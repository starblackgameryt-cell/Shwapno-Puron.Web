'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/fashion/Navbar'
import { Footer } from '@/components/fashion/Footer'
import { ListSidebar } from '@/components/fashion/ListSidebar'
import { FloatingContact } from '@/components/fashion/FloatingContact'
import { ProductDetail } from '@/components/fashion/ProductDetail'
import { useStore } from '@/store/useStore'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
}

interface Product {
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
  reviews: Review[]
}

export default function ProductPageClient({ product }: { product: Product }) {
  const { currentView, setSelectedProduct } = useStore()
  const router = useRouter()
  const isInitialMount = useRef(true)

  // On mount: set store to product view so the shared Navbar/ProductDetail
  // components behave correctly (e.g., "back" button calls goHome()).
  useEffect(() => {
    setSelectedProduct(product.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  // Watch for the user triggering "back to home" via the shared ProductDetail
  // component (which calls goHome() → sets currentView to 'home').
  // On subsequent changes (not initial mount), navigate to the home route.
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (currentView === 'home') {
      router.push('/')
    }
  }, [currentView, router])

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <ProductDetail product={product} />
      </main>
      <Footer />
      <ListSidebar />
      <FloatingContact />
    </div>
  )
}
