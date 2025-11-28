'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import BurgerMenu from '@/components/mobile/BurgerMenu'
import { allNavItems } from '@/lib/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * AppLayout Component
 *
 * Layout principal de l'application STAT-DISCUTE avec:
 * - Fond pointillé caractéristique
 * - Logo fixe en haut centré
 * - Navigation horizontale (desktop)
 * - Menu burger (mobile)
 *
 * @example
 * <AppLayout>
 *   <YourPageContent />
 * </AppLayout>
 */

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#000000' }}>
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
      <header className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#000000' }}>
        {/* Logo centré */}
        <div className="flex justify-center pt-6 pb-4">
          <Link href="/" className="block transition-opacity duration-300 hover:opacity-80">
            <div className="relative w-64 h-16">
              <Image
                src="/logo-v5.png"
                alt="STAT-DISCUTE"
                fill
                sizes="256px"
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </Link>
        </div>

        {/* Trait blanc de séparation - Desktop only */}
        <div className="hidden lg:block h-px bg-white opacity-100" />

        {/* Navigation horizontale - Desktop only */}
        <nav
          className="hidden lg:flex justify-between items-center py-4 px-6"
          aria-label="Navigation principale"
        >
          {/* Spacer gauche pour centrer la nav */}
          <div className="w-48" />

          {/* Navigation centrale */}
          <div className="flex items-center gap-1">
            {allNavItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-6 py-2 text-sm font-medium rounded-md transition-all duration-200',
                    isActive
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Auth Status - Right side */}
          <div className="w-48 flex items-center justify-end gap-3">
            {isLoading ? (
              <div className="h-8 w-24 bg-white/10 animate-pulse rounded-md" />
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm text-gray-400 truncate max-w-[120px]">
                  {user.fullName}
                </span>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200"
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
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                )}
              >
                Se connecter
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Contenu principal avec padding-top pour compenser le header fixe */}
      <main className="relative z-10 pt-32 lg:pt-44">
        {children}
      </main>
    </div>
  )
}
