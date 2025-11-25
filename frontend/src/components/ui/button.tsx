'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button component with multiple variants and sizes
 *
 * Follows STAT-DISCUTE design system v1.0:
 * - Monochrome strict: ONLY black/white/gray
 * - Anti-impulsivity: Encourage reflection, not rapid action
 * - Generous spacing (8px system)
 * - WCAG 2.1 AA minimum
 *
 * @param variant - Visual style: 'primary' | 'secondary' | 'ghost'
 *   - primary: White background, black text (main CTA)
 *   - secondary: Transparent with gray border
 *   - ghost: Minimal, no border
 *
 * @param size - Size variant: 'sm' | 'md' | 'lg' | 'xl'
 *   - sm: 8px/16px padding, 14px text
 *   - md: 12px/24px padding, 16px text (default)
 *   - lg: 16px/32px padding, 18px text
 *   - xl: 20px/40px padding, 20px text
 *
 * @param disabled - Disabled state (reduces opacity, pointer-events-none)
 * @param loading - Loading state with spinner, disables interaction
 * @param fullWidth - Expand to full width of container
 * @param leftIcon - Icon element to display on left side
 * @param rightIcon - Icon element to display on right side
 * @param asChild - Use Slot for composition with Radix primitives
 *
 * @example
 * <Button variant="primary" size="md">Analyser</Button>
 * <Button variant="secondary" size="sm" leftIcon={<SearchIcon />}>Rechercher</Button>
 * <Button variant="ghost" loading>Chargement...</Button>
 * <Button variant="primary" fullWidth>Confirmer</Button>
 */

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-[var(--space-2)]',
    'font-medium',
    'rounded-[var(--radius-md)]',
    'transition-all duration-[var(--transition-normal)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'disabled:pointer-events-none disabled:opacity-50',
    'whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        // Primary: White background, black text
        // Hover: transparent bg + white border + white text + glow
        primary: [
          'bg-white !text-black',
          'border border-white',
          'hover:bg-transparent hover:!text-white',
          'hover:shadow-[var(--shadow-md)]',
          'active:scale-[0.98]',
        ],
        // Secondary: Transparent with gray border
        // Hover: subtle gray background + glow
        secondary: [
          'bg-transparent text-white',
          'border border-[var(--color-gray-800)]',
          'hover:bg-[var(--color-gray-900)]',
          'hover:shadow-[var(--shadow-sm)]',
          'active:scale-[0.98]',
        ],
        // Ghost: Minimal, no border
        // Hover: white text + very subtle background
        ghost: [
          'bg-transparent text-[var(--color-gray-400)]',
          'hover:text-white hover:bg-[var(--color-gray-950)]',
          'active:scale-[0.98]',
        ],
      },
      size: {
        sm: 'px-[var(--space-4)] py-[var(--space-2)] text-[var(--text-sm)]',
        md: 'px-[var(--space-6)] py-[var(--space-3)] text-[var(--text-base)]',
        lg: 'px-[var(--space-8)] py-[var(--space-4)] text-[var(--text-lg)]',
        xl: 'px-[40px] py-[20px] text-[var(--text-xl)]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

// Spinner component for loading state
const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    // Determine spinner size based on button size
    const spinnerSize = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    }[size || 'md']

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Spinner className={spinnerSize} />}
        {!loading && leftIcon && (
          <span className="inline-flex items-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="inline-flex items-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }