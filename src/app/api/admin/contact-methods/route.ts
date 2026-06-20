import { db } from '@/lib/db'
import { verifyAdminSession, getAdminCookie } from '@/lib/auth'

// GET - Admin: get all contact methods (including inactive)
export async function GET(request: Request) {
  try {
    const token = getAdminCookie(request)
    if (!token) return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
    const session = await verifyAdminSession(token)
    if (!session) return Response.json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, { status: 401 })

    const methods = await db.contactMethod.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(methods)
  } catch (error) {
    console.error('Admin contact methods GET error:', error)
    return Response.json({ error: 'যোগাযোগ পদ্ধতি লোড করতে সমস্যা' }, { status: 500 })
  }
}

// POST - Admin: create contact method
export async function POST(request: Request) {
  try {
    const token = getAdminCookie(request)
    if (!token) return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
    const session = await verifyAdminSession(token)
    if (!session) return Response.json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, { status: 401 })

    const data = await request.json()
    if (!data.name) return Response.json({ error: 'নাম আবশ্যক' }, { status: 400 })

    const maxSort = await db.contactMethod.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })

    const method = await db.contactMethod.create({
      data: {
        name: data.name,
        number: data.number || '',
        text: data.text || '',
        link: data.link || '',
        icon: data.icon || '',
        color: data.color || '',
        sortOrder: data.sortOrder ?? (maxSort ? maxSort.sortOrder + 1 : 0),
        isActive: data.isActive !== false,
      },
    })

    return Response.json({ success: true, method })
  } catch (error) {
    console.error('Admin contact method POST error:', error)
    return Response.json({ error: 'যোগাযোগ পদ্ধতি তৈরি করতে সমস্যা' }, { status: 500 })
  }
}

// PUT - Admin: update contact method
export async function PUT(request: Request) {
  try {
    const token = getAdminCookie(request)
    if (!token) return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
    const session = await verifyAdminSession(token)
    if (!session) return Response.json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, { status: 401 })

    const data = await request.json()
    if (!data.id) return Response.json({ error: 'আইডি আবশ্যক' }, { status: 400 })

    const method = await db.contactMethod.update({
      where: { id: data.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.number !== undefined && { number: data.number }),
        ...(data.text !== undefined && { text: data.text }),
        ...(data.link !== undefined && { link: data.link }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return Response.json({ success: true, method })
  } catch (error) {
    console.error('Admin contact method PUT error:', error)
    return Response.json({ error: 'যোগাযোগ পদ্ধতি আপডেট করতে সমস্যা' }, { status: 500 })
  }
}

// DELETE - Admin: delete contact method
export async function DELETE(request: Request) {
  try {
    const token = getAdminCookie(request)
    if (!token) return Response.json({ error: 'অনুমোদন প্রয়োজন' }, { status: 401 })
    const session = await verifyAdminSession(token)
    if (!session) return Response.json({ error: 'সেশন মেয়াদোত্তীর্ণ' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'আইডি আবশ্যক' }, { status: 400 })

    await db.contactMethod.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin contact method DELETE error:', error)
    return Response.json({ error: 'যোগাযোগ পদ্ধতি মুছতে সমস্যা' }, { status: 500 })
  }
}
