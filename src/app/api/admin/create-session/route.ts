import { db } from '@/lib/db'
import { createAdminSession, verifyUserSession, getUserCookie, getClientInfo, createAdminNotification } from '@/lib/auth'

const ADMIN_EMAIL = 'dolamaanha@gmail.com'

export async function POST(request: Request) {
  try {
    // Check if user has a valid session_token (from Google OAuth login)
    const sessionToken = getUserCookie(request)
    if (!sessionToken) {
      return Response.json(
        { error: 'কোনো সেশন পাওয়া যায়নি' },
        { status: 401 }
      )
    }

    // Verify the user session
    const userSession = await verifyUserSession(sessionToken)
    if (!userSession) {
      return Response.json(
        { error: 'সেশন মেয়াদোত্তীর্ণ হয়েছে' },
        { status: 401 }
      )
    }

    // Check if this user is an admin
    const userEmail = userSession.user.email.toLowerCase()
    if (userEmail !== ADMIN_EMAIL) {
      return Response.json(
        { error: 'অ্যাডমিন অ্যাক্সেস নেই' },
        { status: 403 }
      )
    }

    // Find or create admin record
    let admin = await db.admin.findUnique({ where: { email: ADMIN_EMAIL } })
    if (!admin) {
      // Create admin record if it doesn't exist
      admin = await db.admin.create({
        data: {
          email: ADMIN_EMAIL,
          name: userSession.user.name || 'স্বপ্ন পূরণ অ্যাডমিন',
          password: '', // Google OAuth admin doesn't need password
        }
      })
    }

    // Create admin session
    const { ip, userAgent } = getClientInfo(request)
    const adminToken = await createAdminSession(admin.id, ip, userAgent)

    // Notify about admin login via Google
    try {
      await createAdminNotification(
        'login',
        'অ্যাডমিন Google OAuth থেকে অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করেছেন',
        `IP: ${ip}, ডিভাইস: ${userAgent.substring(0, 100)}`
      )
    } catch {
      // Non-critical
    }

    // Set admin_token cookie and return admin data
    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      `admin_token=${adminToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${2 * 60 * 60}`
    )

    return Response.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        emailVerified: true,
      },
    }, { headers })
  } catch (error) {
    console.error('Create admin session error:', error)
    return Response.json(
      { error: 'অ্যাডমিন সেশন তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
