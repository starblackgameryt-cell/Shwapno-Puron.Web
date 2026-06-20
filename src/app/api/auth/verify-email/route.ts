import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return Response.redirect(new URL('/login?verified=missing', request.url))
    }

    // Find user with this verify token
    const user = await db.user.findFirst({
      where: { verifyToken: token },
    })

    if (!user) {
      return Response.redirect(new URL('/login?verified=invalid', request.url))
    }

    // Already verified
    if (user.emailVerified) {
      return Response.redirect(new URL('/login?verified=already', request.url))
    }

    // Mark as verified and clear token
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: '' },
    })

    return Response.redirect(new URL('/login?verified=success', request.url))
  } catch (error) {
    console.error('Email verify error:', error)
    return Response.redirect(new URL('/login?verified=error', request.url))
  }
}

// Also support POST for manual resend
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ error: 'ইমেইল দিন' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })

    if (!user) {
      // Don't reveal if user exists
      return Response.json({ success: true, message: 'যদি অ্যাকাউন্ট থাকে, ভেরিফিকেশন লিংক পাঠানো হবে' })
    }

    if (user.emailVerified) {
      return Response.json({ success: true, message: 'ইমেইল ইতিমধ্যে ভেরিফাইড', alreadyVerified: true })
    }

    // Generate new verify token
    const { randomBytes } = await import('crypto')
    const verifyToken = randomBytes(32).toString('hex')

    await db.user.update({
      where: { id: user.id },
      data: { verifyToken },
    })

    const verifyUrl = `${new URL(request.url).origin}/api/auth/verify-email?token=${verifyToken}`

    return Response.json({
      success: true,
      verifyUrl,
      message: 'ভেরিফিকেশন লিংক পাঠানো হয়েছে',
    })
  } catch (error) {
    console.error('Resend verify error:', error)
    return Response.json({ error: 'সমস্যা হয়েছে' }, { status: 500 })
  }
}
