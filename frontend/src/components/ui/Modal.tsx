'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Modal component with overlay, animations, and accessibility features
 *
 * Follows STAT-DISCUTE design system v1.0:
 * - Monochrome strict: ONLY black/white/gray
 * - Anti-impulsivity: Clear close actions, no pressure
 * - Generous spacing (8px system)
 * - WCAG 2.1 AA minimum with full keyboard support
 *
 * @param open - Controls modal visibility
 * @param onClose - Callback when modal should close (Escape key, overlay click, close button)
 * @param title - Modal title (required for accessibility)
 * @param description - Optional description for additional context
 * @param size - Modal width: 'sm' | 'md' | 'lg' | 'xl'
 *   - sm: 400px max width
 *   - md: 600px max width (default)
 *   - lg: 800px max width
 *   - xl: 1000px max width
 *
 * Features:
 * - Focus trap: Tab cycles within modal
 * - Escape key: Closes modal
 * - Overlay click: Closes modal
 * - Smooth animations: Fade + scale
 * - Backdrop blur for visual depth
 *
 * @example
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirmation">
 *   <p>Are you sure?</p>
 *   <ModalFooter>
 *     <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="primary">Confirm</Button>
 *   </ModalFooter>
 * </Modal>
 */

const modalSizes = cva('', {
  variants: {
    size: {
      sm: 'max-w-[400px]',
      md: 'max-w-[600px]',
      lg: 'max-w-[800px]',
      xl: 'max-w-[1000px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface ModalProps extends VariantProps<typeof modalSizes> {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

// Close button icon
const CloseIcon = () => (
  <svg
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const Modal = ({ open, onClose, title, description, size, children, className }: ModalProps) => {
  const modalRef = React.useRef<HTMLDivElement>(null)
  const previousActiveElement = React.useRef<HTMLElement | null>(null)

  // Handle Escape key
  React.useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  // Focus trap and restore focus on close
  React.useEffect(() => {
    if (open) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus modal on open
      modalRef.current?.focus()

      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Restore focus to previous element
      previousActiveElement.current?.focus()

      // Restore body scroll
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Handle focus trap
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-[var(--space-4)] sm:p-[var(--space-8)]">
        {/* Modal Content */}
        <div
          ref={modalRef}
          className={cn(
            'w-full',
            modalSizes({ size }),
            'max-h-[70vh]',
            'flex flex-col',
            'bg-[var(--color-gray-900)]',
            'border border-[var(--color-gray-700)]',
            'rounded-[var(--radius-xl)]',
            'shadow-[var(--shadow-xl)]',
            'animate-in fade-in zoom-in-95 duration-200',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={description ? 'modal-description' : undefined}
          tabIndex={-1}
          onKeyDown={handleTabKey}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-[var(--space-6)] border-b border-[var(--color-gray-800)]">
            <div className="flex-1">
              <h2
                id="modal-title"
                className="text-[var(--text-xl)] font-[var(--font-semibold)] text-white"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="modal-description"
                  className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-gray-400)]"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="ml-[var(--space-4)] text-[var(--color-gray-400)] hover:text-white transition-colors duration-[var(--transition-fast)] rounded-[var(--radius-sm)] p-1 hover:bg-[var(--color-gray-800)]"
              aria-label="Fermer"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-[var(--space-6)]">{children}</div>
        </div>
      </div>
    </>
  )
}

/**
 * ModalFooter - Footer area for modal actions
 * Typically contains action buttons (Cancel, Confirm, etc.)
 */
export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-[var(--space-3)] p-[var(--space-6)] border-t border-[var(--color-gray-800)]',
      className
    )}
    {...props}
  />
))
ModalFooter.displayName = 'ModalFooter'

Modal.displayName = 'Modal'

export { Modal }
