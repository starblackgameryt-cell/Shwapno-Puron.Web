import { db } from '@/lib/db'
import { verifyAdminSession, getAdminCookie } from '@/lib/auth'

async function requireAdmin(request: Request) {
  const token = getAdminCookie(request)
  if (!token) return null
  return await verifyAdminSession(token)
}

// PUT - Admin: update a custom field
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request)
  if (!session) {
    return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
  }
  try {
    const { id } = await params
    const { label, placeholder, required, isActive, position } = await request.json()
    const field = await db.checkoutCustomField.update({
      where: { id },
      data: {
        ...(label !== undefined && { label: String(label).trim() }),
        ...(placeholder !== undefined && { placeholder: String(placeholder) }),
        ...(required !== undefined && { required: Boolean(required) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(position !== undefined && { position: Number(position) }),
      },
    })
    return Response.json({ success: true, field })
  } catch (error) {
    console.error('Update custom field error:', error)
    return Response.json({ error: 'আপডেট করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}

// DELETE - Admin: delete a custom field
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request)
  if (!session) {
    return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
  }
  try {
    const { id } = await params
    await db.checkoutCustomField.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete custom field error:', error)
    return Response.json({ error: 'মুছতে সমস্যা হয়েছে' }, { status: 500 })
  }
}
