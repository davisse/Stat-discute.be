/**
 * ComponentPalette - Modal for widget selection
 *
 * Features:
 * - Display available widget types as cards
 * - Click to add widget to grid
 * - Hover effects and visual feedback
 * - Close with X button or escape key
 *
 * Design System: STAT-DISCUTE monochrome strict
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { WidgetType, ComponentDefinition } from '../types'
import { AVAILABLE_COMPONENTS } from '../utils'

interface ComponentPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: WidgetType) => void
}

export function ComponentPalette({
  isOpen,
  onClose,
  onSelect,
}: ComponentPaletteProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40',
          'bg-black/60',
          'backdrop-blur-sm',
          'animate-in fade-in duration-200',
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-50',
          'w-full max-w-2xl',
          '-translate-x-1/2 -translate-y-1/2',
          'animate-in fade-in zoom-in-95 duration-200',
          'px-[var(--space-4)]', // Padding for mobile
        )}
      >
        <div
          className={cn(
            // Card styling
            'rounded-[var(--radius-xl)]',
            'border border-[var(--color-gray-800)]',
            'bg-[var(--color-gray-850)]',
            'shadow-[var(--shadow-lg)]',
            'overflow-hidden',
          )}
        >
          {/* Header */}
          <div
            className={cn(
              'flex justify-between items-center',
              'px-[var(--space-6)] py-[var(--space-4)]',
              'border-b border-[var(--color-gray-800)]',
            )}
          >
            <h2
              className="text-[var(--text-xl)] font-[var(--font-semibold)] text-white"
              style={{ fontFamily: 'var(--font-family-sans)' }}
            >
              Sélectionner un composant
            </h2>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                'w-8 h-8',
                'rounded-[var(--radius-md)]',
                'flex items-center justify-center',
                'text-[var(--color-gray-400)]',
                'hover:text-white hover:bg-[var(--color-gray-800)]',
                'transition-all duration-[var(--transition-fast)]',
              )}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>

          {/* Component Grid */}
          <div
            className={cn(
              'p-[var(--space-6)]',
              'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[var(--space-4)]',
              'max-h-[60vh] overflow-y-auto',
            )}
          >
            {AVAILABLE_COMPONENTS.map((component) => (
              <ComponentCard
                key={component.type}
                component={component}
                onClick={() => {
                  onSelect(component.type)
                  onClose()
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * ComponentCard - Individual widget card in palette
 */
interface ComponentCardProps {
  component: ComponentDefinition
  onClick: () => void
}

function ComponentCard({ component, onClick }: ComponentCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Card styling
        'rounded-[var(--radius-lg)]',
        'border border-[var(--color-gray-800)]',
        'bg-[var(--color-gray-900)]',
        'p-[var(--space-4)]',

        // Layout
        'flex flex-col items-start',
        'text-left',

        // Hover state
        'hover:border-white hover:shadow-[var(--shadow-md)]',
        'transition-all duration-[var(--transition-normal)]',
        'active:scale-95',

        // Cursor
        'cursor-pointer',
      )}
    >
      {/* Icon */}
      <div className="text-3xl mb-[var(--space-2)]" aria-hidden="true">
        {component.icon}
      </div>

      {/* Name */}
      <div
        className="text-[var(--text-base)] text-white font-medium mb-1"
        style={{ fontFamily: 'var(--font-family-sans)' }}
      >
        {component.name}
      </div>

      {/* Description */}
      <div
        className="text-[var(--text-sm)] text-[var(--color-gray-400)] mb-[var(--space-2)]"
        style={{ fontFamily: 'var(--font-family-sans)' }}
      >
        {component.description}
      </div>

      {/* Size badge */}
      <div
        className={cn(
          'px-[var(--space-2)] py-1',
          'rounded-[var(--radius-sm)]',
          'bg-[var(--color-gray-800)]',
          'text-[var(--text-sm)] text-[var(--color-gray-400)]',
        )}
        style={{ fontFamily: 'var(--font-family-mono)' }}
      >
        {component.defaultSize}
      </div>
    </button>
  )
}
