import { db } from '@/lib/db'

// POST - Submit a review for a product
export async function POST(request: Request) {
  try {
    const { productId, name, rating, comment } = await request.json()

    if (!productId || !name || !rating || !comment) {
      return Response.json({ error: 'সকল তথ্য পূরণ করুন' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ error: 'রেটিং ১-৫ এর মধ্যে হতে হবে' }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return Response.json({ error: 'পণ্য পাওয়া যায়নি' }, { status: 404 })
    }

    // Create the review
    const review = await db.review.create({
      data: {
        productId,
        name: name.trim(),
        rating: parseInt(rating),
        comment: comment.trim(),
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      },
    })

    // Update product review count and rating
    const allReviews = await db.review.findMany({ where: { productId } })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await db.product.update({
      where: { id: productId },
      data: {
        reviewCount: allReviews.length,
        rating: Math.round(avgRating * 10) / 10,
      },
    })

    return Response.json({ success: true, review })
  } catch (error) {
    console.error('Review submission error:', error)
    return Response.json({ error: 'রিভিউ জমা দিতে সমস্যা হয়েছে' }, { status: 500 })
  }
}
