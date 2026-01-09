'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Users, Calendar, Search, BarChart3, TrendingUp, LineChart } from 'lucide-react'
import { PageTransitionProvider, usePageTransition } from '@/components/transitions'

// ============================================================================
// Types
// ============================================================================

interface NavLinkProps {
  href: string
  label: string
  badge?: string
  badgeColor?: string
}

// ============================================================================
// Card Types and Data
// ============================================================================

interface CardData {
  id: string
  section: 'equipes' | 'joueurs' | 'betting'
  number: string
  category: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  features: string[]
  badge?: string
  badgeColor?: string
}

const sectionColors = {
  equipes: {
    badge: 'bg-emerald-500/20 text-emerald-400',
    icon: 'text-emerald-500',
    hover: 'hover:border-emerald-500/50'
  },
  joueurs: {
    badge: 'bg-blue-500/20 text-blue-400',
    icon: 'text-blue-500',
    hover: 'hover:border-blue-500/50'
  },
  betting: {
    badge: 'bg-amber-500/20 text-amber-400',
    icon: 'text-amber-500',
    hover: 'hover:border-amber-500/50'
  }
} as const

const navigationCards: CardData[] = [
  // Column 1 - Équipes
  {
    id: 'teams',
    section: 'equipes',
    number: '01',
    category: 'ÉQUIPES',
    href: '/teams',
    icon: Users,
    title: 'Équipes',
    features: ['Standings', 'Stats off/def', 'DvP analysis']
  },
  {
    id: 'games',
    section: 'equipes',
    number: '01',
    category: 'ÉQUIPES',
    href: '/games',
    icon: Calendar,
    title: 'Matchs du Jour',
    features: ['Schedule', 'Live scores', "Today's games"]
  },
  // Column 2 - Joueurs
  {
    id: 'players',
    section: 'joueurs',
    number: '02',
    category: 'JOUEURS',
    href: '/players',
    icon: Search,
    title: 'Recherche Joueur',
    features: ['Autocomplete', 'Stats avancées', 'Player detail']
  },
  // Column 3 - Betting & Analyse
  {
    id: 'totals',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/totals',
    icon: BarChart3,
    title: 'Totals O/U',
    features: ['Over/Under', 'Props analysis', 'Trends'],
    badge: 'MC',
    badgeColor: 'bg-emerald-600'
  },
  {
    id: 'value',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/value-finder',
    icon: TrendingUp,
    title: 'Value Finder',
    features: ['Best odds', 'Upside value', 'Edge finder']
  },
  {
    id: 'analysis',
    section: 'betting',
    number: '03',
    category: 'ANALYSE',
    href: '/analysis/q1-value',
    icon: LineChart,
    title: 'Analyse Q1',
    features: ['Q1 patterns', 'Dispersion', 'Pace analysis']
  }
]

// ============================================================================
// NavLink Component
// ============================================================================

function NavLink({ href, label, badge, badgeColor = 'bg-red-500' }: NavLinkProps) {
  const linkRef = useRef<HTMLDivElement>(null)
  const { startTransition } = usePageTransition()

  const handleClick = () => {
    if (linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect()
      startTransition(rect, href, 'rgb(24, 24, 27)')
    }
  }

  return (
    <div
      ref={linkRef}
      onClick={handleClick}
      className="group relative px-6 py-4 border border-zinc-700 rounded-lg cursor-pointer
                 transition-all duration-300 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
    >
      {badge && (
        <span className={`absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeColor} text-white`}>
          {badge}
        </span>
      )}
      <span className="text-sm font-medium uppercase tracking-wider text-white group-hover:text-white transition-colors">
        {label}
      </span>
      <span className="ml-2 text-zinc-500 group-hover:text-white transition-colors">→</span>
    </div>
  )
}

// ============================================================================
// Sticky Section Title Item
// ============================================================================

interface StickyTitleItem {
  id: string
  number: string
  title: string
}

const stickyNavItems: StickyTitleItem[] = [
  { id: 'equipes', number: '01', title: 'ÉQUIPES' },
  { id: 'joueurs', number: '02', title: 'JOUEURS' },
  { id: 'betting', number: '03', title: 'BETTING' },
]

// ============================================================================
// Fixed Navigation Component
// ============================================================================

function FixedNav() {
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

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
}

// ============================================================================
// NavigationCard Component
// ============================================================================

