/**
 * PlayerStatsWidget - Display key player statistics
 *
 * Phase 1 MVP: Mock data
 * Phase 2: Real data from database
 *
 * Configuration:
 * - Player selection
 * - Period (season, last10, last30)
 * - Stats to display (PPG, RPG, APG, FG%, etc.)
 * - Size (1x1 or 2x1)
 *
 * Design System: STAT-DISCUTE monochrome strict
 * Font: JetBrains Mono for numbers
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { WidgetConfig } from '../../types'

interface PlayerStatsWidgetProps {
  config: WidgetConfig
}

// Mock data for Phase 1 MVP
const MOCK_PLAYER_DATA = {
  playerName: 'LeBron James',
  team: 'LAL',
  stats: {
    ppg: 28.5,
    rpg: 7.3,
    apg: 8.8,
    fgPct: 52.4,
    fg3Pct: 38.2,
    ftPct: 75.6,
  },
}

export function PlayerStatsWidget({ config }: PlayerStatsWidgetProps) {
  // Phase 1: Use mock data
  // Phase 2: Fetch real data based on config.playerId and config.period
  const player = MOCK_PLAYER_DATA

  return (
    <div className="flex flex-col h-full">
      {/* Player Info */}
      <div className="mb-[var(--space-4)]">
        <div
          className="text-[var(--text-base)] text-white font-medium"
          style={{ fontFamily: 'var(--font-family-sans)' }}
        >
          {player.playerName}
        </div>
        <div
          className="text-[var(--text-sm)] text-[var(--color-gray-400)]"
          style={{ fontFamily: 'var(--font-family-sans)' }}
        >
          {player.team} · {config.period || 'Saison 2025-26'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-[var(--space-4)] flex-1">
        {/* PPG */}
        <StatItem
          label="PPG"
          value={player.stats.ppg}
          format="decimal"
        />

        {/* RPG */}
        <StatItem
          label="RPG"
          value={player.stats.rpg}
          format="decimal"
        />

        {/* APG */}
        <StatItem
          label="APG"
          value={player.stats.apg}
          format="decimal"
        />

        {/* FG% */}
        <StatItem
          label="FG%"
          value={player.stats.fgPct}
          format="percentage"
        />

        {/* 3P% */}
        <StatItem
          label="3P%"
          value={player.stats.fg3Pct}
          format="percentage"
        />

        {/* FT% */}
        <StatItem
          label="FT%"
          value={player.stats.ftPct}
          format="percentage"
        />
      </div>
    </div>
  )
}

/**
 * StatItem Component - Single stat display
 */
interface StatItemProps {
  label: string
  value: number
  format: 'decimal' | 'percentage'
}

function StatItem({ label, value, format }: StatItemProps) {
  const formattedValue =
    format === 'percentage' ? `${value.toFixed(1)}%` : value.toFixed(1)

  return (
    <div className="flex flex-col">
      <div
        className="text-[var(--text-sm)] text-[var(--color-gray-400)] mb-1"
        style={{ fontFamily: 'var(--font-family-sans)' }}
      >
        {label}
      </div>
      <div
        className={cn(
          'text-[var(--text-xl)] text-white font-medium',
          'tabular-nums', // Ensure aligned numbers
        )}
        style={{ fontFamily: 'var(--font-family-mono)' }}
      >
        {formattedValue}
      </div>
    </div>
  )
}
