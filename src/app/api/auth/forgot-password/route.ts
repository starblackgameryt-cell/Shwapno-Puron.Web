import { db } from '@/lib/db'
import { createPasswordReset } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json(
        { error: 'ইমেইল ঠিকানা দিন' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })

    // Always return success to prevent email enumeration
    if (!user) {
      return Response.json({
        success: true,
        message: 'যদি এই ইমেইলে কোনো অ্যাকাউন্ট থাকে, তাহলে পাসওয়ার্ড রিসেট লিংক পাঠানো হবে',
      })
    }

    // Create password reset token
    const token = await createPasswordReset(user.id)

    // Generate reset URL
    const resetUrl = `${new URL(request.url).origin}/reset-password?token=${token}`

    // Create Gmail compose URL for the admin to send
    const subject = encodeURIComponent('পাসওয়ার্ড রিসেট - স্বপ্ন পূরণ')
    const body = encodeURIComponent(
      `আসসালামু আলাইকুম ${user.name},\n\nআপনার পাসওয়ার্ড রিসেট করার জন্য নিচের লিংকে ক্লিক করুন:\n\n${resetUrl}\n\nএই লিংক ১ ঘন্টার জন্য বৈধ।\n\nধন্যবাদ,\nস্বপ্ন পূরণ টিম`
    )
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`

    return Response.json({
      success: true,
      message: 'পাসওয়ার্ড রিসেট লিংক তৈরি হয়েছে',
      resetUrl,
      gmailUrl,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return Response.json(
      { error: 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
