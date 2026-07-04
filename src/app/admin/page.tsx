'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Shirt,
  Phone,
  Mail,
  MessageCircle,
  X,
  BoxIcon,
  Star,
  Bell,
  AlertTriangle,
  Shield,
  KeyRound,
  Crown,
  FileText,
  Upload,
  CreditCard,
  Camera,
  ImagePlus,
} from 'lucide-react'

// ============ Types ============
interface AdminUser {
  id: string
  email: string
  name: string
  emailVerified?: boolean
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
  featured: boolean
  reviewCount: number
  rating: number
  stock: number
  createdAt: string
  updatedAt: string
}

interface Order {
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

interface Stats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  newOrders: number
  pendingPayments: number
  lowStock: number
  recentOrders: Order[]
}

interface ProductForm {
  name: string
  description: string
  price: string
  category: string
  image: string
  images: string
  colors: string
  sizes: string
  fabric: string
  featured: boolean
  stock: string
}

interface Notification {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
}

type TabType = 'dashboard' | 'products' | 'orders' | 'notifications' | 'content' | 'payment' | 'settings'

// ============ Helper Functions ============
const emptyProductForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  category: 'সালোয়ার কামিজ',
  image: '',
  images: '',
  colors: '',
  sizes: '',
  fabric: '',
  featured: false,
  stock: '10',
}

const categories = ['সালোয়ার কামিজ', 'শাড়ি', 'লেহেঙ্গা', 'কুর্তা', 'শারারা', 'ঘারারা']

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

