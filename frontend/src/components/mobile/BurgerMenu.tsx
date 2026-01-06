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
        <div className="h-full overflow-y-auto py-4 px-6">
          {/* All Navigation Sections */}
          {navSections.map((section) => (
            <MenuSection key={section.id} section={section} onItemClick={closeMenu} />
          ))}

          {/* Account Section */}
          <div className="mb-4 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Compte
            </h3>
            <nav className="space-y-0.5">
              {/* Auth Status */}
              {isLoading ? (
                <div className="px-3 py-2">
                  <div className="h-6 w-32 bg-white/10 animate-pulse rounded" />
                </div>
              ) : isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400">
                    <span className="text-lg">👤</span>
                    <span className="font-medium truncate">{user.fullName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors group"
                  >
                    <span className="text-lg">🚪</span>
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors group"
                  >
                    <span className="text-lg">🔑</span>
                    <span className="font-medium">Se connecter</span>
                    <span className="ml-auto text-gray-500 group-hover:text-white transition-colors text-xs">
                      →
                    </span>
                  </Link>
                </>
              )}
            </nav>
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
