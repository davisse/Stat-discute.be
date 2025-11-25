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
        background: colors.gray[950],
        border: `1px solid ${colors.gray[800]}`,
        borderRadius: radius.lg,
        padding: spacing[12],
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>📋</div>
        <div style={{
          fontSize: typography.fontSize.lg,
          color: colors.foreground,
          marginBottom: spacing[2]
        }}>
          No games to display
        </div>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[500]
        }}>
          Select a team to view game details
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: colors.gray[950],
      border: `1px solid ${colors.gray[800]}`,
      borderRadius: radius.lg,
      padding: spacing[6],
      overflowX: 'auto'
    }}>
      {/* Table Title */}
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.foreground,
        marginBottom: spacing[6]
      }}>
        Game Details
      </h3>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: typography.fontSans
      }}>
        <thead>
          <tr style={{
            background: colors.gray[900],
            borderBottom: `1px solid ${colors.gray[800]}`
          }}>
            <th style={{
              padding: spacing[3],
              textAlign: 'left',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Date
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'left',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Opponent
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'center',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Location
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'right',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Score
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'right',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Opp PTS
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'center',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Result
            </th>
            <th style={{
              padding: spacing[3],
              textAlign: 'right',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[400],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Diff
            </th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => {
            const isAboveAvg = game.opponent_score > avgOpponentPpg

            return (
              <tr
                key={game.game_id}
                style={{
                  borderBottom: `1px solid ${colors.gray[800]}`,
                  transition: '150ms ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.gray[900]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Date */}
                <td style={{
                  padding: spacing[3],
                  fontSize: typography.fontSize.sm,
                  color: colors.gray[400]
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
                  fontSize: typography.fontSize.sm,
                  color: colors.foreground
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                    <span style={{
                      fontFamily: typography.fontMono,
                      fontWeight: typography.fontWeight.semibold,
                      fontSize: typography.fontSize.xs,
                      color: colors.gray[500]
                    }}>
                      {game.opponent_abbr}
                    </span>
                    <span>{game.opponent_full_name}</span>
                  </div>
                </td>

                {/* Location */}
                <td style={{
                  padding: spacing[3],
                  textAlign: 'center',
                  fontSize: typography.fontSize.sm,
                  fontFamily: typography.fontMono,
                  color: colors.gray[400]
                }}>
                  {game.location === 'HOME' ? 'Home' : 'Away'}
                </td>

                {/* Score */}
                <td style={{
                  padding: spacing[3],
                  textAlign: 'right',
                  fontSize: typography.fontSize.sm,
                  fontFamily: typography.fontMono,
                  color: colors.foreground
                }}>
                  {game.team_score}-{game.opponent_score}
                </td>

                {/* Opponent Points */}
                <td style={{
                  padding: spacing[3],
                  textAlign: 'right',
                  fontSize: typography.fontSize.sm,
                  fontFamily: typography.fontMono,
                  fontWeight: typography.fontWeight.semibold,
                  color: isAboveAvg ? colors.negative : colors.positive
                }}>
                  {game.opponent_score}
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
                    fontSize: typography.fontSize.xs,
                    fontFamily: typography.fontMono,
                    fontWeight: typography.fontWeight.semibold,
                    background: game.result === 'W'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    color: game.result === 'W' ? colors.positive : colors.negative
                  }}>
                    {game.result}
                  </span>
                </td>

                {/* Point Differential */}
                <td style={{
                  padding: spacing[3],
                  textAlign: 'right',
                  fontSize: typography.fontSize.sm,
                  fontFamily: typography.fontMono,
                  color: game.point_diff > 0 ? colors.positive : game.point_diff < 0 ? colors.negative : colors.gray[400]
                }}>
                  {game.point_diff > 0 ? '+' : ''}{game.point_diff}
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
        borderTop: `1px solid ${colors.gray[800]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[500]
        }}>
          Showing {games.length} game{games.length !== 1 ? 's' : ''}
        </div>

        <div style={{
          fontSize: typography.fontSize.sm,
          fontFamily: typography.fontMono,
          color: colors.gray[400]
        }}>
          Avg Opponent PPG: <span style={{
            fontWeight: typography.fontWeight.semibold,
            color: colors.foreground
          }}>{avgOpponentPpg.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}
