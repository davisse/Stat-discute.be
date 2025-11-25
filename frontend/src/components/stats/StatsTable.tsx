'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * StatsTable Component
 *
 * Tableau de statistiques avec tri, filtres, et mise en évidence des valeurs.
 * Optimisé pour afficher des données sportives avec nombres en police mono.
 *
 * Features:
 * - Tri cliquable sur colonnes
 * - Highlight de valeurs basé sur seuils
 * - Loading states avec Skeleton
 * - Row click pour drill-down
 * - Responsive avec scroll horizontal
 *
 * @param columns - Configuration des colonnes
 * @param data - Données du tableau (array d'objets)
 * @param sortable - Active le tri global (défaut: true)
 * @param defaultSort - Tri initial { key, direction }
 * @param highlightThreshold - Seuil de highlight { key, value, type }
 * @param onRowClick - Handler de clic sur ligne
 * @param loading - État de chargement
 * @param emptyMessage - Message si pas de données
 *
 * @example
 * <StatsTable
 *   columns={[
 *     { key: 'name', label: 'Joueur', sortable: true },
 *     { key: 'ppg', label: 'PPG', sortable: true, align: 'right' },
 *   ]}
 *   data={players}
 *   highlightThreshold={{ key: 'ppg', value: 25, type: 'above' }}
 *   onRowClick={(player) => navigate(`/players/${player.id}`)}
 * />
 */

export interface Column {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
  width?: string
}

export interface StatsTableProps {
  columns: Column[]
  data: any[]
  sortable?: boolean
  defaultSort?: { key: string; direction: 'asc' | 'desc' }
  highlightThreshold?: { key: string; value: number; type: 'above' | 'below' }
  onRowClick?: (row: any) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

/**
 * Icône de tri
 */
function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="currentColor"
        className="inline-block ml-1"
        aria-hidden="true"
      >
        <path d="M6 3 L9 7 L3 7 Z" />
      </svg>
    )
  }

  if (direction === 'desc') {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="currentColor"
        className="inline-block ml-1"
        aria-hidden="true"
      >
        <path d="M6 9 L9 5 L3 5 Z" />
      </svg>
    )
  }

  // Unsorted: double arrow
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      className="inline-block ml-1 opacity-40"
      aria-hidden="true"
    >
      <path d="M6 2 L8 5 L4 5 Z" />
      <path d="M6 10 L8 7 L4 7 Z" />
    </svg>
  )
}

/**
 * Vérifie si une valeur doit être highlightée
 */
function shouldHighlight(
  value: any,
  threshold: StatsTableProps['highlightThreshold']
): boolean {
  if (!threshold) return false

  const numValue = typeof value === 'number' ? value : parseFloat(value)
  if (isNaN(numValue)) return false

  if (threshold.type === 'above') {
    return numValue > threshold.value
  } else {
    return numValue < threshold.value
  }
}

/**
 * Trie les données
 */
function sortData(
  data: any[],
  sortKey: string | null,
  sortDirection: SortDirection
): any[] {
  if (!sortKey || !sortDirection) {
    return data
  }

  return [...data].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]

    // Nombres
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    }

    // Strings
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()

    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })
}

export function StatsTable({
  columns,
  data,
  sortable = true,
  defaultSort,
  highlightThreshold,
  onRowClick,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  className,
}: StatsTableProps) {
  // État du tri
  const [sortKey, setSortKey] = React.useState<string | null>(
    defaultSort?.key ?? null
  )
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(
    defaultSort?.direction ?? null
  )

  // Handler de clic sur header
  const handleHeaderClick = (column: Column) => {
    if (!sortable || !column.sortable) return

    if (sortKey === column.key) {
      // Cycle: asc → desc → null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(column.key)
      setSortDirection('asc')
    }
  }

  // Trier les données
  const sortedData = React.useMemo(
    () => sortData(data, sortKey, sortDirection),
    [data, sortKey, sortDirection]
  )

  // Loading state
  if (loading) {
    return (
      <Card variant="default" noPadding className={className}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-gray-900)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-[var(--text-xs)] text-[var(--color-gray-400)] uppercase font-[var(--font-semibold)] px-[var(--space-4)] py-[var(--space-3)] text-left"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-[var(--color-gray-800)]">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-[var(--space-4)] py-[var(--space-3)]"
                    >
                      <Skeleton variant="text" width="80%" height="14px" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  // Empty state
  if (!sortedData || sortedData.length === 0) {
    return (
      <Card variant="default" className={className}>
        <div className="text-center py-[var(--space-12)] text-[var(--color-gray-500)]">
          {emptyMessage}
        </div>
      </Card>
    )
  }

  return (
    <Card variant="default" noPadding className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-[var(--color-gray-900)]">
            <tr>
              {columns.map((col) => {
                const isSortable = sortable && col.sortable
                const isSorted = sortKey === col.key
                const currentDirection = isSorted ? sortDirection : null

                return (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col)}
                    className={cn(
                      'text-[var(--text-xs)] text-[var(--color-gray-400)] uppercase font-[var(--font-semibold)] px-[var(--space-4)] py-[var(--space-3)]',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.align !== 'center' && col.align !== 'right' && 'text-left',
                      isSortable &&
                        'cursor-pointer hover:text-white transition-colors duration-[var(--transition-fast)]'
                    )}
                    style={{ width: col.width }}
                  >
                    {col.label}
                    {isSortable && <SortIcon direction={currentDirection} />}
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedData.map((row, rowIdx) => {
              const isClickable = !!onRowClick

              return (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-[var(--color-gray-800)] transition-all duration-[var(--transition-fast)]',
                    isClickable &&
                      'cursor-pointer hover:bg-[var(--color-gray-950)]'
                  )}
                >
                  {columns.map((col) => {
                    const value = row[col.key]
                    const isHighlighted =
                      highlightThreshold?.key === col.key &&
                      shouldHighlight(value, highlightThreshold)

                    // Déterminer background color si highlighted
                    const highlightBg = isHighlighted
                      ? highlightThreshold?.type === 'above'
                        ? 'rgba(16, 185, 129, 0.05)'
                        : 'rgba(239, 68, 68, 0.05)'
                      : 'transparent'

                    // Déterminer si c'est un nombre
                    const isNumber = typeof value === 'number'

                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] text-white',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right',
                          col.align !== 'center' && col.align !== 'right' && 'text-left',
                          isNumber && 'font-[family-name:var(--font-mono)]',
                          isHighlighted && 'font-[var(--font-semibold)]'
                        )}
                        style={{ backgroundColor: highlightBg }}
                      >
                        {col.render ? col.render(value, row) : value}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
