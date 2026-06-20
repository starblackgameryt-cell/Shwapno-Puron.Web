import { db } from '@/lib/db'

const products = [
  {
    name: 'নেভি এমব্রয়ডারি সালোয়ার কামিজ',
    description: 'একটি চমৎকার নেভি ব্লু সালোয়ার কামিজ, যেখানে জরি এমব্রয়ডারির কাজ করা। প্রিমিয়াম সিল্ক ফ্যাব্রিকে তৈরি এই পোশাকটি উৎসব ও অনুষ্ঠানের জন্য দারুণ।',
    price: 2499,
    category: 'সালোয়ার কামিজ',
    image: '/images/products/product1.png',
    images: '/images/products/product1.png',
    colors: 'নেভি,কালো,গাঢ় লাল',
    sizes: 'S,M,L,XL,XXL',
    fabric: 'পিওর সিল্ক, গোল্ড জরি এমব্রয়ডারি ও ক্রেপ লাইনিং',
    featured: true,
    reviewCount: 24,
    rating: 4.8,
    stock: 15,
  },
  {
    name: 'মেরুন বেনারসি শাড়ি',
    description: 'একটি অসাধারণ মেরুন বেনারসি শাড়ি, সোনালী জরি বর্ডার ও পল্লু সহ। মাস্টার তাঁতিদের হাতে বোনা এই শাড়িটি বিয়ে ও বিশেষ অনুষ্ঠানের জন্য পারফেক্ট।',
    price: 3999,
    category: 'শাড়ি',
    image: '/images/products/product2.png',
    images: '/images/products/product2.png',
    colors: 'মেরুন,গাঢ় লাল,সোনালী',
    sizes: 'ফ্রি সাইজ',
    fabric: 'পিওর বেনারসি সিল্ক, গোল্ড জরি বর্ডার',
    featured: true,
    reviewCount: 31,
    rating: 4.6,
    stock: 8,
  },
  {
    name: 'এমারেল্ড মিরর ওয়ার্ক লেহেঙ্গা',
    description: 'একটি মনোমুগ্ধকর এমারেল্ড গ্রিন লেহেঙ্গা, ভারী মিরর ওয়ার্ক ও এমব্রয়ডারি সহ। বিয়ের অনুষ্ঠান ও বড় উদযাপনের জন্য আদর্শ।',
    price: 5499,
    category: 'লেহেঙ্গা',
    image: '/images/products/product3.png',
    images: '/images/products/product3.png',
    colors: 'এমারেল্ড,রয়্যাল ব্লু,টিল',
    sizes: 'S,M,L,XL',
    fabric: 'রেশম সিল্ক, মিরর ওয়ার্ক ও রেশম এমব্রয়ডারি',
    featured: true,
    reviewCount: 18,
    rating: 4.7,
    stock: 5,
  },
  {
    name: 'পিচ চিকনকারি আনারকলি',
    description: 'একটি মার্জিত পিচ রঙের আনারকলি স্যুট, লখনউ চিকনকারি এমব্রয়ডারি সহ। দিনের অনুষ্ঠান ও হালকা মেলামেশার জন্য চমৎকার।',
    price: 1899,
    category: 'সালোয়ার কামিজ',
    image: '/images/products/product4.png',
    images: '/images/products/product4.png',
    colors: 'পিচ,হালকা গোলাপি,ক্রিম',
    sizes: 'S,M,L,XL,XXL',
    fabric: 'জর্জেট, হ্যান্ড চিকনকারি এমব্রয়ডারি',
    featured: true,
    reviewCount: 27,
    rating: 4.5,
    stock: 20,
  },
  {
    name: 'রয়্যাল ব্লু শারারা সেট',
    description: 'একটি দুর্দান্ত রয়্যাল ব্লু শারারা সেট, ভারী দুপাট্টা ও সিকুইন ওয়ার্ক সহ। উৎসবের জন্য একটি দারুণ এনসেম্বল।',
    price: 3299,
    category: 'শারারা',
    image: '/images/products/product5.png',
    images: '/images/products/product5.png',
    colors: 'রয়্যাল ব্লু,নেভি,বেগুনি',
    sizes: 'S,M,L,XL',
    fabric: 'অর্গাঞ্জা, সিকুইন ও জরদোসি ওয়ার্ক',
    featured: false,
    reviewCount: 22,
    rating: 4.9,
    stock: 12,
  },
  {
    name: 'লাল ব্রাইডাল লেহেঙ্গা',
    description: 'একটি অসাধারণ লাল ব্রাইডাল লেহেঙ্গা, ভারী জরদোসি ও কুন্দন ওয়ার্ক সহ। আপনার বিশেষ দিনের জন্য সেরা পছন্দ।',
    price: 8999,
    category: 'লেহেঙ্গা',
    image: '/images/products/product6.png',
    images: '/images/products/product6.png',
    colors: 'লাল,মেরুন,গাঢ় লাল',
    sizes: 'S,M,L',
    fabric: 'ভেলভেট, জরদোসি, কুন্দন ও মুক্তা কাজ',
    featured: false,
    reviewCount: 15,
    rating: 4.4,
    stock: 3,
  },
  {
    name: 'ক্রিম পালাজো কুর্তা সেট',
    description: 'একটি মার্জিত ক্রিম কুর্তা পালাজো সেট, চিকনকারি এমব্রয়ডারি সহ। প্রতিদিনের আরামদায়ক পরিধানের জন্য চমৎকার।',
    price: 1499,
    category: 'কুর্তা',
    image: '/images/products/product7.png',
    images: '/images/products/product7.png',
    colors: 'ক্রিম,সাদা,আইভরি',
    sizes: 'S,M,L,XL,XXL',
    fabric: 'পিওর কটন, চিকনকারি থ্রেড ওয়ার্ক',
    featured: false,
    reviewCount: 19,
    rating: 4.6,
    stock: 25,
  },
  {
    name: 'বেগুনি ঘারারা ড্রেস সেট',
    description: 'একটি মনোহর গাঢ় বেগুনি ঘারারা ড্রেস সেট, কোরা দাবকা এমব্রয়ডারি ও মুক্তা কাজ সহ। উৎসবের জন্য একটি অনন্য পোশাক।',
    price: 4299,
    category: 'ঘারারা',
    image: '/images/products/product8.png',
    images: '/images/products/product8.png',
    colors: 'বেগুনি,রোজ পিঙ্ক,সিলভার',
    sizes: 'S,M,L,XL',
    fabric: 'জামাওয়ার, কোরা দাবকা ও মুক্তা এমব্রয়ডারি',
    featured: false,
    reviewCount: 21,
    rating: 4.7,
    stock: 7,
  },
]

