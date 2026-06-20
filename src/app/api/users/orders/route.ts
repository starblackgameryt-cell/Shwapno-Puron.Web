import { db } from '@/lib/db'
import { verifyUserSession, getUserCookie } from '@/lib/auth'

export async function GET(request: Request) {
  try {
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

    // Get user's orders
    const orders = await db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return Response.json(
      { error: 'অর্ডার লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
