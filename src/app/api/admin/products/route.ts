import { db } from '@/lib/db'

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(products)
  } catch (error) {
    console.error('Products fetch error:', error)
    return Response.json({ error: 'পণ্য লোড করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, category, image, images, colors, sizes, fabric, featured, stock } = body

    if (!name || !price || !category) {
      return Response.json({ error: 'নাম, মূল্য ও ক্যাটাগরি আবশ্যক' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        image: image || '/images/products/product1.png',
        images: images || image || '/images/products/product1.png',
        colors: colors || '',
        sizes: sizes || '',
        fabric: fabric || '',
        featured: featured || false,
        stock: parseInt(stock) || 10,
      },
    })

    return Response.json({ success: true, product, message: 'পণ্য সফলভাবে যোগ হয়েছে' })
  } catch (error) {
    console.error('Product create error:', error)
    return Response.json({ error: 'পণ্য যোগ করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return Response.json({ error: 'পণ্য আইডি আবশ্যক' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = parseFloat(data.price)
    if (data.category !== undefined) updateData.category = data.category
    if (data.image !== undefined) updateData.image = data.image
    if (data.images !== undefined) updateData.images = data.images
    if (data.colors !== undefined) updateData.colors = data.colors
    if (data.sizes !== undefined) updateData.sizes = data.sizes
    if (data.fabric !== undefined) updateData.fabric = data.fabric
    if (data.featured !== undefined) updateData.featured = data.featured
    if (data.stock !== undefined) updateData.stock = parseInt(data.stock)

    const product = await db.product.update({
      where: { id },
      data: updateData,
    })

    return Response.json({ success: true, product, message: 'পণ্য সফলভাবে আপডেট হয়েছে' })
  } catch (error) {
    console.error('Product update error:', error)
    return Response.json({ error: 'পণ্য আপডেট করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'পণ্য আইডি আবশ্যক' }, { status: 400 })
    }

    await db.review.deleteMany({ where: { productId: id } })
    await db.product.delete({ where: { id } })

    return Response.json({ success: true, message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে' })
  } catch (error) {
    console.error('Product delete error:', error)
    return Response.json({ error: 'পণ্য মুছতে সমস্যা হয়েছে' }, { status: 500 })
  }
}
