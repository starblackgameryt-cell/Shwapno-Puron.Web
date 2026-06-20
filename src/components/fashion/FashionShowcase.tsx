'use client'

import Image from 'next/image'
import { ScrollReveal } from './ScrollReveal'
import { Shield, Award, Heart } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

export function FashionShowcase() {
  const { get } = useSiteContent()

  const showcaseItems = [
    { src: get('showcase_image1'), alt: 'শাড়ি কালেকশন' },
    { src: get('showcase_image2'), alt: 'এমব্রয়ডারি ডিটেইল' },
    { src: get('showcase_image3'), alt: 'লেহেঙ্গা কালেকশন' },
    { src: get('showcase_image4'), alt: 'সম্পূর্ণ পোশাক' },
  ]

  const features = [
    { icon: Shield, title: get('showcase_feature1_title'), description: get('showcase_feature1_desc') },
    { icon: Award, title: get('showcase_feature2_title'), description: get('showcase_feature2_desc') },
    { icon: Heart, title: get('showcase_feature3_title'), description: get('showcase_feature3_desc') },
  ]

  return (
    <section id="brand" className="py-12 sm:py-20 lg:py-32 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-stone-400 font-medium">{get('showcase_label')}</span>
            <h2 className="mt-2 text-2xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight">{get('showcase_title')}</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 mb-12 sm:mb-20">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.1}>
              <div className="bg-white p-5 sm:p-8 lg:p-10 text-center hover:shadow-lg transition-shadow duration-300 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-stone-700" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold tracking-[0.1em] sm:tracking-[0.15em] uppercase text-stone-900">{feature.title}</h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-stone-500 leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-stone-400 font-medium">গ্যালারি</span>
            <h2 className="mt-2 text-2xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight">শোকেস</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {showcaseItems.map((item, index) => (
            <ScrollReveal key={item.src} delay={index * 0.1}>
              <div className={`group relative ${index === 0 ? 'aspect-[3/4] md:row-span-2' : 'aspect-square'} overflow-hidden bg-stone-100 cursor-pointer`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <p className="text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase">{item.alt}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
