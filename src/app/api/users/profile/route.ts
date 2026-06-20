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

    return Response.json({
      success: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        phone: session.user.phone,
        avatar: session.user.avatar,
        emailVerified: session.user.emailVerified,
        favorites: session.user.favorites,
        createdAt: session.user.createdAt,
      },
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return Response.json(
      { error: 'প্রোফাইল লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
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

    const body = await request.json()
    const { name, phone, avatar } = body

    const updateData: Record<string, string> = {}
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return Response.json(
          { error: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }
    if (phone !== undefined) updateData.phone = phone
    if (avatar !== undefined) updateData.avatar = avatar

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    return Response.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        emailVerified: updatedUser.emailVerified,
      },
      message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে',
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return Response.json(
      { error: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