function formatCurrency(amount: number) {
  return `৳${amount.toLocaleString('bn-BD')}`
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'এইমাত্র'
  if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`
  return `${Math.floor(diff / 86400)} দিন আগে`
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'login':
      return <Shield className="size-4 text-emerald-600" />
    case 'failed_login':
      return <AlertTriangle className="size-4 text-red-500" />
    case 'new_order':
      return <ShoppingBag className="size-4 text-cyan-600" />
    case 'password_change':
      return <KeyRound className="size-4 text-amber-600" />
    default:
      return <Bell className="size-4 text-stone-400" />
  }
}

function getNotificationIconBg(type: string) {
  switch (type) {
    case 'login':
      return 'bg-emerald-50'
    case 'failed_login':
      return 'bg-red-50'
    case 'new_order':
      return 'bg-cyan-50'
    case 'password_change':
      return 'bg-amber-50'
    default:
      return 'bg-stone-50'
  }
}

// ============ Toast Component ============
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[calc(100%-2rem)]"
    >
      <div className="bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
        <AlertCircle className="size-4 shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="shrink-0 hover:text-stone-300">
          <X className="size-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// ============ Login View ============
const adminFadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.08, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

function LoginView({ onLogin }: { onLogin: (admin: AdminUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = () => {
    setGoogleLoading(true)
    // Use NextAuth signIn for Google - full redirect flow
    // Admin will be redirected to /admin after OAuth
    signIn('google', { callbackUrl: '/admin' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'লগইন করতে সমস্যা হয়েছে')
        return
      }

      // Verify the session after login
      try {
        const verifyRes = await fetch('/api/admin/verify')
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json()
          onLogin({ ...verifyData.admin, emailVerified: true })
        } else {
          onLogin({ ...data.admin, emailVerified: true })
        }
      } catch {
        onLogin({ ...data.admin, emailVerified: true })
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-white to-stone-100 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-stone-200 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2.5, ease: 'easeOut', delay: 0.3 }}
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-stone-300 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-xl shadow-stone-200/30 rounded-3xl overflow-hidden">
          <div className="px-7 pt-8 pb-7">
            {/* Brand Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center mb-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center mb-4 shadow-lg shadow-stone-300/50 relative">
                <Shield className="size-7 text-white" />
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md"
                >
                  <Crown className="w-3.5 h-3.5 text-white" />
                </motion.div>
              </div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">স্বপ্ন পূরণ</h1>
              <p className="text-stone-400 text-sm mt-1.5">অ্যাডমিন ড্যাশবোর্ড</p>
            </motion.div>

            {/* Error Display */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm mb-5"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <motion.div variants={adminFadeUp} custom={0} className="space-y-2">
                <Label htmlFor="admin-email" className="text-stone-600 text-xs font-semibold tracking-wide uppercase">
                  অ্যাডমিন ইমেইল
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    autoComplete="off"
                    className="h-12 rounded-xl border-stone-200/80 bg-white/50 backdrop-blur-sm pl-10 pr-4 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50 transition-all duration-300"
                    required
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={adminFadeUp} custom={1} className="space-y-2">
                <Label htmlFor="admin-password" className="text-stone-600 text-xs font-semibold tracking-wide uppercase">
                  পাসওয়ার্ড
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড দিন"
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-stone-200/80 bg-white/50 backdrop-blur-sm pl-10 pr-11 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={adminFadeUp} custom={2}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-700 hover:to-stone-800 text-white font-semibold text-base shadow-lg shadow-stone-300/40 transition-all duration-300 active:scale-[0.98]"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="size-4 animate-spin" />
                        লগইন হচ্ছে...
                      </motion.div>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        অ্যাডমিন লগইন
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>

            {/* Google Login for Admin */}
            <motion.div variants={adminFadeUp} custom={3} className="mt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-stone-200/60" />
                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">অথবা</span>
                <div className="flex-1 h-px bg-stone-200/60" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className="w-full h-12 rounded-xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-md text-stone-700 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <Loader2 className="size-5 animate-spin text-stone-500" />
                  ) : (
                    <svg className="size-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span>Google দিয়ে লগইন করুন</span>
                </button>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              variants={adminFadeUp}
              custom={4}
              className="mt-6 text-center"
            >
              <p className="text-xs text-stone-400">
                শুধুমাত্র অনুমোদিত অ্যাডমিন লগইন করতে পারবেন
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ============ Dashboard Tab ============
function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error('Stats error:', error)
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    { label: 'মোট পণ্য', value: stats.totalProducts, icon: Shirt, color: 'bg-violet-50 text-violet-600' },
    { label: 'মোট অর্ডার', value: stats.totalOrders, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'আয়', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'নতুন অর্ডার', value: stats.newOrders, icon: TrendingUp, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'বাকি পেমেন্ট', value: stats.pendingPayments, icon: Clock, color: 'bg-orange-50 text-orange-600' },
    { label: 'স্বল্প স্টক', value: stats.lowStock, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-bold text-stone-900">ওভারভিউ</h2>
        <p className="text-stone-500 text-sm">আপনার স্টোরের সামগ্রিক অবস্থা</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-stone-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`size-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon className="size-4.5" />
                </div>
                <p className="text-2xl font-bold text-stone-900">{card.value}</p>
                <p className="text-xs text-stone-500 mt-0.5">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stone-900 mb-3">সাম্প্রতিক অর্ডার</h3>
        {stats.recentOrders.length === 0 ? (
          <Card className="border-stone-100">
            <CardContent className="p-6 text-center text-stone-400 text-sm">
              কোনো অর্ডার নেই
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {stats.recentOrders.map((order) => (
              <Card key={order.id} className="border-stone-100 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">{order.customerName}</p>
                      <p className="text-xs text-stone-500">{order.phone}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-stone-900">{formatCurrency(order.totalAmount)}</p>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============ Product Modal ============
function ProductModal({
  isOpen,
  onClose,
  product,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSave: (form: ProductForm) => Promise<void>
}) {
  const [form, setForm] = useState<ProductForm>(emptyProductForm)
  const [saving, setSaving] = useState(false)
  const [productImageUploading, setProductImageUploading] = useState(false)
  const [productImagesUploading, setProductImagesUploading] = useState(false)
  const productImageInputRef = useRef<HTMLInputElement>(null)
  const productImagesInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        image: product.image,
        images: product.images,
        colors: product.colors,
        sizes: product.sizes,
        fabric: product.fabric,
        featured: product.featured,
        stock: product.stock.toString(),
      })
    } else {
      setForm(emptyProductForm)
    }
  }, [product, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch {
      // error handled in parent
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900">
            {product ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8">
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-600">নাম *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="পণ্যের নাম"
              className="h-10 bg-stone-50/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-600">বিবরণ</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="পণ্যের বিবরণ"
              className="bg-stone-50/50 min-h-20"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-600">মূল্য (৳) *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className="h-10 bg-stone-50/50"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-600">স্টক</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="10"
                className="h-10 bg-stone-50/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-600">ক্যাটাগরি *</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    form.category === cat
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* প্রধান ছবি - Single Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-600">প্রধান ছবি</Label>
            {form.image && (
              <div className="relative w-full h-32 bg-stone-100 rounded-lg overflow-hidden">
                <img src={form.image} alt="প্রধান ছবি" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: '' })}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => productImageInputRef.current?.click()}
                disabled={productImageUploading}
                className="text-xs"
              >
                {productImageUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                {productImageUploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}
              </Button>
              {!form.image && <span className="text-xs text-stone-400">কোনো ছবি নেই</span>}
            </div>
            <input
              ref={productImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setProductImageUploading(true)
                try {
                  const formData = new FormData()
                  formData.append('file', file)
                  const res = await fetch('/api/upload', { method: 'POST', body: formData })
                  const data = await res.json()
                  if (res.ok && data.url) {
                    setForm((prev) => ({ ...prev, image: data.url }))
                  }
                } catch (error) {
                  console.error('Upload error:', error)
                } finally {
                  setProductImageUploading(false)
                  e.target.value = ''
                }
              }}
            />
          </div>

          {/* অতিরিক্ত ছবি - Multi Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-600">অতিরিক্ত ছবি</Label>
            {form.images && form.images.split(',').filter(url => url.trim()).length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {form.images.split(',').filter(url => url.trim()).map((url, index) => (
                  <div key={index} className="relative h-20 bg-stone-100 rounded-lg overflow-hidden group">
                    <img src={url.trim()} alt={`ছবি ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const urls = form.images.split(',').filter(u => u.trim())
                        urls.splice(index, 1)
                        setForm({ ...form, images: urls.join(',') })
                      }}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => productImagesInputRef.current?.click()}
                disabled={productImagesUploading}
                className="text-xs"
              >
                {productImagesUploading ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                {productImagesUploading ? 'আপলোড হচ্ছে...' : 'ছবি যোগ করুন'}
              </Button>
              {(!form.images || form.images.split(',').filter(url => url.trim()).length === 0) && (
                <span className="text-xs text-stone-400">কোনো অতিরিক্ত ছবি নেই</span>
              )}
            </div>
            <input
              ref={productImagesInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setProductImagesUploading(true)
                try {
                  const formData = new FormData()
                  formData.append('file', file)
                  const res = await fetch('/api/upload', { method: 'POST', body: formData })
                  const data = await res.json()
                  if (res.ok && data.url) {
                    setForm((prev) => {
                      const existing = prev.images ? prev.images.split(',').filter(u => u.trim()) : []
                      existing.push(data.url)
                      return { ...prev, images: existing.join(',') }
                    })
                  }
                } catch (error) {
                  console.error('Upload error:', error)
                } finally {
                  setProductImagesUploading(false)
                  e.target.value = ''
                }
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-600">রং (কমা দিয়ে আলাদা)</Label>
            <Input
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              placeholder="লাল, নীল, সবুজ"
              className="h-10 bg-stone-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-600">সাইজ (কমা দিয়ে আলাদা)</Label>
            <Input
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              placeholder="S, M, L, XL"
              className="h-10 bg-stone-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-stone-600">ফ্যাব্রিক</Label>
            <Input
              value={form.fabric}
              onChange={(e) => setForm({ ...form, fabric: e.target.value })}
              placeholder="সিল্ক, কটন"
              className="h-10 bg-stone-50/50"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label className="text-xs font-medium text-stone-600">ফিচার্ড পণ্য</Label>
            <Switch
              checked={form.featured}
              onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white font-semibold"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : product ? (
              'আপডেট করুন'
            ) : (
              'পণ্য যোগ করুন'
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============ Products Tab ============
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [quickUploading, setQuickUploading] = useState<string | null>(null)
  const quickImageInputRef = useRef<HTMLInputElement>(null)
  const [quickImageTarget, setQuickImageTarget] = useState<string | null>(null)

  const handleQuickImageChange = async (file: File, productId: string) => {
    setQuickUploading(productId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        // Update product image via API
        const updateRes = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: productId, image: data.url }),
        })
        if (updateRes.ok) {
          await fetchProducts()
        }
      }
    } catch (error) {
      console.error('Quick image upload error:', error)
    } finally {
      setQuickUploading(null)
      setQuickImageTarget(null)
    }
  }

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
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

  const handleSaveProduct = async (form: ProductForm) => {
    if (editingProduct) {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProduct.id, ...form }),
      })
      if (!res.ok) throw new Error('Failed to update')
    } else {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create')
    }
    await fetchProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি এই পণ্যটি মুছে ফেলতে চান?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(null)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">পণ্যসমূহ</h2>
          <p className="text-stone-500 text-sm">{products.length}টি পণ্য</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-stone-900 hover:bg-stone-800 text-white h-9 text-sm"
        >
          <Plus className="size-4" />
          নতুন পণ্য
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="border-stone-100">
          <CardContent className="p-10 text-center">
            <ShoppingBag className="size-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">কোনো পণ্য নেই</p>
            <Button
              onClick={openAddModal}
              variant="outline"
              className="mt-3 text-sm"
            >
              <Plus className="size-4" />
              পণ্য যোগ করুন
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-stone-100 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-3">
                    <div
                      className="w-20 h-20 shrink-0 bg-stone-100 overflow-hidden relative group cursor-pointer"
                      onClick={() => {
                        setQuickImageTarget(product.id)
                        setTimeout(() => quickImageInputRef.current?.click(), 0)
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="%23f5f5f4" width="80" height="80"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23a8a29e" font-size="24">👗</text></svg>'
                        }}
                      />
                      {/* Hover overlay for quick image change */}
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {quickUploading === product.id ? (
                          <Loader2 className="size-5 text-white animate-spin" />
                        ) : (
                          <>
                            <Camera className="size-5 text-white" />
                            <span className="text-[8px] text-white mt-0.5 font-medium">ছবি পরিবর্তন</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-3 pr-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-stone-900 truncate">{product.name}</p>
                            {product.featured && (
                              <Star className="size-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{product.category}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-stone-400 hover:text-stone-700"
                            onClick={() => openEditModal(product)}
                          >
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                          >
                            {deleting === product.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-bold text-stone-900">{formatCurrency(product.price)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          product.stock <= 5
                            ? 'bg-red-50 text-red-600'
                            : product.stock <= 10
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          স্টক: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Hidden input for quick image change */}
      <input
        ref={quickImageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && quickImageTarget) {
            handleQuickImageChange(file, quickImageTarget)
          }
          e.target.value = ''
        }}
      />
    </motion.div>
  )
}

// ============ Orders Tab ============
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrders(data)
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

  const updateOrderStatus = async (id: string, orderStatus: string) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, orderStatus }),
      })
      if (res.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setUpdating(null)
    }
  }

  const togglePaymentStatus = async (order: Order) => {
    setUpdating(order.id)
    try {
      const newStatus = order.paymentStatus === 'paid' ? 'pending' : 'paid'
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, paymentStatus: newStatus }),
      })
      if (res.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case 'new': return ['confirmed', 'cancelled']
      case 'confirmed': return ['shipped', 'cancelled']
      case 'shipped': return ['delivered', 'cancelled']
      case 'delivered': return []
      case 'cancelled': return ['new']
      default: return []
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'new': return 'নতুন'
      case 'confirmed': return 'কনফার্ম'
      case 'shipped': return 'শিপড'
      case 'delivered': return 'ডেলিভার্ড'
      case 'cancelled': return 'বাতিল'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="size-3.5" />
      case 'confirmed': return <CheckCircle className="size-3.5" />
      case 'shipped': return <Truck className="size-3.5" />
      case 'delivered': return <CheckCircle className="size-3.5" />
      case 'cancelled': return <XCircle className="size-3.5" />
      default: return null
    }
  }

  const getStatusBtnColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 hover:bg-green-200'
      case 'shipped': return 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      case 'delivered': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
      case 'cancelled': return 'bg-red-100 text-red-700 hover:bg-red-200'
      default: return 'bg-stone-100 text-stone-700 hover:bg-stone-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-stone-900">অর্ডারসমূহ</h2>
        <p className="text-stone-500 text-sm">{orders.length}টি অর্ডার</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-stone-100">
          <CardContent className="p-10 text-center">
            <Package className="size-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">কোনো অর্ডার নেই</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id
            const nextStatuses = getNextStatuses(order.orderStatus)
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-stone-900">{order.customerName}</p>
                          {getStatusBadge(order.orderStatus)}
                          {getPaymentBadge(order.paymentStatus)}
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          #{order.id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-sm font-bold text-stone-900">{formatCurrency(order.totalAmount)}</p>
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
                            {/* Customer Info */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs text-stone-600">
                                <Phone className="size-3.5 text-stone-400" />
                                {order.phone}
                              </div>
                              <div className="flex items-start gap-2 text-xs text-stone-600">
                                <BoxIcon className="size-3.5 text-stone-400 shrink-0 mt-0.5" />
                                <span>{order.address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-stone-600">
                                <DollarSign className="size-3.5 text-stone-400" />
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

                            {/* Status Actions */}
                            <div className="flex flex-wrap gap-2">
                              {nextStatuses.map((status) => (
                                <Button
                                  key={status}
                                  size="sm"
                                  variant="outline"
                                  className={`h-7 text-xs ${getStatusBtnColor(status)} border-0`}
                                  onClick={() => updateOrderStatus(order.id, status)}
                                  disabled={updating === order.id}
                                >
                                  {updating === order.id ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    getStatusIcon(status)
                                  )}
                                  {getStatusLabel(status)}
                                </Button>
                              ))}

                              <Button
                                size="sm"
                                variant="outline"
                                className={`h-7 text-xs ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                } border-0`}
                                onClick={() => togglePaymentStatus(order)}
                                disabled={updating === order.id}
                              >
                                {order.paymentStatus === 'paid' ? 'বাকি করুন' : 'পরিশোধিত করুন'}
                              </Button>
                            </div>
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
      )}
    </motion.div>
  )
}

