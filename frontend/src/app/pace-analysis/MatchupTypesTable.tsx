'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { MatchupTypeStats } from '@/lib/queries'

type SortDirection = 'asc' | 'desc' | null

interface MatchupTypesTableProps {
  data: MatchupTypeStats[]
}

// Helper to safely format numbers (handles PostgreSQL numeric type)
const safeNum = (val: number | string | null | undefined): number => {
  if (val === null || val === undefined) return 0
  const num = typeof val === 'string' ? parseFloat(val) : val
  return isNaN(num) ? 0 : num
}

type SortKey = 'matchup_type' | 'games' | 'avg_total' | 'stddev'

interface Column {
  key: SortKey
  label: string
  align: 'left' | 'center'
  sortable: boolean
}

const columns: Column[] = [
  { key: 'matchup_type', label: 'Matchup Type', align: 'left', sortable: true },
  { key: 'games', label: 'Games', align: 'center', sortable: true },
  { key: 'avg_total', label: 'Avg Total', align: 'center', sortable: true },
  { key: 'stddev', label: 'Std Dev', align: 'center', sortable: true },
]

const getBettingInsight = (matchupType: string): string => {
  if (matchupType === 'FAST vs FAST') return 'High totals but volatile - risky for O/U'
  if (matchupType === 'SLOW vs SLOW') return 'Low totals, consistent - best for UNDER bets'
  if (matchupType.includes('MISMATCH')) return 'Slow team drags down pace - lean UNDER'
  if (matchupType === 'MIXED') return 'Most common - use other factors'
  return ''
}

export function MatchupTypesTable({ data }: MatchupTypesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('avg_total')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortKey('avg_total')
        setSortDirection('desc')
      }
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data

    return [...data].sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      if (sortKey === 'matchup_type') {
        aVal = a.matchup_type
        bVal = b.matchup_type
      } else {
        aVal = safeNum(a[sortKey])
        bVal = safeNum(b[sortKey])
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal)
      const bStr = String(bVal)
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })
  }, [data, sortKey, sortDirection])

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="h-3 w-3 opacity-30" />
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-3 w-3" />
    }
    return <ChevronDown className="h-3 w-3" />
  }

  const getMatchupTypeStyle = (matchupType: string) => {
    if (matchupType === 'FAST vs FAST') return 'bg-orange-100 text-orange-700'
    if (matchupType === 'SLOW vs SLOW') return 'bg-blue-100 text-blue-700'
    if (matchupType.includes('MISMATCH')) return 'bg-purple-100 text-purple-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2 px-3 cursor-pointer hover:bg-muted select-none ${
                  col.align === 'center' ? 'text-center' : 'text-left'
                }`}
                onClick={() => handleSort(col.key)}
              >
                <div className={`flex items-center gap-1 ${
                  col.align === 'center' ? 'justify-center' : 'justify-start'
                }`}>
                  {col.label}
                  <SortIcon columnKey={col.key} />
                </div>
              </th>
            ))}
            <th className="text-center py-2 px-3">Range</th>
            <th className="text-left py-2 px-3">Betting Insight</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((mt) => {
            const avgTotal = safeNum(mt.avg_total)
            const stddev = safeNum(mt.stddev)
            return (
              <tr key={mt.matchup_type} className="border-b hover:bg-muted/50">
                <td className="py-2 px-3 font-medium">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMatchupTypeStyle(mt.matchup_type)}`}>
                    {mt.matchup_type}
                  </span>
                </td>
                <td className="text-center py-2 px-3">{safeNum(mt.games)}</td>
                <td className="text-center py-2 px-3 font-bold">
                  <span className={avgTotal > 240 ? 'text-orange-600' : avgTotal < 230 ? 'text-blue-600' : ''}>
                    {avgTotal.toFixed(1)}
                  </span>
                </td>
                <td className="text-center py-2 px-3">
                  <span className={stddev > 20 ? 'text-red-600' : 'text-green-600'}>
                    {stddev.toFixed(1)}
                  </span>
                </td>
                <td className="text-center py-2 px-3 text-muted-foreground">
                  {safeNum(mt.min_total).toFixed(0)} - {safeNum(mt.max_total).toFixed(0)}
                </td>
                <td className="py-2 px-3 text-xs text-muted-foreground">
                  {getBettingInsight(mt.matchup_type)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
