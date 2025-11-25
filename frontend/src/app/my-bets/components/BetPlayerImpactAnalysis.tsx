'use client'

import { useState, useEffect } from 'react'
import { type PlayerImpactGame } from '@/lib/queries'
import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface BetPlayerImpactAnalysisProps {
  teamId: number
  teamAbbreviation: string
  playerId: number
  playerName: string
  bettingLine?: number  // Optional betting line to show on chart
  location?: 'HOME' | 'AWAY'  // Optional location filter
}

export function BetPlayerImpactAnalysis({
  teamId,
  teamAbbreviation,
  playerId,
  playerName,
  bettingLine,
  location
}: BetPlayerImpactAnalysisProps) {
  const [games, setGames] = useState<PlayerImpactGame[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch games when component mounts
  useEffect(() => {
    async function fetchGames() {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/team-defense?action=player-impact&teamId=${teamId}&playerId=${playerId}`
        )
        const data = await response.json()
        setGames(data)
      } catch (error) {
        console.error('Failed to fetch player impact games:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [teamId, playerId])

  // Filter by location if specified
  const filteredGames = location
    ? games.filter(g => g.location === location)
    : games

  // Split games by player participation
  const gamesWithPlayer = filteredGames.filter(g => g.player_played)
  const gamesWithoutPlayer = filteredGames.filter(g => !g.player_played)

  // Calculate combined total metrics
  const getMetrics = (gamesList: PlayerImpactGame[]) => {
    if (gamesList.length === 0) return { avg: 0, count: 0 }

    const values = gamesList.map(g => g.team_score + g.opponent_score)
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    return { avg, count: gamesList.length }
  }

  const withPlayerMetrics = getMetrics(gamesWithPlayer)
  const withoutPlayerMetrics = getMetrics(gamesWithoutPlayer)

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        background: colors.background,
        padding: spacing[6],
        borderRadius: radius.md,
        textAlign: 'center',
        color: colors.gray[500]
      }}>
        Loading player impact data...
      </div>
    )
  }

  // No data state
  if (filteredGames.length === 0) {
    return (
      <div style={{
        background: colors.background,
        padding: spacing[6],
        borderRadius: radius.md,
        textAlign: 'center',
        color: colors.gray[500]
      }}>
        No games found for analysis
      </div>
    )
  }

  return (
    <div>
      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[4]
      }}>
        {/* With Player Card */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.positive}20`,
          borderLeft: `4px solid ${colors.positive}`
        }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            WITH {playerName.toUpperCase()}
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.positive,
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {withPlayerMetrics.avg.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            Avg Combined Total
          </div>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400],
            marginTop: spacing[2]
          }}>
            {withPlayerMetrics.count} games
          </div>
        </div>

        {/* Without Player Card */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${colors.negative}20`,
          borderLeft: `4px solid ${colors.negative}`
        }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            WITHOUT {playerName.toUpperCase()}
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.negative,
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {withoutPlayerMetrics.count > 0 ? withoutPlayerMetrics.avg.toFixed(1) : 'N/A'}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            Avg Combined Total
          </div>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400],
            marginTop: spacing[2]
          }}>
            {withoutPlayerMetrics.count} games
          </div>
        </div>

        {/* Impact Difference Card */}
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
            IMPACT
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: withoutPlayerMetrics.count > 0
              ? (withoutPlayerMetrics.avg - withPlayerMetrics.avg > 0 ? colors.negative : colors.positive)
              : colors.gray[400],
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {withoutPlayerMetrics.count > 0
              ? `${(withoutPlayerMetrics.avg - withPlayerMetrics.avg) > 0 ? '+' : ''}${(withoutPlayerMetrics.avg - withPlayerMetrics.avg).toFixed(1)}`
              : 'N/A'}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            Points difference
          </div>
          {withoutPlayerMetrics.count < 3 && withoutPlayerMetrics.count > 0 && (
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[500],
              marginTop: spacing[2],
              padding: spacing[1],
              background: colors.gray[900],
              borderRadius: radius.sm,
              textAlign: 'center'
            }}>
              ⚠️ Small sample
            </div>
          )}
        </div>
      </div>

      {/* Simple Bar Chart */}
      {withoutPlayerMetrics.count > 0 && (
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
            Average Combined Total Comparison
          </div>

          {/* Betting Line Reference (if provided) */}
          {bettingLine && (
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[500],
              marginBottom: spacing[2],
              fontFamily: typography.fontMono
            }}>
              Betting Line: {Number(bettingLine).toFixed(1)} points
            </div>
          )}

          {/* Bar Chart */}
          <div style={{
            display: 'flex',
            gap: spacing[6],
            alignItems: 'flex-end',
            height: '200px'
          }}>
            {/* WITH bar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{
                width: '100%',
                height: `${(withPlayerMetrics.avg / 250) * 100}%`,
                background: colors.positive,
                borderRadius: `${radius.sm} ${radius.sm} 0 0`,
                minHeight: '40px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.background,
                  fontFamily: typography.fontMono
                }}>
                  {withPlayerMetrics.avg.toFixed(1)}
                </div>
              </div>
              <div style={{
                marginTop: spacing[2],
                fontSize: typography.fontSize.xs,
                color: colors.gray[400],
                textAlign: 'center'
              }}>
                WITH
              </div>
            </div>

            {/* WITHOUT bar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{
                width: '100%',
                height: `${(withoutPlayerMetrics.avg / 250) * 100}%`,
                background: colors.negative,
                borderRadius: `${radius.sm} ${radius.sm} 0 0`,
                minHeight: '40px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.background,
                  fontFamily: typography.fontMono
                }}>
                  {withoutPlayerMetrics.avg.toFixed(1)}
                </div>
              </div>
              <div style={{
                marginTop: spacing[2],
                fontSize: typography.fontSize.xs,
                color: colors.gray[400],
                textAlign: 'center'
              }}>
                WITHOUT
              </div>
            </div>

            {/* Betting Line bar (if provided) */}
            {bettingLine && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  height: `${(Number(bettingLine) / 250) * 100}%`,
                  background: colors.gray[700],
                  borderRadius: `${radius.sm} ${radius.sm} 0 0`,
                  minHeight: '40px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.5
                }}>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.foreground,
                    fontFamily: typography.fontMono
                  }}>
                    {Number(bettingLine).toFixed(1)}
                  </div>
                </div>
                <div style={{
                  marginTop: spacing[2],
                  fontSize: typography.fontSize.xs,
                  color: colors.gray[400],
                  textAlign: 'center'
                }}>
                  LINE
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hit Rate Summary */}
      {bettingLine && withoutPlayerMetrics.count > 0 && (
        <div style={{
          marginTop: spacing[4],
          padding: spacing[3],
          background: colors.background,
          borderRadius: radius.md,
          border: `1px solid ${colors.gray[900]}`,
          fontSize: typography.fontSize.sm,
          color: colors.gray[400]
        }}>
          <strong>Analysis:</strong> {location === 'HOME' ? 'At home' : location === 'AWAY' ? 'Away' : ''} without {playerName},
          {' '}{teamAbbreviation} games average{' '}
          <span style={{ color: colors.foreground, fontFamily: typography.fontMono, fontWeight: typography.fontWeight.bold }}>
            {withoutPlayerMetrics.avg.toFixed(1)} combined points
          </span>
          {' '}({withoutPlayerMetrics.count} games).
          {' '}
          {withoutPlayerMetrics.avg < Number(bettingLine)
            ? <span style={{ color: colors.positive, fontWeight: typography.fontWeight.semibold }}>Strong UNDER indicator</span>
            : <span style={{ color: colors.negative, fontWeight: typography.fontWeight.semibold }}>Favors OVER</span>
          }
          {' '}at {Number(bettingLine).toFixed(1)} line.
        </div>
      )}
    </div>
  )
}
