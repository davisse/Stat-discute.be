'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { NavigationCard } from './NavigationCard'
import { sectionData, containerVariants } from './data'
import type { CardData } from './types'

// ============================================================================
// NavigationSection Component (Cinematic Section with Title)
// ============================================================================

export function NavigationSection({
  sectionKey,
  cards,
  isFirst = false
}: {
  sectionKey: 'equipes' | 'joueurs' | 'betting'
  cards: CardData[]
  isFirst?: boolean
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })
  const section = sectionData[sectionKey]

  return (
    <section
      ref={sectionRef}
      id={sectionKey}
      className={`relative px-4 sm:px-8 lg:px-16 ${isFirst ? 'pt-8 pb-16' : 'py-16'}`}
    >
      {/* Dot pattern background - alternating */}
      {(sectionKey === 'equipes' || sectionKey === 'betting') && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Cinematic Section Header */}
        <div className="mb-10">
          {/* Section Number with Line */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 mb-6"
          >
            <span className={`text-sm font-bold tracking-widest ${section.accentColor}`}>
              {section.number}
            </span>
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: 48 } : { width: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`h-px ${section.accentColor.replace('text-', 'bg-')}`}
            />
          </motion.div>

          {/* Massive Title */}
          <div className="overflow-hidden mb-4">
            <motion.h2
              initial={{ y: '100%' }}
              animate={isInView ? { y: 0 } : { y: '100%' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-[clamp(2.5rem,8vw,5rem)] font-black uppercase tracking-tighter leading-[0.9] text-white"
            >
              {section.title}
            </motion.h2>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-zinc-400 max-w-xl"
          >
            {section.subtitle}
          </motion.p>
        </div>

        {/* Cards Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {cards.map((card) => (
            <NavigationCard key={card.id} card={card} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
