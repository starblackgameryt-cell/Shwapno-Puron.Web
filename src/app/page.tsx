'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Navbar } from '@/components/fashion/Navbar'
import { HeroSection } from '@/components/fashion/HeroSection'
import { FeaturedCollection } from '@/components/fashion/FeaturedCollection'
import { AboutBrand } from '@/components/fashion/AboutBrand'
import { FashionShowcase } from '@/components/fashion/FashionShowcase'
import { ProductGrid } from '@/components/fashion/ProductGrid'
import { ProductDetail } from '@/components/fashion/ProductDetail'
import { Footer } from '@/components/fashion/Footer'
import { ListSidebar } from '@/components/fashion/ListSidebar'
import { FloatingContact } from '@/components/fashion/FloatingContact'
import { CheckoutPage } from '@/components/fashion/CheckoutPage'

interface Product {
  id: string; name: string; description: string; price: number; category: string; image: string; images: string; colors: string; sizes: string; fabric: string; rating: number; reviewCount: number; featured: boolean
  reviews: Array<{ id: string; name: string; rating: number; comment: string; date: string }>
}

export default function Home() {
  const { currentView, selectedProductId, goHome } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [productLoading, setProductLoading] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        if (!sessionStorage.getItem('seeded')) {
          await fetch('/api/seed', { method: 'POST' })
          sessionStorage.setItem('seeded', '1')
        }
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const fetchProductDetail = useCallback(async (id: string) => {
    setProductLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error('Product not found')
      const data = await res.json()
      setSelectedProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      setSelectedProduct(null)
      goHome()
    } finally {
      setProductLoading(false)
    }
  }, [goHome])

  useEffect(() => {
    if (selectedProductId) {
      fetchProductDetail(selectedProductId)
    } else {
      setSelectedProduct(null)
    }
  }, [selectedProductId, fetchProductDetail])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentView])

  if (loading) {
    return (
      <div className="min-h-[100svh] flex flex-col items-center justify-center bg-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">স্বপ্ন পূরণ</span>
          <div className="w-36 sm:w-48 h-0.5 bg-stone-200 overflow-hidden mt-3 sm:mt-4 mx-auto">
            <motion.div className="h-full bg-stone-900" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
          </div>
          <p className="mt-3 text-[9px] sm:text-xs text-stone-400 tracking-[0.3em] uppercase">Loading</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <HeroSection />
              <FeaturedCollection products={products} />
              <AboutBrand />
              <FashionShowcase />
              <ProductGrid products={products} />
            </motion.div>
          ) : currentView === 'checkout' ? (
            <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <CheckoutPage />
            </motion.div>
          ) : (
            <motion.div key="product" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {productLoading ? (
                <div className="min-h-[100svh] flex flex-col items-center justify-center">
                  <div className="w-7 h-7 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
                  <p className="mt-3 text-[10px] sm:text-xs text-stone-400 tracking-wider uppercase">পোশাক লোড হচ্ছে...</p>
                </div>
              ) : selectedProduct ? (
                <ProductDetail product={selectedProduct} />
              ) : (
                <div className="min-h-[100svh] flex flex-col items-center justify-center">
                  <p className="text-stone-500 text-sm">পোশাক পাওয়া যায়নি</p>
                  <button onClick={goHome} className="mt-4 text-stone-900 text-xs underline uppercase tracking-wider min-h-[44px]">হোমে ফিরে যান</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
      <ListSidebar />
      <FloatingContact />
    </div>
  )
}