function NavigationCard({ card }: { card: CardData }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { startTransition } = usePageTransition()
  const colors = sectionColors[card.section]

  const handleClick = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      startTransition(rect, card.href, 'rgb(24, 24, 27)')
    }
  }

  const Icon = card.icon

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onClick={handleClick}
      className={`
        group relative p-6 min-h-[180px]
        bg-zinc-900/50 border border-zinc-800 rounded-xl
        cursor-pointer transition-all duration-300
        hover:border-white hover:bg-zinc-900/70
        ${colors.hover}
      `}
    >
      {/* Badge */}
      {card.badge && (
        <span className={`absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${card.badgeColor} text-white`}>
          {card.badge}
        </span>
      )}

      {/* Section Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${colors.badge}`}>
          {card.number} {card.category}
        </span>
      </div>

      {/* Icon */}
      <Icon className={`w-6 h-6 mb-3 ${colors.icon}`} />

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>

      {/* Separator */}
      <div className="w-full h-px bg-zinc-800 mb-3" />

      {/* Features */}
      <ul className="space-y-1">
        {card.features.map((feature, index) => (
          <li key={index} className="text-sm text-zinc-400 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Arrow */}
      <span className="absolute bottom-6 right-6 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
        →
      </span>
    </motion.div>
  )
}

// ============================================================================
// Section Data for Cinematic Headers
// ============================================================================

const sectionData = {
  equipes: {
    number: '01',
    title: 'ÉQUIPES',
    subtitle: 'Standings, statistiques et performances des 30 franchises NBA',
    accentColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/30',
  },
  joueurs: {
    number: '02',
    title: 'JOUEURS',
    subtitle: 'Statistiques individuelles et métriques avancées',
    accentColor: 'text-blue-500',
    borderColor: 'border-blue-500/30',
  },
  betting: {
    number: '03',
    title: 'BETTING',
    subtitle: 'Intelligence betting, value finder et analyses Q1',
    accentColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
  },
} as const

// ============================================================================
// NavigationSection Component (Cinematic Section with Title)
// ============================================================================

function NavigationSection({
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

// ============================================================================
// NavigationGrid Component (Orchestrates 3 Sections)
// ============================================================================

function NavigationGrid() {
  const equipesCards = navigationCards.filter(c => c.section === 'equipes')
  const joueursCards = navigationCards.filter(c => c.section === 'joueurs')
  const bettingCards = navigationCards.filter(c => c.section === 'betting')

  return (
    <div id="navigation">
      <NavigationSection sectionKey="equipes" cards={equipesCards} isFirst />
      <NavigationSection sectionKey="joueurs" cards={joueursCards} />
      <NavigationSection sectionKey="betting" cards={bettingCards} />
    </div>
  )
}

// ============================================================================
// Hero Section Component
// ============================================================================

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={heroRef}
      className="h-[70vh] flex flex-col items-center justify-center relative px-8"
    >
      {/* Logo - More prominent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="mb-6"
      >
        <Image
          src="/logo-v5.png"
          alt="Stat Discute"
          width={600}
          height={150}
          priority
          className="w-80 md:w-[28rem] lg:w-[32rem]"
        />
      </motion.div>

      {/* Tagline - More prominent */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-2xl md:text-3xl lg:text-4xl text-zinc-300 text-center font-light tracking-wide"
      >
        L'analyse NBA data-driven
      </motion.p>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollIndicator ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest text-zinc-600">Scroll</span>
          <svg
            className="w-6 h-6 text-zinc-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ============================================================================
// Footer Section Component
// ============================================================================

function FooterSection() {
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
          alt="Stat Discute"
          width={200}
          height={50}
          className="w-40 mx-auto mb-6 opacity-60"
        />
        <p className="text-zinc-600 text-sm mb-4">Saison 2025-26</p>
        <div className="w-16 h-0.5 bg-zinc-800 mx-auto mb-4" />
        <p className="text-zinc-500 text-sm">Data-driven NBA analytics</p>
      </motion.div>
    </section>
  )
}

// ============================================================================
// Main Home Content
// ============================================================================

function HomeContent() {
  return (
    <div className="bg-black min-h-screen">
      {/* Fixed Navigation */}
      <FixedNav />

      {/* Hero Section */}
      <HeroSection />

      {/* Navigation Grid */}
      <NavigationGrid />

      {/* Footer */}
      <FooterSection />
    </div>
  )
}

// ============================================================================
// Export
// ============================================================================

export default function HomePage() {
  return (
    <PageTransitionProvider>
      <HomeContent />
    </PageTransitionProvider>
  )
}
