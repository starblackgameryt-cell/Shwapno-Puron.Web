'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2, Eye, EyeOff, Lock, CheckCircle, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-ivory px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <Card className="bg-white/80 backdrop-blur-xl border-[#C9A961]/30/60 shadow-lg rounded-2xl">
            <CardContent className="pt-6 pb-6 px-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-3">
                  <AlertCircle className="size-7 text-red-500" />
                </div>
                <h1 className="text-lg font-bold text-stone-900 mb-1">ত্রুটি</h1>
                <p className="text-brand-charcoal/60 text-sm mb-4">রিসেট টোকেন পাওয়া যায়নি</p>
                <Link href="/forgot-password">
                  <Button className="rounded-xl btn-lux font-medium shadow-md">
                    আবার চেষ্টা করুন
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('সব তথ্য পূরণ করুন')
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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে')
        return
      }

      setSuccess(true)
    } catch {
      setError('নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-ivory px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <Card className="bg-white/80 backdrop-blur-xl border-[#C9A961]/30/60 shadow-lg rounded-2xl">
          <CardContent className="pt-6 pb-6 px-6">
            {/* Brand Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col items-center mb-6"
            >
              <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center mb-3 shadow-md">
                <span className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-inter)' }}>স্ব</span>
              </div>
              <h1 className="text-xl font-bold text-stone-900">নতুন পাসওয়ার্ড সেট করুন</h1>
              <p className="text-brand-charcoal/60 text-sm mt-1">আপনার নতুন পাসওয়ার্ড দিন</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Error Display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-sm mb-4"
                    >
                      <AlertCircle className="size-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="space-y-1.5"
                    >
                      <Label htmlFor="password" className="text-stone-700 text-sm font-medium">নতুন পাসওয়ার্ড</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="ন্যূনতম ৬ অক্ষর"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 rounded-xl border-[#C9A961]/30 bg-white/60 pl-10 pr-11 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-charcoal/70 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirm New Password */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25, duration: 0.3 }}
                      className="space-y-1.5"
                    >
                      <Label htmlFor="confirmPassword" className="text-stone-700 text-sm font-medium">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="পুনরায় পাসওয়ার্ড দিন"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 rounded-xl border-[#C9A961]/30 bg-white/60 pl-10 pr-11 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-charcoal/70 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl btn-lux font-medium text-base shadow-md transition-all active:scale-[0.98]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            আপডেট হচ্ছে...
                          </>
                        ) : (
                          'পাসওয়ার্ড আপডেট করুন'
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-3">
                    <CheckCircle className="size-7 text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 mb-1">পাসওয়ার্ড আপডেট হয়েছে!</h2>
                  <p className="text-brand-charcoal/60 text-sm mb-5">
                    আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে
                  </p>
                  <Link href="/login" className="w-full">
                    <Button className="w-full h-12 rounded-xl btn-lux font-medium text-base shadow-md transition-all active:scale-[0.98]">
                      এখন লগইন করুন
                    </Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-ivory">
          <Loader2 className="size-6 animate-spin text-stone-400" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
