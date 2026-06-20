'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'

interface ScrollRevealProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-30px' })
  const controls = useAnimation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  const distance = isMobile ? 15 : 40

  const directionMap = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { y: 0, x: distance },
    right: { y: 0, x: -distance },
  }

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      style={{ willChange: 'transform, opacity' }}
      variants={{
        hidden: {
          opacity: 0,
          ...directionMap[direction],
        },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: {
            duration: isMobile ? duration * 0.6 : duration,
            delay: isMobile ? delay * 0.4 : delay,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface FloatingProps {
  children: ReactNode
  className?: string
  amplitude?: number
  duration?: number
}

export function Floating({ children, className = '', amplitude = 10, duration = 4 }: FloatingProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <motion.div
      className={className}
      animate={{
        y: [-(isMobile ? amplitude * 0.4 : amplitude), isMobile ? amplitude * 0.4 : amplitude, -(isMobile ? amplitude * 0.4 : amplitude)],
      }}
      transition={{
        duration: isMobile ? duration * 0.7 : duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: isMobile ? 8 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: isMobile ? 0.35 : 0.6,
        delay: isMobile ? delay * 0.4 : delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}
