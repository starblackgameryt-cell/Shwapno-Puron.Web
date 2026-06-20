import { db } from '@/lib/db'
import { verifyAdminSession, getAdminCookie } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Verify admin session
    const token = getAdminCookie(request)
    if (!token) {
      return Response.json({ error: 'অ্যাডমিন লগইন করা হয়নি' }, { status: 401 })
    }

    const session = await verifyAdminSession(token)
    if (!session) {
      return Response.json({ error: 'সেশন মেয়াদোত্তীর্ণ হয়েছে' }, { status: 401 })
    }

    const notifications = await db.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return Response.json(
      { error: 'বিজ্ঞপ্তি লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Verify admin session
    const token = getAdminCookie(request)
    if (!token) {
      return Response.json({ error: 'অ্যাডমিন লগইন করা হয়নি' }, { status: 401 })
    }

    const session = await verifyAdminSession(token)
    if (!session) {
      return Response.json({ error: 'সেশন মেয়াদোত্তীর্ণ হয়েছে' }, { status: 401 })
    }

    const body = await request.json()
    const { id, markAll } = body

    if (markAll) {
      // Mark all notifications as read
      await db.adminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      })
      return Response.json({
        success: true,
        message: 'সব বিজ্ঞপ্তি পড়া হিসেবে চিহ্নিত হয়েছে',
      })
    }

    if (!id) {
      return Response.json(
        { error: 'বিজ্ঞপ্তি আইডি দিন' },
        { status: 400 }
      )
    }

    // Mark single notification as read
    await db.adminNotification.update({
      where: { id },
      data: { isRead: true },
    })

    return Response.json({
      success: true,
      message: 'বিজ্ঞপ্তি পড়া হিসেবে চিহ্নিত হয়েছে',
    })
  } catch (error) {
    console.error('Notification update error:', error)
    return Response.json(
      { error: 'বিজ্ঞপ্তি আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Verify admin session
    const token = getAdminCookie(request)
    if (!token) {
      return Response.json({ error: 'অ্যাডমিন লগইন করা হয়নি' }, { status: 401 })
    }

    const session = await verifyAdminSession(token)
    if (!session) {
      return Response.json({ error: 'সেশন মেয়াদোত্তীর্ণ হয়েছে' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    if (clearAll === 'true') {
      // Delete all notifications
      await db.adminNotification.deleteMany({})
      return Response.json({
        success: true,
        message: 'সব বিজ্ঞপ্তি মুছে ফেলা হয়েছে',
      })
    }

    if (!id) {
      return Response.json(
        { error: 'বিজ্ঞপ্তি আইডি দিন অথবা clearAll=true দিন' },
        { status: 400 }
      )
    }

    // Delete single notification
    await db.adminNotification.delete({ where: { id } })

    return Response.json({
      success: true,
      message: 'বিজ্ঞপ্তি মুছে ফেলা হয়েছে',
    })
  } catch (error) {
    console.error('Notification delete error:', error)
    return Response.json(
      { error: 'বিজ্ঞপ্তি মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
