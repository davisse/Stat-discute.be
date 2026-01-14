'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'

// ============================================================================
// Footer Section Component
// ============================================================================

export function FooterSection() {
  const footerRef = useRef<HTMLElement>(null)
  const isInView = useInView(footerRef, { once: true, amount: 0.5 })

  return (
    <section
      ref={footerRef}
      className="min-h-[50vh] flex flex-col items-center justify-center px-8 py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Image
          src="/logo-v5.png"
          alt="STAT-DISCUTE"
          width={200}
          height={50}
          loading="lazy"
          className="w-40 mx-auto mb-6 opacity-60"
        />
        <p className="text-zinc-600 text-sm mb-4">Saison 2025-26</p>
        <div className="w-16 h-0.5 bg-zinc-800 mx-auto mb-4" />
        <p className="text-zinc-500 text-sm">Data-driven NBA analytics</p>
      </motion.div>
    </section>
  )
}
