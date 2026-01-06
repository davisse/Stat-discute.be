'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import BurgerMenu from '@/components/mobile/BurgerMenu'
import { navSections, NavSection } from '@/lib/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTransitionReady } from '@/hooks/useTransitionReady'

/**
 * NavDropdown Component
 * Dropdown panel matching homepage section design
 */
function NavDropdown({
  section,
  isOpen,
  onClose
}: {
  section: NavSection
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
        onClick={onClose}
        style={{ top: '160px' }}
      />

      {/* Dropdown panel */}
      <div
        className="absolute top-full left-0 right-0 bg-black border-t border-zinc-800 z-40"
        style={{
          borderBottom: '6px solid #FFFFFF',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      >
        <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Section Number */}
        <div className="mb-6">
          <span className="text-sm font-medium text-zinc-500 tracking-widest">{section.number}</span>
          <div className="h-0.5 w-8 bg-zinc-700 mt-2" />
        </div>

        {/* Section Title */}
        <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
          {section.label}
        </h3>

        {/* Description */}
        <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mb-8">
          {section.description}
        </p>

        {/* Navigation Links - Homepage style */}
        <div className="flex flex-wrap gap-3">
          {section.links.map((link) => {
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  'group relative px-6 py-4 border rounded-lg transition-all duration-300',
                  isActive
                    ? 'border-white bg-white/10'
                    : 'border-zinc-700 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                )}
              >
                {link.badge && (
                  <span className={cn(
                    'absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full text-white',
                    link.badgeColor || 'bg-red-500'
                  )}>
                    {link.badge}
                  </span>
                )}
                <span className="text-sm font-medium uppercase tracking-wider text-white group-hover:text-white transition-colors">
                  {link.label}
                </span>
                <span className="ml-2 text-zinc-500 group-hover:text-white transition-colors">→</span>
              </Link>
            )
          })}
        </div>
      </div>
      </div>
    </>
  )
}

/**
 * AppLayout Component
 *
 * Layout principal de l'application STAT-DISCUTE avec:
 * - Fond pointillé caractéristique
 * - Logo fixe en haut centré
 * - Navigation horizontale avec dropdowns (desktop)
 * - Menu burger (mobile)
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [openSection, setOpenSection] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  // Signal that the page is ready for reveal animation
  useTransitionReady()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenSection(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setOpenSection(null)
  }, [pathname])

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId)
  }

  // Check if current path is in a section
  const isInSection = (section: NavSection) => {
    return section.links.some(link => pathname === link.href)
  }

  return (
    <div className="min-h-screen relative overscroll-none" style={{ backgroundColor: '#000000' }}>
      {/* Fond pointillé (Dots Grid Background) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.15,
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px',
          zIndex: 0,
        }}
      />

      {/* Burger Menu - Mobile Only */}
      <div className="lg:hidden">
        <BurgerMenu />
      </div>

      {/* Header fixe avec logo et navbar */}
      <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-black lg:bg-black/90 lg:backdrop-blur-md border-b border-zinc-800/50">
        {/* Navigation horizontale - Desktop only */}
        <nav
          className="hidden lg:flex justify-between items-center py-4 px-6 relative"
          aria-label="Navigation principale"
        >
          {/* Logo - Left side */}
          <Link href="/" className="h-10 flex items-center transition-opacity duration-300 hover:opacity-80 w-48">
            <Image
              src="/logo-v5.png"
              alt="STAT-DISCUTE"
              width={120}
              height={30}
              className="h-7 w-auto"
              priority
            />
          </Link>

          {/* Navigation centrale - 4 sections */}
          <div className="flex items-center gap-2">
            {navSections.map((section) => {
              const isActive = isInSection(section)
              const isOpen = openSection === section.id

              return (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    'px-6 py-2 text-sm font-medium uppercase tracking-wider rounded-md transition-all duration-200 flex items-center gap-2',
                    isActive || isOpen
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <span className="text-zinc-500 text-xs">{section.number}</span>
                  {section.label}
                  <svg
                    className={cn(
                      'w-3 h-3 transition-transform duration-200',
                      isOpen ? 'rotate-180' : ''
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )
            })}
          </div>

          {/* Auth Status - Right side */}
          <div className="w-48 flex items-center justify-end gap-3">
            {isLoading ? (
              <div className="h-8 w-24 bg-white/10 animate-pulse rounded-md" />
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm text-zinc-400 truncate max-w-[120px]">
                  {user.fullName}
                </span>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  pathname === '/login'
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                )}
              >
                Se connecter
              </Link>
            )}
          </div>
        </nav>

        {/* Dropdown Panels */}
        {navSections.map((section) => (
          <NavDropdown
            key={section.id}
            section={section}
            isOpen={openSection === section.id}
            onClose={() => setOpenSection(null)}
          />
        ))}
      </header>

      {/* Contenu principal avec padding-top pour compenser le header fixe */}
      <main className="relative z-10 pt-16 lg:pt-20">
        {children}
      </main>
    </div>
  )
}
