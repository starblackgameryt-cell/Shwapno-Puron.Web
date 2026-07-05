import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import ProductPageClient from './ProductPageClient'

const SITE_URL = process.env.SITE_URL || process.env.NEXTAUTH_URL || 'https://shwapno-puron-web.vercel.app'

interface ReviewRow {
  id: string
  name: string
  rating: number
  comment: string
  date: string
}

interface ProductRow {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  images: string
  colors: string
  sizes: string
  fabric: string
  rating: number
  reviewCount: number
  featured: boolean
  reviews: ReviewRow[]
}

async function getProduct(id: string): Promise<ProductRow | null> {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: { reviews: true },
    })
    return (product as ProductRow | null) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: 'পোশাক পাওয়া যায়নি',
      robots: { index: false, follow: false },
    }
  }

  // Title is just the product name — the root layout's title template
  // ("%s | স্বপ্ন পূরণ") appends the brand suffix automatically.
  // For og:title/twitter:title we use the full string explicitly.
  const title = product.name
  const fullTitle = `${product.name} | স্বপ্ন পূরণ`
  const description = product.description.slice(0, 155)
  const imageUrl = product.image.startsWith('http')
    ? product.image
    : `${SITE_URL}${product.image}`
  const pageUrl = `${SITE_URL}/products/${product.id}`

  return {
    title,
    description,
    keywords: [product.name, product.category, product.fabric, 'স্বপ্ন পূরণ', 'বাংলাদেশি ফ্যাশন'],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      url: pageUrl,
      siteName: 'স্বপ্ন পূরণ — Shwapno Puron',
      locale: 'bn_BD',
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return <ProductPageClient product={product} />
}
