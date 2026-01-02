'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
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

interface SectionProps {
  id: string
  number?: string
  title: string | string[]
  description: string
  links: NavLinkProps[]
  className?: string
  showDots?: boolean
}

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
  { id: 'statistiques', number: '01', title: 'STATISTIQUES' },
  { id: 'props-joueurs', number: '02', title: 'PROPS JOUEURS' },
  { id: 'paris-sportifs', number: '03', title: 'PARIS SPORTIFS' },
  { id: 'analyse', number: '04', title: 'ANALYSE' },
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
// AnimatedSection Component
// ============================================================================

function AnimatedSection({ id, number, title, description, links, className = '', showDots = true }: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })

  // Parallax effect for the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3])

  const titleLines = Array.isArray(title) ? title : [title]

  // First section (statistiques) should have less top padding
  const isFirstSection = id === 'statistiques'

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 relative overflow-hidden ${
        isFirstSection ? 'pt-8 pb-20' : 'py-20'
      } ${className}`}
    >
      {/* Section-specific dots pattern (alternating) */}
      {showDots && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      )}

      <motion.div
        style={{ y, opacity }}
        className="max-w-7xl mx-auto w-full relative z-10"
      >
        {/* Section Number */}
        {number && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className="text-base font-medium text-zinc-500 tracking-widest">{number}</span>
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: 32 } : { width: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-0.5 bg-zinc-700 mt-2"
            />
          </motion.div>
        )}

        {/* Massive Title with stagger */}
        <div className="mb-8 overflow-hidden">
          {titleLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ y: '100%' }}
              animate={isInView ? { y: 0 } : { y: '100%' }}
              transition={{
                duration: 1,
                delay: 0.1 + index * 0.15,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <h2 className="text-[clamp(3rem,12vw,10rem)] font-black uppercase tracking-tighter leading-[0.9] text-white">
                {line}
              </h2>
            </motion.div>
          ))}
        </div>

        {/* Description with character reveal effect */}
        <motion.p
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl text-zinc-400 leading-relaxed max-w-2xl mb-12"
        >
          {description}
        </motion.p>

        {/* Navigation Links with stagger */}
        <div className="flex flex-wrap gap-4">
          {links.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
              transition={{
                duration: 0.5,
                delay: 0.6 + index * 0.08,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <NavLink {...link} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
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
// Section Data
// ============================================================================

const sections: SectionProps[] = [
  {
    id: 'statistiques',
    number: '01',
    title: 'STATISTIQUES',
    description: 'Explorez les performances individuelles et collectives. Analyse complète des joueurs, équipes, et matchs avec statistiques avancées et métriques de pace.',
    showDots: true,
    links: [
      { href: '/players', label: 'Joueurs' },
      { href: '/teams', label: 'Équipes' },
      { href: '/games', label: 'Matchs' },
      { href: '/advanced-stats', label: 'Avancées' },
      { href: '/team-defense', label: 'Défense' },
      { href: '/pace-analysis', label: 'Pace' },
      { href: '/lineups', label: 'Lineups' },
    ],
  },
  {
    id: 'props-joueurs',
    number: '02',
    title: ['PROPS', 'JOUEURS'],
    description: 'Analyse des player props avec rankings défensifs, projections Monte Carlo, et identification des meilleures opportunités pour les paris sur les performances individuelles.',
    showDots: false,
    links: [
      { href: '/player-props/tonight', label: 'Props Ce Soir', badge: 'LIVE', badgeColor: 'bg-red-600' },
      { href: '/player-props', label: 'Recherche Props' },
    ],
  },
  {
    id: 'paris-sportifs',
    number: '03',
    title: ['PARIS', 'SPORTIFS'],
    description: 'Outils de betting intelligence: analyse des totaux Over/Under avec simulations Monte Carlo, expected value, critère de Kelly, et suivi des mouvements de cotes en temps réel.',
    showDots: true,
    links: [
      { href: '/betting/totals', label: 'Totaux O/U', badge: 'MC', badgeColor: 'bg-emerald-600' },
      { href: '/betting/odds-terminal', label: 'Terminal' },
      { href: '/betting/odds-movement', label: 'Mouvements' },
      { href: '/betting/value-finder', label: 'Value Finder' },
      { href: '/my-bets', label: 'Mes Paris' },
    ],
  },
  {
    id: 'analyse',
    number: '04',
    title: 'ANALYSE',
    description: 'Deep-dive analytique: verdicts O/U, analyse par quart-temps, dispersion des performances, head-to-head matchups, et modèles ML pour prédictions avancées. Chat IA pour exploration conversationnelle.',
    showDots: false,
    links: [
      { href: '/analysis', label: 'Hub Analyse' },
      { href: '/analysis/quarters', label: 'Quarts' },
      { href: '/analysis/q1-value', label: 'Value Q1' },
      { href: '/analysis/dispersion', label: 'Dispersion' },
      { href: '/matchups', label: 'Matchups' },
      { href: '/ml-analysis', label: 'ML Analysis', badge: 'Beta', badgeColor: 'bg-purple-600' },
      { href: '/chat', label: 'Chat IA', badge: 'IA', badgeColor: 'bg-blue-600' },
    ],
  },
]

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

      {/* Content Sections - dots pattern alternates per section */}
      {sections.map((section) => (
        <AnimatedSection key={section.id} {...section} />
      ))}

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
