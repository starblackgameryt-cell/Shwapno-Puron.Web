'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  User,
  Heart,
  Package,
  Settings,
  LogOut,
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  Home,
  Shield,
  ShoppingBag,
  MailCheck,
  Send,
  Crown,
  Gem,
} from 'lucide-react'

// ============ Types ============
interface UserData {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  favorites: string
  createdAt: string
  emailVerified: boolean
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  images: string
  colors: string
  sizes: string
  fabric: string
  rating: number
  reviewCount: number
  featured: boolean
  stock: number
  createdAt: string
  updatedAt: string
}

interface OrderData {
  id: string
  customerName: string
  phone: string
  address: string
  products: string
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  notes: string
  createdAt: string
  updatedAt: string
}

type TabType = 'profile' | 'favorites' | 'orders' | 'settings'

// ============ Helper Functions ============
function getStatusBadge(status: string) {
  switch (status) {
    case 'new':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">নতুন</Badge>
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">কনফার্ম</Badge>
    case 'shipped':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">শিপড</Badge>
    case 'delivered':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">ডেলিভার্ড</Badge>
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">বাতিল</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getPaymentBadge(status: string) {
  return status === 'paid'
    ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">পরিশোধিত</Badge>
    : <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">বাকি</Badge>
}

function getPaymentMethodLabel(method: string) {
  switch (method) {
    case 'bkash': return 'বিকাশ'
    case 'nagad': return 'নগদ'
    case 'rocket': return 'রকেট'
    case 'bank': return 'ব্যাংক'
    case 'cod': return 'ক্যাশ অন ডেলিভারি'
    default: return method
  }
}

function formatCurrency(amount: number) {
  return `৳${amount.toLocaleString('bn-BD')}`
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function formatMemberSince(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// ============ Resend Verification Button ============
function ResendVerificationButton({ email }: { email: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setSending(true)
    try {
      await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (error) {
      console.error('Resend verification error:', error)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1 text-xs text-emerald-600"
      >
        <MailCheck className="size-3" />
        পাঠানো হয়েছে
      </motion.div>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleResend}
      disabled={sending}
      className="h-6 px-2 text-[10px] border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
    >
      {sending ? (
        <Loader2 className="size-2.5 animate-spin" />
      ) : (
        <Send className="size-2.5 mr-0.5" />
      )}
      ভেরিফিকেশন পাঠান
    </Button>
  )
}

// ============ Profile Tab ============
function ProfileTab({ user, onUserUpdate }: { user: UserData; onUserUpdate: (u: UserData) => void }) {
  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [savingName, setSavingName] = useState(false)
  const [savingPhone, setSavingPhone] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSaveName = async () => {
    if (name.trim().length < 2) return
    setSavingName(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.user) {
        onUserUpdate({ ...user, name: data.user.name })
        setEditingName(false)
      }
    } catch (error) {
      console.error('Name update error:', error)
    } finally {
      setSavingName(false)
    }
  }

  const handleSavePhone = async () => {
    setSavingPhone(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (res.ok && data.user) {
        onUserUpdate({ ...user, phone: data.user.phone })
        setEditingPhone(false)
      }
    } catch (error) {
      console.error('Phone update error:', error)
    } finally {
      setSavingPhone(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড মিলছে না' })
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে' })
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'নেটওয়ার্ক সমস্যা হয়েছে' })
    } finally {
      setChangingPassword(false)
    }
  }

  const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : '?'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Avatar & Name */}
      <div className="flex flex-col items-center pt-2">
        {user.avatar ? (
          <div className="size-20 rounded-full overflow-hidden shadow-lg border-2 border-white mb-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="size-20 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center mb-3 shadow-lg ring-4 ring-white">
            <span className="text-3xl font-black text-white">{firstLetter}</span>
          </div>
        )}
        <h2 className="text-lg font-bold text-stone-900">{user.name}</h2>
        <p className="text-stone-500 text-sm">{user.email}</p>
      </div>

      {/* Info Card */}
      <Card className="border-stone-100 shadow-sm">
        <CardContent className="p-4 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-500">নাম</Label>
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 bg-stone-50/50 border-stone-200 text-sm"
                  disabled={savingName}
                />
                <Button
                  size="sm"
                  onClick={handleSaveName}
                  disabled={savingName || name.trim().length < 2}
                  className="bg-stone-900 hover:bg-stone-800 text-white h-9 px-3 shrink-0"
                >
                  {savingName ? <Loader2 className="size-3.5 animate-spin" /> : 'সংরক্ষণ'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setEditingName(false); setName(user.name) }}
                  className="h-9 px-3 shrink-0"
                >
                  বাতিল
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-900">{user.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-stone-400 hover:text-stone-700"
                  onClick={() => setEditingName(true)}
                >
                  <Edit className="size-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-500">ফোন নম্বর</Label>
            {editingPhone ? (
              <div className="flex gap-2">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ফোন নম্বর দিন"
                  className="h-9 bg-stone-50/50 border-stone-200 text-sm"
                  disabled={savingPhone}
                />
                <Button
                  size="sm"
                  onClick={handleSavePhone}
                  disabled={savingPhone}
                  className="bg-stone-900 hover:bg-stone-800 text-white h-9 px-3 shrink-0"
                >
                  {savingPhone ? <Loader2 className="size-3.5 animate-spin" /> : 'সংরক্ষণ'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setEditingPhone(false); setPhone(user.phone) }}
                  className="h-9 px-3 shrink-0"
                >
                  বাতিল
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-900 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-stone-400" />
                  {user.phone || 'ফোন নম্বর দেওয়া হয়নি'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-stone-400 hover:text-stone-700"
                  onClick={() => setEditingPhone(true)}
                >
                  <Edit className="size-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-500">ইমেইল</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-900">{user.email}</span>
              <div className="size-4 rounded bg-stone-100 flex items-center justify-center">
                <LockIcon className="size-2.5 text-stone-400" />
              </div>
            </div>
            {/* Email Verified / Unverified Badge */}
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-1"
              >
                {user.emailVerified ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-1">
                    <CheckCircle className="size-3" />
                    ভেরিফাইড ✓
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 gap-1">
                      <AlertCircle className="size-3" />
                      আনভেরিফাইড
                    </Badge>
                    <ResendVerificationButton email={user.email} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Member Since */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-500">সদস্যতার তারিখ</Label>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-stone-400" />
              <span className="text-sm text-stone-900">{formatMemberSince(user.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fashion Loyalty Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/50 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                className="size-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shrink-0"
              >
                <Crown className="size-6 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-amber-900">রয়্যাল মেম্বারশিপ</h3>
                <p className="text-xs text-amber-700 mt-0.5">স্বপ্ন পূরণ ফ্যাশন ক্লাব</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Gem className="size-3 text-amber-600" />
                  <span className="text-[11px] font-medium text-amber-600">
                    {user.emailVerified ? 'সক্রিয় সদস্য ✓' : 'ভেরিফিকেশন বাকি'}
                  </span>
                </div>
              </div>
              {user.emailVerified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="size-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"
                >
                  <CheckCircle className="size-4 text-emerald-600" />
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Change Section */}
      <Card className="border-stone-100 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Shield className="size-4 text-stone-500" />
            পাসওয়ার্ড পরিবর্তন
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-500">বর্তমান পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দিন"
                  className="h-9 bg-stone-50/50 border-stone-200 text-sm pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showCurrent ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-500">নতুন পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড দিন"
                  className="h-9 bg-stone-50/50 border-stone-200 text-sm pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showNew ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-500">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড আবার দিন"
                  className="h-9 bg-stone-50/50 border-stone-200 text-sm pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* Password Message */}
            {passwordMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 text-xs p-2.5 rounded-lg ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle className="size-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="size-3.5 shrink-0" />
                )}
                {passwordMsg.text}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full h-9 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold"
            >
              {changingPassword ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'আপডেট করুন'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Simple lock icon component
function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

// ============ Favorites Tab ============
function FavoritesTab({ user, onUserUpdate }: { user: UserData; onUserUpdate: (u: UserData) => void }) {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Parse favorites from user data
  const favoriteIds: string[] = (() => {
    try {
      return JSON.parse(user.favorites || '[]')
    } catch {
      return []
    }
  })()

  // Filter products that are in favorites
  const favoriteProducts = allProducts.filter((p) => favoriteIds.includes(p.id))

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (Array.isArray(data)) {
        setAllProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleRemoveFavorite = async (productId: string) => {
    setRemovingId(productId)
    try {
      const res = await fetch('/api/users/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (res.ok && data.favorites) {
        onUserUpdate({ ...user, favorites: JSON.stringify(data.favorites) })
      }
    } catch (error) {
      console.error('Remove favorite error:', error)
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (favoriteProducts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <div className="size-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
          <Heart className="size-7 text-stone-300" />
        </div>
        <p className="text-stone-500 text-sm font-medium">কোনো পছন্দের পণ্য নেই</p>
        <p className="text-stone-400 text-xs mt-1">পণ্যের হার্ট আইকনে ক্লিক করে পছন্দে যোগ করুন</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-stone-900">পছন্দের তালিকা</h2>
        <p className="text-stone-500 text-sm">{favoriteProducts.length}টি পণ্য</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {favoriteProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-stone-100 shadow-sm overflow-hidden">
              <div
                className="relative aspect-[3/4] bg-stone-100 cursor-pointer overflow-hidden"
                onClick={() => { window.location.href = '/' }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260"><rect fill="%23f5f5f4" width="200" height="260"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23a8a29e" font-size="48">👗</text></svg>'
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFavorite(product.id)
                  }}
                  disabled={removingId === product.id}
                  className="absolute top-2 right-2 size-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                >
                  {removingId === product.id ? (
                    <Loader2 className="size-3.5 animate-spin text-stone-500" />
                  ) : (
                    <Trash2 className="size-3.5 text-red-500" />
                  )}
                </button>
              </div>
              <CardContent className="p-3">
                <p className="text-xs font-semibold text-stone-900 truncate">{product.name}</p>
                <p className="text-sm font-bold text-stone-900 mt-1">{formatCurrency(product.price)}</p>
                <div className="mt-2 space-y-1.5">
                  <Button
                    size="sm"
                    className="w-full h-7 bg-stone-900 hover:bg-stone-800 text-white text-xs"
                    onClick={() => { window.location.href = '/' }}
                  >
                    <ShoppingBag className="size-3 mr-1" />
                    তালিকায় যোগ করুন
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleRemoveFavorite(product.id)}
                    disabled={removingId === product.id}
                  >
                    {removingId === product.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="size-3 mr-1" />
                        পছন্দ থেকে সরান
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ============ Orders Tab ============
function OrdersTab() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/users/orders')
      const data = await res.json()
      if (res.ok && data.orders) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <div className="size-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
          <Package className="size-7 text-stone-300" />
        </div>
        <p className="text-stone-500 text-sm font-medium">কোনো অর্ডার নেই</p>
        <p className="text-stone-400 text-xs mt-1">আপনার অর্ডারগুলো এখানে দেখা যাবে</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-stone-900">আমার অর্ডার</h2>
        <p className="text-stone-500 text-sm">{orders.length}টি অর্ডার</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id
          let parsedProducts: Array<{ name: string; price?: number; quantity?: number; size?: string; color?: string }> = []
          try {
            parsedProducts = JSON.parse(order.products)
          } catch {
            parsedProducts = []
          }

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-stone-100 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  {/* Order Header */}
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-stone-900">
                          #{order.id.slice(-6).toUpperCase()}
                        </p>
                        {getStatusBadge(order.orderStatus)}
                        {getPaymentBadge(order.paymentStatus)}
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-sm font-bold text-stone-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="size-4 text-stone-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                          {/* Contact Info */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-stone-600">
                              <Phone className="size-3.5 text-stone-400" />
                              {order.phone}
                            </div>
                            <div className="flex items-start gap-2 text-xs text-stone-600">
                              <MapPin className="size-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <span>{order.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-stone-600">
                              <ShoppingBag className="size-3.5 text-stone-400" />
                              {getPaymentMethodLabel(order.paymentMethod)}
                            </div>
                          </div>

                          {/* Products */}
                          {parsedProducts.length > 0 && (
                            <div className="bg-stone-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-stone-700 mb-2">পণ্যসমূহ</p>
                              {parsedProducts.map((p, i) => (
                                <div key={i} className="flex justify-between text-xs text-stone-600 py-0.5">
                                  <span>{p.name}{p.size ? ` (${p.size})` : ''}{p.color ? ` - ${p.color}` : ''}</span>
                                  <span>{p.quantity ? `x${p.quantity}` : ''}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Notes */}
                          {order.notes && (
                            <div className="bg-amber-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-amber-700 mb-1">নোট</p>
                              <p className="text-xs text-amber-600">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ============ Settings Tab ============
function SettingsTab({ user, onLogout }: { user: UserData; onLogout: () => void }) {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      onLogout()
    } catch {
      onLogout()
    } finally {
      setLoggingOut(false)
    }
  }

  const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : '?'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-stone-900">সেটিংস</h2>
        <p className="text-stone-500 text-sm">অ্যাকাউন্ট সেটিংস</p>
      </div>

      {/* Account Info Card */}
      <Card className="border-stone-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <div className="size-12 rounded-full overflow-hidden shrink-0 border border-stone-200">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="size-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shrink-0 ring-2 ring-white shadow-md">
                <span className="text-lg font-bold text-white">{firstLetter}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 truncate">{user.name}</p>
              <p className="text-xs text-stone-500 truncate">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card className="border-stone-100 shadow-sm">
        <CardContent className="p-0">
          <button
            onClick={() => { window.location.href = '/' }}
            className="w-full flex items-center gap-3 p-4 hover:bg-stone-50 transition-colors text-left"
          >
            <div className="size-9 rounded-lg bg-stone-100 flex items-center justify-center">
              <Home className="size-4 text-stone-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-900">হোম পেজে যান</p>
              <p className="text-xs text-stone-500">মূল স্টোর পেজে ফিরে যান</p>
            </div>
            <ChevronDown className="size-4 text-stone-400 -rotate-90" />
          </button>

          <div className="border-t border-stone-100" />

          <button
            onClick={() => {
              // Try admin login - if user is admin, they'll be redirected to /admin
              // If not admin, they'll see Access Denied
              window.location.href = '/admin'
            }}
            className="w-full flex items-center gap-3 p-4 hover:bg-stone-50 transition-colors text-left"
          >
            <div className="size-9 rounded-lg bg-stone-100 flex items-center justify-center">
              <Shield className="size-4 text-stone-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-900">অ্যাডমিন প্যানেল</p>
              <p className="text-xs text-stone-500">শুধুমাত্র অ্যাডমিন অ্যাকাউন্ট</p>
            </div>
            <ChevronDown className="size-4 text-stone-400 -rotate-90" />
          </button>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
      >
        {loggingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <LogOut className="size-4 mr-2" />
            লগআউট
          </>
        )}
      </Button>
    </motion.div>
  )
}

// ============ Main Account Page ============
export default function AccountPage() {
  const { data: nextAuthSession } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  // Check if admin via NextAuth session and auto-redirect
  useEffect(() => {
    if (nextAuthSession?.user) {
      const isAdmin = (nextAuthSession.user as any).isAdmin || 
        nextAuthSession.user.email?.toLowerCase() === 'dolamaanha@gmail.com'
      if (isAdmin) {
        window.location.href = '/admin'
      }
    }
  }, [nextAuthSession])

  // Check auth on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.status === 401) {
          window.location.href = '/login'
          return
        }
        const data = await res.json()
        if (data.user) {
          setUser({
            ...data.user,
            emailVerified: data.user.emailVerified ?? false,
          })
        } else {
          window.location.href = '/login'
          return
        }
      } catch {
        window.location.href = '/login'
        return
      } finally {
        setAuthChecked(true)
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleUserUpdate = (updatedUser: UserData) => {
    setUser((prev) => prev ? { ...prev, emailVerified: updatedUser.emailVerified ?? prev.emailVerified, ...updatedUser } : updatedUser)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Even if API fails, we still redirect
    }
    window.location.href = '/'
  }

  // Loading screen
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <span className="text-3xl font-black tracking-tight text-stone-900">স্বপ্ন পূরণ</span>
          <div className="w-48 h-0.5 bg-stone-200 overflow-hidden mt-4 mx-auto">
            <motion.div
              className="h-full bg-stone-900"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'প্রোফাইল', icon: <User className="size-5" /> },
    { id: 'favorites', label: 'পছন্দ', icon: <Heart className="size-5" /> },
    { id: 'orders', label: 'অর্ডার', icon: <Package className="size-5" /> },
    { id: 'settings', label: 'সেটিংস', icon: <Settings className="size-5" /> },
  ]

  // Get tab direction for animation
  const tabIndex = (tab: TabType) => tabs.findIndex((t) => t.id === tab)
  const direction = tabIndex(activeTab) > tabIndex('profile') ? 1 : -1

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-100">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-stone-900 flex items-center justify-center relative">
              <span className="text-xs font-black text-white">স্ব</span>
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <Crown className="w-2.5 h-2.5 text-white" />
              </motion.div>
            </div>
            <span className="text-base font-black text-stone-900 tracking-tight">স্বপ্ন পূরণ</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.3 }}
              className={`size-2 rounded-full ${user.emailVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}
              title={user.emailVerified ? 'ইমেইল ভেরিফাইড' : 'ইমেইল আনভেরিফাইড'}
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs h-8"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              হোমে ফিরুন
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-stone-500 hover:text-red-600 hover:bg-red-50 text-xs h-8"
            >
              <LogOut className="size-3.5 mr-1" />
              লগআউট
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {activeTab === 'profile' && (
              <ProfileTab user={user} onUserUpdate={handleUserUpdate} />
            )}
            {activeTab === 'favorites' && (
              <FavoritesTab user={user} onUserUpdate={handleUserUpdate} />
            )}
            {activeTab === 'orders' && (
              <OrdersTab />
            )}
            {activeTab === 'settings' && (
              <SettingsTab user={user} onLogout={handleLogout} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-100 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 transition-colors relative ${
                  isActive
                    ? 'text-stone-900'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute top-0 left-2 right-2 h-0.5 bg-stone-900 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
