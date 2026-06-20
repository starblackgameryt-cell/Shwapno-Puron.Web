'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, Mail, Lock, CheckCircle, MailCheck, Shield, Sparkles, Crown, Gem } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
}

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  }),
}

function LoginForm() {
  const searchParams = useSearchParams()
  const verifiedParam = searchParams.get('verified')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [notVerified, setNotVerified] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [adminRedirecting, setAdminRedirecting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Google OAuth error from URL params (NextAuth error format)
  const errorParam = searchParams.get('error')
  const googleError = (() => {
    switch (errorParam) {
      case 'AccessDenied':
      case 'access_denied':
        return 'Google অ্যাক্সেস অস্বীকৃত হয়েছে'
      case 'google_not_configured':
        return 'Google লগইন এখনো কনফিগার করা হয়নি। ইমেইল দিয়ে লগইন করুন।'
      case 'google_oauth_failed':
        return 'Google OAuth কনফিগার করা হয়নি'
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'AccountNotLinked':
        return 'Google লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
      case 'Callback':
        return 'Google কলব্যাকে সমস্যা হয়েছে'
      case 'OAuthAccountNotLinked':
        return 'এই ইমেইল অন্যভাবে নিবন্ধিত। ইমেইল/পাসওয়ার্ড দিয়ে লগইন করুন।'
      default:
        if (errorParam && !['google_access_denied', 'google_no_code', 'google_invalid_state', 'google_no_email', 'google_callback_error'].includes(errorParam)) {
          return 'Google লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
        }
        return null
    }
  })()

  const handleGoogleLogin = () => {
    setGoogleLoading(true)
    // Use NextAuth signIn for Google - full redirect flow
    // This redirects to Google → callback → /account (or /admin for admin users)
    signIn('google', { callbackUrl: '/account' })
  }

  // Verification status message from URL params
  const verificationMessage = (() => {
    switch (verifiedParam) {
      case 'success':
        return { type: 'success' as const, text: 'আপনার ইমেইল সফলভাবে ভেরিফাইড হয়েছে! এখন লগইন করুন।' }
      case 'already':
        return { type: 'info' as const, text: 'আপনার ইমেইল ইতিমধ্যে ভেরিফাইড আছে।' }
      case 'invalid':
        return { type: 'error' as const, text: 'ভেরিফিকেশন লিংকটি অবৈধ।' }
      case 'error':
        return { type: 'error' as const, text: 'ভেরিফিকেশনে সমস্যা হয়েছে।' }
      default:
        return null
    }
  })()

  // Auto-dismiss verification message after some time
  const [showVerificationMsg, setShowVerificationMsg] = useState(!!verificationMessage)
  useEffect(() => {
    if (verificationMessage) {
      const timer = setTimeout(() => setShowVerificationMsg(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [verificationMessage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('ইমেইল ও পাসওয়ার্ড দিন')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'লগইন করতে সমস্যা হয়েছে')
        return
      }

      // Check if this is an admin login - auto redirect to admin dashboard
      if (data.isAdmin) {
        setAdminRedirecting(true)
        setTimeout(() => {
          window.location.href = '/admin'
        }, 800)
        return
      }

      // Normal user - redirect to account page
      if (data.notVerified) {
        setNotVerified(true)
      }
      window.location.href = '/account'
    } catch {
      setError('নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-white to-stone-100 px-4 py-8 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-stone-200 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 2.5, ease: 'easeOut', delay: 0.3 }}
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-stone-300 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.04, y: 0 }}
          transition={{ duration: 3, ease: 'easeOut', delay: 0.5 }}
          className="absolute top-20 left-20"
        >
          <Crown className="size-16 text-stone-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.04, y: 0 }}
          transition={{ duration: 3, ease: 'easeOut', delay: 0.8 }}
          className="absolute bottom-32 right-16"
        >
          <Gem className="size-14 text-stone-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.03, y: 0 }}
          transition={{ duration: 3, ease: 'easeOut', delay: 1.1 }}
          className="absolute top-1/3 right-1/4"
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
        <motion.div variants={itemVariants} custom={0}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-700 text-sm mb-8 transition-colors group"
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
              initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center mb-8"
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
              <p className="text-stone-400 text-sm mt-1.5">আপনার অ্যাকাউন্টে লগইন করুন</p>
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

            {/* Admin Redirect Overlay */}
            <AnimatePresence>
              {adminRedirecting && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mb-5 bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 rounded-2xl px-4 py-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2"
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </motion.div>
                  <p className="text-sm font-bold text-emerald-800">অ্যাডমিন হিসেবে লগইন হয়েছে!</p>
                  <p className="text-xs text-emerald-600 mt-1">ড্যাশবোর্ডে রিডাইরেক্ট হচ্ছে...</p>
                  <div className="mt-2">
                    <Loader2 className="size-4 animate-spin text-emerald-600 mx-auto" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verification Status Message */}
            <AnimatePresence mode="wait">
              {verificationMessage && showVerificationMsg && (
                <motion.div
                  key={`verify-${verifiedParam}`}
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                  className={[
                    'flex items-center gap-2 backdrop-blur-sm border rounded-2xl px-4 py-3 text-sm mb-5',
                    verificationMessage.type === 'success'
                      ? 'bg-emerald-50/80 border-emerald-100 text-emerald-600'
                      : verificationMessage.type === 'info'
                        ? 'bg-sky-50/80 border-sky-100 text-sky-600'
                        : 'bg-red-50/80 border-red-100 text-red-600',
                  ].join(' ')}
                >
                  {verificationMessage.type === 'success' ? (
                    <CheckCircle className="size-4 shrink-0" />
                  ) : verificationMessage.type === 'info' ? (
                    <MailCheck className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  {verificationMessage.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Unverified User Warning Banner */}
            <AnimatePresence mode="wait">
              {notVerified && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                  className="bg-amber-50/80 backdrop-blur-sm border border-amber-100 text-amber-700 rounded-2xl px-4 py-3 text-sm mb-5"
                >
                  <div className="flex items-start gap-2">
                    <MailCheck className="size-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">আপনার ইমেইল ভেরিফাইড নয়</p>
                      <p className="text-amber-600 mt-0.5 text-xs">কিছু ফিচার সীমিত থাকতে পারে।</p>
                      <button
                        type="button"
                        onClick={async () => {
                          if (resendLoading || !email) return
                          setResendLoading(true)
                          setResendSuccess(false)
                          try {
                            const res = await fetch('/api/auth/verify-email', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email }),
                            })
                            if (res.ok) {
                              setResendSuccess(true)
                            }
                          } catch {
                            // silently fail
                          } finally {
                            setResendLoading(false)
                          }
                        }}
                        disabled={resendLoading || !email}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors disabled:opacity-50"
                      >
                        {resendLoading ? (
                          <>
                            <Loader2 className="size-3 animate-spin" />
                            পাঠানো হচ্ছে...
                          </>
                        ) : resendSuccess ? (
                          <>
                            <CheckCircle className="size-3" />
                            ভেরিফিকেশন ইমেইল পাঠানো হয়েছে
                          </>
                        ) : (
                          <>
                            <Mail className="size-3" />
                            ভেরিফিকেশন ইমেইল আবার পাঠান
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Error Display */}
            <AnimatePresence mode="wait">
              {googleError && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm mb-5"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  {googleError}
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Google Login Button - Premium Design */}
            <motion.div variants={fadeUp} custom={0} className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading || adminRedirecting}
                className="w-full h-12 rounded-xl bg-white border-2 border-stone-200/80 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50 text-stone-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {googleLoading ? (
                  <Loader2 className="size-5 animate-spin text-stone-500" />
                ) : (
                  <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span className="relative z-10">
                  {googleLoading
                      ? 'Google-এ রিডাইরেক্ট হচ্ছে...'
                      : 'Google দিয়ে লগইন করুন'
                  }
                </span>
              </button>

            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeUp} custom={1} className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-stone-200/60" />
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">অথবা ইমেইল দিয়ে</span>
              <div className="flex-1 h-px bg-stone-200/60" />
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <motion.div variants={fadeUp} custom={0} className="space-y-2">
                <Label htmlFor="email" className="text-stone-600 text-xs font-semibold tracking-wide uppercase">
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
                    className="h-12 rounded-xl border-stone-200/80 bg-white/60 backdrop-blur-sm pl-10 pr-4 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50 transition-all duration-300"
                    disabled={loading || adminRedirecting}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={fadeUp} custom={1} className="space-y-2">
                <Label htmlFor="password" className="text-stone-600 text-xs font-semibold tracking-wide uppercase">
                  পাসওয়ার্ড
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="আপনার পাসওয়ার্ড দিন"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-stone-200/80 bg-white/60 backdrop-blur-sm pl-10 pr-11 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50 transition-all duration-300"
                    disabled={loading || adminRedirecting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Forgot Password Link */}
              <motion.div variants={fadeUp} custom={2} className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-stone-400 hover:text-stone-700 transition-colors font-medium"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={fadeUp} custom={3}>
                <Button
                  type="submit"
                  disabled={loading || adminRedirecting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-700 hover:to-stone-800 text-white font-semibold text-base shadow-lg shadow-stone-300/40 transition-all duration-300 active:scale-[0.98]"
                >
                  <AnimatePresence mode="wait">
                    {adminRedirecting ? (
                      <motion.div
                        key="admin-redirect"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Shield className="size-4" />
                        অ্যাডমিন ড্যাশবোর্ডে যাচ্ছেন...
                      </motion.div>
                    ) : loading ? (
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
                        লগইন করুন
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="flex items-center gap-3 my-6"
            >
              <div className="flex-1 h-px bg-stone-200/60" />
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">অথবা</span>
              <div className="flex-1 h-px bg-stone-200/60" />
            </motion.div>

            {/* Admin Login Hint */}
            <motion.div
              variants={fadeUp}
              custom={5}
              className="text-center"
            >
              <p className="text-xs text-stone-400">
                অ্যাডমিন? এখানে লগইন করলে স্বয়ংক্রিয়ভাবে ড্যাশবোর্ডে যাবেন
              </p>
            </motion.div>

            {/* Signup Link */}
            <motion.div
              variants={fadeUp}
              custom={6}
              className="mt-4 text-center"
            >
              <p className="text-sm text-stone-400">
                নতুন অ্যাকাউন্ট নেই?{' '}
                <Link href="/signup" className="text-stone-900 font-semibold hover:underline transition-all">
                  সাইনআপ করুন
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
