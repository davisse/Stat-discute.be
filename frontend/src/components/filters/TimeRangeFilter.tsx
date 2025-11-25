'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

/**
 * TimeRangeFilter Component
 *
 * Filtre de période temporelle pour analyser différentes fenêtres temporelles.
 * Design: Segmented control (boutons groupés) avec option custom date picker.
 *
 * Philosophy: Encourage l'analyse approfondie sur différentes périodes,
 * pas l'impulsivité. Permet de comparer '7J' vs '30J' vs 'Saison'.
 *
 * @param ranges - Options de plages temporelles disponibles
 * @param selected - Valeur actuellement sélectionnée
 * @param onChange - Handler de changement de sélection
 * @param customRange - Plage personnalisée (si selected='custom')
 * @param onCustomChange - Handler pour changement de dates custom
 *
 * @example
 * // Filtre avec plages par défaut
 * <TimeRangeFilter
 *   ranges={[
 *     { label: '7J', value: '7d', days: 7 },
 *     { label: '30J', value: '30d', days: 30 },
 *     { label: 'Saison', value: 'season' },
 *     { label: 'Custom', value: 'custom' }
 *   ]}
 *   selected={timeRange}
 *   onChange={setTimeRange}
 *   onCustomChange={(from, to) => setCustomDates({ from, to })}
 * />
 */

export interface TimeRange {
  label: string
  value: string // '7d', '30d', 'season', 'custom'
  days?: number
}

export interface TimeRangeFilterProps {
  ranges: TimeRange[]
  selected: string
  onChange: (value: string) => void
  customRange?: { from: Date; to: Date }
  onCustomChange?: (from: Date, to: Date) => void
  className?: string
}

/**
 * Plages par défaut
 */
export const defaultTimeRanges: TimeRange[] = [
  { label: '7J', value: '7d', days: 7 },
  { label: '30J', value: '30d', days: 30 },
  { label: 'Saison', value: 'season' },
  { label: 'Custom', value: 'custom' },
]

/**
 * Formate une date en YYYY-MM-DD pour input type="date"
 */
function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formate une date en DD/MM/YYYY pour affichage
 */
function formatDateForDisplay(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Modal pour sélection de dates custom
 */
function CustomDateModal({
  open,
  onClose,
  initialFrom,
  initialTo,
  onApply,
}: {
  open: boolean
  onClose: () => void
  initialFrom?: Date
  initialTo?: Date
  onApply: (from: Date, to: Date) => void
}) {
  const [fromDate, setFromDate] = React.useState<string>(
    initialFrom ? formatDateForInput(initialFrom) : formatDateForInput(new Date())
  )
  const [toDate, setToDate] = React.useState<string>(
    initialTo ? formatDateForInput(initialTo) : formatDateForInput(new Date())
  )

  const handleApply = () => {
    const from = new Date(fromDate)
    const to = new Date(toDate)

    // Validation: from doit être avant to
    if (from > to) {
      alert('La date de début doit être antérieure à la date de fin')
      return
    }

    onApply(from, to)
    onClose()
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} title="Sélectionner une période">
      <div className="space-y-[var(--space-6)]">
        {/* Date de début */}
        <div>
          <label
            htmlFor="from-date"
            className="block text-[var(--text-sm)] text-[var(--color-gray-400)] mb-[var(--space-2)]"
          >
            Date de début
          </label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        {/* Date de fin */}
        <div>
          <label
            htmlFor="to-date"
            className="block text-[var(--text-sm)] text-[var(--color-gray-400)] mb-[var(--space-2)]"
          >
            Date de fin
          </label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-[var(--space-3)] justify-end">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="secondary" onClick={handleApply}>
            Appliquer
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function TimeRangeFilter({
  ranges,
  selected,
  onChange,
  customRange,
  onCustomChange,
  className,
}: TimeRangeFilterProps) {
  const [isCustomModalOpen, setIsCustomModalOpen] = React.useState(false)

  const handleRangeClick = (value: string) => {
    if (value === 'custom') {
      setIsCustomModalOpen(true)
    } else {
      onChange(value)
    }
  }

  const handleCustomApply = (from: Date, to: Date) => {
    onCustomChange?.(from, to)
    onChange('custom')
  }

  return (
    <>
      <div
        className={cn(
          'inline-flex rounded-[var(--radius-md)] border border-[var(--color-gray-800)]',
          'flex-col sm:flex-row',
          className
        )}
        role="radiogroup"
        aria-label="Sélectionnez une période temporelle"
      >
        {ranges.map((range, idx) => {
          const isSelected = selected === range.value
          const isFirst = idx === 0
          const isLast = idx === ranges.length - 1

          return (
            <button
              key={range.value}
              onClick={() => handleRangeClick(range.value)}
              className={cn(
                'px-[var(--space-4)] py-[var(--space-2)] text-[var(--text-sm)] font-[var(--font-medium)] transition-all duration-[var(--transition-fast)]',
                'border-[var(--color-gray-800)]',
                'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black',

                // Selected state
                isSelected
                  ? 'bg-[var(--color-gray-850)] text-white border-white'
                  : 'bg-transparent text-[var(--color-gray-400)] hover:text-white hover:bg-[var(--color-gray-900)]',

                // Border radius (segmented control)
                isFirst && 'rounded-l-[var(--radius-md)] sm:rounded-l-[var(--radius-md)] sm:rounded-r-none rounded-t-[var(--radius-md)] rounded-b-none sm:rounded-b-[var(--radius-md)]',
                isLast && 'rounded-r-[var(--radius-md)] sm:rounded-r-[var(--radius-md)] sm:rounded-l-none rounded-b-[var(--radius-md)] rounded-t-none sm:rounded-t-[var(--radius-md)]',
                !isFirst && !isLast && 'rounded-none',

                // Borders between buttons (desktop)
                'sm:border-l-0 first:sm:border-l',
                // Borders between buttons (mobile)
                'border-t-0 first:border-t sm:border-t'
              )}
              role="radio"
              aria-checked={isSelected}
            >
              {range.value === 'custom' && customRange ? (
                <span className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span className="hidden sm:inline">{range.label}:</span>
                  <span className="text-[var(--text-xs)] sm:text-[var(--text-sm)]">
                    {formatDateForDisplay(customRange.from)} -{' '}
                    {formatDateForDisplay(customRange.to)}
                  </span>
                </span>
              ) : (
                range.label
              )}
            </button>
          )
        })}
      </div>

      {/* Custom Date Modal */}
      <CustomDateModal
        open={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        initialFrom={customRange?.from}
        initialTo={customRange?.to}
        onApply={handleCustomApply}
      />
    </>
  )
}
