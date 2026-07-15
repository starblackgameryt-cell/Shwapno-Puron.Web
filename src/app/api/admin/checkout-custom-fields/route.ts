import { db } from '@/lib/db'
import { verifyAdminSession, getAdminCookie } from '@/lib/auth'

async function requireAdmin(request: Request) {
  const token = getAdminCookie(request)
  if (!token) return null
  return await verifyAdminSession(token)
}

// GET - Admin: list ALL custom fields (including inactive)
export async function GET(request: Request) {
  const session = await requireAdmin(request)
  if (!session) {
    return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
  }
  try {
    const fields = await db.checkoutCustomField.findMany({
      orderBy: { position: 'asc' },
    })
    return Response.json(fields)
  } catch (error) {
    console.error('Admin custom fields GET error:', error)
    return Response.json([])
  }
}

// POST - Admin: create a new custom field
export async function POST(request: Request) {
  const session = await requireAdmin(request)
  if (!session) {
    return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
  }
  try {
    const { label, placeholder, required, isActive } = await request.json()
    if (!label || typeof label !== 'string' || !label.trim()) {
      return Response.json({ error: 'লেবেল আবশ্যক' }, { status: 400 })
    }
    // position = current max + 1
    const existing = await db.checkoutCustomField.findMany({ orderBy: { position: 'desc' }, take: 1 })
    const nextPosition = (existing[0]?.position ?? -1) + 1
    const field = await db.checkoutCustomField.create({
      data: {
        label: label.trim(),
        placeholder: (placeholder || '').trim(),
        required: Boolean(required),
        isActive: isActive !== false,
        position: nextPosition,
      },
    })
    return Response.json({ success: true, field })
  } catch (error) {
    console.error('Create custom field error:', error)
    return Response.json({ error: 'তৈরি করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}
