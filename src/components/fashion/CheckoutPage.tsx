'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store/useStore'
import { FadeIn } from './ScrollReveal'
import { useSiteContent } from '@/hooks/useSiteContent'

interface PaymentMethodData {
  id: string
  name: string
  number: string
  text: string
  link: string
  icon: string
  color: string
  sortOrder: number
  isActive: boolean
}

interface ContactMethodData {
  id: string
  name: string
  number: string
  text: string
  link: string
  icon: string
  color: string
  sortOrder: number
  isActive: boolean
}

function CopyButton({ text, tooltip }: { text: string; tooltip?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text) } catch { /* clipboard not available */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="p-1.5 hover:bg-stone-100 rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center" aria-label={tooltip || 'কপি করুন'}>
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
    </button>
  )
}

function getMethodIcon(icon: string) {
  switch (icon) {
    case 'bkash': return 'ব'
    case 'nagad': return 'ন'
    case 'rocket': return 'র'
    case 'bank': return '🏦'
    case 'whatsapp': return '💬'
    case 'messenger': return '📩'
    case 'email': return '📧'
    case 'phone': return '📞'
    case 'telegram': return '✈️'
    default: return icon || '💳'
  }
}

function getMethodColor(color: string) {
  switch (color) {
    case 'pink': return 'bg-pink-500'
    case 'orange': return 'bg-orange-500'
    case 'purple': return 'bg-purple-600'
    case 'green': case 'emerald': return 'bg-emerald-500'
    case 'blue': return 'bg-blue-500'
    case 'red': return 'bg-red-500'
    case 'teal': return 'bg-teal-500'
    case 'cyan': return 'bg-cyan-500'
    case 'stone': case 'gray': return 'bg-stone-700'
    default: return color || 'bg-stone-700'
  }
}

