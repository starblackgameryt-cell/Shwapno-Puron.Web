import { db } from '@/lib/db'
import {
  verifyPassword,
  createUserSession,
  createAdminSession,
  createAdminNotification,
  getClientInfo,
  hashPassword,
} from '@/lib/auth'

// Default admin credentials for detection
const ADMIN_EMAIL = 'dolamaanha@gmail.com'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json(
        { error: 'ইমেইল ও পাসওয়ার্ড দিন' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()
    const { ip, userAgent } = getClientInfo(request)

    // ===== CHECK IF THIS IS AN ADMIN LOGIN =====
    if (normalizedEmail === ADMIN_EMAIL) {
      // Find or create the admin account
      let admin = await db.admin.findUnique({ where: { email: ADMIN_EMAIL } })

      if (!admin) {
        // Create admin if doesn't exist yet
        const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || '')
        admin = await db.admin.create({
          data: {
            email: ADMIN_EMAIL,
            password: hashedPassword,
            name: 'স্বপ্ন পূরণ অ্যাডমিন',
          },
        })
      }

      // Verify password against admin account
      const isAdminValid = await verifyPassword(password, admin.password)

      if (isAdminValid) {
        // Create admin session
        const adminToken = await createAdminSession(admin.id, ip, userAgent)

        // Create admin notification
        await createAdminNotification(
          'login',
          'অ্যাডমিন সফলভাবে লগইন হয়েছে',
          `IP: ${ip}, ডিভাইস: ${userAgent.substring(0, 100)}`
        )

        // Try to send email notification to admin
        try {
          await fetch(new URL('/api/admin/notify-login', request.url).href, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ip,
              userAgent: userAgent.substring(0, 100),
              time: new Date().toISOString(),
            }),
          })
        } catch {
          // Email notification is non-critical, don't block login
        }

        // Set admin_token cookie
        const headers = new Headers()
        headers.append(
          'Set-Cookie',
          `admin_token=${adminToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${2 * 60 * 60}`
        )

        return Response.json(
          {
            success: true,
            isAdmin: true,
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              emailVerified: true,
            },
            message: 'অ্যাডমিন হিসেবে লগইন হয়েছে',
          },
          { headers }
        )
      } else {
        // Wrong admin password
        await createAdminNotification(
          'failed_login',
          'অ্যাডমিন লগইন ব্যর্থ হয়েছে',
          `ইমেইল: ${normalizedEmail}, IP: ${ip}, ডিভাইস: ${userAgent.substring(0, 100)}`
        )
        return Response.json(
          { error: 'ভুল ইমেইল বা পাসওয়ার্ড' },
          { status: 401 }
        )
      }
    }

    // ===== NORMAL USER LOGIN =====
    const user = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      return Response.json(
        { error: 'ভুল ইমেইল বা পাসওয়ার্ড' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      // Create notification for failed user login
      await createAdminNotification(
        'failed_login',
          `ব্যবহারকারী লগইন ব্যর্থ: ${user.name}`,
        `ইমেইল: ${user.email}, IP: ${ip}, ডিভাইস: ${userAgent.substring(0, 100)}`
      )
      return Response.json(
        { error: 'ভুল ইমেইল বা পাসওয়ার্ড' },
        { status: 401 }
      )
    }

    // Create user session
    const token = await createUserSession(user.id)

    // Create admin notification about user login
    await createAdminNotification(
      'user_login',
      `ব্যবহারকারী লগইন: ${user.name}`,
      `ইমেইল: ${user.email}, IP: ${ip}, ডিভাইস: ${userAgent.substring(0, 100)}`
    )

    // Set HTTP-only cookie
    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      `session_token=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    )

    return Response.json(
      {
        success: true,
        isAdmin: false,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
        },
        notVerified: !user.emailVerified,
        message: 'সফলভাবে লগইন হয়েছে',
      },
      { headers }
    )
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'লগইন করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
