import { db } from '@/lib/db'

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { reviews: true },
    })
    return Response.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
