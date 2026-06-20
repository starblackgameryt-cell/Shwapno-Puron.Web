import { db } from '@/lib/db'
import { hashPassword, createUserSession, createAdminNotification, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate fields
    if (!name || !email || !password) {
      return Response.json(
        { error: 'নাম, ইমেইল ও পাসওয়ার্ড সব আবশ্যক' },
        { status: 400 }
      )
    }

    // Validate email format - must be real Gmail
    const emailRegex = /^[^\s@]+@gmail\.com$/
    if (!emailRegex.test(email.toLowerCase())) {
      return Response.json(
        { error: 'অনুগ্রহ করে একটি সঠিক Gmail ঠিকানা দিন' },
        { status: 400 }
      )
    }

    // Validate password length - minimum 6 characters
    if (password.length < 6) {
      return Response.json(
        { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length < 2) {
      return Response.json(
        { error: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Check email uniqueness
    const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return Response.json(
        { error: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। লগইন করুন' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate email verification token
    const verifyToken = generateToken()

    // Create user with verify token
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        verifyToken,
        emailVerified: false,
      },
    })

    // Create session
    const token = await createUserSession(user.id)

    // Notify admin about new user
    await createAdminNotification(
      'new_user',
      `নতুন ব্যবহারকারী নিবন্ধিত: ${user.name}`,
      `ইমেইল: ${user.email}`
    )

    // Set HTTP-only cookie
    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      `session_token=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    )

    // Build verification URL
    const verifyUrl = `${new URL(request.url).origin}/api/auth/verify-email?token=${verifyToken}`

    return Response.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
        },
        verifyUrl,
        message: 'সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে। ইমেইল ভেরিফিকেশন লিংক পাঠানো হয়েছে।',
      },
      { headers }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return Response.json(
      { error: 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
