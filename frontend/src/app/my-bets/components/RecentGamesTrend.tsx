'use client'

import { useState, useEffect } from 'react'
import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface RecentGame {
  game_date: string
  home_team_abbr: string
  away_team_abbr: string
  home_team_score: number
  away_team_score: number
  combined_total: number
}

interface RecentGamesTrendProps {
  teamAbbreviation: string
  playerId: number
  playerName: string
  bettingLine: number
  limit?: number  // Number of recent games to show (default 6)
  location?: 'HOME' | 'AWAY'  // Optional location filter
}

export function RecentGamesTrend({
  teamAbbreviation,
  playerId,
  playerName,
  bettingLine,
  limit = 6,
  location
}: RecentGamesTrendProps) {
  const [games, setGames] = useState<RecentGame[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchGames() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          action: 'recent-games-without-player',
          teamAbbr: teamAbbreviation,
          playerId: playerId.toString(),
          limit: limit.toString()
        })

        if (location) {
          params.append('location', location)
        }

        const response = await fetch(`/api/my-bets?${params}`)
        const data = await response.json()

        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setGames(data)
        } else {
          console.error('API returned non-array data:', data)
          setGames([])
        }
      } catch (error) {
        console.error('Failed to fetch recent games:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [teamAbbreviation, playerId, limit, location])

  if (isLoading) {
    return (
      <div style={{
        background: colors.background.card,
        padding: spacing[6],
        borderRadius: radius.md,
        textAlign: 'center',
        color: colors.neutral[500]
      }}>
        Loading recent games trend...
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div style={{
        background: colors.background.card,
        padding: spacing[6],
        borderRadius: radius.md,
        textAlign: 'center',
        color: colors.neutral[500]
      }}>
        No games found without {playerName}
      </div>
    )
  }

  // Calculate average
  const average = games.reduce((sum, g) => sum + g.combined_total, 0) / games.length

  // Calculate min/max for chart scaling
  const allValues = games.map(g => g.combined_total)
  const minValue = Math.min(...allValues, bettingLine) - 10
  const maxValue = Math.max(...allValues, bettingLine) + 10
  const range = maxValue - minValue

  // Count games under the betting line
  const gamesUnder = games.filter(g => g.combined_total < bettingLine).length
  const hitRate = (gamesUnder / games.length) * 100

  return (
    <div>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[4]
      }}>
        {/* Average Card */}
        <div style={{
          background: colors.background.card,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.neutral[900]}`
        }}>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            AVERAGE (LAST {games.length} GAMES)
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: average < bettingLine ? colors.betting.positive : colors.betting.negative,
            fontFamily: typography.fonts.mono,
            marginBottom: spacing[1]
          }}>
            {average.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500]
          }}>
            Combined Total
          </div>
        </div>

        {/* Hit Rate Card */}
        <div style={{
          background: colors.background.card,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.neutral[900]}`
        }}>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            UNDER HIT RATE
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: hitRate >= 70 ? colors.betting.positive : hitRate >= 50 ? colors.text.primary : colors.betting.negative,
            fontFamily: typography.fonts.mono,
            marginBottom: spacing[1]
          }}>
            {hitRate.toFixed(0)}%
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500]
          }}>
            {gamesUnder}/{games.length} games under {Number(bettingLine).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div style={{
        background: colors.background.card,
        padding: spacing[4],
        borderRadius: radius.md,
        border: `1px solid ${colors.neutral[900]}`
      }}>
        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[400],
          marginBottom: spacing[4],
          fontWeight: typography.weights.medium
        }}>
          Recent Form Without {playerName} {location ? `(${location === 'HOME' ? 'Home' : 'Away'} Games)` : ''}
        </div>

        {/* Chart Container */}
        <div style={{
          position: 'relative',
          height: '300px',
          marginBottom: spacing[4]
        }}>
          {/* Betting Line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${((bettingLine - minValue) / range) * 100}%`,
            height: '2px',
            background: colors.neutral[700],
            opacity: 0.5,
            zIndex: 1
          }} />
          <div style={{
            position: 'absolute',
            right: spacing[2],
            bottom: `${((bettingLine - minValue) / range) * 100}%`,
            transform: 'translateY(50%)',
            fontSize: typography.sizes.xs,
            color: colors.neutral[500],
            fontFamily: typography.fonts.mono,
            background: colors.background.card,
            padding: `${spacing[1]} ${spacing[2]}`,
            borderRadius: radius.sm,
            zIndex: 2
          }}>
            Line: {Number(bettingLine).toFixed(1)}
          </div>

          {/* Average Line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${((average - minValue) / range) * 100}%`,
            height: '1px',
            background: average < bettingLine ? colors.betting.positive : colors.betting.negative,
            opacity: 0.3,
            zIndex: 1,
            borderTop: `1px dashed ${average < bettingLine ? colors.betting.positive : colors.betting.negative}`
          }} />

          {/* Data Points and Line */}
          <svg style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 2
          }}>
            {/* Connect points with line */}
            {games.map((game, index) => {
              if (index === games.length - 1) return null

              const x1 = ((index + 0.5) / games.length) * 100
              const y1 = 100 - ((game.combined_total - minValue) / range) * 100
              const nextGame = games[index + 1]
              const x2 = ((index + 1.5) / games.length) * 100
              const y2 = 100 - ((nextGame.combined_total - minValue) / range) * 100

              return (
                <line
                  key={`line-${index}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke={colors.text.primary}
                  strokeWidth="2"
                  opacity="0.5"
                />
              )
            })}

            {/* Data points */}
            {games.map((game, index) => {
              const x = ((index + 0.5) / games.length) * 100
              const y = 100 - ((game.combined_total - minValue) / range) * 100
              const isUnder = game.combined_total < bettingLine

              return (
                <g key={`point-${index}`}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="6"
                    fill={isUnder ? colors.betting.positive : colors.betting.negative}
                    stroke={colors.background.card}
                    strokeWidth="2"
                  />
                  <text
                    x={`${x}%`}
                    y={`${y - 3}%`}
                    textAnchor="middle"
                    fontSize={typography.sizes.xs}
                    fill={colors.text.primary}
                    fontFamily={typography.fonts.mono}
                    fontWeight={typography.weights.bold}
                  >
                    {game.combined_total}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Game Labels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${games.length}, 1fr)`,
          gap: spacing[2]
        }}>
          {games.map((game, index) => {
            const date = new Date(game.game_date)
            const monthDay = `${date.getMonth() + 1}/${date.getDate()}`
            const isUnder = game.combined_total < bettingLine

            return (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  fontSize: typography.sizes.xs,
                  color: colors.neutral[400]
                }}
              >
                <div style={{ marginBottom: spacing[1] }}>{monthDay}</div>
                <div style={{
                  fontSize: typography.sizes.xs,
                  color: isUnder ? colors.betting.positive : colors.betting.negative,
                  fontWeight: typography.weights.semibold
                }}>
                  {game.home_team_abbr} vs {game.away_team_abbr}
                </div>
                <div style={{
                  fontSize: typography.sizes.xs,
                  color: colors.neutral[500],
                  fontFamily: typography.fonts.mono
                }}>
                  {game.home_team_score}-{game.away_team_score}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Analysis Summary */}
      <div style={{
        marginTop: spacing[4],
        padding: spacing[3],
        background: colors.background.card,
        borderRadius: radius.md,
        border: `1px solid ${colors.neutral[900]}`,
        fontSize: typography.sizes.sm,
        color: colors.neutral[400]
      }}>
        <strong>Recent Form Analysis:</strong> {location === 'HOME' ? 'At home' : location === 'AWAY' ? 'Away' : ''} without {playerName},
        {' '}{teamAbbreviation} averaged{' '}
        <span style={{ color: colors.text.primary, fontFamily: typography.fonts.mono, fontWeight: typography.weights.bold }}>
          {average.toFixed(1)} combined points
        </span>
        {' '}over the last {games.length} games.
        {' '}{gamesUnder}/{games.length} games went UNDER{' '}
        <span style={{ fontFamily: typography.fonts.mono, fontWeight: typography.weights.bold }}>
          {Number(bettingLine).toFixed(1)}
        </span>
        {' '}({hitRate.toFixed(0)}% hit rate).
        {' '}
        {hitRate >= 70 ? (
          <span style={{ color: colors.betting.positive, fontWeight: typography.weights.semibold }}>Strong UNDER trend</span>
        ) : hitRate >= 50 ? (
          <span style={{ color: colors.text.primary, fontWeight: typography.weights.semibold }}>Moderate UNDER lean</span>
        ) : (
          <span style={{ color: colors.betting.negative, fontWeight: typography.weights.semibold }}>Favors OVER</span>
        )}
      </div>
    </div>
  )
}
