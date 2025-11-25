/**
 * ComparisonWidget - Compare two players side-by-side
 *
 * Phase 1 MVP: Mock data
 * Phase 2: Real data from database
 *
 * Configuration:
 * - 2 player selections
 * - Stats to compare
 * - Period (season, last10, last30)
 * - Size (2x1 or 2x2)
 *
 * Design System: STAT-DISCUTE monochrome strict
 * Font: JetBrains Mono for numbers
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { WidgetConfig } from '../../types'

interface ComparisonWidgetProps {
  config: WidgetConfig
}

// Mock data for Phase 1 MVP
const MOCK_COMPARISON_DATA = {
  player1: {
    name: 'LeBron James',
    team: 'LAL',
    stats: {
      ppg: 28.5,
      rpg: 7.3,
      apg: 8.8,
      fgPct: 52.4,
    },
  },
  player2: {
    name: 'Jayson Tatum',
    team: 'BOS',
    stats: {
      ppg: 27.0,
      rpg: 8.6,
      apg: 4.9,
      fgPct: 48.2,
    },
  },
}

export function ComparisonWidget({ config }: ComparisonWidgetProps) {
  // Phase 1: Use mock data
  // Phase 2: Fetch real data based on config.playerIds and config.period
  const { player1, player2 } = MOCK_COMPARISON_DATA

  return (
    <div className="flex flex-col h-full">
      {/* Player Headers */}
      <div className="grid grid-cols-2 gap-[var(--space-4)] mb-[var(--space-4)]">
        {/* Player 1 */}
        <PlayerHeader name={player1.name} team={player1.team} />

        {/* Player 2 */}
        <PlayerHeader name={player2.name} team={player2.team} />
      </div>

      {/* Stats Comparison */}
      <div className="flex flex-col gap-[var(--space-3)] flex-1">
        <ComparisonRow
          label="PPG"
          value1={player1.stats.ppg}
          value2={player2.stats.ppg}
          format="decimal"
        />

        <ComparisonRow
          label="RPG"
          value1={player1.stats.rpg}
          value2={player2.stats.rpg}
          format="decimal"
        />

        <ComparisonRow
          label="APG"
          value1={player1.stats.apg}
          value2={player2.stats.apg}
          format="decimal"
        />

        <ComparisonRow
          label="FG%"
          value1={player1.stats.fgPct}
          value2={player2.stats.fgPct}
          format="percentage"
        />
      </div>
    </div>
  )
}

/**
 * PlayerHeader Component
 */
interface PlayerHeaderProps {
  name: string
  team: string
}

function PlayerHeader({ name, team }: PlayerHeaderProps) {
  return (
    <div>
      <div
        className="text-[var(--text-base)] text-white font-medium truncate"
        style={{ fontFamily: 'var(--font-family-sans)' }}
      >
        {name}
      </div>
      <div
        className="text-[var(--text-sm)] text-[var(--color-gray-400)]"
        style={{ fontFamily: 'var(--font-family-sans)' }}
      >
        {team}
      </div>
    </div>
  )
}

/**
 * ComparisonRow Component - Single stat comparison
 */
interface ComparisonRowProps {
  label: string
  value1: number
  value2: number
  format: 'decimal' | 'percentage'
}

function ComparisonRow({ label, value1, value2, format }: ComparisonRowProps) {
  const formattedValue1 =
    format === 'percentage' ? `${value1.toFixed(1)}%` : value1.toFixed(1)
  const formattedValue2 =
    format === 'percentage' ? `${value2.toFixed(1)}%` : value2.toFixed(1)

  // Determine which value is higher for emphasis
  const value1Higher = value1 > value2
  const value2Higher = value2 > value1

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-[var(--space-3)] items-center">
      {/* Player 1 Value */}
      <div
        className={cn(
          'text-[var(--text-lg)] font-medium text-right tabular-nums',
          value1Higher ? 'text-white' : 'text-[var(--color-gray-400)]',
        )}
        style={{ fontFamily: 'var(--font-family-mono)' }}
      >
        {formattedValue1}
      </div>

      {/* Stat Label */}
      <div
        className="text-[var(--text-sm)] text-[var(--color-gray-500)] px-[var(--space-2)]"
        style={{ fontFamily: 'var(--font-family-sans)' }}
      >
        {label}
      </div>

      {/* Player 2 Value */}
      <div
        className={cn(
          'text-[var(--text-lg)] font-medium text-left tabular-nums',
          value2Higher ? 'text-white' : 'text-[var(--color-gray-400)]',
        )}
        style={{ fontFamily: 'var(--font-family-mono)' }}
      >
        {formattedValue2}
      </div>
    </div>
  )
}
