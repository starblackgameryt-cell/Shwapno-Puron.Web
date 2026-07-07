'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, Mail, Lock, User, Check, Crown, Gem, Sparkles, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.07, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = () => {
    setGoogleLoading(true)
    signIn('google', { callbackUrl: '/account' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('সব তথ্য পূরণ করুন')
      return
    }

    if (name.trim().length < 2) {
      setError('নাম কমপক্ষে ২ অক্ষরের হতে হবে')
      return
    }

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
      return
    }

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড দুটি মিলছে না')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে')
        return
      }

      window.location.href = '/account'
    } catch {
      setError('নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' }
    if (password.length < 6) return { level: 1, label: 'দুর্বল', color: 'bg-red-400' }
    if (password.length < 8) return { level: 2, label: 'মাঝারি', color: 'bg-amber-400' }
    if (password.length < 10) return { level: 3, label: 'ভালো', color: 'bg-emerald-400' }
    return { level: 4, label: 'শক্তিশালী', color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-white to-stone-100 px-4 py-8 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-stone-200 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 2.5, ease: 'easeOut', delay: 0.3 }}
          className="absolute -bottom-32 -right-32 w-80 h-80 bg-stone-300 rounded-full blur-3xl"
        />
        {/* Floating fashion-themed decorative elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.04, y: 0 }}
          transition={{ duration: 3, ease: 'easeOut', delay: 0.5 }}
          className="absolute top-16 right-20"
        >
          <Gem className="size-16 text-stone-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.04, y: 0 }}
          transition={{ duration: 3, ease: 'easeOut', delay: 0.8 }}
          className="absolute bottom-24 left-16"
        >
          <Crown className="size-14 text-stone-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.03, y: 0 }}
          transition={{ duration: 3, ease: 'easeOut', delay: 1.1 }}
          className="absolute top-1/2 left-1/4"
        >
          <Sparkles className="size-12 text-stone-400" />
        </motion.div>
      </div>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Back to home */}
        <motion.div variants={fadeUp} custom={0}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-brand-charcoal/60 hover:text-stone-700 text-sm mb-8 transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            হোমে ফিরে যান
          </Link>
        </motion.div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-stone-200/40 rounded-3xl overflow-hidden">
          <div className="px-7 pt-8 pb-7">
            {/* Brand Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center mb-7"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center mb-4 shadow-lg shadow-stone-300/50 relative">
                <span className="text-white text-2xl font-black">স্ব</span>
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
              <p className="text-stone-400 text-sm mt-1.5">নতুন অ্যাকাউন্ট তৈরি করুন</p>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full"
              >
                <Gem className="w-3 h-3 text-amber-600" />
                <span className="text-[10px] font-semibold text-amber-700 tracking-wide">ফ্যাশন অ্যাকাউন্ট</span>
              </motion.div>
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

            {/* Google Login Button */}
            <motion.div variants={fadeUp} custom={0}>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full h-12 rounded-xl bg-white border border-[#C9A961]/30/80 hover:border-[#C9A961]/40 hover:shadow-md text-stone-700 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Loader2 className="size-5 animate-spin text-stone-400" />
                ) : (
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span>{googleLoading ? 'Google-এ যাচ্ছে...' : 'Google দিয়ে সাইনআপ করুন'}</span>
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeUp} custom={1} className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-stone-200/60" />
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">অথবা ইমেইল দিয়ে</span>
              <div className="flex-1 h-px bg-stone-200/60" />
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <motion.div variants={fadeUp} custom={1} className="space-y-2">
                <Label htmlFor="name" className="text-brand-charcoal/70 text-xs font-semibold tracking-wide uppercase">
                  আপনার নাম
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="আপনার পুরো নাম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                    className="h-12 rounded-xl border-[#C9A961]/30/80 bg-white/60 backdrop-blur-sm pl-10 pr-4 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50 transition-all duration-300"
                    disabled={loading}
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={fadeUp} custom={2} className="space-y-2">
                <Label htmlFor="email" className="text-brand-charcoal/70 text-xs font-semibold tracking-wide uppercase">
                  Gmail ঠিকানা
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    className="h-12 rounded-xl border-[#C9A961]/30/80 bg-white/60 backdrop-blur-sm pl-10 pr-4 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50 transition-all duration-300"
                    disabled={loading}
                  />
                </div>
                <p className="text-[10px] text-stone-400 pl-1">শুধুমাত্র সঠিক Gmail ঠিকানা গ্রহণযোগ্য</p>
              </motion.div>

              {/* Password */}
              <motion.div variants={fadeUp} custom={3} className="space-y-2">
                <Label htmlFor="password" className="text-brand-charcoal/70 text-xs font-semibold tracking-wide uppercase">
                  পাসওয়ার্ড
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="আপনার মনের পাসওয়ার্ড দিন"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-[#C9A961]/30/80 bg-white/60 backdrop-blur-sm pl-10 pr-11 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50 transition-all duration-300"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-charcoal/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1.5 pt-1"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <motion.div
                          key={level}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: strength.level >= level ? 1 : 0 }}
                          transition={{ duration: 0.3, delay: level * 0.05 }}
                          className={`h-1 flex-1 rounded-full origin-left ${
                            strength.level >= level ? strength.color : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-stone-400">
                      পাসওয়ার্ড শক্তি: <span className="font-medium">{strength.label}</span>
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={fadeUp} custom={4} className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-brand-charcoal/70 text-xs font-semibold tracking-wide uppercase">
                  পাসওয়ার্ড নিশ্চিত করুন
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="পুনরায় পাসওয়ার্ড দিন"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-[#C9A961]/30/80 bg-white/60 backdrop-blur-sm pl-10 pr-11 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50 transition-all duration-300"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-charcoal/70 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {/* Password match indicator */}
                {confirmPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 pt-0.5"
                  >
                    {password === confirmPassword ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span className="text-[11px] text-emerald-600 font-medium">পাসওয়ার্ড মিলেছে</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-3 text-red-400" />
                        <span className="text-[11px] text-red-500 font-medium">পাসওয়ার্ড মিলছে না</span>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Terms note */}
              <motion.div variants={fadeUp} custom={5} className="text-center">
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  সাইনআপ করে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন
                </p>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={fadeUp} custom={6} className="pt-1">
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
                        অ্যাকাউন্ট তৈরি হচ্ছে...
                      </motion.div>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        অ্যাকাউন্ট তৈরি করুন
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>

            {/* Login Link */}
            <motion.div
              variants={fadeUp}
              custom={7}
              className="mt-7 text-center"
            >
              <p className="text-sm text-stone-400">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <Link href="/login" className="text-stone-900 font-semibold hover:underline transition-all">
                  লগইন করুন
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
