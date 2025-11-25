'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Card component with multiple variants
 *
 * Follows STAT-DISCUTE design system v1.0:
 * - Monochrome strict: ONLY black/white/gray
 * - Anti-impulsivity: Spacious, clear content containers
 * - Generous spacing (8px system)
 * - WCAG 2.1 AA minimum
 *
 * @param variant - Visual style: 'default' | 'anthracite' | 'elevated'
 *   - default: Gray-950 background, standard card
 *   - anthracite: Gray-850 background (#1F1F1F) - signature color for main cards
 *   - elevated: Enhanced with stronger border and shadow
 *
 * @param padding - Padding size: 'none' | 'sm' | 'md' | 'lg'
 *   - none: No padding (use noPadding prop for backwards compat)
 *   - sm: 16px padding
 *   - md: 24px padding (default)
 *   - lg: 32px padding
 *
 * @param onClick - Optional click handler (makes card interactive/clickable)
 *
 * @example
 * <Card variant="default">
 *   <CardHeader><CardTitle>Title</CardTitle></CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 *
 * <Card variant="anthracite" onClick={() => {}}>Clickable card</Card>
 */

const cardVariants = cva(
  [
    'rounded-[var(--radius-lg)]',
    'border',
    'transition-all duration-[var(--transition-normal)]',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--color-gray-950)]',
          'border-[var(--color-gray-800)]',
          'text-white',
        ],
        anthracite: [
          'bg-[var(--color-gray-850)]',
          'border-[var(--color-gray-800)]',
          'text-white',
        ],
        elevated: [
          'bg-[var(--color-gray-850)]',
          'border-[var(--color-gray-700)]',
          'shadow-[var(--shadow-md)]',
          'text-white',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-[var(--space-4)]',
        md: 'p-[var(--space-6)]',
        lg: 'p-[var(--space-8)]',
      },
      clickable: {
        true: [
          'cursor-pointer',
          'hover:border-white',
          'hover:shadow-[var(--shadow-lg)]',
          'hover:-translate-y-[2px]',
          'active:translate-y-0',
        ],
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      clickable: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  noPadding?: boolean // Backwards compatibility alias for padding="none"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, clickable, noPadding, onClick, ...props }, ref) => {
    // Handle noPadding prop for backwards compatibility
    const finalPadding = noPadding ? 'none' : padding

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({
            variant,
            padding: finalPadding,
            clickable: !!onClick || clickable,
            className,
          })
        )}
        onClick={onClick}
        role={onClick ? 'button' : 'article'}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick(e as any)
                }
              }
            : undefined
        }
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

/**
 * CardHeader - Container for card title and description
 * Uses spacing-6 (24px) for generous vertical spacing
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-[var(--space-2)] p-[var(--space-6)]', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

/**
 * CardTitle - Card title heading
 * Uses text-xl (20px) for section titles
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-[var(--text-xl)] font-[var(--font-semibold)] leading-[var(--leading-tight)] text-white',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

/**
 * CardDescription - Card description text
 * Uses gray-400 for secondary text
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-[var(--text-sm)] text-[var(--color-gray-400)]', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

/**
 * CardContent - Main content area of card
 * No top padding to stack naturally after CardHeader
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-[var(--space-6)] pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

/**
 * CardFooter - Footer area for actions
 * Flex container with items aligned to end
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-[var(--space-6)] pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
