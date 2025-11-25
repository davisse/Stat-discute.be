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
        background: colors.background,
        padding: spacing[6],
        borderRadius: radius.md,
        textAlign: 'center',
        color: colors.gray[500]
      }}>
        Loading head-to-head history...
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div style={{
        background: colors.background,
        padding: spacing[6],
        borderRadius: radius.md,
        textAlign: 'center',
        color: colors.gray[500]
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
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.gray[900]}`
        }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            AVERAGE (LAST {games.length} H2H)
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: average < bettingLine ? colors.positive : colors.negative,
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {average.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            Combined Total
          </div>
        </div>

        {/* Trend Card */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.gray[900]}`
        }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
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
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.positive,
              fontFamily: typography.fontMono
            }}>
              {gamesUnder}
            </div>
            <div style={{
              fontSize: typography.fontSize.xl,
              color: colors.gray[500],
              fontFamily: typography.fontMono
            }}>
              /
            </div>
            <div style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.negative,
              fontFamily: typography.fontMono
            }}>
              {gamesOver}
            </div>
            <div style={{
              fontSize: typography.fontSize.xl,
              color: colors.gray[500],
              fontFamily: typography.fontMono
            }}>
              /
            </div>
            <div style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.gray[400],
              fontFamily: typography.fontMono
            }}>
              {gamesPush}
            </div>
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            vs {Number(bettingLine).toFixed(1)} line
          </div>
        </div>
      </div>

      {/* Games Table */}
      <div style={{
        background: colors.background,
        padding: spacing[4],
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          marginBottom: spacing[4],
          fontWeight: typography.fontWeight.medium
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
                borderBottom: `1px solid ${colors.gray[900]}`
              }}>
                <th style={{
                  textAlign: 'left',
                  padding: spacing[3],
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.gray[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Date
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: spacing[3],
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.gray[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Matchup
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: spacing[3],
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.gray[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Score
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: spacing[3],
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.gray[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Total
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: spacing[3],
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.gray[400],
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
                      borderBottom: index < games.length - 1 ? `1px solid ${colors.gray[900]}` : 'none'
                    }}
                  >
                    <td style={{
                      padding: spacing[3],
                      fontSize: typography.fontSize.sm,
                      color: colors.gray[400],
                      fontFamily: typography.fontMono
                    }}>
                      {dateStr}
                    </td>
                    <td style={{
                      padding: spacing[3],
                      fontSize: typography.fontSize.sm,
                      color: colors.foreground,
                      fontWeight: typography.fontWeight.medium
                    }}>
                      {game.home_team_abbr} vs {game.away_team_abbr}
                    </td>
                    <td style={{
                      padding: spacing[3],
                      fontSize: typography.fontSize.sm,
                      color: colors.gray[400],
                      textAlign: 'center',
                      fontFamily: typography.fontMono
                    }}>
                      {game.home_team_score}-{game.away_team_score}
                    </td>
                    <td style={{
                      padding: spacing[3],
                      fontSize: typography.fontSize.sm,
                      color: colors.foreground,
                      textAlign: 'center',
                      fontWeight: typography.fontWeight.bold,
                      fontFamily: typography.fontMono
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
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        background: isUnder ? colors.positiveBg : isOver ? colors.negativeBg : colors.gray[800],
                        color: isUnder ? colors.positive : isOver ? colors.negative : colors.gray[400]
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
        background: colors.background,
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`,
        fontSize: typography.fontSize.sm,
        color: colors.gray[400]
      }}>
        <strong>Head-to-Head Analysis:</strong> In the last {games.length} matchups between {team1Abbr} and {team2Abbr},
        {' '}games averaged{' '}
        <span style={{ color: colors.foreground, fontFamily: typography.fontMono, fontWeight: typography.fontWeight.bold }}>
          {average.toFixed(1)} combined points
        </span>.
        {' '}{gamesUnder}/{games.length} games went UNDER{' '}
        <span style={{ fontFamily: typography.fontMono, fontWeight: typography.fontWeight.bold }}>
          {Number(bettingLine).toFixed(1)}
        </span>
        {' '}({hitRate.toFixed(0)}% hit rate).
        {' '}
        {hitRate === 100 ? (
          <span style={{ color: colors.positive, fontWeight: typography.fontWeight.semibold }}>Perfect UNDER record</span>
        ) : hitRate >= 75 ? (
          <span style={{ color: colors.positive, fontWeight: typography.fontWeight.semibold }}>Strong UNDER trend</span>
        ) : hitRate >= 50 ? (
          <span style={{ color: colors.foreground, fontWeight: typography.fontWeight.semibold }}>Moderate UNDER lean</span>
        ) : (
          <span style={{ color: colors.negative, fontWeight: typography.fontWeight.semibold }}>Favors OVER</span>
        )}
      </div>
    </div>
  )
}
