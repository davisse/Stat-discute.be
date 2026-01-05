'use client'

import { useState } from 'react'
import { type TeamDefenseGame } from '@/lib/queries'
import { OpponentScoringChart } from './OpponentScoringChart'
import { GameDetailsTable } from './GameDetailsTable'
import { FilterControls } from './FilterControls'
import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface OpponentScoringSectionProps {
  games: TeamDefenseGame[]
  avgOpponentPpg: number
}

export function OpponentScoringSection({ games, avgOpponentPpg }: OpponentScoringSectionProps) {
  const [filters, setFilters] = useState<{
    location?: 'HOME' | 'AWAY'
    limit?: number
  }>({})
  const [opponentLine, setOpponentLine] = useState<string>('115')

  // Apply filters to games
  const filteredGames = games.filter(game => {
    // Location filter
    if (filters.location && game.location !== filters.location) {
      return false
    }
    return true
  })

  // Apply limit
  const limitedGames = filters.limit
    ? filteredGames.slice(0, filters.limit)
    : filteredGames

  return (
    <div style={{
      background: colors.neutral[950],
      border: `1px solid ${colors.neutral[900]}`,
      borderRadius: radius.lg,
      padding: spacing[6],
      marginBottom: spacing[8]
    }}>
      {/* Header with Betting Line Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[6],
        flexWrap: 'wrap',
        gap: spacing[4]
      }}>
        <div>
          <h2 style={{
            fontSize: typography.sizes['2xl'],
            fontWeight: typography.weights.bold,
            color: colors.text.primary,
            marginBottom: spacing[1]
          }}>
            Opponent Scoring by Game
          </h2>
          <p style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400]
          }}>
            Points allowed per game
          </p>
        </div>

        {/* Betting Line Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <label style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400],
            fontWeight: typography.weights.medium
          }}>
            Betting Line:
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={opponentLine}
            onChange={(e) => {
              const value = e.target.value
              // Allow empty, numbers, and decimals
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setOpponentLine(value)
              }
            }}
            style={{
              width: '100px',
              padding: `${spacing[2]} ${spacing[3]}`,
              background: colors.background.primary,
              border: `1px solid ${colors.neutral[800]}`,
              borderRadius: radius.md,
              color: colors.text.primary,
              fontSize: typography.sizes.base,
              fontFamily: typography.fonts.mono,
              textAlign: 'center',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <FilterControls onFilterChange={setFilters} />

      {/* Chart */}
      <div style={{ marginBottom: spacing[6] }}>
        <OpponentScoringChart
          games={limitedGames}
          avgOpponentPpg={avgOpponentPpg}
          opponentLine={opponentLine ? parseFloat(opponentLine) : undefined}
        />
      </div>

      {/* Game Details Table */}
      <GameDetailsTable
        games={limitedGames}
        avgOpponentPpg={avgOpponentPpg}
      />
    </div>
  )
}
