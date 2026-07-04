'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Minus, Plus, ClipboardList, ArrowLeft, Heart, Truck, Shield, RotateCcw, MessageCircle, Phone, HelpCircle, ShoppingBag, Mail, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useStore, type ListItem } from '@/store/useStore'
import { FadeIn } from './ScrollReveal'
import { useSiteContent } from '@/hooks/useSiteContent'

interface Review { id: string; name: string; rating: number; comment: string; date: string }
interface Product { id: string; name: string; description: string; price: number; category: string; image: string; images: string; colors: string; sizes: string; fabric: string; rating: number; reviewCount: number; reviews: Review[] }

const colorMap: Record<string, string> = {
  'নেভি': '#1B2A4A', 'কালো': '#1A1A1A', 'গাঢ় লাল': '#8B1A1A', 'মেরুন': '#800000', 'সোনালী': '#FFD700',
  'এমারেল্ড': '#2E8B57', 'রয়্যাল ব্লু': '#4169E1', 'পিচ': '#FFDAB9', 'হালকা গোলাপি': '#FFB6C1',
  'ক্রিম': '#FFFDD0', 'সাদা': '#FAFAFA', 'আইভরি': '#FFFFF0', 'বেগুনি': '#800080', 'টিল': '#008080',
  'রোজ পিঙ্ক': '#FF66CC', 'সিলভার': '#C0C0C0', 'লাল': '#DC143C',
}

