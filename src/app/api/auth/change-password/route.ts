import { verifyPassword, hashPassword, verifyUserSession, getUserCookie, createAdminNotification } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: 'বর্তমান পাসওয়ার্ড ও নতুন পাসওয়ার্ড দিন' },
        { status: 400 }
      )
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return Response.json(
        { error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
        { status: 400 }
      )
    }

    // Verify user session
    const token = getUserCookie(request)
    if (!token) {
      return Response.json(
        { error: 'লগইন করা হয়নি' },
        { status: 401 }
      )
    }

    const session = await verifyUserSession(token)
    if (!session) {
      return Response.json(
        { error: 'সেশন মেয়াদোত্তীর্ণ হয়েছে, আবার লগইন করুন' },
        { status: 401 }
      )
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, session.user.password)
    if (!isValid) {
      return Response.json(
        { error: 'বর্তমান পাসওয়ার্ড ভুল হয়েছে' },
        { status: 400 }
      )
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword)

    // Import db to update user
    const { db } = await import('@/lib/db')
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    // Create admin notification
    await createAdminNotification(
      'password_change',
      `ব্যবহারকারী পাসওয়ার্ড পরিবর্তন: ${session.user.name}`,
      `ইমেইল: ${session.user.email}`
    )

    return Response.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return Response.json(
      { error: 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
