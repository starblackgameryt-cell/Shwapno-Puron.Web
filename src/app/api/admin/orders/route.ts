import { db } from '@/lib/db'

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(orders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return Response.json({ error: 'অর্ডার লোড করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, orderStatus, paymentStatus } = body

    if (!id) {
      return Response.json({ error: 'অর্ডার আইডি আবশ্যক' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (orderStatus !== undefined) updateData.orderStatus = orderStatus
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus

    const order = await db.order.update({
      where: { id },
      data: updateData,
    })

    return Response.json({ success: true, order, message: 'অর্ডার সফলভাবে আপডেট হয়েছে' })
  } catch (error) {
    console.error('Order update error:', error)
    return Response.json({ error: 'অর্ডার আপডেট করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}
