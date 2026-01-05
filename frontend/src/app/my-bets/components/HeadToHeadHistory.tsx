'use client'

import { useState, useEffect } from 'react'
import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface HeadToHeadGame {
  game_date: string
  home_team_abbr: string
  away_team_abbr: string
  home_team_score: number
  away_team_score: number
  combined_total: number
}

interface HeadToHeadHistoryProps {
  team1Abbr: string
  team2Abbr: string
  bettingLine: number
  limit?: number  // Number of recent games to show (default 4)
}

export function HeadToHeadHistory({
  team1Abbr,
  team2Abbr,
  bettingLine,
  limit = 4
}: HeadToHeadHistoryProps) {
  const [games, setGames] = useState<HeadToHeadGame[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchGames() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          action: 'head-to-head',
          team1: team1Abbr,
          team2: team2Abbr,
          limit: limit.toString()
        })

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
        console.error('Failed to fetch head-to-head games:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [team1Abbr, team2Abbr, limit])

  if (isLoading) {
    return (
      <div style={{
        background: colors.background.card,
        padding: spacing[6],
        borderRadius: radius.md,
        textAlign: 'center',
        color: colors.neutral[500]
      }}>
        Loading head-to-head history...
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
        No head-to-head games found
      </div>
    )
  }

  // Calculate average and stats
  const average = games.reduce((sum, g) => sum + g.combined_total, 0) / games.length
  const gamesUnder = games.filter(g => g.combined_total < bettingLine).length
  const gamesOver = games.filter(g => g.combined_total > bettingLine).length
  const gamesPush = games.filter(g => g.combined_total === bettingLine).length
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
            AVERAGE (LAST {games.length} H2H)
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

        {/* Trend Card */}
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
            UNDER/OVER/PUSH
          </div>
          <div style={{
            display: 'flex',
            gap: spacing[3],
            alignItems: 'baseline',
            marginBottom: spacing[1]
          }}>
            <div style={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: colors.betting.positive,
              fontFamily: typography.fonts.mono
            }}>
              {gamesUnder}
            </div>
            <div style={{
              fontSize: typography.sizes.xl,
              color: colors.neutral[500],
              fontFamily: typography.fonts.mono
            }}>
              /
            </div>
            <div style={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: colors.betting.negative,
              fontFamily: typography.fonts.mono
            }}>
              {gamesOver}
            </div>
            <div style={{
              fontSize: typography.sizes.xl,
              color: colors.neutral[500],
              fontFamily: typography.fonts.mono
            }}>
              /
            </div>
            <div style={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: colors.neutral[400],
              fontFamily: typography.fonts.mono
            }}>
              {gamesPush}
            </div>
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500]
          }}>
            vs {Number(bettingLine).toFixed(1)} line
          </div>
        </div>
      </div>

      {/* Games Table */}
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
          {team1Abbr} vs {team2Abbr} Recent Matchups
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                borderBottom: `1px solid ${colors.neutral[900]}`
              }}>
                <th style={{
                  textAlign: 'left',
                  padding: spacing[3],
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                  color: colors.neutral[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Date
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: spacing[3],
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                  color: colors.neutral[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Matchup
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: spacing[3],
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                  color: colors.neutral[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Score
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: spacing[3],
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                  color: colors.neutral[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Total
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: spacing[3],
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                  color: colors.neutral[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => {
                const date = new Date(game.game_date)
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(2)}`
                const isUnder = game.combined_total < bettingLine
                const isOver = game.combined_total > bettingLine
                const isPush = game.combined_total === bettingLine

                return (
                  <tr
                    key={index}
                    style={{
                      borderBottom: index < games.length - 1 ? `1px solid ${colors.neutral[900]}` : 'none'
                    }}
                  >
                    <td style={{
                      padding: spacing[3],
                      fontSize: typography.sizes.sm,
                      color: colors.neutral[400],
                      fontFamily: typography.fonts.mono
                    }}>
                      {dateStr}
                    </td>
                    <td style={{
                      padding: spacing[3],
                      fontSize: typography.sizes.sm,
                      color: colors.text.primary,
                      fontWeight: typography.weights.medium
                    }}>
                      {game.home_team_abbr} vs {game.away_team_abbr}
                    </td>
                    <td style={{
                      padding: spacing[3],
                      fontSize: typography.sizes.sm,
                      color: colors.neutral[400],
                      textAlign: 'center',
                      fontFamily: typography.fonts.mono
                    }}>
                      {game.home_team_score}-{game.away_team_score}
                    </td>
                    <td style={{
                      padding: spacing[3],
                      fontSize: typography.sizes.sm,
                      color: colors.text.primary,
                      textAlign: 'center',
                      fontWeight: typography.weights.bold,
                      fontFamily: typography.fonts.mono
                    }}>
                      {game.combined_total}
                    </td>
                    <td style={{
                      padding: spacing[3],
                      textAlign: 'center'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: `${spacing[1]} ${spacing[3]}`,
                        borderRadius: radius.sm,
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.bold,
                        background: isUnder ? `${colors.betting.positive}20` : isOver ? `${colors.betting.negative}20` : colors.neutral[800],
                        color: isUnder ? colors.betting.positive : isOver ? colors.betting.negative : colors.neutral[400]
                      }}>
                        {isUnder ? 'UNDER' : isOver ? 'OVER' : 'PUSH'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
        <strong>Head-to-Head Analysis:</strong> In the last {games.length} matchups between {team1Abbr} and {team2Abbr},
        {' '}games averaged{' '}
        <span style={{ color: colors.text.primary, fontFamily: typography.fonts.mono, fontWeight: typography.weights.bold }}>
          {average.toFixed(1)} combined points
        </span>.
        {' '}{gamesUnder}/{games.length} games went UNDER{' '}
        <span style={{ fontFamily: typography.fonts.mono, fontWeight: typography.weights.bold }}>
          {Number(bettingLine).toFixed(1)}
        </span>
        {' '}({hitRate.toFixed(0)}% hit rate).
        {' '}
        {hitRate === 100 ? (
          <span style={{ color: colors.betting.positive, fontWeight: typography.weights.semibold }}>Perfect UNDER record</span>
        ) : hitRate >= 75 ? (
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
