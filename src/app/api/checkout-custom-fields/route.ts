import { db } from '@/lib/db'

// GET - Public: list active custom fields for checkout form rendering
export async function GET() {
  try {
    const fields = await db.checkoutCustomField.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    })
    return Response.json(fields)
  } catch (error) {
    console.error('Checkout custom fields GET error:', error)
    return Response.json([])
  }
}
