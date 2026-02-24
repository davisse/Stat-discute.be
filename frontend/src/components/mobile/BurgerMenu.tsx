'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { navSections, NavSection } from '@/lib/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const handleLogout = () => {
    closeMenu()
    logout()
  }

  // ESC key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Don't render burger menu when not authenticated
  // User can only access login/signup pages when not logged in
  if (!isAuthenticated && !isLoading) {
    return null
  }

  return (
    <>
      {/* Burger Button - Fixed Top Right, vertically centered with logo bar */}
      <button
        onClick={toggleMenu}
        className="fixed top-2.5 right-6 z-[60] p-3 rounded-xl bg-zinc-900 border border-zinc-700 transition-all duration-200 hover:bg-zinc-800 hover:-translate-y-1 active:translate-y-0"
        aria-label="Menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`block h-0.5 bg-white transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block h-0.5 bg-white transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 bg-white transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </div>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[55] transition-opacity duration-300"
          onClick={closeMenu}
          style={{ top: '64px' }} // Below header bar (py-3 + h-10 = 64px)
        />
      )}

      {/* Full-Screen Menu Drawer */}
      <div
        className={`fixed left-0 right-0 w-full bg-black border-t border-gray-800 z-[56] transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{
          top: '64px', // Below header bar (py-3 + h-10 = 64px)
          height: 'calc(100vh - 64px)' // Fill remaining screen
        }}
      >
        {/* Menu Content - Section Layout */}
        <div className="h-full flex flex-col relative">
          {/* Scrollable Navigation Sections */}
          <div className="flex-1 overflow-y-auto py-4 px-6 pb-24">
            {/* All Navigation Sections */}
            {navSections.map((section) => (
              <MenuSection key={section.id} section={section} onItemClick={closeMenu} />
            ))}
          </div>

          {/* Fixed Footer - Auth Status (relative to menu container) */}
          <div className="absolute bottom-0 left-0 right-0 border-t-2 border-white bg-zinc-800 p-4" style={{ borderTop: '2px solid white' }}>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-8 w-32 bg-white/10 animate-pulse rounded-lg" />
              </div>
            ) : isAuthenticated && user ? (
              /* Connected State - Single Line */
              <div className="flex items-center justify-between gap-2">
                {/* User Name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm">👤</span>
                  <span className="text-sm text-white font-medium truncate">
                    {user.fullName}
                  </span>
                </div>

                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span>📊</span>
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <span>🚪</span>
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              /* Not Connected State - Two Buttons */
              <div className="flex items-center justify-center gap-4">
                {/* Login Button - Secondary */}
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex-1 max-w-[160px] px-4 py-2 text-sm font-medium text-center border border-zinc-700 text-white rounded-lg hover:border-white hover:bg-white/10 transition-all"
                >
                  Se connecter
                </Link>

                {/* Signup Button - Primary */}
                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="flex-1 max-w-[160px] px-4 py-2 text-sm font-semibold text-center bg-white text-black rounded-lg hover:bg-zinc-100 transition-all"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Menu Section Component
function MenuSection({
  section,
  onItemClick
}: {
  section: NavSection
  onItemClick: () => void
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 px-2">
        <span className="text-xs font-medium text-zinc-500">{section.number}</span>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          {section.label}
        </h3>
      </div>
      <nav className="space-y-0.5">
        {section.links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors group"
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded text-white ${item.badgeColor || 'bg-red-500'}`}>
                {item.badge}
              </span>
            )}
            <span className="ml-auto text-gray-500 group-hover:text-white transition-colors text-xs">
              →
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