// ============ Notifications Tab ============
function NotificationsTab({ unreadCount, onUnreadChange }: { unreadCount: number; onUnreadChange: (count: number) => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      if (Array.isArray(data)) {
        setNotifications(data)
        const unread = data.filter((n: Notification) => !n.isRead).length
        onUnreadChange(unread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [onUnreadChange])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  const markAllRead = async () => {
    setActionLoading('markAll')
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (res.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error('Mark all read error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error('Delete notification error:', error)
    }
  }

  const clearAll = async () => {
    if (!confirm('আপনি কি সব নোটিফিকেশন মুছে ফেলতে চান?')) return
    setActionLoading('clearAll')
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      })
      if (res.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error('Clear all error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            নোটিফিকেশন
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                {unreadCount}টি অপঠিত
              </Badge>
            )}
          </h2>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={markAllRead}
              disabled={actionLoading === 'markAll' || unreadCount === 0}
            >
              {actionLoading === 'markAll' ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckCircle className="size-3" />
              )}
              সব পড়া হয়েছে
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={clearAll}
              disabled={actionLoading === 'clearAll'}
            >
              {actionLoading === 'clearAll' ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Trash2 className="size-3" />
              )}
              সব মুছুন
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="border-stone-100">
          <CardContent className="p-10 text-center">
            <Bell className="size-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">কোনো নোটিফিকেশন নেই</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <Card
                className={`border-stone-100 shadow-sm overflow-hidden cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-stone-50/80 border-l-2 border-l-cyan-500' : ''
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification.id)
                  }
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`size-9 rounded-lg ${getNotificationIconBg(notification.type)} flex items-center justify-center shrink-0 mt-0.5`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-stone-900' : 'text-stone-700'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!notification.isRead && (
                            <span className="size-2 rounded-full bg-cyan-500 shrink-0" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="size-6 flex items-center justify-center rounded-md text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-stone-400 mt-1">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ============ Google OAuth Status Component ============
function GoogleOAuthStatus() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle className="size-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-700">Google লগইন সক্রিয়</span>
      </div>
      <p className="text-xs text-stone-500">
        ব্যবহারকারীরা Google অ্যাকাউন্ট দিয়ে লগইন করতে পারবেন।
      </p>
    </div>
  )
}

// ============ Image Upload Field ============
function ImageUploadField({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (url: string) => void
  label: string
}) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        onChange(data.url)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full h-32 bg-stone-100 rounded-lg overflow-hidden">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs"
        >
          {uploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
          {uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}
        </Button>
        {!value && <span className="text-xs text-stone-400">কোনো ছবি নেই</span>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// ============ Content Tab ============
function ContentTab({ onToast }: { onToast: (msg: string) => void }) {
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hero: true,
    about: false,
    showcase: false,
    featured: false,
    footer: false,
    order: false,
  })

  const textareaFields = new Set(['hero_description', 'about_paragraph1', 'about_paragraph2', 'footer_brand_description', 'order_payment_instruction', 'order_payment_instruction_before', 'order_payment_instruction_after', 'order_contact_instruction', 'order_notification_text', 'order_success_message', 'order_subtitle', 'order_no_payment_text', 'order_empty_cart_text'])

  const sections = [
    {
      id: 'hero',
      title: 'হিরো সেকশন',
      fields: [
        { key: 'hero_image', label: 'হিরো ছবি', type: 'image' as const },
        { key: 'hero_since_label', label: '"যখন থেকে" লেবেল' },
        { key: 'hero_subtitle', label: 'সাবটাইটেল' },
        { key: 'hero_description', label: 'বিবরণ' },
      ],
    },
    {
      id: 'about',
      title: 'আমাদের গল্প',
      fields: [
        { key: 'about_image', label: 'সেকশন ছবি', type: 'image' as const },
        { key: 'about_label', label: 'সেকশন লেবেল' },
        { key: 'about_title_line1', label: 'শিরোনাম লাইন ১' },
        { key: 'about_title_line2', label: 'শিরোনাম লাইন ২' },
        { key: 'about_paragraph1', label: 'অনুচ্ছেদ ১' },
        { key: 'about_paragraph2', label: 'অনুচ্ছেদ ২' },
        { key: 'about_experience_years', label: 'অভিজ্ঞতার সংখ্যা' },
        { key: 'about_experience_label', label: 'অভিজ্ঞতার লেবেল' },
        { key: 'about_stat1_number', label: 'পরিসংখ্যান ১ - সংখ্যা' },
        { key: 'about_stat1_label', label: 'পরিসংখ্যান ১ - লেবেল' },
        { key: 'about_stat2_number', label: 'পরিসংখ্যান ২ - সংখ্যা' },
        { key: 'about_stat2_label', label: 'পরিসংখ্যান ২ - লেবেল' },
        { key: 'about_stat3_number', label: 'পরিসংখ্যান ৩ - সংখ্যা' },
        { key: 'about_stat3_label', label: 'পরিসংখ্যান ৩ - লেবেল' },
      ],
    },
    {
      id: 'showcase',
      title: 'শোকেস সেকশন',
      fields: [
        { key: 'showcase_image1', label: 'গ্যালারি ছবি ১', type: 'image' as const },
        { key: 'showcase_image2', label: 'গ্যালারি ছবি ২', type: 'image' as const },
        { key: 'showcase_image3', label: 'গ্যালারি ছবি ৩', type: 'image' as const },
        { key: 'showcase_image4', label: 'গ্যালারি ছবি ৪', type: 'image' as const },
        { key: 'showcase_label', label: 'সেকশন লেবেল' },
        { key: 'showcase_title', label: 'শিরোনাম' },
        { key: 'showcase_feature1_title', label: 'ফিচার ১ - শিরোনাম' },
        { key: 'showcase_feature1_desc', label: 'ফিচার ১ - বিবরণ' },
        { key: 'showcase_feature2_title', label: 'ফিচার ২ - শিরোনাম' },
        { key: 'showcase_feature2_desc', label: 'ফিচার ২ - বিবরণ' },
        { key: 'showcase_feature3_title', label: 'ফিচার ৩ - শিরোনাম' },
        { key: 'showcase_feature3_desc', label: 'ফিচার ৩ - বিবরণ' },
      ],
    },
    {
      id: 'featured',
      title: 'ফিচার্ড সেকশন',
      fields: [
        { key: 'featured_label', label: 'সেকশন লেবেল' },
        { key: 'featured_title', label: 'শিরোনাম' },
      ],
    },
    {
      id: 'footer',
      title: 'ফুটার',
      fields: [
        { key: 'footer_brand_description', label: 'ব্র্যান্ড বিবরণ' },
        { key: 'footer_phone', label: 'ফোন নম্বর' },
        { key: 'footer_whatsapp', label: 'WhatsApp নম্বর' },
        { key: 'footer_email', label: 'ইমেইল' },
        { key: 'footer_facebook', label: 'Facebook লিংক' },
        { key: 'footer_facebook_name', label: 'Facebook পেজের নাম' },
        { key: 'footer_instagram', label: 'Instagram লিংক' },
        { key: 'footer_address', label: 'ঠিকানা' },
      ],
    },
    {
      id: 'order',
      title: 'অর্ডার পেজ',
      fields: [
        { key: 'order_title', label: 'অর্ডার শিরোনাম' },
        { key: 'order_subtitle', label: 'অর্ডার সাবটাইটেল' },
        { key: 'order_info_title', label: 'তথ্য সেকশন শিরোনাম' },
        { key: 'order_name_placeholder', label: 'নাম প্লেসহোল্ডার' },
        { key: 'order_phone_placeholder', label: 'ফোন প্লেসহোল্ডার' },
        { key: 'order_address_placeholder', label: 'ঠিকানা প্লেসহোল্ডার' },
        { key: 'order_notes_placeholder', label: 'নোট প্লেসহোল্ডার' },
        { key: 'order_payment_title', label: 'পেমেন্ট সেকশন শিরোনাম' },
        { key: 'order_payment_instruction_before', label: 'পেমেন্ট নির্বাচন নির্দেশনা' },
        { key: 'order_payment_instruction_after', label: 'পেমেন্ট পরবর্তী নির্দেশনা' },
        { key: 'order_summary_title', label: 'সারাংশ শিরোনাম' },
        { key: 'order_total_label', label: 'মোট লেবেল' },
        { key: 'order_empty_cart_text', label: 'খালি কার্ট টেক্সট' },
        { key: 'order_no_payment_text', label: 'পেমেন্ট পদ্ধতি নেই টেক্সট' },
        { key: 'order_payment_instruction', label: 'পেমেন্ট নির্দেশনা (কনফার্মেশন)' },
        { key: 'order_notification_text', label: 'নোটিফিকেশন টেক্সট' },
        { key: 'order_notification_email', label: 'নোটিফিকেশন ইমেইল' },
        { key: 'order_button_text', label: 'অর্ডার বাটন টেক্সট' },
        { key: 'order_processing_text', label: 'প্রসেসিং টেক্সট' },
        { key: 'order_back_button', label: 'ফিরে যান বাটন' },
        { key: 'order_home_button', label: 'হোমে ফিরে যান বাটন' },
        { key: 'order_success_title', label: 'সাফল্য শিরোনাম' },
        { key: 'order_success_message', label: 'সাফল্য বার্তা' },
        { key: 'order_confirm_title', label: 'পেমেন্ট কনফার্ম শিরোনাম' },
        { key: 'order_contact_title', label: 'যোগাযোগ শিরোনাম' },
        { key: 'order_contact_instruction', label: 'যোগাযোগ নির্দেশনা' },
        { key: 'order_copy_tooltip', label: 'কপি টুলটিপ' },
      ],
    },
  ]

  useEffect(() => {
    let cancelled = false
    fetch('/api/site-content')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setContent(data)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error('Content fetch error:', error)
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      if (res.ok) {
        onToast('কন্টেন্ট সফলভাবে সেভ হয়েছে!')
      } else {
        onToast('সেভ করতে সমস্যা হয়েছে')
      }
    } catch {
      onToast('নেটওয়ার্ক সমস্যা হয়েছে')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-stone-900">ওয়েবসাইট কন্টেন্ট</h2>
        <p className="text-stone-500 text-sm">হোমপেজের টেক্সট ও তথ্য সম্পাদনা করুন</p>
      </div>

      {sections.map((section) => (
        <Card key={section.id} className="border-stone-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection(section.id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50/50 transition-colors"
          >
            <span className="text-sm font-semibold text-stone-900">{section.title}</span>
            {expandedSections[section.id] ? (
              <ChevronUp className="size-4 text-stone-400" />
            ) : (
              <ChevronDown className="size-4 text-stone-400" />
            )}
          </button>
          {expandedSections[section.id] && (
            <CardContent className="px-4 pb-4 pt-0 space-y-3 border-t border-stone-100">
              <div className="pt-3" />
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-600">{field.label}</Label>
                  {field.type === 'image' ? (
                    <ImageUploadField
                      value={content[field.key] || ''}
                      onChange={(url) => setContent({ ...content, [field.key]: url })}
                      label={field.label}
                    />
                  ) : textareaFields.has(field.key) ? (
                    <Textarea
                      value={content[field.key] || ''}
                      onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                      className="bg-stone-50/50 min-h-20"
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={content[field.key] || ''}
                      onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                      className="h-10 bg-stone-50/50"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white font-semibold"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          'সেভ করুন'
        )}
      </Button>
    </motion.div>
  )
}

// ============ Payment & Contact Tab ============
interface PaymentMethodItem {
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

interface ContactMethodItem {
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

const iconOptions = [
  { value: 'bkash', label: 'বিকাশ (ব)', emoji: 'ব' },
  { value: 'nagad', label: 'নগদ (ন)', emoji: 'ন' },
  { value: 'rocket', label: 'রকেট (র)', emoji: 'র' },
  { value: 'bank', label: 'ব্যাংক (🏦)', emoji: '🏦' },
  { value: 'whatsapp', label: 'WhatsApp (💬)', emoji: '💬' },
  { value: 'messenger', label: 'Messenger (📩)', emoji: '📩' },
  { value: 'email', label: 'ইমেইল (📧)', emoji: '📧' },
  { value: 'phone', label: 'ফোন (📞)', emoji: '📞' },
  { value: 'telegram', label: 'টেলিগ্রাম (✈️)', emoji: '✈️' },
  { value: 'card', label: 'কার্ড (💳)', emoji: '💳' },
]

const colorOptions = [
  { value: 'pink', label: 'পিংক', class: 'bg-pink-500' },
  { value: 'orange', label: 'অরেঞ্জ', class: 'bg-orange-500' },
  { value: 'purple', label: 'পার্পল', class: 'bg-purple-600' },
  { value: 'green', label: 'সবুজ', class: 'bg-emerald-500' },
  { value: 'blue', label: 'নীল', class: 'bg-blue-500' },
  { value: 'red', label: 'লাল', class: 'bg-red-500' },
  { value: 'teal', label: 'টিল', class: 'bg-teal-500' },
  { value: 'cyan', label: 'সায়ান', class: 'bg-cyan-500' },
  { value: 'stone', label: 'স্টোন', class: 'bg-stone-700' },
]

function PaymentTab({ onToast }: { onToast: (msg: string) => void }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([])
  const [contactMethods, setContactMethods] = useState<ContactMethodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPayment, setEditingPayment] = useState<PaymentMethodItem | null>(null)
  const [editingContact, setEditingContact] = useState<ContactMethodItem | null>(null)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state for payment method
  const [pmForm, setPmForm] = useState({ name: '', number: '', text: '', link: '', icon: 'bank', color: 'stone' })
  // Form state for contact method
  const [cmForm, setCmForm] = useState({ name: '', number: '', text: '', link: '', icon: 'whatsapp', color: 'green' })

  const fetchData = useCallback(async () => {
    try {
      const [pmRes, cmRes] = await Promise.all([
        fetch('/api/admin/payment-methods'),
        fetch('/api/admin/contact-methods'),
      ])
      const pmData = await pmRes.json()
      const cmData = await cmRes.json()
      if (Array.isArray(pmData)) setPaymentMethods(pmData)
      if (Array.isArray(cmData)) setContactMethods(cmData)
    } catch (error) {
      console.error('Error fetching payment/contact methods:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetPmForm = () => {
    setPmForm({ name: '', number: '', text: '', link: '', icon: 'bank', color: 'stone' })
    setEditingPayment(null)
    setShowAddPayment(false)
  }

  const resetCmForm = () => {
    setCmForm({ name: '', number: '', text: '', link: '', icon: 'whatsapp', color: 'green' })
    setEditingContact(null)
    setShowAddContact(false)
  }

  const handleSavePayment = async () => {
    if (!pmForm.name) return
    setSaving(true)
    try {
      if (editingPayment) {
        const res = await fetch('/api/admin/payment-methods', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPayment.id, ...pmForm }),
        })
        if (!res.ok) throw new Error()
        onToast('পেমেন্ট পদ্ধতি আপডেট হয়েছে')
      } else {
        const res = await fetch('/api/admin/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pmForm),
        })
        if (!res.ok) throw new Error()
        onToast('পেমেন্ট পদ্ধতি যোগ হয়েছে')
      }
      resetPmForm()
      await fetchData()
    } catch {
      onToast('সেভ করতে সমস্যা হয়েছে')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveContact = async () => {
    if (!cmForm.name) return
    setSaving(true)
    try {
      if (editingContact) {
        const res = await fetch('/api/admin/contact-methods', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingContact.id, ...cmForm }),
        })
        if (!res.ok) throw new Error()
        onToast('যোগাযোগ পদ্ধতি আপডেট হয়েছে')
      } else {
        const res = await fetch('/api/admin/contact-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cmForm),
        })
        if (!res.ok) throw new Error()
        onToast('যোগাযোগ পদ্ধতি যোগ হয়েছে')
      }
      resetCmForm()
      await fetchData()
    } catch {
      onToast('সেভ করতে সমস্যা হয়েছে')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePayment = async (id: string) => {
    if (!confirm('আপনি কি এই পেমেন্ট পদ্ধতি মুছে ফেলতে চান?')) return
    try {
      await fetch(`/api/admin/payment-methods?id=${id}`, { method: 'DELETE' })
      onToast('পেমেন্ট পদ্ধতি মুছে ফেলা হয়েছে')
      await fetchData()
    } catch {
      onToast('মুছতে সমস্যা হয়েছে')
    }
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm('আপনি কি এই যোগাযোগ পদ্ধতি মুছে ফেলতে চান?')) return
    try {
      await fetch(`/api/admin/contact-methods?id=${id}`, { method: 'DELETE' })
      onToast('যোগাযোগ পদ্ধতি মুছে ফেলা হয়েছে')
      await fetchData()
    } catch {
      onToast('মুছতে সমস্যা হয়েছে')
    }
  }

  const handleTogglePayment = async (pm: PaymentMethodItem) => {
    try {
      await fetch('/api/admin/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pm.id, isActive: !pm.isActive }),
      })
      await fetchData()
    } catch {
      onToast('আপডেট করতে সমস্যা')
    }
  }

  const handleToggleContact = async (cm: ContactMethodItem) => {
    try {
      await fetch('/api/admin/contact-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cm.id, isActive: !cm.isActive }),
      })
      await fetchData()
    } catch {
      onToast('আপডেট করতে সমস্যা')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Payment Methods Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">💳 পেমেন্ট পদ্ধতি</h2>
            <p className="text-stone-500 text-sm">অর্ডার পেজে দেখানো পেমেন্ট বক্স</p>
          </div>
          <Button onClick={() => { resetPmForm(); setShowAddPayment(true) }} className="bg-stone-900 hover:bg-stone-800 text-white h-9 text-sm">
            <Plus className="size-4" /> যোগ করুন
          </Button>
        </div>

        {/* Add/Edit Payment Method Form */}
        {(showAddPayment || editingPayment) && (
          <Card className="border-stone-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-900">{editingPayment ? 'পেমেন্ট পদ্ধতি সম্পাদনা' : 'নতুন পেমেন্ট পদ্ধতি'}</span>
                <Button variant="ghost" size="icon" onClick={resetPmForm} className="size-7"><X className="size-3.5" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">নাম *</Label>
                  <Input value={pmForm.name} onChange={(e) => setPmForm({ ...pmForm, name: e.target.value })} placeholder="bKash" className="h-9 bg-stone-50/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">নম্বর *</Label>
                  <Input value={pmForm.number} onChange={(e) => setPmForm({ ...pmForm, number: e.target.value })} placeholder="017XX-XXXXXX" className="h-9 bg-stone-50/50" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">বিবরণ / টেক্সট</Label>
                <Input value={pmForm.text} onChange={(e) => setPmForm({ ...pmForm, text: e.target.value })} placeholder="অ্যাকাউন্ট নাম: স্বপ্ন পূরণ" className="h-9 bg-stone-50/50" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">লিংক (ঐচ্ছিক)</Label>
                <Input value={pmForm.link} onChange={(e) => setPmForm({ ...pmForm, link: e.target.value })} placeholder="https://..." className="h-9 bg-stone-50/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">আইকন</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {iconOptions.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setPmForm({ ...pmForm, icon: opt.value })}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${pmForm.icon === opt.value ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                        {opt.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">রং</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorOptions.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setPmForm({ ...pmForm, color: opt.value })}
                        className={`w-7 h-7 rounded-full ${opt.class} transition-all ${pmForm.color === opt.value ? 'ring-2 ring-offset-2 ring-stone-900' : 'opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={handleSavePayment} disabled={saving || !pmForm.name} className="w-full h-10 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm">
                {saving ? <Loader2 className="size-4 animate-spin" /> : editingPayment ? 'আপডেট করুন' : 'যোগ করুন'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <Card className="border-stone-100">
            <CardContent className="p-6 text-center">
              <p className="text-stone-400 text-sm">কোনো পেমেন্ট পদ্ধতি নেই</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {paymentMethods.map((pm) => (
              <Card key={pm.id} className={`border-stone-100 shadow-sm ${!pm.isActive ? 'opacity-50' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-9 rounded-full ${colorOptions.find(c => c.value === pm.color)?.class || 'bg-stone-700'} flex items-center justify-center text-white flex-shrink-0`}>
                      <span className="text-xs font-bold">{iconOptions.find(i => i.value === pm.icon)?.emoji || '💳'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900">{pm.name}</p>
                      <p className="text-xs text-stone-500 truncate">{pm.number}{pm.text ? ` • ${pm.text}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleTogglePayment(pm)} className="p-1.5 hover:bg-stone-100 rounded">
                        {pm.isActive ? <Eye className="size-3.5 text-emerald-500" /> : <EyeOff className="size-3.5 text-stone-400" />}
                      </button>
                      <button onClick={() => { setEditingPayment(pm); setPmForm({ name: pm.name, number: pm.number, text: pm.text, link: pm.link, icon: pm.icon, color: pm.color }); setShowAddPayment(true) }} className="p-1.5 hover:bg-stone-100 rounded">
                        <Edit className="size-3.5 text-stone-500" />
                      </button>
                      <button onClick={() => handleDeletePayment(pm.id)} className="p-1.5 hover:bg-red-50 rounded">
                        <Trash2 className="size-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Contact Methods Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">📱 যোগাযোগ পদ্ধতি</h2>
            <p className="text-stone-500 text-sm">অর্ডার কনফার্মেশনে দেখানো যোগাযোগ বক্স</p>
          </div>
          <Button onClick={() => { resetCmForm(); setShowAddContact(true) }} className="bg-stone-900 hover:bg-stone-800 text-white h-9 text-sm">
            <Plus className="size-4" /> যোগ করুন
          </Button>
        </div>

        {/* Add/Edit Contact Method Form */}
        {(showAddContact || editingContact) && (
          <Card className="border-stone-200 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-900">{editingContact ? 'যোগাযোগ পদ্ধতি সম্পাদনা' : 'নতুন যোগাযোগ পদ্ধতি'}</span>
                <Button variant="ghost" size="icon" onClick={resetCmForm} className="size-7"><X className="size-3.5" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">নাম *</Label>
                  <Input value={cmForm.name} onChange={(e) => setCmForm({ ...cmForm, name: e.target.value })} placeholder="WhatsApp" className="h-9 bg-stone-50/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">নম্বর / আইডি</Label>
                  <Input value={cmForm.number} onChange={(e) => setCmForm({ ...cmForm, number: e.target.value })} placeholder="+8801XXX / @username" className="h-9 bg-stone-50/50" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">বিবরণ / টেক্সট</Label>
                <Input value={cmForm.text} onChange={(e) => setCmForm({ ...cmForm, text: e.target.value })} placeholder="সরাসরি মেসেজ করুন" className="h-9 bg-stone-50/50" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">লিংক *</Label>
                <Input value={cmForm.link} onChange={(e) => setCmForm({ ...cmForm, link: e.target.value })} placeholder="https://wa.me/8801XXX" className="h-9 bg-stone-50/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">আইকন</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {iconOptions.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setCmForm({ ...cmForm, icon: opt.value })}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${cmForm.icon === opt.value ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                        {opt.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-stone-600">রং</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorOptions.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setCmForm({ ...cmForm, color: opt.value })}
                        className={`w-7 h-7 rounded-full ${opt.class} transition-all ${cmForm.color === opt.value ? 'ring-2 ring-offset-2 ring-stone-900' : 'opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveContact} disabled={saving || !cmForm.name || !cmForm.link} className="w-full h-10 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm">
                {saving ? <Loader2 className="size-4 animate-spin" /> : editingContact ? 'আপডেট করুন' : 'যোগ করুন'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Methods List */}
        {contactMethods.length === 0 ? (
          <Card className="border-stone-100">
            <CardContent className="p-6 text-center">
              <p className="text-stone-400 text-sm">কোনো যোগাযোগ পদ্ধতি নেই</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {contactMethods.map((cm) => (
              <Card key={cm.id} className={`border-stone-100 shadow-sm ${!cm.isActive ? 'opacity-50' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-9 rounded-full ${colorOptions.find(c => c.value === cm.color)?.class || 'bg-emerald-500'} flex items-center justify-center text-white flex-shrink-0`}>
                      <span className="text-xs font-bold">{iconOptions.find(i => i.value === cm.icon)?.emoji || '💬'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900">{cm.name}</p>
                      <p className="text-xs text-stone-500 truncate">{cm.number || cm.text} • {cm.link}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleContact(cm)} className="p-1.5 hover:bg-stone-100 rounded">
                        {cm.isActive ? <Eye className="size-3.5 text-emerald-500" /> : <EyeOff className="size-3.5 text-stone-400" />}
                      </button>
                      <button onClick={() => { setEditingContact(cm); setCmForm({ name: cm.name, number: cm.number, text: cm.text, link: cm.link, icon: cm.icon, color: cm.color }); setShowAddContact(true) }} className="p-1.5 hover:bg-stone-100 rounded">
                        <Edit className="size-3.5 text-stone-500" />
                      </button>
                      <button onClick={() => handleDeleteContact(cm.id)} className="p-1.5 hover:bg-red-50 rounded">
                        <Trash2 className="size-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============ Settings Tab ============
function SettingsTab({ admin, onLogout }: { admin: AdminUser; onLogout: () => void }) {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      onLogout()
    } catch {
      onLogout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-stone-900">সেটিংস</h2>
        <p className="text-stone-500 text-sm">অ্যাডমিন সেটিংস ও তথ্য</p>
      </div>

      {/* Admin Info */}
      <Card className="border-stone-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-full bg-stone-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {admin.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-stone-900">{admin.name}</p>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs px-2 py-0.5 gap-1">
                    <CheckCircle className="size-3" />
                    ভেরিফাইড ✓
                  </Badge>
                </motion.div>
              </div>
              <p className="text-sm text-stone-500">{admin.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Mail className="size-4 text-stone-400" />
              {admin.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Shield className="size-4 text-stone-400" />
              অ্যাডমিন অ্যাকাউন্ট
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle className="size-4 text-emerald-500" />
              ইমেইল ভেরিফাইড
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-stone-100 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold text-stone-900">দ্রুত লিংক</p>
          <a
            href="https://wa.me/8801913551490"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="size-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-700">WhatsApp</p>
              <p className="text-xs text-green-600">সরাসরি মেসেজ পাঠান</p>
            </div>
          </a>
          <a
            href={`mailto:${admin.email}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
          >
            <Mail className="size-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-700">Gmail</p>
              <p className="text-xs text-red-600">ইমেইল পাঠান</p>
            </div>
          </a>
        </CardContent>
      </Card>

      {/* Google OAuth Setup */}
      <Card className="border-stone-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <p className="text-sm font-semibold text-stone-900">Google লগইন সেটআপ</p>
          </div>
          <GoogleOAuthStatus />
        </CardContent>
      </Card>

      {/* Notification Info */}
      <Card className="border-stone-100 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-stone-900 mb-3">নোটিফিকেশন</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">নতুন অর্ডার নোটিফিকেশন</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">সক্রিয়</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">স্টক সতর্কতা</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">সক্রিয়</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">পেমেন্ট আপডেট</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">সক্রিয়</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        disabled={loggingOut}
        variant="outline"
        className="w-full h-11 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
      >
        {loggingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <LogOut className="size-4" />
            লগআউট
          </>
        )}
      </Button>
    </motion.div>
  )
}

// ============ Access Denied View ============
function AccessDeniedView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-stone-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6"
        >
          <Shield className="size-10 text-red-500" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-black text-red-600 mb-2"
        >
          Access Denied
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-stone-600 text-sm mb-2"
        >
          এই পেজে প্রবেশের অনুমতি নেই
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-stone-400 text-xs mb-8"
        >
          শুধুমাত্র অ্যাডমিন অ্যাকাউন্ট এই পেজে প্রবেশ করতে পারে। আপনি একজন সাধারণ ব্যবহারকারী হিসেবে লগইন করেছেন।
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-3"
        >
          <Button
            onClick={() => { window.location.href = '/account' }}
            className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl"
          >
            আমার অ্যাকাউন্টে যান
          </Button>
          <Button
            variant="outline"
            onClick={() => { window.location.href = '/' }}
            className="w-full h-12 rounded-xl"
          >
            হোম পেজে যান
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ============ Main Admin Page ============
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard')
  const [unreadCount, setUnreadCount] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  // Refs for auto-logout timers
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const verifyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loginTimeRef = useRef<number>(0)

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
    if (verifyIntervalRef.current) clearInterval(verifyIntervalRef.current)
    warningTimerRef.current = null
    logoutTimerRef.current = null
    verifyIntervalRef.current = null
  }, [])

  const handleLogout = useCallback(async () => {
    clearTimers()
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } catch {
      // Even if API fails, clear local state
    }
    setIsLoggedIn(false)
    setAdmin(null)
    setCurrentTab('dashboard')
    setUnreadCount(0)
    setAccessDenied(false)
  }, [clearTimers])

  const startSessionTimers = useCallback(() => {
    clearTimers()
    loginTimeRef.current = Date.now()

    // Warning at 1 hour 50 minutes (110 minutes = 6,600,000 ms)
    warningTimerRef.current = setTimeout(() => {
      setToast('আপনার সেশন ১০ মিনিটের মধ্যে শেষ হবে')
    }, 110 * 60 * 1000)

    // Auto-logout at 2 hours (120 minutes = 7,200,000 ms)
    logoutTimerRef.current = setTimeout(() => {
      handleLogout()
    }, 120 * 60 * 1000)

    // Verify session every 5 minutes (300,000 ms)
    verifyIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/verify')
        if (!res.ok) {
          setToast('সেশন মেয়াদোত্তীর্ণ হয়েছে')
          handleLogout()
        }
      } catch {
        // Network error, don't force logout
      }
    }, 5 * 60 * 1000)
  }, [clearTimers, handleLogout])

  // Verify existing session on page load
  useEffect(() => {
    const verifySession = async () => {
      try {
        // First check if user has admin_token (direct admin login)
        const adminRes = await fetch('/api/admin/verify')
        if (adminRes.ok) {
          const data = await adminRes.json()
          setAdmin({ ...data.admin, emailVerified: true })
          setIsLoggedIn(true)
          startSessionTimers()
        } else {
          // Admin verify failed - check if user logged in via Google OAuth
          try {
            const userRes = await fetch('/api/auth/me')
            if (userRes.ok) {
              const userData = await userRes.json()
              // Check if this user is actually an admin (logged in via Google OAuth)
              if (userData.user && (userData.user.email === 'dolamaanha@gmail.com' || userData.user.isAdmin)) {
                // Google OAuth admin - create admin session automatically
                try {
                  const createAdminRes = await fetch('/api/admin/create-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                  })
                  if (createAdminRes.ok) {
                    const adminData = await createAdminRes.json()
                    setAdmin({ ...adminData.admin, emailVerified: true })
                    setIsLoggedIn(true)
                    startSessionTimers()
                    return
                  }
                } catch {
                  // Failed to create admin session, fall through
                }
              }
              // Regular user - show Access Denied
              setAccessDenied(true)
            }
          } catch {
            // Not logged in at all - show login form
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setVerifying(false)
      }
    }
    verifySession()
  }, [startSessionTimers])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  const handleLogin = (adminUser: AdminUser) => {
    setAdmin(adminUser)
    setIsLoggedIn(true)
    setAccessDenied(false)
    startSessionTimers()
  }

  // Show loading spinner while verifying session
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="size-8 animate-spin text-stone-400" />
      </div>
    )
  }

  // Show Access Denied for regular users trying to access admin
  if (accessDenied) {
    return <AccessDeniedView />
  }

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />
  }

  const tabs: Array<{ id: TabType; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'products', label: 'পণ্য', icon: ShoppingBag },
    { id: 'orders', label: 'অর্ডার', icon: Package },
    { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell },
    { id: 'content', label: 'কন্টেন্ট', icon: FileText },
    { id: 'payment', label: 'পেমেন্ট', icon: CreditCard },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-stone-900 flex items-center justify-center">
              <span className="text-white font-black text-sm">স্ব</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-900 leading-none">স্বপ্ন পূরণ</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-[10px] text-stone-500 leading-none">অ্যাডমিন প্যানেল</p>
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[8px] px-1 py-0 gap-0.5 leading-none h-4">
                    <CheckCircle className="size-2.5" />
                    ভেরিফাইড
                  </Badge>
                </motion.span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-stone-100 flex items-center justify-center">
              <span className="text-stone-600 font-semibold text-xs">
                {admin?.name.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentTab === 'dashboard' && (
              <DashboardTab />
            )}
            {currentTab === 'products' && (
              <ProductsTab />
            )}
            {currentTab === 'orders' && (
              <OrdersTab />
            )}
            {currentTab === 'notifications' && (
              <NotificationsTab unreadCount={unreadCount} onUnreadChange={setUnreadCount} />
            )}
            {currentTab === 'content' && (
              <ContentTab onToast={(msg) => setToast(msg)} />
            )}
            {currentTab === 'payment' && (
              <PaymentTab onToast={(msg) => setToast(msg)} />
            )}
            {currentTab === 'settings' && admin && (
              <SettingsTab admin={admin} onLogout={handleLogout} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 transition-all ${
                  isActive
                    ? 'text-stone-900'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <div className="relative">
                  <tab.icon className={`size-5 transition-all ${isActive ? 'scale-110' : ''}`} />
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="tabIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-900"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
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
