'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { stickyNavItems } from './data'

// ============================================================================
// Fixed Navigation Component
// ============================================================================

export function FixedNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [passedHero, setPassedHero] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight

      // Check if we've passed the hero (when hero logo/slogan would be scrolled out)
      // Trigger earlier - at ~40% of viewport so header logo appears as hero disappears
      setPassedHero(scrollY > viewportHeight * 0.35)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* Fixed Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          passedHero ? 'bg-black/90 backdrop-blur-md border-b border-zinc-800/50' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-12">
          {/* Left side: Logo */}
          <div className="flex flex-col py-3">
            {/* Logo row - appears after passing hero */}
            <AnimatePresence>
              {passedHero && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="cursor-pointer h-10 flex items-center"
                  onClick={() => scrollToSection('hero')}
                >
                  <Image
                    src="/logo-v5.png"
                    alt="Stat Discute"
                    width={120}
                    height={30}
                    loading="eager"
                    className="h-7 w-auto"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 group self-start mt-3"
            aria-label="Menu"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-white transition-colors group-hover:bg-zinc-300"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-6 h-0.5 bg-white transition-colors group-hover:bg-zinc-300"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-white transition-colors group-hover:bg-zinc-300"
            />
          </button>
        </div>
      </motion.header>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-lg flex items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-8">
              {stickyNavItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => scrollToSection(item.id)}
                  className="text-3xl md:text-5xl font-bold text-white hover:text-zinc-400 transition-colors uppercase tracking-wider"
                >
                  {item.number} {item.title}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
