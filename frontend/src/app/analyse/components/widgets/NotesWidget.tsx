/**
 * NotesWidget - Free-form text notes
 *
 * Features:
 * - Editable textarea
 * - Auto-save on blur (to localStorage in Phase 1)
 * - Character count (optional)
 * - Markdown support (Phase 3 optional)
 *
 * Design System: STAT-DISCUTE monochrome strict
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { WidgetConfig } from '../../types'

interface NotesWidgetProps {
  config: WidgetConfig
  onConfigChange: (newConfig: WidgetConfig) => void
}

export function NotesWidget({ config, onConfigChange }: NotesWidgetProps) {
  const [content, setContent] = React.useState(config.content || '')
  const [isFocused, setIsFocused] = React.useState(false)

  // Handle blur - save content
  const handleBlur = () => {
    setIsFocused(false)
    // Update config with new content
    onConfigChange({
      ...config,
      content,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder="Écrivez vos notes ici..."
        className={cn(
          // Layout
          'w-full h-full',
          'resize-none',

          // Styling
          'rounded-[var(--radius-md)]',
          'border',
          isFocused
            ? 'border-white'
            : 'border-[var(--color-gray-800)]',
          'bg-[var(--color-gray-900)]',
          'p-[var(--space-4)]',

          // Text
          'text-[var(--text-base)] text-white',
          'placeholder:text-[var(--color-gray-500)]',

          // Focus state
          'focus:outline-none focus:border-white',
          'transition-colors duration-[var(--transition-fast)]',

          // Font
          'font-[var(--font-family-sans)]',
        )}
      />

      {/* Character count (optional) */}
      {content.length > 0 && (
        <div
          className="mt-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-gray-500)] text-right"
          style={{ fontFamily: 'var(--font-family-mono)' }}
        >
          {content.length} caractères
        </div>
      )}
    </div>
  )
}
