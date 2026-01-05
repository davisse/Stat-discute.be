'use client'

import { useState } from 'react'
import { type TeamDefenseGame } from '@/lib/queries'
import { colors, spacing, radius, typography, transitions } from '@/lib/design-tokens'
import { CombinedTotalChart } from './CombinedTotalChart'
import { FilterControls } from './FilterControls'

interface CombinedTotalAnalysisProps {
  games: TeamDefenseGame[]
  teamAbbreviation: string
}

export function CombinedTotalAnalysis({ games, teamAbbreviation }: CombinedTotalAnalysisProps) {
  const [totalLine, setTotalLine] = useState<number>(220)
  const [filters, setFilters] = useState<{
    location?: 'HOME' | 'AWAY'
    limit?: number
  }>({})

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

  // Calculate combined totals for each game
  const gamesWithTotals = limitedGames.map(game => {
    const combinedTotal = game.total
    const vsLine = combinedTotal > totalLine ? 'OVER' : combinedTotal < totalLine ? 'UNDER' : 'PUSH'
    const diff = combinedTotal - totalLine

    return {
      ...game,
      combinedTotal,
      vsLine,
      diff
    }
  })

  // Calculate statistics
  const totalGames = gamesWithTotals.length
  const avgTotal = totalGames > 0
    ? gamesWithTotals.reduce((sum, g) => sum + g.combinedTotal, 0) / totalGames
    : 0
  const overCount = gamesWithTotals.filter(g => g.vsLine === 'OVER').length
  const underCount = gamesWithTotals.filter(g => g.vsLine === 'UNDER').length
  const overPct = totalGames > 0 ? (overCount / totalGames) * 100 : 0

  if (totalGames === 0) {
    return null
  }

  return (
    <div style={{
      background: colors.neutral[950],
      border: `1px solid ${colors.neutral[900]}`,
      borderRadius: radius.lg,
      padding: spacing[6],
      marginBottom: spacing[8]
    }}>
      {/* Header */}
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
            Combined Total Analysis
          </h2>
          <p style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400]
          }}>
            Team Score + Opponent Score for {teamAbbreviation} games
          </p>
        </div>

        {/* Total Line Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <label style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400],
            fontWeight: typography.weights.medium
          }}>
            Betting Line:
          </label>
          <input
            type="number"
            value={totalLine}
            onChange={(e) => setTotalLine(Number(e.target.value))}
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
      <div style={{ marginBottom: spacing[6] }}>
        <FilterControls onFilterChange={setFilters} />
      </div>

      {/* Summary Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[6]
      }}>
        {/* Average Total */}
        <div style={{
          background: colors.background.primary,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.neutral[900]}`
        }}>
          <div style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400],
            marginBottom: spacing[1]
          }}>
            Average Total
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: colors.text.primary,
            fontFamily: typography.fonts.mono
          }}>
            {avgTotal.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: avgTotal > totalLine ? colors.positive : colors.negative,
            marginTop: spacing[1]
          }}>
            {avgTotal > totalLine ? `+${(avgTotal - totalLine).toFixed(1)}` : (avgTotal - totalLine).toFixed(1)} vs line
          </div>
        </div>

        {/* Over Count */}
        <div style={{
          background: colors.background.primary,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.neutral[900]}`
        }}>
          <div style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400],
            marginBottom: spacing[1]
          }}>
            Over {totalLine}
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: colors.positive,
            fontFamily: typography.fonts.mono
          }}>
            {overCount}
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500],
            marginTop: spacing[1]
          }}>
            {overPct.toFixed(1)}% of games
          </div>
        </div>

        {/* Under Count */}
        <div style={{
          background: colors.background.primary,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.neutral[900]}`
        }}>
          <div style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400],
            marginBottom: spacing[1]
          }}>
            Under {totalLine}
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: colors.negative,
            fontFamily: typography.fonts.mono
          }}>
            {underCount}
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500],
            marginTop: spacing[1]
          }}>
            {((underCount / totalGames) * 100).toFixed(1)}% of games
          </div>
        </div>

        {/* Trend */}
        <div style={{
          background: colors.background.primary,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.neutral[900]}`
        }}>
          <div style={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400],
            marginBottom: spacing[1]
          }}>
            Trend
          </div>
          <div style={{
            fontSize: typography.sizes['2xl'],
            fontWeight: typography.weights.bold,
            color: overPct > 55 ? colors.positive : overPct < 45 ? colors.negative : colors.neutral[400],
            fontFamily: typography.fonts.mono
          }}>
            {overPct > 55 ? 'OVER' : overPct < 45 ? 'UNDER' : 'EVEN'}
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500],
            marginTop: spacing[1]
          }}>
            {totalGames} games analyzed
          </div>
        </div>
      </div>

      {/* Combined Total Chart */}
      <CombinedTotalChart
        games={limitedGames}
        avgTotal={avgTotal}
        totalLine={totalLine}
      />

      {/* Games Table */}
      <div style={{
        overflowX: 'auto',
        border: `1px solid ${colors.neutral[900]}`,
        borderRadius: radius.md
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: typography.sizes.sm
        }}>
          <thead>
            <tr style={{ background: colors.background.primary }}>
              <th style={{
                padding: spacing[3],
                textAlign: 'left',
                color: colors.neutral[400],
                fontWeight: typography.weights.semibold,
                borderBottom: `1px solid ${colors.neutral[900]}`
              }}>
                Date
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'left',
                color: colors.neutral[400],
                fontWeight: typography.weights.semibold,
                borderBottom: `1px solid ${colors.neutral[900]}`
              }}>
                Opponent
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.neutral[400],
                fontWeight: typography.weights.semibold,
                borderBottom: `1px solid ${colors.neutral[900]}`
              }}>
                Location
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.neutral[400],
                fontWeight: typography.weights.semibold,
                borderBottom: `1px solid ${colors.neutral[900]}`
              }}>
                {teamAbbreviation}
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.neutral[400],
                fontWeight: typography.weights.semibold,
                borderBottom: `1px solid ${colors.neutral[900]}`
              }}>
                OPP
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.neutral[400],
                fontWeight: typography.weights.semibold,
                borderBottom: `1px solid ${colors.neutral[900]}`
              }}>
                Total
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.neutral[400],
                fontWeight: typography.weights.semibold,
                borderBottom: `1px solid ${colors.neutral[900]}`
              }}>
                vs {totalLine}
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.neutral[400],
                fontWeight: typography.weights.semibold,
                borderBottom: `1px solid ${colors.neutral[900]}`
              }}>
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {gamesWithTotals.map((game, index) => (
              <tr
                key={game.game_id}
                style={{
                  background: index % 2 === 0 ? colors.background.primary : 'transparent',
                  transition: transitions.presets.fast
                }}
              >
                <td style={{
                  padding: spacing[3],
                  color: colors.neutral[400],
                  fontFamily: typography.fonts.mono,
                  fontSize: typography.sizes.xs
                }}>
                  {new Date(game.game_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td style={{
                  padding: spacing[3],
                  color: colors.text.primary,
                  fontFamily: typography.fonts.mono,
                  fontWeight: typography.weights.semibold
                }}>
                  {game.opponent}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: colors.neutral[400],
                  fontSize: typography.sizes.xs
                }}>
                  {game.location === 'HOME' ? 'vs' : '@'}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: colors.text.primary,
                  fontFamily: typography.fonts.mono,
                  fontWeight: typography.weights.bold
                }}>
                  {game.team_points}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: colors.neutral[400],
                  fontFamily: typography.fonts.mono
                }}>
                  {game.points_allowed}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: colors.text.primary,
                  fontFamily: typography.fonts.mono,
                  fontWeight: typography.weights.bold,
                  fontSize: typography.sizes.base
                }}>
                  {game.combinedTotal}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: game.diff > 0 ? colors.positive : colors.negative,
                  fontFamily: typography.fonts.mono,
                  fontWeight: typography.weights.semibold
                }}>
                  {game.diff > 0 ? '+' : ''}{game.diff}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center'
                }}>
                  <span style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    borderRadius: radius.sm,
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.bold,
                    fontFamily: typography.fonts.mono,
                    background: game.vsLine === 'OVER'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : game.vsLine === 'UNDER'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : colors.neutral[800],
                    color: game.vsLine === 'OVER'
                      ? colors.positive
                      : game.vsLine === 'UNDER'
                        ? colors.negative
                        : colors.neutral[400]
                  }}>
                    {game.vsLine}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
