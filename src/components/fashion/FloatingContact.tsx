'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Phone, Mail, X } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'
import { useStore } from '@/store/useStore'

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false)
  const { get } = useSiteContent()
  const { currentView } = useStore()

  const whatsappNumber = get('footer_whatsapp') || '8801700000000'
  const businessEmail = get('footer_email') || 'dolamaanha@gmail.com'
  const facebookUrl = get('footer_facebook') || ''

  const getMessengerUrl = (url: string) => {
    if (!url) return ''
    const idMatch = url.match(/[?&]id=(\d+)/)
    if (idMatch) return `https://m.me/${idMatch[1]}`
    const username = url.split('/').filter(Boolean).pop()
    return username ? `https://m.me/${username}` : ''
  }
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('হ্যালো, আমি একটি ড্রেস সম্পর্কে জানতে চাই।')}`
  const messengerUrl = getMessengerUrl(facebookUrl)
  const emailUrl = `mailto:${businessEmail}?subject=ড্রেস সম্পর্কে জিজ্ঞাসা&body=হ্যালো, আমি একটি ড্রেস সম্পর্কে জানতে চাই।`

  // On product page, the sticky CTA takes up bottom space on mobile
  // Position the floating button above the sticky CTA on mobile, normal on desktop
  const isProductView = currentView === 'product'

  return (
    <div className={`fixed right-3 z-40 flex flex-col items-end gap-2 sm:gap-3 ${
      isProductView
        ? 'bottom-[88px] sm:bottom-6 lg:bottom-6'
        : 'bottom-6'
    }`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl shadow-2xl border border-stone-100 p-3 sm:p-4 w-[260px] sm:w-64 mb-2"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-bold text-stone-900 uppercase tracking-wider">যোগাযোগ</span>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-stone-50 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-3.5 h-3.5 text-stone-400" /></button>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 sm:p-3 hover:bg-emerald-50 rounded-xl transition-colors group min-h-[44px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"><MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
                <div><p className="text-[10px] sm:text-xs font-semibold text-stone-900">WhatsApp</p><p className="text-[8px] sm:text-[10px] text-stone-400">সরাসরি মেসেজ করুন</p></div>
              </a>
              <a href={messengerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 sm:p-3 hover:bg-blue-50 rounded-xl transition-colors group min-h-[44px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"><MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
                <div><p className="text-[10px] sm:text-xs font-semibold text-stone-900">Messenger</p><p className="text-[8px] sm:text-[10px] text-stone-400">Facebook মেসেজ</p></div>
              </a>
              <a href={emailUrl} className="flex items-center gap-2.5 p-2.5 sm:p-3 hover:bg-red-50 rounded-xl transition-colors group min-h-[44px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
                <div><p className="text-[10px] sm:text-xs font-semibold text-stone-900">ইমেইল</p><p className="text-[8px] sm:text-[10px] text-stone-400">মেইল পাঠান</p></div>
              </a>
              <a href={`tel:+${whatsappNumber}`} className="flex items-center gap-2.5 p-2.5 sm:p-3 hover:bg-stone-50 rounded-xl transition-colors group min-h-[44px]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-stone-800 rounded-full flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
                <div><p className="text-[10px] sm:text-xs font-semibold text-stone-900">কল করুন</p><p className="text-[8px] sm:text-[10px] text-stone-400">+{whatsappNumber}</p></div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]"
        aria-label="যোগাযোগ করুন"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>
    </div>
  )
}