const reviews = [
  { productId: '', name: 'ফাতেমা রহমান', rating: 5, comment: 'অসাধারণ সুন্দর! এমব্রয়ডারির কাজ দেখে মুগ্ধ হয়েছি। আবার অর্ডার করব!', date: '২০২৫-০১-১৫' },
  { productId: '', name: 'নুসরাত জাহান', rating: 5, comment: 'বিয়েতে অনেক কমপ্লিমেন্ট পেয়েছি। ফিটিং পারফেক্ট আর কাজের মান অবিশ্বাস্য!', date: '২০২৫-০২-০৩' },
  { productId: '', name: 'তাসলিমা আখতার', rating: 4, comment: 'সুন্দর ডিজাইন আর ভালো মান। একটু লম্বা হয়েছে কিন্তু দরজি দিয়ে ঠিক করা যাবে।', date: '২০২৫-০১-২৮' },
  { productId: '', name: 'রাবেয়া খাতুন', rating: 5, comment: 'মেয়ের বিয়েতে রানির মতো অনুভব করেছি। কারুকাজ অসাধারণ!', date: '২০২৫-০৩-১০' },
  { productId: '', name: 'সাবরিনা ইসলাম', rating: 4, comment: 'মার্জিত আর ভালো মানের। রং আসলের চেয়েও সুন্দর। ফ্যাব্রিক প্রিমিয়াম মানের।', date: '২০২৫-০২-১৮' },
  { productId: '', name: 'লামিয়া হক', rating: 5, comment: 'ঈদের জন্য পারফেক্ট! এমব্রয়ডারি অসাধারণ আর ডেলিভারিও দ্রুত।', date: '২০২৫-০১-২২' },
]

