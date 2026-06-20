import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || ''
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

    if (!clientId || !clientSecret) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'google_not_configured')
      return NextResponse.redirect(url)
    }

    // Redirect to NextAuth Google sign-in
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/account'
    const signInUrl = new URL('/api/auth/signin/google', request.url)
    signInUrl.searchParams.set('callbackUrl', callbackUrl)

    return NextResponse.redirect(signInUrl)
  } catch (error) {
    console.error('Google OAuth redirect error:', error)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'google_oauth_failed')
    return NextResponse.redirect(url)
  }
}
