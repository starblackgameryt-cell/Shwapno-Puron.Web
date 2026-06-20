import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin API routes (except auth and notify-login)
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth') && !pathname.startsWith('/api/admin/notify-login')) {
    const adminToken = request.cookies.get('admin_token')?.value
    if (!adminToken) {
      return NextResponse.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
    }
  }

  // Protect user API routes
  if (pathname.startsWith('/api/users/')) {
    const sessionToken = request.cookies.get('session_token')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })
    }
  }

  // Protect user auth change-password route
  if (pathname === '/api/auth/change-password') {
    const sessionToken = request.cookies.get('session_token')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })
    }
  }

  // Protect admin PAGE route - redirect non-admin users
  // We check for admin_token cookie; client-side will also verify the session
  if (pathname === '/admin') {
    const adminToken = request.cookies.get('admin_token')?.value
    const sessionToken = request.cookies.get('session_token')?.value

    // If user has a session_token but NOT an admin_token, they're a regular user
    // We let the page load, but the client-side code will show "Access Denied"
    // If they have neither token, they'll see the admin login form (which is fine)
    // If they have admin_token, they'll see the dashboard
    // Note: We can't fully block at middleware level because we need to show
    // the Access Denied message on the client side for UX purposes
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/users/:path*',
    '/api/auth/change-password',
    '/admin',
  ],
}
