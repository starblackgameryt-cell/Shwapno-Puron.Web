import { db } from '@/lib/db'

// GET - Public: get active contact methods
export async function GET() {
  try {
    const methods = await db.contactMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(methods)
  } catch (error) {
    console.error('Contact methods GET error:', error)
    return Response.json([])
  }
}
