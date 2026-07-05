import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const SITE_URL =
  process.env.SITE_URL ||
  process.env.NEXTAUTH_URL ||
  'https://shwapno-puron-web.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ---- Static public pages ----
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/login`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/signup`,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/forgot-password`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  // ---- Dynamic product pages ----
  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await db.product.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    })
    productPages = products.map((p) => ({
      url: `${SITE_URL}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('[sitemap] Failed to fetch products:', error)
  }

  return [...staticPages, ...productPages]
}
