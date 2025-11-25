'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Spinner component for loading states
 *
 * Follows STAT-DISCUTE design system v1.0:
 * - Monochrome strict: ONLY black/white/gray (customizable via color prop)
 * - Anti-impulsivity: Calm, non-aggressive loading indicator
 * - Used in buttons, forms, and inline loading states
 *
 * @param size - Size variant: 'sm' | 'md' | 'lg' | 'xl'
 *   - sm: 16px (inline with text)
 *   - md: 24px (default, buttons)
 *   - lg: 32px (cards, sections)
 *   - xl: 48px (page loading)
 *
 * @param color - Color override (default: currentColor)
 *   - Uses currentColor by default to inherit text color
 *   - Can specify custom color for special cases
 *
 * @example
 * // Inline with text
 * <div className="flex items-center gap-2">
 *   <Spinner size="sm" />
 *   <span>Chargement...</span>
 * </div>
 *
 * // In button (handled automatically by Button component)
 * <Button loading>Analyser</Button>
 *
 * // Page loading
 * <div className="flex items-center justify-center min-h-screen">
 *   <Spinner size="xl" />
 * </div>
 *
 * // Custom color
 * <Spinner size="md" color="#10B981" />
 */

const spinnerSizes = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerSizes> {
  color?: string
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size, color = 'currentColor', className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={cn(spinnerSizes({ size }), className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
        role="status"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill={color}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )
  }
)

Spinner.displayName = 'Spinner'

/**
 * SpinnerPage - Full page loading spinner
 * Centered vertically and horizontally
 */
export const SpinnerPage = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex items-center justify-center min-h-screen',
      className
    )}
    role="status"
    aria-label="Chargement de la page"
  >
    <Spinner size="xl" />
  </div>
)

/**
 * SpinnerInline - Inline loading spinner with text
 */
export const SpinnerInline = ({
  text = 'Chargement...',
  className,
}: {
  text?: string
  className?: string
}) => (
  <div
    className={cn('flex items-center gap-[var(--space-2)]', className)}
    role="status"
    aria-label={text}
  >
    <Spinner size="sm" />
    <span className="text-[var(--text-sm)] text-[var(--color-gray-400)]">{text}</span>
  </div>
)

/**
 * SpinnerOverlay - Full container overlay with spinner
 * Useful for loading states over existing content
 */
export const SpinnerOverlay = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm',
      className
    )}
    role="status"
    aria-label="Chargement en cours"
  >
    <Spinner size="lg" />
  </div>
)

export { Spinner, spinnerSizes }
