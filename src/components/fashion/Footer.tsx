'use client'

import { useState } from 'react'
import { ScrollReveal } from './ScrollReveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Facebook, Instagram, MessageCircle, ArrowUp, Phone, Mail, MapPin } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

export function Footer() {
  const { get } = useSiteContent()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = async () => {
    if (!email) return
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      setSubscribed(true); setEmail('')
    } catch { /* error */ }
  }

  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="py-10 sm:py-16 lg:py-20 border-b border-stone-800">
          <ScrollReveal>
            <div className="max-w-xl mx-auto text-center">
              <h3 className="text-xl sm:text-3xl font-black tracking-tight">আপডেট পান</h3>
              <p className="mt-2 sm:mt-3 text-stone-400 text-xs sm:text-sm">নতুন কালেকশন ও অফার সরাসরি আপনার ইনবক্সে।</p>
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Input
                  type="email"
                  placeholder="আপনার ইমেইল"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full flex-1 bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 rounded-none px-4 sm:px-6 py-4 sm:py-5 text-sm min-h-[44px]"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                />
                <Button
                  onClick={handleSubscribe}
                  disabled={subscribed}
                  className="w-full sm:w-auto bg-white text-stone-900 hover:bg-stone-100 px-5 sm:px-8 py-4 sm:py-5 rounded-none text-[11px] tracking-[0.2em] uppercase font-bold min-h-[44px]"
                >
                  {subscribed ? 'সাবস্ক্রাইব হয়েছে ✓' : 'সাবস্ক্রাইব'}
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Main Footer */}
        <div className="py-10 sm:py-16 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <span className="text-lg sm:text-xl font-black tracking-tight">স্বপ্ন পূরণ</span>
            <span className="block text-[7px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-stone-500">Shwapno Puron</span>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-stone-400 leading-relaxed max-w-xs">
              {get('footer_brand_description')}
            </p>
            <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
              {get('footer_facebook') ? (
                <a href={get('footer_facebook')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-11 sm:h-11 border border-stone-700 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
              ) : (
                <span className="w-10 h-10 sm:w-11 sm:h-11 border border-stone-700 flex items-center justify-center opacity-40 cursor-not-allowed" title="Not Available"><Facebook className="w-4 h-4" /></span>
              )}
              {get('footer_instagram') ? (
                <a href={get('footer_instagram')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-11 sm:h-11 border border-stone-700 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
              ) : (
                <span className="w-10 h-10 sm:w-11 sm:h-11 border border-stone-700 flex items-center justify-center opacity-40 cursor-not-allowed" title="Not Available"><Instagram className="w-4 h-4" /></span>
              )}
              {get('footer_whatsapp') ? (
                <a href={`https://wa.me/${get('footer_whatsapp')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-11 sm:h-11 border border-stone-700 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0" aria-label="WhatsApp"><MessageCircle className="w-4 h-4" /></a>
              ) : (
                <span className="w-10 h-10 sm:w-11 sm:h-11 border border-stone-700 flex items-center justify-center opacity-40 cursor-not-allowed" title="Not Available"><MessageCircle className="w-4 h-4" /></span>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mb-3 sm:mb-4 font-bold">দ্রুত লিংক</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['নতুন আগমন', 'সালোয়ার কামিজ', 'শাড়ি', 'লেহেঙ্গা', 'কুর্তা'].map((link) => (
                <li key={link}><a href="#shop" className="text-xs sm:text-sm text-stone-500 hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mb-3 sm:mb-4 font-bold">সাহায্য</h4>
            <ul className="space-y-2 sm:space-y-3">
              {['যোগাযোগ', 'সাইজ গাইড', 'ডেলিভারি', 'রিটার্ন ও এক্সচেঞ্জ', 'সাধারণ জিজ্ঞাসা'].map((link) => (
                <li key={link}><a href="#" className="text-xs sm:text-sm text-stone-500 hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mb-3 sm:mb-4 font-bold">যোগাযোগ</h4>
            <div className="space-y-2 sm:space-y-3">
              <a href={`tel:${get('footer_phone').replace(/[\s\-]/g, '')}`} className="py-1 flex items-center gap-2 text-xs sm:text-sm text-stone-500 hover:text-white transition-colors min-h-[32px]"><Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> {get('footer_phone')}</a>
              {get('footer_whatsapp') && <a href={`https://wa.me/${get('footer_whatsapp')}`} target="_blank" rel="noopener noreferrer" className="py-1 flex items-center gap-2 text-xs sm:text-sm text-stone-500 hover:text-white transition-colors min-h-[32px]"><MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> WhatsApp</a>}
              <a href={`mailto:${get('footer_email')}`} className="py-1 flex items-center gap-2 text-xs sm:text-sm text-stone-500 hover:text-white transition-colors min-h-[32px]"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> <span className="break-all">{get('footer_email')}</span></a>
              {get('footer_facebook') && <a href={get('footer_facebook')} target="_blank" rel="noopener noreferrer" className="py-1 flex items-center gap-2 text-xs sm:text-sm text-stone-500 hover:text-white transition-colors min-h-[32px]"><Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> {get('footer_facebook_name')}</a>}
              {get('footer_instagram') && <a href={get('footer_instagram')} target="_blank" rel="noopener noreferrer" className="py-1 flex items-center gap-2 text-xs sm:text-sm text-stone-500 hover:text-white transition-colors min-h-[32px]"><Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> Instagram</a>}
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-500 min-h-[32px]"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" /> {get('footer_address')}</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4 sm:py-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <p className="text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-wider">© {new Date().getFullYear()} স্বপ্ন পূরণ। সর্বস্বত্ব সংরক্ষিত।</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-[9px] sm:text-[10px] text-stone-500 hover:text-white transition-colors uppercase tracking-wider group min-h-[44px]">
            উপরে যান <ArrowUp className="w-3 h-3 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  )
}
