/**
 * BentoGrid Component - 12-column CSS Grid Container
 *
 * Responsive grid system:
 * - Desktop (lg): 12 columns
 * - Tablet (md): 6 columns
 * - Mobile: 4 columns
 *
 * Design System: STAT-DISCUTE monochrome strict
 * Gap: 16px (--space-4)
 * Background: Black with dots pattern (from AppLayout)
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BentoGridProps {
  children: React.ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        // Grid system
        'grid',
        'grid-cols-4',           // Mobile: 4 columns
        'md:grid-cols-6',        // Tablet: 6 columns
        'lg:grid-cols-12',       // Desktop: 12 columns
        'gap-[var(--space-4)]',  // 16px gap

        // Spacing
        'px-[var(--space-6)]',   // 24px horizontal padding
        'py-[var(--space-6)]',   // 24px vertical padding

        // Layout
        'w-full',
        'min-h-[400px]',

        // Auto-flow for optimal placement
        'auto-rows-auto',

        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * EmptyState Component - Shown when no widgets exist
 */
interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div
      className={cn(
        // Layout - Center in grid
        'col-span-full',
        'flex items-center justify-center',
        'min-h-[400px]',
        'py-[var(--space-16)]',
      )}
    >
      <div
        className={cn(
          // Card styling
          'rounded-[var(--radius-xl)]',              // 16px radius
          'border border-[var(--color-gray-800)]',
          'bg-[var(--color-gray-850)]',
          'p-[var(--space-8)]',                      // 32px padding

          // Size
          'max-w-md',
          'text-center',

          // Spacing
          'space-y-[var(--space-6)]',
        )}
      >
        {/* Icon */}
        <div className="text-6xl" aria-hidden="true">
          📊
        </div>

        {/* Text */}
        <div className="space-y-[var(--space-2)]">
          <h2
            className="text-[var(--text-xl)] font-[var(--font-semibold)] text-white"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Commencez votre analyse
          </h2>
          <p
            className="text-[var(--text-base)] text-[var(--color-gray-400)]"
            style={{ fontFamily: 'var(--font-family-sans)' }}
          >
            Ajoutez des composants pour construire une analyse NBA personnalisée
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onAdd}
          className={cn(
            // Base button styles
            'inline-flex items-center justify-center',
            'px-[var(--space-6)] py-[var(--space-3)]',
            'rounded-[var(--radius-md)]',

            // Primary button styling (white bg, black text)
            'bg-white !text-black',
            'border border-white',

            // Hover state
            'hover:bg-transparent hover:!text-white',
            'hover:shadow-[var(--shadow-md)]',
            'transition-all duration-[var(--transition-normal)]',

            // Font
            'font-medium text-[var(--text-base)]',
          )}
        >
          <span className="mr-[var(--space-2)]">+</span>
          Ajouter un composant
        </button>
      </div>
    </div>
  )
}
