import { verifyUserSession, getUserCookie } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    // First, try custom session cookie
    const token = getUserCookie(request)

    if (token) {
      const session = await verifyUserSession(token)
      if (session) {
        return Response.json({
          success: true,
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            phone: session.user.phone,
            avatar: session.user.avatar,
            favorites: session.user.favorites,
            emailVerified: session.user.emailVerified,
            createdAt: session.user.createdAt,
          },
        })
      }
    }

    // Fallback: try NextAuth session
    const nextAuthSession = await getServerSession(authOptions)
    if (nextAuthSession?.user?.email) {
      const dbUser = await db.user.findUnique({
        where: { email: nextAuthSession.user.email.toLowerCase() }
      })
      if (dbUser) {
        return Response.json({
          success: true,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone,
            avatar: dbUser.avatar,
            favorites: dbUser.favorites,
            emailVerified: dbUser.emailVerified,
            createdAt: dbUser.createdAt,
          },
        })
      }
    }

    // No valid session found
    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      'session_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
    )
    return Response.json(
      { error: 'লগইন করা হয়নি' },
      { status: 401, headers }
    )
  } catch (error) {
    console.error('Me error:', error)
    return Response.json(
      { error: 'ব্যবহারকারীর তথ্য লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
