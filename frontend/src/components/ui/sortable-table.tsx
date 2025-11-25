'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

type SortDirection = 'asc' | 'desc' | null

interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (row: T) => React.ReactNode
  getValue?: (row: T) => number | string // For custom sort values
}

interface SortableTableProps<T> {
  data: T[]
  columns: Column<T>[]
  defaultSort?: { key: string; direction: SortDirection }
  rowKey: keyof T | ((row: T) => string | number)
  className?: string
}

export function SortableTable<T extends Record<string, unknown>>({
  data,
  columns,
  defaultSort,
  rowKey,
  className = ''
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction ?? null)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Cycle: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortKey(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data

    const column = columns.find(c => c.key === sortKey)

    return [...data].sort((a, b) => {
      let aVal: unknown
      let bVal: unknown

      if (column?.getValue) {
        aVal = column.getValue(a)
        bVal = column.getValue(b)
      } else {
        aVal = a[sortKey as keyof T]
        bVal = b[sortKey as keyof T]
      }

      // Handle string values that are actually numbers
      if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
        aVal = parseFloat(aVal)
      }
      if (typeof bVal === 'string' && !isNaN(parseFloat(bVal))) {
        bVal = parseFloat(bVal)
      }

      // Compare
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      // String comparison
      const aStr = String(aVal ?? '')
      const bStr = String(bVal ?? '')
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })
  }, [data, sortKey, sortDirection, columns])

  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row)
    }
    return (row[rowKey] as string | number) ?? index
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="h-3 w-3 opacity-30" />
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-3 w-3" />
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="h-3 w-3" />
    }
    return <ChevronsUpDown className="h-3 w-3 opacity-30" />
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`py-2 px-2 ${
                  col.align === 'center' ? 'text-center' :
                  col.align === 'right' ? 'text-right' : 'text-left'
                } ${col.sortable !== false ? 'cursor-pointer hover:bg-muted select-none' : ''}`}
                onClick={() => col.sortable !== false && handleSort(String(col.key))}
              >
                <div className={`flex items-center gap-1 ${
                  col.align === 'center' ? 'justify-center' :
                  col.align === 'right' ? 'justify-end' : 'justify-start'
                }`}>
                  {col.label}
                  {col.sortable !== false && <SortIcon columnKey={String(col.key)} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={getRowKey(row, index)} className="border-b hover:bg-muted/50">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`py-2 px-2 ${
                    col.align === 'center' ? 'text-center' :
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
