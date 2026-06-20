import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  createUserSession,
  createAdminSession,
  createAdminNotification,
  getClientInfo,
  hashPassword,
  generateToken,
} from '@/lib/auth'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''

const ADMIN_EMAIL = 'dolamaanha@gmail.com'

interface GoogleUserInfo {
  sub: string
  email: string
  email_verified: boolean
  name: string
  picture: string
  given_name: string
  family_name: string
}

/**
 * Dynamically detect the external origin from request headers.
 * External (non-localhost) access is always HTTPS.
 */
function getOriginFromRequest(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto')
  const host = req.headers.get('host')

  const actualHost = forwardedHost || host || ''

  // Non-localhost external access is always HTTPS
  let proto = 'https'
  if (actualHost.startsWith('localhost') || actualHost.startsWith('127.0.0.1')) {
    proto = 'http'
  } else if (forwardedProto && forwardedProto !== 'http') {
    proto = forwardedProto
  }

  if (actualHost) {
    return `${proto}://${actualHost}`
  }

  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<{ access_token: string; id_token: string }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Token exchange error:', error)
    throw new Error('Failed to exchange code for tokens')
  }

  return response.json()
}

async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google')
  }

  return response.json()
}

function redirectWithCookies(url: string, cookies: string[]): NextResponse {
  const response = NextResponse.redirect(url, { status: 302 })
  for (const cookie of cookies) {
    response.headers.append('Set-Cookie', cookie)
  }
  return response
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('code') ? null : searchParams.get('error')

    const origin = getOriginFromRequest(request)
    console.log(`[Google Callback] Detected origin: ${origin}`)

    // Handle Google auth errors (user denied access, etc.)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=google_access_denied`, { status: 302 })
    }

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=google_no_code`, { status: 302 })
    }

    // Build the redirect URI dynamically based on the detected origin
    const redirectUri = `${origin}/api/auth/callback/google`
    console.log(`[Google Callback] Using redirect_uri: ${redirectUri}`)

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri)

    // Get user info from Google
    const googleUser = await getUserInfo(tokens.access_token)

    if (!googleUser.email) {
      return NextResponse.redirect(`${origin}/login?error=google_no_email`, { status: 302 })
    }

    const normalizedEmail = googleUser.email.toLowerCase()
    const { ip, userAgent } = getClientInfo(request)

    // ========== CHECK IF ADMIN ==========
    if (normalizedEmail === ADMIN_EMAIL) {
      // Find or create admin
      let admin = await db.admin.findUnique({ where: { email: ADMIN_EMAIL } })

      if (!admin) {
        const hashedPassword = await hashPassword('shwapnopuron35356')
        admin = await db.admin.create({
          data: {
            email: ADMIN_EMAIL,
            password: hashedPassword,
            name: googleUser.name || 'স্বপ্ন পূরণ অ্যাডমিন',
          },
        })
      } else {
        // Update admin name if changed
        if (googleUser.name && admin.name !== googleUser.name) {
          admin = await db.admin.update({
            where: { id: admin.id },
            data: { name: googleUser.name },
          })
        }
      }

      // Create admin session
      const adminToken = await createAdminSession(admin.id, ip, userAgent)

      // Notify about admin login
      await createAdminNotification(
        'login',
        'অ্যাডমিন Google দিয়ে লগইন হয়েছে',
        `IP: ${ip}, ডিভাইস: ${userAgent.substring(0, 100)}`
      )

      // Set admin_token cookie and redirect
      const adminCookies = [
        `admin_token=${adminToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${2 * 60 * 60}`,
        `google_oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
      ]

      return redirectWithCookies(`${origin}/admin`, adminCookies)
    }

    // ========== NORMAL USER ==========
    // Check if user exists (by googleId first, then by email)
    let user = await db.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub },
          { email: normalizedEmail },
        ],
      },
    })

    if (user) {
      // Update existing user with Google info if needed
      const updateData: Record<string, string | boolean> = {}
      if (googleUser.picture && user.avatar !== googleUser.picture) {
        updateData.avatar = googleUser.picture
      }
      if (googleUser.name && user.name !== googleUser.name) {
        updateData.name = googleUser.name
      }
      if (!user.googleId) {
        updateData.googleId = googleUser.sub
      }
      if (!user.emailVerified && googleUser.email_verified) {
        updateData.emailVerified = true
      }

      if (Object.keys(updateData).length > 0) {
        user = await db.user.update({
          where: { id: user.id },
          data: updateData,
        })
      }
    } else {
      // Create new user from Google account
      user = await db.user.create({
        data: {
          name: googleUser.name || googleUser.given_name || 'Google User',
          email: normalizedEmail,
          password: await hashPassword(generateToken()), // Random password for Google users
          avatar: googleUser.picture || '',
          googleId: googleUser.sub,
          emailVerified: googleUser.email_verified || true,
        },
      })

      // Notify admin about new Google user
      await createAdminNotification(
        'new_user',
        `নতুন Google ব্যবহারকারী: ${user.name}`,
        `ইমেইল: ${user.email}`
      )
    }

    // Create user session
    const token = await createUserSession(user.id)

    // Set session cookie and redirect
    const userCookies = [
      `session_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
      `google_oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
    ]

    return redirectWithCookies(`${origin}/account`, userCookies)
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    const origin = getOriginFromRequest(request as unknown as NextRequest)
    return NextResponse.redirect(`${origin}/login?error=google_callback_error`, { status: 302 })
  }
}
