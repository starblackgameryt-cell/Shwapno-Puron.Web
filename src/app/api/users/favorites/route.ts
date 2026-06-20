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

    // Parse favorites JSON array
    let favorites: string[] = []
    try {
      favorites = JSON.parse(session.user.favorites || '[]')
    } catch {
      favorites = []
    }

    return Response.json({
      success: true,
      favorites,
    })
  } catch (error) {
    console.error('Favorites fetch error:', error)
    return Response.json(
      { error: 'পছন্দের তালিকা লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const { productId } = await request.json()

    if (!productId) {
      return Response.json(
        { error: 'পণ্যের আইডি দিন' },
        { status: 400 }
      )
    }

    // Parse current favorites
    let favorites: string[] = []
    try {
      favorites = JSON.parse(session.user.favorites || '[]')
    } catch {
      favorites = []
    }

    // Toggle favorite
    let message: string
    if (favorites.includes(productId)) {
      favorites = favorites.filter((id: string) => id !== productId)
      message = 'পছন্দের তালিকা থেকে সরানো হয়েছে'
    } else {
      favorites.push(productId)
      message = 'পছন্দের তালিকায় যোগ হয়েছে'
    }

    // Update user favorites
    await db.user.update({
      where: { id: session.user.id },
      data: { favorites: JSON.stringify(favorites) },
    })

    return Response.json({
      success: true,
      favorites,
      message,
    })
  } catch (error) {
    console.error('Favorites toggle error:', error)
    return Response.json(
      { error: 'পছন্দের তালিকা আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