export function ProductDetail({ product }: { product: Product }) {
  const { goHome, addToList, goCheckout } = useStore()
  const { get } = useSiteContent()
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [addedToList, setAddedToList] = useState(false)
  const [showSizeWarning, setShowSizeWarning] = useState(false)

  // Review form state
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewHover, setReviewHover] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [localReviews, setLocalReviews] = useState<Review[]>(product.reviews || [])

  const colors = product.colors.split(',')
  const sizes = product.sizes.split(',')
  const images = product.images.split(',').filter(Boolean)

  const handleAddToList = () => {
    if (!selectedSize || !selectedColor) {
      setShowSizeWarning(true)
      setTimeout(() => setShowSizeWarning(false), 3000)
      return
    }
    const item: ListItem = { productId: product.id, name: product.name, price: product.price, image: product.image, size: selectedSize, color: selectedColor, quantity }
    addToList(item)
    setAddedToList(true)
    setTimeout(() => setAddedToList(false), 2000)
  }

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      setShowSizeWarning(true)
      setTimeout(() => setShowSizeWarning(false), 3000)
      return
    }
    const item: ListItem = { productId: product.id, name: product.name, price: product.price, image: product.image, size: selectedSize, color: selectedColor, quantity }
    addToList(item)
    goCheckout()
  }

  const handleSubmitReview = async () => {
    if (!reviewName.trim() || !reviewRating || !reviewComment.trim()) return
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, name: reviewName, rating: reviewRating, comment: reviewComment }),
      })
      const data = await res.json()
      if (data.success && data.review) {
        setLocalReviews(prev => [...prev, data.review])
        setReviewName('')
        setReviewRating(0)
        setReviewComment('')
        setReviewSubmitted(true)
        setTimeout(() => setReviewSubmitted(false), 4000)
      }
    } catch (error) {
      console.error('Review submit error:', error)
    } finally {
      setSubmittingReview(false)
    }
  }

  const whatsappNumber = get('footer_whatsapp') || '8801913551490'
  const businessEmail = get('footer_email') || 'dolamaanha@gmail.com'
  const whatsappMsg = `হ্যালো, আমি এই ড্রেসটি সম্পর্কে জানতে চাই: ${product.name} (৳${product.price.toLocaleString()})`
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`
  const gmailSubject = `ড্রেস সম্পর্কে জিজ্ঞাসা: ${product.name}`
  const gmailBody = `হ্যালো, আমি এই ড্রেসটি সম্পর্কে জানতে চাই:\n\nপোশাক: ${product.name}\nমূল্য: ৳${product.price.toLocaleString()}\n\nদয়া করে বিস্তারিত জানান।`
  const gmailUrl = `mailto:${businessEmail}?subject=${encodeURIComponent(gmailSubject)}&body=${encodeURIComponent(gmailBody)}`

  return (
    <FadeIn className="pt-16 sm:pt-24 lg:pt-32 pb-36 lg:pb-8 min-h-[100svh] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={goHome} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-4 sm:mb-8 group min-h-[44px]">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] tracking-[0.2em] uppercase font-medium">ফিরে যান</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="relative aspect-[3/4] overflow-hidden bg-stone-100">
              <Image src={images[activeImage] || product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide smooth-scroll">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`relative w-14 h-[78px] sm:w-20 sm:h-28 flex-shrink-0 overflow-hidden transition-all duration-200 min-w-[44px] min-h-[44px] ${activeImage === idx ? 'ring-2 ring-stone-900 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}>
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="(max-width: 640px) 56px, 80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:py-4">
            <p className="text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 font-medium mb-1.5 sm:mb-2">{product.category}</p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 tracking-tight uppercase">{product.name}</h1>

            <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${star <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`} />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-stone-500">{product.rating} ({localReviews.length} রিভিউ)</span>
            </div>

            <p className="mt-4 sm:mt-6 text-xl sm:text-3xl font-black text-stone-900">৳{product.price.toLocaleString()}</p>
            <p className="mt-3 sm:mt-6 text-stone-500 leading-relaxed text-xs sm:text-sm">{product.description}</p>

            {/* Color Selection */}
            <div className="mt-5 sm:mt-8">
              <p className="text-[10px] sm:text-[11px] font-bold text-stone-900 mb-2 sm:mb-3 uppercase tracking-wider">রং: <span className="text-stone-400 font-normal">{selectedColor || 'বেছে নিন'}</span></p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {colors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color.trim())} className={`relative w-10 h-10 sm:w-11 sm:h-11 border-2 transition-all duration-200 min-w-[44px] min-h-[44px] ${selectedColor === color.trim() ? 'border-stone-900 scale-110' : 'border-stone-200 hover:border-stone-400'}`} style={{ backgroundColor: colorMap[color.trim()] || '#E5E5E5' }} aria-label={color.trim()}>
                    {selectedColor === color.trim() && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" stroke={color.trim() === 'সাদা' || color.trim() === 'ক্রিম' || color.trim() === 'আইভরি' || color.trim() === 'পিচ' ? '#1a1a1a' : '#fff'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mt-5 sm:mt-8">
              <p className="text-[10px] sm:text-[11px] font-bold text-stone-900 mb-2 sm:mb-3 uppercase tracking-wider">সাইজ: <span className="text-stone-400 font-normal">{selectedSize || 'বেছে নিন'}</span></p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size.trim())} className={`min-w-[44px] h-10 sm:h-11 px-3 sm:px-4 border-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 ${selectedSize === size.trim() ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-700 hover:border-stone-400'}`}>
                    {size.trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5 sm:mt-8">
              <p className="text-[10px] sm:text-[11px] font-bold text-stone-900 mb-2 sm:mb-3 uppercase tracking-wider">পরিমাণ</p>
              <div className="flex items-center gap-3 sm:gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-stone-200 flex items-center justify-center hover:border-stone-400 min-w-[44px] min-h-[44px]"><Minus className="w-4 h-4" /></button>
                <span className="text-lg font-light w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-stone-200 flex items-center justify-center hover:border-stone-400 min-w-[44px] min-h-[44px]"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Size/Color Warning */}
            {showSizeWarning && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800 font-medium">⚠ দয়া করে আগে রং ও সাইজ বেছে নিন!</p>
              </motion.div>
            )}

            {/* Buy Now - Desktop shows inline, Mobile uses sticky CTA */}
            <div className="mt-6 sm:mt-10 hidden lg:block">
              <Button onClick={handleBuyNow} className="w-full bg-amber-700 hover:bg-amber-800 text-white py-5 sm:py-6 rounded-none text-[11px] tracking-[0.2em] uppercase font-bold transition-all duration-300">
                <ShoppingBag className="w-4 h-4 mr-2" />
                এখনই কিনুন
              </Button>
            </div>

            <div className="mt-3 hidden lg:flex gap-4">
              <Button onClick={handleAddToList} className={`flex-1 py-5 sm:py-6 rounded-none text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ${addedToList ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-900'}`}>
                {addedToList ? <span className="flex items-center gap-2">তালিকায় যোগ হয়েছে ✓</span> : <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> তালিকায় যোগ করুন</span>}
              </Button>
              <Button variant="outline" className="w-14 h-14 border-stone-200 hover:border-stone-400 rounded-none"><Heart className="w-5 h-5" /></Button>
            </div>

            {/* Contact Buttons */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-none min-h-[44px] justify-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                <span className="text-[8px] sm:text-[9px] tracking-wider uppercase font-medium text-emerald-700">WhatsApp</span>
              </a>
              <a href={gmailUrl} className="flex flex-col items-center gap-1 p-3 sm:p-4 bg-red-50 hover:bg-red-100 transition-colors rounded-none min-h-[44px] justify-center">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="text-[8px] sm:text-[9px] tracking-wider uppercase font-medium text-red-600">ইমেইল</span>
              </a>
              <a href={`tel:${whatsappNumber}`} className="flex flex-col items-center gap-1 p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 transition-colors rounded-none min-h-[44px] justify-center">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-[8px] sm:text-[9px] tracking-wider uppercase font-medium text-blue-700">কল করুন</span>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-3 sm:p-4 bg-amber-50 hover:bg-amber-100 transition-colors rounded-none min-h-[44px] justify-center">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span className="text-[8px] sm:text-[9px] tracking-wider uppercase font-medium text-amber-700">জিজ্ঞাসা</span>
              </a>
            </div>

            {/* Features */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-stone-50"><Truck className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-stone-500 mb-1.5 sm:mb-2" /><p className="text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] uppercase text-stone-500 font-medium">ফ্রি ডেলিভারি</p></div>
              <div className="text-center p-3 sm:p-4 bg-stone-50"><Shield className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-stone-500 mb-1.5 sm:mb-2" /><p className="text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] uppercase text-stone-500 font-medium">অরিজিনাল</p></div>
              <div className="text-center p-3 sm:p-4 bg-stone-50"><RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-stone-500 mb-1.5 sm:mb-2" /><p className="text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] uppercase text-stone-500 font-medium">রিটার্ন</p></div>
            </div>

            {/* Fabric & Care */}
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-stone-50 border border-stone-100">
              <h3 className="text-[10px] sm:text-[11px] font-bold text-stone-900 mb-1.5 sm:mb-2 uppercase tracking-wider">ফ্যাব্রিক ও যত্ন</h3>
              <p className="text-xs sm:text-sm text-stone-500">{product.fabric}</p>
              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {['শুধু ড্রাই ক্লিন', 'ব্লিচ করবেন না', 'হালকা আয়রন', 'প্রফেশনাল যত্ন'].map((tag) => (
                  <span key={tag} className="text-[8px] sm:text-[9px] tracking-[0.08em] uppercase px-2 sm:px-3 py-0.5 sm:py-1 bg-white border border-stone-200 text-stone-500 font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 sm:mt-20 lg:mt-28 pb-4 lg:pb-0">
          <div className="text-center mb-6 sm:mb-10">
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-stone-400 font-medium">রিভিউ</span>
            <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-3xl font-black text-stone-900 tracking-tight">গ্রাহকদের মতামত</h2>
          </div>

          {/* Write Review Form */}
          <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="p-4 sm:p-6 bg-stone-50 border border-stone-100">
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 sm:mb-4">আপনার মতামত লিখুন</h3>

              {reviewSubmitted && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-emerald-50 border border-emerald-200">
                  <p className="text-xs text-emerald-700 font-medium">✓ আপনার রিভিউ সফলভাবে জমা হয়েছে! ধন্যবাদ।</p>
                </motion.div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {/* Name */}
                <div>
                  <label className="text-[10px] sm:text-xs font-medium text-stone-600 mb-1 block">আপনার নাম *</label>
                  <Input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="আপনার নাম লিখুন"
                    className="h-10 bg-white border-stone-200 text-sm"
                  />
                </div>

                {/* Star Rating */}
                <div>
                  <label className="text-[10px] sm:text-xs font-medium text-stone-600 mb-1 block">রেটিং *</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="p-1 min-w-[36px] min-h-[36px] flex items-center justify-center transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                            star <= (reviewHover || reviewRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-stone-200 text-stone-200'
                          }`}
                        />
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="text-xs text-stone-500 ml-2">
                        {['', 'খারাপ', 'মোটামুটি', 'ভালো', 'চমৎকার', 'অসাধারণ'][reviewRating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-[10px] sm:text-xs font-medium text-stone-600 mb-1 block">আপনার মতামত *</label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="আপনার অভিজ্ঞতা সম্পর্কে লিখুন..."
                    className="bg-white border-stone-200 min-h-[80px] sm:min-h-[100px] text-sm"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={!reviewName.trim() || !reviewRating || !reviewComment.trim() || submittingReview}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-none text-[10px] sm:text-[11px] tracking-[0.15em] uppercase font-bold disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {submittingReview ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" />
                      রিভিউ জমা দিন
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Reviews */}
          {localReviews.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              <AnimatePresence>
                {localReviews.map((review, index) => (
                  <motion.div key={review.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }} className="p-4 sm:p-6 bg-stone-50 border border-stone-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-0.5 mb-2 sm:mb-3">
                      {[1,2,3,4,5].map((star) => (<Star key={star} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}`} />))}
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3 sm:mb-4">&ldquo;{review.comment}&rdquo;</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] sm:text-xs font-bold text-stone-900 uppercase tracking-wider">{review.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-stone-400">{review.date}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {localReviews.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-stone-400 text-sm">এখনো কোনো রিভিউ নেই। প্রথম রিভিউ লিখুন!</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-stone-100 p-3 sm:p-4 lg:hidden z-30" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex gap-2 sm:gap-3 max-w-lg mx-auto">
          <Button onClick={handleAddToList} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 py-3 sm:py-4 rounded-none text-[10px] sm:text-[11px] tracking-[0.12em] uppercase font-bold min-h-[44px]">
            <ClipboardList className="w-4 h-4 mr-1.5" />
            তালিকায় যোগ
          </Button>
          <Button onClick={handleBuyNow} className="flex-1 bg-amber-700 hover:bg-amber-800 text-white py-3 sm:py-4 rounded-none text-[10px] sm:text-[11px] tracking-[0.12em] uppercase font-bold min-h-[44px]">
            এখনই কিনুন
          </Button>
        </div>
      </div>
    </FadeIn>
  )
}
