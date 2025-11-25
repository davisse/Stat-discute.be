'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { mainNavItems, analyticsNavItems, accountNavItems } from '@/lib/navigation'

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

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
      {/* Burger Button - Fixed Top Right with Micro-interactions */}
      <button
        onClick={toggleMenu}
        className="fixed top-6 right-6 z-[60] p-3 rounded-xl bg-white/10 backdrop-blur-lg transition-all duration-200 hover:bg-white/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20 active:translate-y-0 active:shadow-sm"
        aria-label="Menu"
        style={{
          boxShadow: isOpen ? '0 1px 3px rgba(255,255,255,0.1)' : '0 4px 6px rgba(0,0,0,0.3)'
        }}
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] transition-opacity duration-300"
          onClick={closeMenu}
          style={{ top: '128px' }} // Below logo bar
        />
      )}

      {/* Full-Screen Menu Drawer */}
      <div
        className={`fixed left-0 right-0 w-full bg-black border-t border-gray-800 z-[56] transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{
          top: '128px', // Below logo bar (~100px logo + 28px padding)
          height: 'calc(100vh - 128px)' // Fill remaining screen
        }}
      >
        {/* Menu Content - Compact Layout */}
        <div className="h-full overflow-y-auto py-4 px-6">
          {/* Main Navigation */}
          <MenuSection title="Navigation" items={mainNavItems} onItemClick={closeMenu} />

          {/* Analytics Section */}
          <MenuSection
            title="Analyses avancées"
            items={analyticsNavItems}
            onItemClick={closeMenu}
          />

          {/* Account Section */}
          <MenuSection title="Compte" items={accountNavItems} onItemClick={closeMenu} />
        </div>
      </div>
    </>
  )
}

// Menu Section Component (Compact)
function MenuSection({
  title,
  items,
  onItemClick
}: {
  title: string
  items: typeof mainNavItems
  onItemClick: () => void
}) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
        {title}
      </h3>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors group"
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="font-medium">{item.label}</span>
            <span className="ml-auto text-gray-500 group-hover:text-white transition-colors text-xs">
              →
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
