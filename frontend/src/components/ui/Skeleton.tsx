'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Skeleton component for loading states
 *
 * Follows STAT-DISCUTE design system v1.0:
 * - Monochrome strict: ONLY black/white/gray
 * - Anti-impulsivity: Calm loading indicators
 * - Generous spacing (8px system)
 *
 * @param variant - Shape variant: 'text' | 'circular' | 'rectangular'
 *   - text: Line of text (1rem height)
 *   - circular: Circle (aspect ratio 1:1)
 *   - rectangular: Block element
 *
 * @param animation - Animation type: 'pulse' | 'wave' | 'none'
 *   - pulse: Opacity animation (default)
 *   - wave: Shimmer effect
 *   - none: Static skeleton
 *
 * @param width - Custom width (CSS value)
 * @param height - Custom height (CSS value)
 *
 * @example
 * // Text line skeleton
 * <Skeleton variant="text" width="200px" />
 *
 * // Avatar skeleton
 * <Skeleton variant="circular" width="48px" height="48px" />
 *
 * // Card skeleton
 * <Skeleton variant="rectangular" width="100%" height="200px" />
 *
 * // Multiple text lines
 * <div className="space-y-2">
 *   <Skeleton variant="text" width="100%" />
 *   <Skeleton variant="text" width="80%" />
 *   <Skeleton variant="text" width="60%" />
 * </div>
 */

const skeletonVariants = cva(
  [
    'bg-[var(--color-gray-900)]',
    'inline-block',
    'overflow-hidden',
    'relative',
  ],
  {
    variants: {
      variant: {
        text: 'h-4 rounded-[var(--radius-sm)]',
        circular: 'rounded-full aspect-square',
        rectangular: 'rounded-[var(--radius-md)]',
      },
      animation: {
        pulse: 'animate-pulse',
        wave: 'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'rectangular',
      animation: 'pulse',
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animation, width, height, style, ...props }, ref) => {
    // Convert numeric width/height to pixels
    const finalWidth = typeof width === 'number' ? `${width}px` : width
    const finalHeight = typeof height === 'number' ? `${height}px` : height

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, animation }), className)}
        style={{
          width: finalWidth,
          height: finalHeight,
          ...style,
        }}
        aria-busy="true"
        aria-live="polite"
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

/**
 * Skeleton group component for common loading patterns
 */
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'p-[var(--space-6)] border border-[var(--color-gray-800)] rounded-[var(--radius-lg)] bg-[var(--color-gray-950)]',
      className
    )}
  >
    <div className="space-y-[var(--space-3)]">
      {/* Title */}
      <Skeleton variant="text" width="60%" />
      {/* Description lines */}
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      {/* Content block */}
      <Skeleton variant="rectangular" width="100%" height="120px" className="mt-[var(--space-4)]" />
    </div>
  </div>
)

export const SkeletonAvatar = ({ className }: { className?: string }) => (
  <Skeleton variant="circular" width="48px" height="48px" className={className} />
)

export const SkeletonText = ({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) => (
  <div className={cn('space-y-[var(--space-2)]', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
)

export { Skeleton, skeletonVariants }
