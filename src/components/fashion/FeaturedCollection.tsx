'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'
import { Button } from '@/components/ui/button'
import { Star, ArrowRight, ShoppingBag, Heart } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useSiteContent } from '@/hooks/useSiteContent'

interface Product {
  id: string; name: string; description: string; price: number; category: string; image: string; rating: number; reviewCount: number; featured: boolean
}

export function FeaturedCollection({ products }: { products: Product[] }) {
  const { setSelectedProduct, addToList } = useStore()
  const { get } = useSiteContent()
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [animatingHeart, setAnimatingHeart] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const authRes = await fetch('/api/auth/me')
        if (authRes.ok) {
          setIsLoggedIn(true)
          const favRes = await fetch('/api/users/favorites')
          if (favRes.ok) {
            const favData = await favRes.json()
            const favIds = new Set<string>()
            if (Array.isArray(favData)) {
              favData.forEach((id: string) => favIds.add(id))
            } else if (favData.favorites && Array.isArray(favData.favorites)) {
              favData.favorites.forEach((id: string) => favIds.add(id))
            }
            setFavorites(favIds)
          }
        }
      } catch { /* */ }
    }
    init()
  }, [])

  const toggleFavorite = useCallback(async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    if (!isLoggedIn) { window.location.href = '/login'; return }
    setAnimatingHeart(productId)
    try {
      const res = await fetch('/api/users/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setFavorites((prev) => {
          const next = new Set(prev)
          if (next.has(productId)) next.delete(productId); else next.add(productId)
          return next
        })
      }
    } catch { /* */ }
    setTimeout(() => setAnimatingHeart(null), 300)
  }, [isLoggedIn])

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    setSelectedProduct(product.id)
  }

  const handleAddToList = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    addToList({ productId: product.id, name: product.name, price: product.price, image: product.image, size: 'ফ্রি সাইজ', color: 'ডিফল্ট', quantity: 1 })
  }

  return (
    <section id="collection" className="py-12 sm:py-20 lg:py-32 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-16">
            <div>
              <span className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-stone-400 font-medium">{get('featured_label')}</span>
              <h2 className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight">{get('featured_title')}</h2>
            </div>
            <Button variant="outline" asChild className="border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white px-5 sm:px-6 py-3 sm:py-4 rounded-none text-[11px] tracking-[0.2em] uppercase w-fit group min-h-[44px]">
              <a href="#shop">সব দেখুন <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" /></a>
            </Button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {featuredProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 0.08}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }} className="group cursor-pointer bg-white overflow-hidden" onClick={() => setSelectedProduct(product.id)}>
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white px-2 py-0.5 sm:px-3 sm:py-1">
                    <span className="text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] uppercase font-medium text-stone-600">{product.category}</span>
                  </div>
                  {/* Favorite Heart */}
                  <motion.button
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 sm:p-2 bg-white shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 hover:bg-stone-900 hover:text-white z-10 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    onClick={(e) => toggleFavorite(e, product.id)}
                    aria-label="পছন্দে যোগ করুন"
                    animate={animatingHeart === product.id ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={favorites.has(product.id) ? 'filled' : 'outline'}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.12 }}
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                  {/* Hover: বিস্তারিত দেখুন */}
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 translate-y-0 sm:translate-y-3 sm:group-hover:translate-y-0">
                    <button
                      className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-none py-3 sm:py-5 text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold min-h-[44px]"
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product.id) }}
                    >
                      বিস্তারিত দেখুন
                    </button>
                  </div>
                </div>
                <div className="pt-2 sm:pt-4 px-0.5">
                  <h3 className="text-[10px] sm:text-sm font-bold text-stone-900 uppercase tracking-wider group-hover:text-amber-700 transition-colors line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between mt-1 sm:mt-1.5">
                    <p className="text-xs sm:text-base font-semibold text-stone-900">৳{product.price.toLocaleString()}</p>
                    <div className="flex items-center gap-0.5 sm:gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-[9px] sm:text-[10px] text-stone-500">{product.rating}</span></div>
                  </div>
                  {/* Buy + Add to list */}
                  <div className="mt-2 sm:mt-3 flex gap-1.5 sm:gap-2">
                    <button
                      onClick={(e) => handleBuyNow(e, product)}
                      className="flex-1 bg-stone-900 hover:bg-stone-800 text-white py-2.5 sm:py-2.5 text-[9px] sm:text-[11px] tracking-[0.08em] sm:tracking-[0.1em] uppercase font-bold transition-colors min-h-[44px] sm:min-h-0"
                    >
                      এখনই কিনুন
                    </button>
                    <button
                      onClick={(e) => handleAddToList(e, product)}
                      className="w-11 sm:w-11 border-2 border-stone-200 hover:border-stone-400 flex items-center justify-center transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
                      aria-label="তালিকায় যোগ করুন"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
