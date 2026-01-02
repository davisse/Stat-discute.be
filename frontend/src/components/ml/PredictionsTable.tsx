'use client'

import { useState } from 'react'
import type { GamePrediction } from '@/types/ml'
import { formatConfidence, formatExpectedValue, getConfidenceColor, getEVColor } from '@/lib/ml-api'

interface PredictionsTableProps {
  predictions: GamePrediction[]
  highConfidenceIds?: string[]
  showModelDetails?: boolean
}

type SortField = 'matchup' | 'line' | 'prediction' | 'confidence' | 'expectedValue' | 'odds'
type SortDirection = 'asc' | 'desc'

export function PredictionsTable({
  predictions,
  highConfidenceIds = [],
  showModelDetails = true,
}: PredictionsTableProps) {
  const [sortField, setSortField] = useState<SortField>('confidence')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedPredictions = [...predictions].sort((a, b) => {
    let aVal: number | string = a[sortField]
    let bVal: number | string = b[sortField]

    if (typeof aVal === 'string') {
      const comparison = aVal.localeCompare(bVal as string)
      return sortDirection === 'asc' ? comparison : -comparison
    }

    return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal
  })

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-white">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  )

  if (predictions.length === 0) {
    return (
      <div className="bg-gray-950 rounded-lg p-8 text-center">
        <p className="text-gray-400">No predictions available for today</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <SortHeader field="matchup">Matchup</SortHeader>
            <SortHeader field="line">Line</SortHeader>
            <SortHeader field="prediction">Pick</SortHeader>
            <SortHeader field="confidence">Conf.</SortHeader>
            {showModelDetails && (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Log.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  XGB
                </th>
              </>
            )}
            <SortHeader field="odds">Odds</SortHeader>
            <SortHeader field="expectedValue">EV</SortHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {sortedPredictions.map((p) => {
            const isHighConfidence = highConfidenceIds.includes(p.gameId)
            return (
              <tr
                key={p.gameId}
                className={`hover:bg-gray-900 transition-colors ${
                  isHighConfidence ? 'bg-gray-900/50' : ''
                }`}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-white">{p.matchup}</span>
                    {isHighConfidence && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 font-medium">
                        HC
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap font-mono text-sm text-gray-300">
                  {p.line.toFixed(1)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`font-mono text-sm font-medium ${
                      p.prediction === 'OVER' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {p.prediction}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`font-mono text-sm font-medium ${getConfidenceColor(p.confidence)}`}>
                    {formatConfidence(p.confidence)}
                  </span>
                </td>
                {showModelDetails && (
                  <>
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                      {(p.logisticProb * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                      {(p.xgboostProb * 100).toFixed(1)}%
                    </td>
                  </>
                )}
                <td className="px-4 py-4 whitespace-nowrap font-mono text-sm text-gray-300">
                  {p.odds.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`font-mono text-sm font-medium ${getEVColor(p.expectedValue)}`}>
                    {formatExpectedValue(p.expectedValue)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default PredictionsTable
