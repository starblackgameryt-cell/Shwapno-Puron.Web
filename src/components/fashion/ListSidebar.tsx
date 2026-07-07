'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ClipboardList, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'

export function ListSidebar() {
  const { isListOpen, toggleList, list, removeFromList, updateQuantity, clearList, goCheckout, goHome } = useStore()
  const total = list.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const count = list.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <AnimatePresence>
      {isListOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={toggleList} className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-brand-ivory z-50 shadow-2xl flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E6DFD0]">
              <div className="flex items-center gap-2 sm:gap-3">
                <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
                <h2 className="text-xs sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-brand-emerald">আমার তালিকা ({count})</h2>
              </div>
              <button onClick={toggleList} className="p-2 hover:bg-brand-ivory transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="বন্ধ করুন"><X className="w-5 h-5 text-brand-charcoal/60" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 overscroll-none">
              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400">
                  <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mb-3 stroke-1" />
                  <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase">তালিকা খালি</p>
                  <p className="text-[9px] sm:text-[10px] mt-1 text-stone-300">পোশাক যোগ করে শুরু করুন</p>
                </div>
              ) : (
                list.map((item) => (
                  <motion.div key={item.productId + item.size + item.color} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex gap-3 sm:gap-4">
                    <div className="relative w-14 h-[77px] sm:w-20 sm:h-28 overflow-hidden bg-stone-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width: 640px) 56px, 80px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[10px] sm:text-xs font-bold text-brand-emerald uppercase tracking-wider truncate">{item.name}</h3>
                      <p className="text-[9px] sm:text-[10px] text-stone-400 mt-0.5 uppercase tracking-wider">{item.size} / {item.color}</p>
                      <p className="text-xs sm:text-sm font-semibold text-brand-emerald mt-1">৳{item.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button onClick={() => updateQuantity(item.productId, item.size, item.color, Math.max(1, item.quantity - 1))} className="w-9 h-9 sm:w-7 sm:h-7 border border-[#C9A961]/30 flex items-center justify-center hover:border-stone-400 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"><Minus className="w-3 h-3" /></button>
                          <span className="text-[10px] sm:text-xs w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="w-9 h-9 sm:w-7 sm:h-7 border border-[#C9A961]/30 flex items-center justify-center hover:border-stone-400 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeFromList(item.productId, item.size, item.color)} className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center" aria-label="সরান"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {list.length > 0 && (
              <div className="border-t border-[#E6DFD0] p-4 sm:p-6 space-y-3 sm:space-y-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-brand-charcoal/60 uppercase tracking-wider">মোট</span>
                  <span className="text-base sm:text-lg font-black text-brand-emerald">৳{total.toLocaleString()}</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider">ডেলিভারি চার্জ চেকআউটে যোগ হবে</p>
                <Button onClick={() => { toggleList(); goCheckout(); }} className="w-full btn-lux py-4 sm:py-6 rounded-none text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase min-h-[44px]">
                  অর্ডার করুন
                </Button>
                <button onClick={clearList} className="w-full text-center text-[9px] sm:text-[10px] text-stone-400 hover:text-brand-charcoal/70 transition-colors py-2 uppercase tracking-wider min-h-[44px]">তালিকা মুছুন</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
