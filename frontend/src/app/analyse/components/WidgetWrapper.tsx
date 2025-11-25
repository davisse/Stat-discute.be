/**
 * WidgetWrapper Component - HOC for all widgets
 *
 * Provides:
 * - Consistent card styling with hover states
 * - Widget header with title and controls
 * - Config button (⚙️) and Delete button (🗑️)
 * - Grid size classes application
 *
 * Design System: STAT-DISCUTE monochrome strict
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { WidgetSize, widgetSizeClasses, widgetSizeResponsiveClasses } from '../types'

interface WidgetWrapperProps {
  children: React.ReactNode
  title: string
  size: WidgetSize
  onConfig: () => void
  onDelete: () => void
  className?: string
}

export function WidgetWrapper({
  children,
  title,
  size,
  onConfig,
  onDelete,
  className,
}: WidgetWrapperProps) {
  return (
    <div
      className={cn(
        // Grid size (responsive)
        widgetSizeClasses[size],
        widgetSizeResponsiveClasses[size],

        // Card styling
        'rounded-[var(--radius-lg)]',              // 12px radius
        'border border-[var(--color-gray-800)]',
        'bg-[var(--color-gray-850)]',
        'p-[var(--space-6)]',                      // 24px padding

        // Transitions
        'transition-all duration-[var(--transition-normal)]',

        // Hover state
        'hover:border-white hover:shadow-[var(--shadow-md)]',

        // Layout
        'relative',
        'flex flex-col',

        className
      )}
    >
      {/* Widget Header */}
      <div className="flex justify-between items-start mb-[var(--space-4)]">
        <h3
          className="text-[var(--text-lg)] font-[var(--font-semibold)] text-white"
          style={{ fontFamily: 'var(--font-family-sans)' }}
        >
          {title}
        </h3>

        {/* Control Buttons */}
        <div className="flex gap-[var(--space-2)] shrink-0">
          {/* Config Button */}
          <button
            onClick={onConfig}
            className={cn(
              'w-8 h-8',
              'rounded-[var(--radius-md)]',
              'flex items-center justify-center',
              'text-[var(--color-gray-400)]',
              'hover:text-white hover:bg-[var(--color-gray-800)]',
              'transition-all duration-[var(--transition-fast)]',
              'active:scale-95',
            )}
            aria-label="Configurer le widget"
            title="Configurer"
          >
            ⚙️
          </button>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className={cn(
              'w-8 h-8',
              'rounded-[var(--radius-md)]',
              'flex items-center justify-center',
              'text-[var(--color-gray-400)]',
              'hover:text-white hover:bg-[var(--color-gray-800)]',
              'transition-all duration-[var(--transition-fast)]',
              'active:scale-95',
            )}
            aria-label="Supprimer le widget"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
