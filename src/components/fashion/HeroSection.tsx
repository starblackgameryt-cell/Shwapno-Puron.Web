'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

// Deterministic pattern to avoid hydration mismatch (no Math.random in render)
const DECOR_PATTERN = [1, 0.3, 1, 1, 0.3, 1, 0.3, 1, 1, 1, 0.3, 1, 1, 0.3, 1, 1, 1, 0.3, 1, 1]

export function HeroSection() {
  const { get } = useSiteContent()
  // Memoize the decorative bars to avoid recalculating on every render
  const decorBars = useMemo(() => DECOR_PATTERN, [])
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 w-full" style={{ paddingBottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom)))' }}>
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex gap-0.5">
                  {decorBars.map((opacity, i) => (
                    <div key={i} className="w-[2px] h-3 sm:h-4 bg-stone-900" style={{ opacity }} />
                  ))}
                </div>
                <span className="text-[9px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase text-stone-500 font-medium">{get('hero_since_label')}</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
              <h1 className="text-[48px] sm:text-[80px] md:text-[110px] lg:text-[140px] font-black leading-[0.85] tracking-tighter text-stone-900 select-none">
                পো
                <span className="relative inline-flex items-center justify-center mx-0.5 sm:mx-1 md:mx-2 align-middle">
                  <span className="w-[44px] h-[44px] sm:w-[65px] sm:h-[65px] md:w-[90px] md:h-[90px] lg:w-[110px] lg:h-[110px] rounded-full overflow-hidden border-2 border-stone-900 flex-shrink-0">
                    <Image src={get('hero_image')} alt="স্বপ্ন পূরণ ড্রেস" fill className="object-cover" priority sizes="(max-width: 640px) 44px, (max-width: 768px) 65px, (max-width: 1024px) 90px, 110px" />
                  </span>
                </span>
                শাক
              </h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="mt-3 sm:mt-6">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-light tracking-[0.1em] sm:tracking-[0.15em] text-stone-400">
                {get('hero_subtitle')}
              </h2>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="mt-4 sm:mt-8 max-w-md">
              <p className="text-stone-500 leading-relaxed text-sm sm:text-base">
                {get('hero_description')}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }} className="mt-6 sm:mt-10 flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
              <Button asChild className="bg-stone-900 hover:bg-stone-800 text-white px-6 sm:px-8 py-5 sm:py-6 rounded-none text-[11px] tracking-[0.2em] uppercase transition-all duration-300 group w-full sm:w-auto min-h-[44px]">
                <a href="#shop">এখনই দেখুন <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></a>
              </Button>
              <Button variant="outline" asChild className="border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white px-6 sm:px-8 py-5 sm:py-6 rounded-none text-[11px] tracking-[0.2em] uppercase transition-all duration-300 w-full sm:w-auto min-h-[44px]">
                <a href="#collection">কালেকশন</a>
              </Button>
            </motion.div>
          </div>

          <div className="lg:col-span-5 mt-6 lg:mt-0">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="relative">
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-50">
                <Image src={get('hero_image')} alt="প্রিমিয়াম পোশাক" fill className="object-cover" priority sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw" />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white rounded-full px-2.5 py-1 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-md">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] sm:text-[11px] tracking-widest uppercase font-medium text-stone-700">নতুন</span>
                </div>
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-stone-900 text-white rounded-full px-2.5 py-1 sm:px-4 sm:py-2 shadow-md">
                  <span className="text-[9px] sm:text-[11px] tracking-widest uppercase font-medium">৳২,৪৯৯</span>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1 }} className="hidden sm:flex absolute -bottom-4 -left-4 sm:-bottom-8 sm:-left-8 bg-white p-3 sm:p-4 shadow-xl border border-stone-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center"><span className="text-amber-700 text-[10px] sm:text-xs font-bold">★</span></div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-stone-900">প্রিমিয়াম মান</p>
                    <p className="text-[8px] sm:text-[10px] text-stone-400">হাতে বানানো</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
