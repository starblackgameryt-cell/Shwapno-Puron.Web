'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2, ArrowLeft, Mail, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetUrl, setResetUrl] = useState('')
  const [gmailUrl, setGmailUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('ইমেইল ঠিকানা দিন')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে')
        return
      }

      if (data.resetUrl) {
        setResetUrl(data.resetUrl)
        setGmailUrl(data.gmailUrl || '')
      }
      setSuccess(true)
    } catch {
      setError('নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resetUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = resetUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Back to login */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-700 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          লগইন পেজে ফিরে যান
        </Link>

        <Card className="bg-white/80 backdrop-blur-xl border-stone-200/60 shadow-lg rounded-2xl">
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
              <h1 className="text-xl font-bold text-stone-900">পাসওয়ার্ড পুনরুদ্ধার</h1>
              <p className="text-stone-500 text-sm mt-1 text-center">আপনার ইমেইল দিন, আমরা রিসেট লিংক পাঠাবো</p>
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
                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="space-y-1.5"
                    >
                      <Label htmlFor="email" className="text-stone-700 text-sm font-medium">ইমেইল</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="off"
                          className="h-12 rounded-xl border-stone-200 bg-white/60 pl-10 pr-4 text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-stone-200/50"
                          disabled={loading}
                        />
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
                        className="w-full h-12 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-base shadow-md transition-all active:scale-[0.98]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            প্রসেসিং...
                          </>
                        ) : (
                          'রিসেট লিংক পাঠান'
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
                  className="space-y-4"
                >
                  {/* Success Icon */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-3">
                      <CheckCircle className="size-7 text-green-600" />
                    </div>
                    <h2 className="text-lg font-bold text-stone-900">রিসেট লিংক প্রস্তুত!</h2>
                    <p className="text-stone-500 text-sm mt-1 text-center">
                      নিচের লিংক দিয়ে আপনার পাসওয়ার্ড রিসেট করুন
                    </p>
                  </div>

                  {/* Reset URL Display */}
                  {resetUrl && (
                    <div className="space-y-2">
                      <Label className="text-stone-700 text-sm font-medium">রিসেট লিংক</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={resetUrl}
                          className="h-11 rounded-xl border-stone-200 bg-white/60 text-stone-700 text-sm font-mono"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCopy}
                          className="h-11 px-3 rounded-xl border-stone-200 hover:bg-stone-100 shrink-0"
                        >
                          <Copy className="size-4 text-stone-600" />
                        </Button>
                      </div>
                      {copied && (
                        <p className="text-green-600 text-xs">কপি হয়েছে!</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2.5">
                    {gmailUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.open(gmailUrl, '_blank')}
                        className="w-full h-11 rounded-xl border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-all"
                      >
                        <ExternalLink className="size-4 mr-1.5" />
                        Gmail এ পাঠান
                      </Button>
                    )}
                    {resetUrl && (
                      <Button
                        type="button"
                        onClick={() => window.location.href = resetUrl}
                        className="w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-md transition-all active:scale-[0.98]"
                      >
                        রিসেট করুন
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Link */}
            {!success && (
              <div className="mt-5 text-center">
                <p className="text-sm text-stone-500">
                  মনে পড়ে গেছে?{' '}
                  <Link href="/login" className="text-stone-900 font-medium hover:underline">
                    লগইন করুন
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
