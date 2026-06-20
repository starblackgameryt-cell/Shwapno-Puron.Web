import { db } from '@/lib/db'

// GET - Public: get active payment methods
export async function GET() {
  try {
    const methods = await db.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(methods)
  } catch (error) {
    console.error('Payment methods GET error:', error)
    return Response.json([])
  }
}