export function CheckoutPage() {
  const { goHome, list, clearList } = useStore()
  const { get } = useSiteContent()
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedPaymentId, setSelectedPaymentId] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([])
  const [contactMethods, setContactMethods] = useState<ContactMethodData[]>([])

  const total = list.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const notificationEmail = get('order_notification_email') || 'dolamaanha@gmail.com'

  // Fetch payment methods and contact methods
  useEffect(() => {
    fetch('/api/payment-methods').then(r => r.json()).then(setPaymentMethods).catch(() => {})
    fetch('/api/contact-methods').then(r => r.json()).then(setContactMethods).catch(() => {})
  }, [])

  const selectedPayment = paymentMethods.find(m => m.id === selectedPaymentId)

  const handleSubmit = async () => {
    if (!customerName || !phone || !address || !selectedPaymentId) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName, phone, address, notes,
          products: list.map((item) => ({ name: item.name, price: item.price, quantity: item.quantity, size: item.size, color: item.color })),
          totalAmount: total,
          paymentMethod: selectedPayment?.name || 'unknown',
          paymentMethodId: selectedPaymentId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setOrderPlaced(true)
        clearList()
      }
    } catch (error) {
      console.error('Order error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Order placed success screen
  if (orderPlaced) {
    return (
      <FadeIn className="pt-20 sm:pt-32 pb-16 sm:pb-20 min-h-[100svh] bg-white">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }} className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Check className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tight">
            {get('order_success_title') || 'অর্ডার সফল হয়েছে!'}
          </h1>
          <p className="mt-3 sm:mt-4 text-stone-500 text-sm">
            {get('order_success_message') || 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'}
          </p>

          {/* Payment instruction for selected payment method */}
          {selectedPayment && (
            <div className="mt-6 p-4 sm:p-5 bg-amber-50 border border-amber-200 text-left">
              <p className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                💳 {get('order_confirm_title') || 'পেমেন্ট নিশ্চিত করুন'}
              </p>
              <p className="text-[10px] sm:text-xs text-amber-700 mb-3">
                {get('order_payment_instruction_after') || 'নিচের নম্বরে পেমেন্ট করুন এবং পেমেন্টের স্ক্রিনশট নিচের যোগাযোগে পাঠান:'}
              </p>
              <div className="flex items-center justify-between bg-white p-3 border border-amber-200">
                <div>
                  <p className="text-sm font-bold text-stone-900">{selectedPayment.name}</p>
                  <p className="text-lg font-black text-amber-700 tracking-wider">{selectedPayment.number}</p>
                  {selectedPayment.text && <p className="text-[10px] text-stone-500 mt-0.5">{selectedPayment.text}</p>}
                </div>
                <CopyButton text={selectedPayment.number} tooltip={get('order_copy_tooltip')} />
              </div>
            </div>
          )}

          {/* Contact methods */}
          {contactMethods.length > 0 && (
            <div className="mt-4 p-4 sm:p-5 bg-stone-50 border border-stone-200 text-left">
              <p className="text-[10px] sm:text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                📱 {get('order_contact_title') || 'যোগাযোগ করুন'}
              </p>
              <p className="text-[10px] sm:text-xs text-stone-500 mb-3">
                {get('order_contact_instruction') || 'পেমেন্ট করার পর অর্ডার কনফার্ম করতে নিচের যোগাযোগে আপনার পেমেন্টের স্ক্রিনশট পাঠান।'}
              </p>
              <div className="space-y-2">
                {contactMethods.map((method) => (
                  <a
                    key={method.id}
                    href={method.link || '#'}
                    target={method.link ? '_blank' : undefined}
                    rel={method.link ? 'noopener noreferrer' : undefined}
                    className="w-full flex items-center gap-3 p-3 bg-white border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all min-h-[44px]"
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 ${getMethodColor(method.color)} rounded-full flex items-center justify-center flex-shrink-0 text-white`}>
                      <span className="text-xs font-bold">{getMethodIcon(method.icon)}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold text-stone-900">{method.name}</p>
                      <p className="text-[10px] text-stone-500">{method.number || method.text}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <Button onClick={goHome} className="w-full mt-4 sm:mt-6 bg-stone-900 hover:bg-stone-800 text-white py-3 sm:py-4 rounded-none text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase min-h-[44px]">
            {get('order_home_button') || 'হোমে ফিরে যান'}
          </Button>
        </div>
      </FadeIn>
    )
  }

  return (
    <FadeIn className="pt-20 sm:pt-32 pb-24 sm:pb-20 min-h-[100svh] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={goHome} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-4 sm:mb-8 group min-h-[44px]">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] tracking-[0.2em] uppercase font-medium">{get('order_back_button') || 'ফিরে যান'}</span>
        </button>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight uppercase">
          {get('order_title') || 'অর্ডার করুন'}
        </h1>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-stone-500">
          {get('order_subtitle') || `অর্ডার করলে স্বয়ংক্রিয়ভাবে আমাদের Gmail (${notificationEmail}) এ নোটিফিকেশন যাবে`}
        </p>

        <div className="mt-6 sm:mt-8 grid lg:grid-cols-5 gap-6 sm:gap-10">
          {/* Left - Form */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {/* Customer Info */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900">
                {get('order_info_title') || 'আপনার তথ্য'}
              </h2>
              <Input placeholder={get('order_name_placeholder') || 'আপনার নাম'} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="rounded-none py-4 sm:py-5 text-sm" />
              <Input placeholder={get('order_phone_placeholder') || 'ফোন নম্বর'} value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-none py-4 sm:py-5 text-sm" />
              <Input placeholder={get('order_address_placeholder') || 'সম্পূর্ণ ঠিকানা'} value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-none py-4 sm:py-5 text-sm" />
              <Input placeholder={get('order_notes_placeholder') || 'বিশেষ নোট (ঐচ্ছিক)'} value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-none py-4 sm:py-5 text-sm" />
            </div>

            {/* Payment Methods - Dynamic */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900">
                {get('order_payment_title') || 'পেমেন্ট পদ্ধতি'}
              </h2>

              {!selectedPaymentId && paymentMethods.length > 0 && (
                <p className="text-[10px] sm:text-xs text-stone-400">
                  {get('order_payment_instruction_before') || 'পেমেন্ট পদ্ধতি নির্বাচন করুন'}
                </p>
              )}

              {paymentMethods.length === 0 && (
                <div className="p-4 bg-stone-50 border border-stone-200 text-center">
                  <p className="text-xs text-stone-400">{get('order_no_payment_text') || 'কোনো পেমেন্ট পদ্ধতি যোগ করা হয়নি। অ্যাডমিন প্যানেল থেকে পেমেন্ট পদ্ধতি যোগ করুন।'}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentId(method.id)}
                    className={`p-3 sm:p-4 border-2 transition-all duration-200 text-left min-h-[44px] ${
                      selectedPaymentId === method.id
                        ? 'border-stone-900 bg-stone-50'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 ${getMethodColor(method.color)} rounded-full flex items-center justify-center flex-shrink-0 text-white`}>
                        <span className="text-[10px] sm:text-xs font-bold">{getMethodIcon(method.icon)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-bold text-stone-900">{method.name}</p>
                        {method.number && <p className="text-[9px] sm:text-[10px] text-stone-400 mt-0.5">{method.number}</p>}
                        {method.text && <p className="text-[8px] sm:text-[9px] text-stone-400 truncate">{method.text}</p>}
                      </div>
                      {method.number && <CopyButton text={method.number} tooltip={get('order_copy_tooltip')} />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Payment info for selected method */}
              {selectedPaymentId && selectedPayment && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 sm:p-4 bg-amber-50 border border-amber-200"
                >
                  <p className="text-[10px] sm:text-xs text-amber-800">
                    💳 <strong>{selectedPayment.name}</strong> এ পেমেন্ট করুন — নম্বর: <strong>{selectedPayment.number}</strong>
                    {selectedPayment.text && <span className="block mt-1 text-[9px] sm:text-[10px]">{selectedPayment.text}</span>}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-stone-200 pt-6 lg:pt-0">
            <div className="bg-stone-50 p-4 sm:p-6 sticky top-20 sm:top-28">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900 mb-3 sm:mb-4">
                {get('order_summary_title') || 'অর্ডার সারাংশ'}
              </h2>
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {list.map((item) => (
                  <div key={item.productId + item.size + item.color} className="flex justify-between items-start text-xs sm:text-sm">
                    <div className="min-w-0 mr-2">
                      <p className="font-semibold text-stone-900 text-[10px] sm:text-xs truncate">{item.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-stone-400">{item.size} / {item.color} x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-stone-900 text-[10px] sm:text-xs flex-shrink-0">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              {list.length === 0 && <p className="text-[10px] sm:text-xs text-stone-400">{get('order_empty_cart_text') || 'তালিকায় কোনো পোশাক নেই'}</p>}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-stone-200 flex justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-stone-900 uppercase">{get('order_total_label') || 'মোট'}</span>
                <span className="text-base sm:text-lg font-black text-stone-900">৳{total.toLocaleString()}</span>
              </div>

              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-100">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm">📧</span>
                  <p className="text-[9px] sm:text-[10px] text-red-700 font-medium">
                    {get('order_notification_text') || `অর্ডার কনফার্ম হলে ${notificationEmail} এ স্বয়ংক্রিয় নোটিফিকেশন যাবে`}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!customerName || !phone || !address || !selectedPaymentId || list.length === 0 || submitting}
                className="w-full mt-4 sm:mt-6 bg-stone-900 hover:bg-stone-800 text-white py-4 sm:py-6 rounded-none text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              >
                {submitting ? (get('order_processing_text') || 'প্রসেসিং...') : (get('order_button_text') || 'অর্ডার নিশ্চিত করুন')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}
