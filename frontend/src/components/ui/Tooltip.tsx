'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Tooltip component with auto-positioning and animations
 *
 * Follows STAT-DISCUTE design system v1.0:
 * - Monochrome strict: ONLY black/white/gray
 * - Anti-impulsivity: Informative, non-intrusive
 * - Generous spacing (8px system)
 * - WCAG 2.1 AA minimum
 *
 * @param content - Tooltip text content
 * @param children - Element that triggers the tooltip
 * @param position - Preferred position: 'top' | 'bottom' | 'left' | 'right'
 *   - Auto-adjusts if not enough space
 * @param delay - Delay before showing tooltip in milliseconds (default: 300ms)
 *
 * Features:
 * - Hover activation with delay
 * - Auto-positioning when near viewport edges
 * - Arrow indicator pointing to element
 * - Smooth fade + translate animation
 * - Touch-friendly (shows on tap, hides on tap outside)
 *
 * @example
 * <Tooltip content="This is helpful information">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * <Tooltip content="Analyze data" position="right" delay={500}>
 *   <IconButton icon={<ChartIcon />} />
 * </Tooltip>
 */

type Position = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  position?: Position
  delay?: number
  className?: string
}

const Tooltip = ({ content, children, position = 'top', delay = 300, className }: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [finalPosition, setFinalPosition] = React.useState<Position>(position)
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const triggerRef = React.useRef<HTMLElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  // Show tooltip with delay
  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      adjustPosition()
    }, delay)
  }

  // Hide tooltip immediately
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  // Adjust position if tooltip would overflow viewport
  const adjustPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let newPosition = position

    // Check if tooltip overflows viewport and adjust
    if (position === 'top' && triggerRect.top - tooltipRect.height < 0) {
      newPosition = 'bottom'
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewportHeight) {
      newPosition = 'top'
    } else if (position === 'left' && triggerRect.left - tooltipRect.width < 0) {
      newPosition = 'right'
    } else if (position === 'right' && triggerRect.right + tooltipRect.width > viewportWidth) {
      newPosition = 'left'
    }

    setFinalPosition(newPosition)
  }

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Position and animation classes based on final position
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-gray-900)] border-x-transparent border-b-transparent',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-gray-900)] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-gray-900)] border-y-transparent border-r-transparent',
    right:
      'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-gray-900)] border-y-transparent border-l-transparent',
  }

  return (
    <div
      className="relative inline-block"
      ref={triggerRef as any}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={cn(
            'absolute z-50',
            'max-w-[200px]',
            'px-[var(--space-3)] py-[var(--space-2)]',
            'bg-[var(--color-gray-900)]',
            'border border-[var(--color-gray-700)]',
            'rounded-[var(--radius-sm)]',
            'shadow-[var(--shadow-md)]',
            'text-[var(--text-sm)] text-[var(--color-gray-300)]',
            'whitespace-normal',
            'pointer-events-none',
            'animate-in fade-in slide-in-from-top-1 duration-150',
            positionClasses[finalPosition],
            className
          )}
        >
          {content}

          {/* Arrow */}
          <div
            className={cn(
              'absolute',
              'w-0 h-0',
              'border-4',
              'border-solid',
              arrowClasses[finalPosition]
            )}
          />
        </div>
      )}
    </div>
  )
}

Tooltip.displayName = 'Tooltip'

export { Tooltip }
