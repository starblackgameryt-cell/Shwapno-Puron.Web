import { deleteSession, getUserCookie, getAdminCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Clear custom session tokens
    const userToken = getUserCookie(request)
    const adminToken = getAdminCookie(request)

    if (userToken) {
      await deleteSession(userToken)
    }
    if (adminToken) {
      await deleteSession(adminToken)
    }

    // Clear all cookies including NextAuth
    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      'session_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
    )
    headers.append(
      'Set-Cookie',
      'admin_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
    )
    // Clear NextAuth session cookies
    headers.append(
      'Set-Cookie',
      'next-auth.session-token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
    )
    headers.append(
      'Set-Cookie',
      'next-auth.callback-url=; SameSite=Lax; Path=/; Max-Age=0'
    )
    headers.append(
      'Set-Cookie',
      'next-auth.csrf-token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
    )

    return Response.json(
      { success: true, message: 'সফলভাবে লগআউট হয়েছে' },
      { headers }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json(
      { error: 'লগআউট করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
