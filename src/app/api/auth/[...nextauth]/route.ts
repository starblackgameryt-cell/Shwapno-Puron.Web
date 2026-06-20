import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { AsyncLocalStorage } from 'async_hooks'
import { db } from '@/lib/db'
import { createAdminNotification, createUserSession } from '@/lib/auth'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dolamaanha@gmail.com'

// AsyncLocalStorage to pass detected origin to callbacks (thread-safe)
const originStore = new AsyncLocalStorage<string>()

/**
 * Dynamically detect the external origin from request headers.
 * Caddy proxy forwards: Host, X-Forwarded-Proto, X-Forwarded-Host
 */
function getOriginFromRequest(req: Request): string {
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto')
  const host = req.headers.get('host')

  // Determine the actual host
  const actualHost = forwardedHost || host || ''

  // Determine protocol: non-localhost external access is always HTTPS
  // (Caddy sends {scheme}=http because internal connections are HTTP,
  //  but external access goes through HTTPS via cloud gateway)
  let proto = 'https'
  if (actualHost.startsWith('localhost') || actualHost.startsWith('127.0.0.1')) {
    proto = 'http'
  } else if (forwardedProto && forwardedProto !== 'http') {
    proto = forwardedProto
  }

  if (actualHost) {
    return `${proto}://${actualHost}`
  }

  // Fallback to env
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

// Exported authOptions for use by getServerSession in other routes
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error('[NextAuth] Google signIn: No email in user object')
        return false
      }

      try {
        console.log(`[NextAuth] Google signIn: ${user.email}`)

        const existingUser = await db.user.findUnique({
          where: { email: user.email.toLowerCase() }
        })

        if (existingUser) {
          if (!existingUser.googleId && account?.providerAccountId) {
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                googleId: account.providerAccountId,
                avatar: user.image || existingUser.avatar,
                emailVerified: true,
              }
            })
          } else if (user.image && existingUser.avatar !== user.image) {
            await db.user.update({
              where: { id: existingUser.id },
              data: { avatar: user.image }
            })
          }
          if (!existingUser.emailVerified) {
            await db.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: true }
            })
          }
        } else {
          const name = user.name || user.email.split('@')[0]
          await db.user.create({
            data: {
              email: user.email.toLowerCase(),
              name,
              password: '',
              googleId: account?.providerAccountId || '',
              avatar: user.image || '',
              emailVerified: true,
            }
          })

          try {
            await createAdminNotification(
              'new_user',
              'নতুন ব্যবহারকারী Google দিয়ে নিবন্ধন করেছেন',
              `নাম: ${name}, ইমেইল: ${user.email}`
            )
          } catch (e) {
            console.error('Failed to send admin notification:', e)
          }
        }

        if (user.email.toLowerCase() === ADMIN_EMAIL) {
          try {
            await createAdminNotification(
              'login',
              'অ্যাডমিন Google দিয়ে লগইন করেছেন',
              `ইমেইল: ${user.email}`
            )
          } catch (e) {
            console.error('Failed to send admin notification:', e)
          }
        }

        return true
      } catch (error) {
        console.error('[NextAuth] Google signIn callback error:', error)
        return false
      }
    },

    async jwt({ token, user, account }) {
      if (user?.email) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: user.email.toLowerCase() }
          })
          if (dbUser) {
            token.userId = dbUser.id
            token.isAdmin = dbUser.email === ADMIN_EMAIL
            token.avatar = dbUser.avatar
            token.phone = dbUser.phone
          }
        } catch (e) {
          console.error('[NextAuth] JWT callback DB error:', e)
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string
        ;(session.user as any).isAdmin = token.isAdmin as boolean
        ;(session.user as any).avatar = token.avatar as string
        ;(session.user as any).phone = token.phone as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Get the dynamically detected origin from AsyncLocalStorage
      const dynamicOrigin = originStore.getStore() || baseUrl
      console.log(`[NextAuth] redirect: url=${url}, baseUrl=${baseUrl}, dynamicOrigin=${dynamicOrigin}`)

      // If url is relative, prepend dynamic origin
      if (url.startsWith("/")) return dynamicOrigin + url

      // If callbackUrl is in the URL params, extract and use it
      try {
        const parsedUrl = new URL(url)
        const callbackUrl = parsedUrl.searchParams.get('callbackUrl')
        if (callbackUrl) {
          if (callbackUrl.startsWith('/')) return dynamicOrigin + callbackUrl
          return callbackUrl
        }
      } catch {
        // Invalid URL, fall through
      }

      // Replace any localhost references with dynamic origin
      if (url.includes('localhost:3000')) {
        return url.replace(/https?:\/\/localhost:3000/, dynamicOrigin)
      }

      // Allow redirects to the same origin (check both dynamic and baseUrl)
      try {
        const urlOrigin = new URL(url).origin
        if (urlOrigin === dynamicOrigin || urlOrigin === baseUrl) return url
      } catch {
        // Invalid URL, fall through
      }

      // Default redirect to account page
      return dynamicOrigin + '/account'
    },
  },
  events: {
    async signIn({ user }) {
      if (user.email) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: user.email.toLowerCase() }
          })
          if (dbUser) {
            await createUserSession(dbUser.id)
            console.log(`[NextAuth] Custom session created for: ${user.email}`)
          }
        } catch (e) {
          console.error('[NextAuth] Create custom session error:', e)
        }
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

/**
 * Rewrite any localhost:3000 references in the response Location header
 * to the detected external origin. This handles cases where NextAuth's
 * redirect callback is not invoked (e.g., error redirects).
 */
function rewriteResponseLocation(response: Response, externalOrigin: string): Response {
  const location = response.headers.get('location')
  if (location && location.includes('localhost:3000')) {
    const newLocation = location.replace(/https?:\/\/localhost:3000/, externalOrigin)
    console.log(`[NextAuth] Rewriting Location: ${location} → ${newLocation}`)
    // Create a new response with the rewritten Location header
    const newHeaders = new Headers(response.headers)
    newHeaders.set('location', newLocation)
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    })
  }
  return response
}

async function handler(
  req: Request,
  context: { params: { nextauth: string[] } }
) {
  // Detect the external origin from request headers
  const detectedOrigin = getOriginFromRequest(req)
  console.log(`[NextAuth] Detected origin: ${detectedOrigin}`)

  // Temporarily override NEXTAUTH_URL so NextAuth generates correct URLs
  const originalUrl = process.env.NEXTAUTH_URL
  process.env.NEXTAUTH_URL = detectedOrigin

  // Create a fresh handler with the updated NEXTAUTH_URL
  const nextAuthHandler = NextAuth(authOptions)

  try {
    // Run inside AsyncLocalStorage so the redirect callback can access the detected origin
    const response = await originStore.run(detectedOrigin, async () => {
      return await nextAuthHandler(req, context)
    })

    // Rewrite any localhost:3000 references in the response Location header
    return rewriteResponseLocation(response, detectedOrigin)
  } finally {
    // Restore original NEXTAUTH_URL
    process.env.NEXTAUTH_URL = originalUrl
  }
}

export { handler as GET, handler as POST }
