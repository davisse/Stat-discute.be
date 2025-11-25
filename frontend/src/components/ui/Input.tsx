'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Input component with variants and states
 *
 * Follows STAT-DISCUTE design system v1.0:
 * - Monochrome strict: ONLY black/white/gray (except error state)
 * - Anti-impulsivity: Encourage reflection and accuracy
 * - Generous spacing (8px system)
 * - WCAG 2.1 AA minimum
 *
 * @param variant - Visual style: 'default' | 'search'
 *   - default: Standard input field
 *   - search: Input with search icon, optimized for search operations
 *
 * @param error - Error message to display below input (also sets error styling)
 * @param leftIcon - Icon element to display on left side
 * @param rightIcon - Icon element to display on right side
 * @param onClear - Callback when clear button is clicked (search variant only)
 *
 * @example
 * <Input placeholder="Entrez une valeur" />
 * <Input variant="search" placeholder="Rechercher un joueur..." />
 * <Input error="Champ requis" />
 * <Input leftIcon={<Icon />} placeholder="Avec icône" />
 */

const inputVariants = cva(
  [
    'w-full',
    'px-[var(--space-4)] py-[var(--space-3)]',
    'text-[var(--text-base)] font-[var(--font-regular)]',
    'bg-[var(--color-gray-950)]',
    'border rounded-[var(--radius-md)]',
    'transition-all duration-[var(--transition-normal)]',
    'placeholder:text-[var(--color-gray-500)]',
    'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        default: 'text-white',
        search: 'text-white pl-[var(--space-12)]', // Extra padding for search icon
      },
      hasError: {
        true: 'border-[var(--color-negative)] focus:ring-[var(--color-negative)]',
        false: 'border-[var(--color-gray-800)] focus:border-white',
      },
    },
    defaultVariants: {
      variant: 'default',
      hasError: false,
    },
  }
)

// Search icon component
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

// Clear button component
const ClearButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-gray-400)] hover:text-white transition-colors duration-[var(--transition-fast)]"
    aria-label="Effacer"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  </button>
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      error,
      leftIcon,
      rightIcon,
      onClear,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error
    const showClearButton = variant === 'search' && value && onClear && !disabled

    return (
      <div className="w-full">
        <div className="relative">
          {/* Search icon for search variant */}
          {variant === 'search' && (
            <div className="absolute left-[var(--space-4)] top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]">
              <SearchIcon />
            </div>
          )}

          {/* Left icon (custom) */}
          {leftIcon && variant !== 'search' && (
            <div className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            className={cn(
              inputVariants({ variant, hasError }),
              leftIcon && variant !== 'search' && 'pl-[var(--space-10)]',
              rightIcon && !showClearButton && 'pr-[var(--space-10)]',
              showClearButton && 'pr-[var(--space-10)]',
              className
            )}
            disabled={disabled}
            value={value}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${props.id}-error` : undefined}
            {...props}
          />

          {/* Right icon (custom) or Clear button */}
          {showClearButton ? (
            <ClearButton onClick={onClear} />
          ) : (
            rightIcon && (
              <div className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={`${props.id}-error`}
            className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-negative)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
