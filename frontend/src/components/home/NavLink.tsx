'use client'

import { useRef } from 'react'
import { usePageTransition } from '@/components/transitions'
import type { NavLinkProps } from './types'

// ============================================================================
// NavLink Component
// ============================================================================

export function NavLink({ href, label, badge, badgeColor = 'bg-red-500' }: NavLinkProps) {
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
