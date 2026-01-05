'use client'

import { type TeamDefenseGame } from '@/lib/queries'
import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface GameDetailsTableProps {
  games: TeamDefenseGame[]
  avgOpponentPpg: number
}

export function GameDetailsTable({ games, avgOpponentPpg }: GameDetailsTableProps) {
  if (games.length === 0) {
    return (
      <div style={{
        background: colors.neutral[950],
        border: `1px solid ${colors.neutral[800]}`,
        borderRadius: radius.lg,
        padding: spacing[12],
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>📋</div>
        <div style={{
          fontSize: typography.sizes.lg,
          color: colors.text.primary,
          marginBottom: spacing[2]
        }}>
          No games to display
        </div>
        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[500]
        }}>
          Select a team to view game details
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: colors.neutral[950],
      border: `1px solid ${colors.neutral[800]}`,
      borderRadius: radius.lg,
      padding: spacing[6],
      overflowX: 'auto'
    }}>
      {/* Table Title */}
      <h3 style={{
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        marginBottom: spacing[6]
      }}>
        Game Details
      </h3>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: typography.fonts.sans
      }}>
        <thead>
          <tr style={{
            background: colors.neutral[900],
            borderBottom: `1px solid ${colors.neutral[800]}`
          }}>
            <th style={{
              padding: spacing[3],
              textAlign: 'left',
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              color: colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Date
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'left',
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              color: colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Opponent
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'center',
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              color: colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Location
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'right',
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              color: colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Score
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'right',
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              color: colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Opp PTS
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'center',
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              color: colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Result
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'right',
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              color: colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Diff
            </th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => {
            const isAboveAvg = game.points_allowed > avgOpponentPpg
            const result = game.team_points > game.points_allowed ? 'W' : 'L'
            const pointDiff = game.team_points - game.points_allowed

            return (
              <tr
                key={game.game_id}
                style={{
                  borderBottom: `1px solid ${colors.neutral[800]}`,
                  transition: '150ms ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.neutral[900]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Date */}
                <td style={{
                  padding: spacing[3],
                  fontSize: typography.sizes.sm,
                  color: colors.neutral[400]
                }}>
                  {new Date(game.game_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>

                {/* Opponent */}
                <td style={{
                  padding: spacing[3],
                  fontSize: typography.sizes.sm,
                  color: colors.text.primary
                }}>
                  <span style={{
                    fontFamily: typography.fonts.mono,
                    fontWeight: typography.weights.semibold
                  }}>
                    {game.opponent}
                  </span>
                </td>

                {/* Location */}
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  fontSize: typography.sizes.sm,
                  fontFamily: typography.fonts.mono,
                  color: colors.neutral[400]
                }}>
                  {game.location === 'HOME' ? 'Home' : 'Away'}
                </td>

                {/* Score */}
                <td style={{
                  padding: spacing[3],
                  textAlign: 'right',
                  fontSize: typography.sizes.sm,
                  fontFamily: typography.fonts.mono,
                  color: colors.text.primary
                }}>
                  {game.team_points}-{game.points_allowed}
                </td>

                {/* Opponent Points */}
                <td style={{
                  padding: spacing[3],
                  textAlign: 'right',
                  fontSize: typography.sizes.sm,
                  fontFamily: typography.fonts.mono,
                  fontWeight: typography.weights.semibold,
                  color: isAboveAvg ? colors.negative : colors.positive
                }}>
                  {game.points_allowed}
                </td>

                {/* Result */}
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center'
                }}>
                  <span style={{
                    display: 'inline-block',
                    padding: `${spacing[1]} ${spacing[2]}`,
                    borderRadius: radius.sm,
                    fontSize: typography.sizes.xs,
                    fontFamily: typography.fonts.mono,
                    fontWeight: typography.weights.semibold,
                    background: result === 'W'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    color: result === 'W' ? colors.positive : colors.negative
                  }}>
                    {result}
                  </span>
                </td>

                {/* Point Differential */}
                <td style={{
                  padding: spacing[3],
                  textAlign: 'right',
                  fontSize: typography.sizes.sm,
                  fontFamily: typography.fonts.mono,
                  color: pointDiff > 0 ? colors.positive : pointDiff < 0 ? colors.negative : colors.neutral[400]
                }}>
                  {pointDiff > 0 ? '+' : ''}{pointDiff}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div style={{
        marginTop: spacing[6],
        paddingTop: spacing[4],
        borderTop: `1px solid ${colors.neutral[800]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[500]
        }}>
          Showing {games.length} game{games.length !== 1 ? 's' : ''}
        </div>

        <div style={{
          fontSize: typography.sizes.sm,
          fontFamily: typography.fonts.mono,
          color: colors.neutral[400]
        }}>
          Avg Opponent PPG: <span style={{
            fontWeight: typography.weights.semibold,
            color: colors.text.primary
          }}>{avgOpponentPpg.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}
