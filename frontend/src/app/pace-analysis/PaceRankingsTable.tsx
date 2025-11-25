'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

type SortDirection = 'asc' | 'desc' | null

interface PaceRanking {
  team_id: number
  team: string
  pace: number | string
  rank: number | string
  ppg: number | string
  opp_ppg: number | string
  l3_ppg: number | string
  l10_ppg: number | string
  avg_total: number | string
  l3_total: number | string
  l10_total: number | string
  off_rtg: number | string
  games: number
}

interface PaceRankingsTableProps {
  data: PaceRanking[]
  leagueAvgPace: number
  leagueAvgTotal: number
}

// Helper to safely format numbers (handles PostgreSQL numeric type)
const safeNum = (val: number | string | null | undefined): number => {
  if (val === null || val === undefined) return 0
  const num = typeof val === 'string' ? parseFloat(val) : val
  return isNaN(num) ? 0 : num
}

const getPaceTier = (pace: number) => {
  if (pace < 99) return { label: 'SLOW', color: 'text-blue-600', bg: 'bg-blue-100' }
  if (pace < 102) return { label: 'AVG', color: 'text-gray-600', bg: 'bg-gray-100' }
  return { label: 'FAST', color: 'text-orange-600', bg: 'bg-orange-100' }
}

type SortKey = 'rank' | 'team' | 'pace' | 'ppg' | 'l3_ppg' | 'l10_ppg' | 'avg_total' | 'l3_total' | 'l10_total' | 'off_rtg'

interface Column {
  key: SortKey
  label: string
  align: 'left' | 'center'
}

const columns: Column[] = [
  { key: 'rank', label: 'Rk', align: 'left' },
  { key: 'team', label: 'Team', align: 'left' },
  { key: 'pace', label: 'Pace', align: 'center' },
  { key: 'ppg', label: 'PPG', align: 'center' },
  { key: 'l3_ppg', label: 'L3', align: 'center' },
  { key: 'l10_ppg', label: 'L10', align: 'center' },
  { key: 'avg_total', label: 'Avg Tot', align: 'center' },
  { key: 'l3_total', label: 'L3 Tot', align: 'center' },
  { key: 'l10_total', label: 'L10 Tot', align: 'center' },
  { key: 'off_rtg', label: 'ORTG', align: 'center' },
]

export function PaceRankingsTable({ data, leagueAvgPace, leagueAvgTotal }: PaceRankingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('pace')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortKey('pace') // Reset to default
        setSortDirection('asc')
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data

    return [...data].sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      if (sortKey === 'team') {
        aVal = a.team
        bVal = b.team
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

  return (
    <>
      <div className="text-xs text-muted-foreground mb-3">
        League Average: Pace {leagueAvgPace.toFixed(1)} | Total {leagueAvgTotal.toFixed(1)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2 px-2 cursor-pointer hover:bg-muted select-none ${
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
              <th className="text-center py-2 px-2">Tier</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((team, index) => {
              const pace = safeNum(team.pace)
              const tier = getPaceTier(pace)
              const avgTotal = safeNum(team.avg_total)
              return (
                <tr key={team.team} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-2 text-muted-foreground">{index + 1}</td>
                  <td className="py-2 px-2 font-medium">{team.team}</td>
                  <td className="text-center py-2 px-2 font-bold">{pace.toFixed(1)}</td>
                  <td className="text-center py-2 px-2">{safeNum(team.ppg).toFixed(1)}</td>
                  <td className="text-center py-2 px-2 text-muted-foreground">{safeNum(team.l3_ppg).toFixed(1)}</td>
                  <td className="text-center py-2 px-2 text-muted-foreground">{safeNum(team.l10_ppg).toFixed(1)}</td>
                  <td className="text-center py-2 px-2 font-medium">
                    <span className={avgTotal > 240 ? 'text-orange-600' : avgTotal < 230 ? 'text-blue-600' : ''}>
                      {avgTotal.toFixed(1)}
                    </span>
                  </td>
                  <td className="text-center py-2 px-2 text-muted-foreground">{safeNum(team.l3_total).toFixed(1)}</td>
                  <td className="text-center py-2 px-2 text-muted-foreground">{safeNum(team.l10_total).toFixed(1)}</td>
                  <td className="text-center py-2 px-2">{safeNum(team.off_rtg).toFixed(1)}</td>
                  <td className="text-center py-2 px-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tier.bg} ${tier.color}`}>
                      {tier.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
