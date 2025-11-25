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
    const combinedTotal = game.team_score + game.opponent_score
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
      background: colors.gray[950],
      border: `1px solid ${colors.gray[900]}`,
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
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.foreground,
            marginBottom: spacing[1]
          }}>
            Combined Total Analysis
          </h2>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400]
          }}>
            Team Score + Opponent Score for {teamAbbreviation} games
          </p>
        </div>

        {/* Total Line Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <label style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400],
            fontWeight: typography.fontWeight.medium
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
              background: colors.background,
              border: `1px solid ${colors.gray[800]}`,
              borderRadius: radius.md,
              color: colors.foreground,
              fontSize: typography.fontSize.base,
              fontFamily: typography.fontMono,
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
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.gray[900]}`
        }}>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400],
            marginBottom: spacing[1]
          }}>
            Average Total
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.foreground,
            fontFamily: typography.fontMono
          }}>
            {avgTotal.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: avgTotal > totalLine ? colors.positive : colors.negative,
            marginTop: spacing[1]
          }}>
            {avgTotal > totalLine ? `+${(avgTotal - totalLine).toFixed(1)}` : (avgTotal - totalLine).toFixed(1)} vs line
          </div>
        </div>

        {/* Over Count */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.gray[900]}`
        }}>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400],
            marginBottom: spacing[1]
          }}>
            Over {totalLine}
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.positive,
            fontFamily: typography.fontMono
          }}>
            {overCount}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500],
            marginTop: spacing[1]
          }}>
            {overPct.toFixed(1)}% of games
          </div>
        </div>

        {/* Under Count */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.gray[900]}`
        }}>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400],
            marginBottom: spacing[1]
          }}>
            Under {totalLine}
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.negative,
            fontFamily: typography.fontMono
          }}>
            {underCount}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500],
            marginTop: spacing[1]
          }}>
            {((underCount / totalGames) * 100).toFixed(1)}% of games
          </div>
        </div>

        {/* Trend */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.gray[900]}`
        }}>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400],
            marginBottom: spacing[1]
          }}>
            Trend
          </div>
          <div style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: overPct > 55 ? colors.positive : overPct < 45 ? colors.negative : colors.gray[400],
            fontFamily: typography.fontMono
          }}>
            {overPct > 55 ? 'OVER' : overPct < 45 ? 'UNDER' : 'EVEN'}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500],
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
        border: `1px solid ${colors.gray[900]}`,
        borderRadius: radius.md
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: typography.fontSize.sm
        }}>
          <thead>
            <tr style={{ background: colors.background }}>
              <th style={{
                padding: spacing[3],
                textAlign: 'left',
                color: colors.gray[400],
                fontWeight: typography.fontWeight.semibold,
                borderBottom: `1px solid ${colors.gray[900]}`
              }}>
                Date
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'left',
                color: colors.gray[400],
                fontWeight: typography.fontWeight.semibold,
                borderBottom: `1px solid ${colors.gray[900]}`
              }}>
                Opponent
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.gray[400],
                fontWeight: typography.fontWeight.semibold,
                borderBottom: `1px solid ${colors.gray[900]}`
              }}>
                Location
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.gray[400],
                fontWeight: typography.fontWeight.semibold,
                borderBottom: `1px solid ${colors.gray[900]}`
              }}>
                {teamAbbreviation}
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.gray[400],
                fontWeight: typography.fontWeight.semibold,
                borderBottom: `1px solid ${colors.gray[900]}`
              }}>
                OPP
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.gray[400],
                fontWeight: typography.fontWeight.semibold,
                borderBottom: `1px solid ${colors.gray[900]}`
              }}>
                Total
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.gray[400],
                fontWeight: typography.fontWeight.semibold,
                borderBottom: `1px solid ${colors.gray[900]}`
              }}>
                vs {totalLine}
              </th>
              <th style={{
                padding: spacing[3],
                textAlign: 'center',
                color: colors.gray[400],
                fontWeight: typography.fontWeight.semibold,
                borderBottom: `1px solid ${colors.gray[900]}`
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
                  background: index % 2 === 0 ? colors.background : 'transparent',
                  transition: transitions.fast
                }}
              >
                <td style={{
                  padding: spacing[3],
                  color: colors.gray[400],
                  fontFamily: typography.fontMono,
                  fontSize: typography.fontSize.xs
                }}>
                  {new Date(game.game_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td style={{
                  padding: spacing[3],
                  color: colors.foreground,
                  fontFamily: typography.fontMono,
                  fontWeight: typography.fontWeight.semibold
                }}>
                  {game.opponent_abbr}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: colors.gray[400],
                  fontSize: typography.fontSize.xs
                }}>
                  {game.location === 'HOME' ? 'vs' : '@'}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: colors.foreground,
                  fontFamily: typography.fontMono,
                  fontWeight: typography.fontWeight.bold
                }}>
                  {game.team_score}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: colors.gray[400],
                  fontFamily: typography.fontMono
                }}>
                  {game.opponent_score}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: colors.foreground,
                  fontFamily: typography.fontMono,
                  fontWeight: typography.fontWeight.bold,
                  fontSize: typography.fontSize.base
                }}>
                  {game.combinedTotal}
                </td>
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  color: game.diff > 0 ? colors.positive : colors.negative,
                  fontFamily: typography.fontMono,
                  fontWeight: typography.fontWeight.semibold
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
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    fontFamily: typography.fontMono,
                    background: game.vsLine === 'OVER'
                      ? colors.positiveBg
                      : game.vsLine === 'UNDER'
                        ? colors.negativeBg
                        : colors.gray[800],
                    color: game.vsLine === 'OVER'
                      ? colors.positive
                      : game.vsLine === 'UNDER'
                        ? colors.negative
                        : colors.gray[400]
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
