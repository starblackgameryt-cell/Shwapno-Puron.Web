'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'

export function CartSidebar() {
  const { isListOpen, toggleList, list, removeFromList, updateQuantity, clearList } = useStore()
  const total = list.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const count = list.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <AnimatePresence>
      {isListOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleList}
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* হেডার */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-stone-700" />
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-stone-900">
                  আমার তালিকা ({count})
                </h2>
              </div>
              <button onClick={toggleList} className="p-2 hover:bg-stone-50 transition-colors" aria-label="বন্ধ করুন">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* তালিকা আইটেম */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400">
                  <ShoppingBag className="w-16 h-16 mb-4 stroke-1" />
                  <p className="text-xs tracking-[0.2em] uppercase">তালিকা খালি</p>
                  <p className="text-[10px] mt-1 text-stone-300">পোশাক যোগ করে শুরু করুন</p>
                </div>
              ) : (
                list.map((item) => (
                  <motion.div
                    key={item.productId + item.size + item.color}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-4"
                  >
                    <div className="relative w-20 h-28 overflow-hidden bg-stone-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider truncate">{item.name}</h3>
                      <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider">
                        {item.size} / {item.color}
                      </p>
                      <p className="text-sm font-semibold text-stone-900 mt-1">৳{item.price.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="w-7 h-7 border border-stone-200 flex items-center justify-center hover:border-stone-400 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 border border-stone-200 flex items-center justify-center hover:border-stone-400 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromList(item.productId)} className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors" aria-label="সরান">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* ফুটার */}
            {list.length > 0 && (
              <div className="border-t border-stone-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 uppercase tracking-wider">মোট</span>
                  <span className="text-lg font-black text-stone-900">৳{total.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider">ডেলিভারি চার্জ চেকআউটে যোগ হবে</p>
                <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white py-6 rounded-none text-[11px] tracking-[0.2em] uppercase transition-all duration-300">
                  অর্ডার করুন
                </Button>
                <button onClick={clearList} className="w-full text-center text-[10px] text-stone-400 hover:text-stone-600 transition-colors py-2 uppercase tracking-wider">
                  তালিকা মুছুন
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