export async function POST(request: Request) {
  try {
    // Check if products already exist
    const existing = await db.product.count()

    // If products already exist, only admin can re-seed
    if (existing > 0) {
      const { verifyAdminSession } = await import('@/lib/auth')
      const adminToken = request.headers.get('cookie')?.match(/admin_token=([^;]+)/)?.[1]
      if (!adminToken) {
        return Response.json({ message: 'পণ্য আগে থেকেই আছে, রি-সিড করতে অ্যাডমিন লগইন করুন' }, { status: 200 })
      }
      const adminSession = await verifyAdminSession(adminToken)
      if (!adminSession) {
        return Response.json({ message: 'পণ্য আগে থেকেই আছে, রি-সিড করতে অ্যাডমিন লগইন করুন' }, { status: 200 })
      }
      await db.review.deleteMany()
      await db.product.deleteMany()
    }

    const createdProducts = []
    for (const product of products) { const created = await db.product.create({ data: product }); createdProducts.push(created) }

    for (const product of createdProducts) {
      for (const review of reviews) {
        await db.review.create({ data: { productId: product.id, name: review.name, rating: review.rating, comment: review.comment, date: review.date } })
      }
      await db.product.update({ where: { id: product.id }, data: { reviewCount: reviews.length } })
    }

    // Seed default payment methods if none exist
    const existingPaymentMethods = await db.paymentMethod.count()
    if (existingPaymentMethods === 0) {
      await db.paymentMethod.createMany({
        data: [
          { name: 'bKash', number: '017XX-XXXXXX', text: 'সেন্ড মানি: ব্যক্তিগত', icon: 'bkash', color: 'pink', sortOrder: 0, isActive: true },
          { name: 'Nagad', number: '018XX-XXXXXX', text: 'ক্যাশ আউট: ব্যক্তিগত', icon: 'nagad', color: 'orange', sortOrder: 1, isActive: true },
          { name: 'Rocket', number: '016XX-XXXXXX', text: 'সেন্ড মানি', icon: 'rocket', color: 'purple', sortOrder: 2, isActive: true },
          { name: 'ইসলামী ব্যাংক', number: '1234567890', text: 'অ্যাকাউন্ট: স্বপ্ন পূরণ ফ্যাশন | শাখা: ধানমন্ডি', icon: 'bank', color: 'teal', sortOrder: 3, isActive: true },
        ],
      })
    }

    // Seed default contact methods if none exist
    const existingContactMethods = await db.contactMethod.count()
    if (existingContactMethods === 0) {
      await db.contactMethod.createMany({
        data: [
          { name: 'WhatsApp', number: '+8801XXXXXXXXX', text: 'সরাসরি মেসেজ করুন', link: 'https://wa.me/8801700000000?text=হ্যালো, আমি পেমেন্ট করেছি।', icon: 'whatsapp', color: 'green', sortOrder: 0, isActive: true },
          { name: 'Messenger', number: '@স্বপ্নপূরণ', text: 'Facebook মেসেজ', link: 'https://m.me/100095208882295', icon: 'messenger', color: 'blue', sortOrder: 1, isActive: true },
        ],
      })
    }

    return Response.json({ message: 'ডাটাবেস সফলভাবে সিড করা হয়েছে', products: createdProducts.length, reviews: reviews.length * createdProducts.length })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({ error: 'সিড করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}
