'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Menu, X, ArrowLeft, User, Heart } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'

interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  avatar?: string
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const { currentView, goHome, toggleList, list } = useStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Check auth state on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }
    checkAuth()
  }, [])

  const listCount = list.reduce((sum, item) => sum + item.quantity, 0)

  const handleUserClick = () => {
    if (user) {
      window.location.href = '/account'
    } else {
      window.location.href = '/login'
    }
  }

  const handleFavoritesClick = () => {
    if (user) {
      window.location.href = '/account'
    } else {
      window.location.href = '/login'
    }
  }

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : null

  const navLinks = [
    { href: '#collection', label: 'কালেকশন' },
    { href: '#about', label: 'আমাদের সম্পর্কে' },
    { href: '#brand', label: 'ব্র্যান্ড' },
    { href: '#shop', label: 'শপ' },
  ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-stone-100' : 'bg-white'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Left: Hamburger + Desktop Nav */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-stone-50 rounded-lg transition-colors"
              aria-label="মেনু"
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </button>
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.slice(0, 3).map((link) => (
                <a key={link.href} href={link.href} className="text-[11px] tracking-[0.2em] uppercase text-stone-600 hover:text-stone-900 transition-colors font-medium">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Center: Brand */}
          <button onClick={goHome} className="absolute left-1/2 -translate-x-1/2 text-center">
            <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-stone-900">স্বপ্ন পূরণ</span>
            <span className="block text-[7px] sm:text-[8px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-stone-400">Shwapno Puron</span>
          </button>

          {/* Right: Nav + Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden lg:flex items-center gap-8">
              <a href="#shop" className="text-[11px] tracking-[0.2em] uppercase text-stone-600 hover:text-stone-900 transition-colors font-medium">শপ</a>
            </div>
            {currentView === 'product' && (
              <Button variant="ghost" size="sm" onClick={goHome} className="hidden sm:flex items-center gap-2 text-stone-600 hover:text-stone-900 text-[11px] tracking-[0.2em] uppercase">
                <ArrowLeft className="w-4 h-4" />
                ফিরে যান
              </Button>
            )}
            {/* Heart - hidden on mobile, shown in dropdown */}
            <button onClick={handleFavoritesClick} className="hidden sm:block relative p-2 hover:bg-stone-50 transition-colors" aria-label="পছন্দ">
              <Heart className="w-5 h-5 text-stone-700" />
            </button>
            {/* User - hidden on mobile, shown in dropdown */}
            <button onClick={handleUserClick} className="hidden sm:block relative p-2 hover:bg-stone-50 transition-colors" aria-label="অ্যাকাউন্ট">
              {user && firstLetter ? (
                user.avatar ? (
                  <span className="relative w-6 h-6 rounded-full overflow-hidden border border-stone-200">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {user.emailVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                    )}
                  </span>
                ) : (
                  <span className="relative w-5 h-5 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {firstLetter}
                    {user.emailVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                    )}
                  </span>
                )
              ) : (
                <User className="w-5 h-5 text-stone-700" />
              )}
            </button>
            {/* List / Cart button - always visible */}
            <button onClick={toggleList} className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-stone-50 rounded-lg transition-colors" aria-label="তালিকা">
              <ClipboardList className="w-5 h-5 text-stone-700" />
              {listCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {listCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            {/* Slide-in menu from left */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-[280px] sm:w-[320px] bg-white z-[70] shadow-2xl flex flex-col lg:hidden"
              style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Menu header */}
              <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-lg sm:text-xl font-black tracking-tight text-stone-900">স্বপ্ন পূরণ</span>
                  <span className="block text-[7px] sm:text-[8px] tracking-[0.3em] uppercase text-stone-400 mt-0.5">Shwapno Puron</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="মেনু বন্ধ">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>
              {/* Menu links */}
              <nav className="flex-1 p-3 sm:p-4 space-y-0.5 overflow-y-auto overscroll-none">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 min-h-[48px] px-4 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                {currentView === 'product' && (
                  <button
                    onClick={() => { goHome(); setMobileMenuOpen(false) }}
                    className="flex items-center gap-3 min-h-[48px] px-4 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 rounded-lg transition-colors w-full"
                  >
                    <ArrowLeft className="w-4 h-4" /> শপে ফিরে যান
                  </button>
                )}
                <div className="border-t border-stone-100 my-2" />
                <button
                  onClick={() => { handleFavoritesClick(); setMobileMenuOpen(false) }}
                  className="flex items-center gap-3 min-h-[48px] px-4 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 rounded-lg transition-colors w-full"
                >
                  <Heart className="w-4 h-4" /> পছন্দ
                </button>
                <button
                  onClick={() => { handleUserClick(); setMobileMenuOpen(false) }}
                  className="flex items-center gap-3 min-h-[48px] px-4 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 rounded-lg transition-colors w-full"
                >
                  {user && firstLetter ? (
                    user.avatar ? (
                      <span className="relative w-5 h-5 rounded-full overflow-hidden border border-stone-200 flex-shrink-0">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 bg-stone-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {firstLetter}
                      </span>
                    )
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {user ? 'অ্যাকাউন্ট' : 'লগইন'}
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
