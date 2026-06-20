'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'
import { ArrowRight } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

export function AboutBrand() {
  const { get } = useSiteContent()
  return (
    <section id="about" className="py-12 sm:py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="relative aspect-[3/4] max-h-[350px] sm:max-h-[450px] lg:max-h-none overflow-hidden">
                <Image
                  src={get('about_image')}
                  alt="স্বপ্ন পূরণ আতেলিয়ে"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 lg:-bottom-8 lg:-right-8 bg-stone-900 text-white p-3 sm:p-5 lg:p-8">
                <p className="text-2xl sm:text-3xl lg:text-5xl font-black">{get('about_experience_years')}</p>
                <p className="text-[8px] sm:text-[10px] lg:text-[11px] tracking-[0.2em] uppercase text-stone-400 mt-0.5">{get('about_experience_label')}</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="lg:pl-8">
              <span className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-stone-400 font-medium">{get('about_label')}</span>
              <h2 className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
                {get('about_title_line1')}<br/><span className="font-light text-stone-400">{get('about_title_line2')}</span>
              </h2>
              <p className="mt-4 sm:mt-6 text-stone-500 leading-relaxed text-sm sm:text-base">
                {get('about_paragraph1')}
              </p>
              <p className="mt-3 sm:mt-4 text-stone-500 leading-relaxed text-sm sm:text-base">
                {get('about_paragraph2')}
              </p>
              <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-0 divide-x divide-stone-200">
                <div className="pr-2 sm:pr-4">
                  <p className="text-lg sm:text-2xl lg:text-3xl font-black text-stone-900">{get('about_stat1_number')}</p>
                  <p className="text-[7px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mt-0.5 sm:mt-1">{get('about_stat1_label')}</p>
                </div>
                <div className="px-2 sm:px-4">
                  <p className="text-lg sm:text-2xl lg:text-3xl font-black text-stone-900">{get('about_stat2_number')}</p>
                  <p className="text-[7px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mt-0.5 sm:mt-1">{get('about_stat2_label')}</p>
                </div>
                <div className="pl-2 sm:pl-4">
                  <p className="text-lg sm:text-2xl lg:text-3xl font-black text-stone-900">{get('about_stat3_number')}</p>
                  <p className="text-[7px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mt-0.5 sm:mt-1">{get('about_stat3_label')}</p>
                </div>
              </div>
              <div className="mt-8 sm:mt-10">
                <Button asChild className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white px-6 sm:px-8 py-5 sm:py-6 rounded-none text-[11px] tracking-[0.2em] uppercase transition-all duration-300 group min-h-[44px]">
                  <a href="#shop">এখনই কিনুন <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></a>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
