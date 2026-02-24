'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

// ============================================================================
// Hero Section Component - Elegant Fade
// ============================================================================

export function HeroSection() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollIndicator(window.scrollY <= 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const showButtons = !isLoading

  return (
    <section className="h-screen flex flex-col items-center justify-center relative px-4 sm:px-8">

      {/* Logo - Large, Simple Fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="mb-8"
      >
        <Image
          src="/logo-v5.png"
          alt="STAT-DISCUTE - Analyse NBA Data-Driven"
          width={1200}
          height={300}
          priority
          className="w-[40vw] sm:w-[35vw] md:w-[30vw] lg:w-[28vw] max-w-[400px] h-auto"
        />
      </motion.div>

      {/* Tagline - Subtle Fade */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
        className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-zinc-400 text-center font-light tracking-wide mb-10"
      >
        L'analyse NBA data-driven
      </motion.p>

      {/* Action Buttons - Gentle Fade */}
      <AnimatePresence>
        {showButtons && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.6, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/login"
              className="
                px-8 py-3
                border border-zinc-700 rounded-lg
                bg-transparent text-white
                text-sm font-medium uppercase tracking-wider
                transition-all duration-200
                hover:border-zinc-500 hover:bg-white/5
                min-w-[160px] text-center
              "
            >
              Se connecter
            </Link>

            <Link
              href="/signup"
              className="
                px-8 py-3
                rounded-lg
                bg-white text-black
                text-sm font-semibold uppercase tracking-wider
                transition-all duration-200
                hover:bg-zinc-200
                min-w-[160px] text-center
              "
            >
              S'inscrire
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* La Une Button */}
      <AnimatePresence>
        {showButtons && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.6, ease: 'easeOut' }}
          >
            <Link
              href="/la-une"
              className="
                px-8 py-3
                rounded-lg
                bg-white text-black
                text-sm font-semibold uppercase tracking-wider
                transition-all duration-200
                hover:bg-zinc-200
              "
            >
              Accéder à La Une
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Indicator */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showScrollIndicator ? 0.5 : 0 }}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs uppercase tracking-widest text-zinc-600">
              Scroll
            </span>
            <svg
              className="w-4 h-4 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
