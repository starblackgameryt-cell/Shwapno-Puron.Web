import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalProducts,
      totalOrders,
      newOrders,
      pendingPayments,
      lowStock,
      recentOrders,
      revenueResult,
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.order.count({ where: { orderStatus: 'new' } }),
      db.order.count({ where: { paymentStatus: 'pending' } }),
      db.product.count({ where: { stock: { lte: 5 } } }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'paid' },
      }),
    ])

    const totalRevenue = revenueResult._sum.totalAmount || 0

    return Response.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      newOrders,
      pendingPayments,
      lowStock,
      recentOrders,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return Response.json({ error: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}
