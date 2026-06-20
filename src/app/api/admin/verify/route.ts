import { verifyAdminSession, getAdminCookie } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = getAdminCookie(request)

    if (!token) {
      return Response.json(
        { error: 'অ্যাডমিন লগইন করা হয়নি' },
        { status: 401 }
      )
    }

    const session = await verifyAdminSession(token)

    if (!session) {
      // Clear expired/invalid cookie
      const headers = new Headers()
      headers.append(
        'Set-Cookie',
        'admin_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
      )
      return Response.json(
        { error: 'সেশন মেয়াদোত্তীর্ণ হয়েছে, আবার লগইন করুন' },
        { status: 401, headers }
      )
    }

    return Response.json({
      success: true,
      admin: {
        id: session.admin.id,
        email: session.admin.email,
        name: session.admin.name,
        emailVerified: true, // Admin is always verified
      },
    })
  } catch (error) {
    console.error('Admin verify error:', error)
    return Response.json(
      { error: 'অ্যাডমিন যাচাই করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
