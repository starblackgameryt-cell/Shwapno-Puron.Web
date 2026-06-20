import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

  const configured = !!(clientId && clientSecret)

  // Detect the external origin - same logic as NextAuth route
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const host = request.headers.get('host')

  const actualHost = forwardedHost || host || ''

  let proto = 'https'
  if (actualHost.startsWith('localhost') || actualHost.startsWith('127.0.0.1')) {
    proto = 'http'
  } else if (forwardedProto && forwardedProto !== 'http') {
    proto = forwardedProto
  }

  let detectedOrigin = ''
  if (actualHost) {
    detectedOrigin = `${proto}://${actualHost}`
  }

  return Response.json({
    configured,
    detectedOrigin,
    host,
    forwardedHost,
    forwardedProto,
    googleCallbackUrl: detectedOrigin ? `${detectedOrigin}/api/auth/callback/google` : '',
  })
}
