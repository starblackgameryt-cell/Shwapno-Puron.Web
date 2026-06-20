import { db } from '@/lib/db'
import {
  verifyPassword,
  hashPassword,
  createAdminSession,
  createAdminNotification,
  getClientInfo,
  getAdminCookie,
} from '@/lib/auth'

// Admin credentials from environment variables
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dolamaanha@gmail.com'
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'shwapnopuron35356'
const DEFAULT_ADMIN_NAME = 'স্বপ্ন পূরণ অ্যাডমিন'

async function ensureAdminExists() {
  let admin = await db.admin.findUnique({ where: { email: DEFAULT_ADMIN_EMAIL } })
  if (!admin) {
    // Create admin with hashed password
    const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD)
    admin = await db.admin.create({
      data: {
        email: DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        name: DEFAULT_ADMIN_NAME,
      },
    })
  } else {
    // Always ensure the password is hashed correctly
    try {
      const isValid = await verifyPassword(DEFAULT_ADMIN_PASSWORD, admin.password)
      if (!isValid) {
        // Re-hash if the stored password doesn't match
        const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD)
        admin = await db.admin.update({
          where: { id: admin.id },
          data: { password: hashedPassword },
        })
      }
    } catch {
      // If verification fails (e.g. corrupted hash), re-hash
      const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD)
      admin = await db.admin.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      })
    }
  }
  return admin
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'ইমেইল ও পাসওয়ার্ড দিন' }, { status: 400 })
    }

    const admin = await ensureAdminExists()

    if (admin.email !== email.toLowerCase()) {
      const { ip, userAgent } = getClientInfo(request)
      await createAdminNotification(
        'failed_login',
        'অ্যাডমিন লগইন ব্যর্থ হয়েছে',
        `ইমেইল: ${email}, IP: ${ip}, ডিভাইস: ${userAgent.substring(0, 100)}`
      )
      return Response.json({ error: 'ভুল ইমেইল বা পাসওয়ার্ড' }, { status: 401 })
    }

    // Verify password (always hashed now)
    const isValid = await verifyPassword(password, admin.password)

    if (!isValid) {
      const { ip, userAgent } = getClientInfo(request)
      await createAdminNotification(
        'failed_login',
        'অ্যাডমিন লগইন ব্যর্থ হয়েছে',
        `ইমেইল: ${email}, IP: ${ip}, ডিভাইস: ${userAgent.substring(0, 100)}`
      )
      return Response.json({ error: 'ভুল ইমেইল বা পাসওয়ার্ড' }, { status: 401 })
    }

    // Successful login
    const { ip, userAgent } = getClientInfo(request)
    const token = await createAdminSession(admin.id, ip, userAgent)

    await createAdminNotification(
      'login',
      'অ্যাডমিন সফলভাবে লগইন হয়েছে',
      `IP: ${ip}, ডিভাইস: ${userAgent.substring(0, 100)}`
    )

    // Set HTTP-only cookie with 2-hour expiry
    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      `admin_token=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${2 * 60 * 60}`
    )

    return Response.json(
      {
        success: true,
        admin: { id: admin.id, email: admin.email, name: admin.name, emailVerified: true },
        message: 'সফলভাবে লগইন হয়েছে',
      },
      { headers }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return Response.json({ error: 'লগইন করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const token = getAdminCookie(request)

    if (token) {
      try {
        await db.adminSession.delete({ where: { token } })
      } catch {
        // Session may already be deleted
      }
    }

    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      'admin_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
    )

    return Response.json(
      { success: true, message: 'সফলভাবে লগআউট হয়েছে' },
      { headers }
    )
  } catch (error) {
    console.error('Admin logout error:', error)
    return Response.json({ error: 'লগআউট করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}
