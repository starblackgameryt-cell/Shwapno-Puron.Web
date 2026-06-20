import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return Response.json(
        { error: 'টোকেন ও নতুন পাসওয়ার্ড দিন' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return Response.json(
        { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
        { status: 400 }
      )
    }

    // Find valid password reset token
    const resetToken = await db.passwordReset.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return Response.json(
        { error: 'অবৈধ রিসেট লিংক' },
        { status: 400 }
      )
    }

    if (resetToken.used) {
      return Response.json(
        { error: 'এই রিসেট লিংক ইতিমধ্যে ব্যবহৃত হয়েছে' },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt < new Date()) {
      return Response.json(
        { error: 'রিসেট লিংকের মেয়াদ শেষ হয়ে গেছে' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    })

    // Mark token as used
    await db.passwordReset.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    // Delete all user sessions (force re-login)
    await db.userSession.deleteMany({
      where: { userId: resetToken.userId },
    })

    return Response.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return Response.json(
      { error: 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
