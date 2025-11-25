'use client'

import { useState } from 'react'
import { type TeamDefenseGame } from '@/lib/queries'
import { colors, spacing, radius, typography, transitions } from '@/lib/design-tokens'

interface CombinedTotalChartProps {
  games: TeamDefenseGame[]
  avgTotal: number
  totalLine: number
}

export function CombinedTotalChart({ games, avgTotal, totalLine }: CombinedTotalChartProps) {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  if (games.length === 0) {
    return (
      <div style={{
        background: colors.gray[950],
        border: `1px solid ${colors.gray[800]}`,
        borderRadius: radius.lg,
        padding: spacing[12],
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>📊</div>
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
          Select a team to view combined total analysis
        </div>
      </div>
    )
  }

  // Reverse to show chronologically (oldest first)
  const chronologicalGames = [...games].reverse()

  // Calculate combined totals
  const gamesWithTotals = chronologicalGames.map(game => ({
    ...game,
    combinedTotal: game.team_score + game.opponent_score
  }))

  // Calculate chart dimensions
  const totals = gamesWithTotals.map(g => g.combinedTotal)
  const actualMax = Math.max(...totals)
  const actualMin = Math.min(...totals)

  // Add padding to ensure all bars are visible and properly scaled
  const maxTotal = Math.max(actualMax + 20, totalLine + 30, avgTotal + 30)
  const minTotal = Math.max(0, Math.min(actualMin - 20, totalLine - 30, avgTotal - 30))
  const totalRange = maxTotal - minTotal
  const chartHeight = 400

  // Calculate bar height percentage - proportional to Y-axis
  const getBarHeight = (total: number) => {
    return ((total - minTotal) / totalRange) * 100
  }

  // Y-axis labels (every 20 points)
  const yAxisLabels = []
  const startLabel = Math.floor(minTotal / 20) * 20
  for (let i = startLabel; i <= maxTotal; i += 20) {
    yAxisLabels.push(i)
  }

  // Line positions
  const avgLinePosition = ((avgTotal - minTotal) / totalRange) * 100
  const bettingLinePosition = ((totalLine - minTotal) / totalRange) * 100

  return (
    <div style={{
      background: colors.gray[950],
      border: `1px solid ${colors.gray[800]}`,
      borderRadius: radius.lg,
      padding: spacing[6],
      marginBottom: spacing[6]
    }}>
      {/* Chart Title */}
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.foreground,
        marginBottom: spacing[6]
      }}>
        Combined Total Points by Game
      </h3>

      {/* Chart Container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        gap: spacing[4]
      }}>
        {/* Y-Axis */}
        <div style={{
          position: 'relative',
          width: '40px',
          height: `${chartHeight}px`
        }}>
          {yAxisLabels.map((label) => {
            const position = ((label - minTotal) / totalRange) * 100
            return (
              <div
                key={label}
                style={{
                  position: 'absolute',
                  bottom: `${position}%`,
                  right: 0,
                  fontSize: typography.fontSize.xs,
                  fontFamily: typography.fontMono,
                  color: colors.gray[500],
                  textAlign: 'right',
                  transform: 'translateY(50%)'
                }}
              >
                {label}
              </div>
            )
          })}
        </div>

        {/* Chart Area */}
        <div style={{
          flex: 1,
          position: 'relative',
          height: `${chartHeight}px`,
          borderLeft: `1px solid ${colors.gray[800]}`,
          borderBottom: `1px solid ${colors.gray[800]}`
        }}>
          {/* Y-Axis Gridlines */}
          {yAxisLabels.map((label) => {
            const position = ((label - minTotal) / totalRange) * 100
            return (
              <div
                key={`grid-${label}`}
                style={{
                  position: 'absolute',
                  bottom: `${position}%`,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: colors.gray[800],
                  opacity: 0.3,
                  zIndex: 5,
                  pointerEvents: 'none'
                }}
              />
            )
          })}

          {/* Betting Line */}
          <div style={{
            position: 'absolute',
            bottom: `${bettingLinePosition}%`,
            left: 0,
            right: 0,
            height: '2px',
            background: colors.foreground,
            opacity: 0.8,
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <span style={{
              position: 'absolute',
              left: spacing[2],
              top: '-10px',
              fontSize: typography.fontSize.xs,
              fontFamily: typography.fontMono,
              color: colors.foreground,
              background: colors.gray[950],
              padding: `0 ${spacing[1]}`,
              fontWeight: typography.fontWeight.bold
            }}>
              Line: {totalLine}
            </span>
          </div>

          {/* Average Line */}
          <div style={{
            position: 'absolute',
            bottom: `${avgLinePosition}%`,
            left: 0,
            right: 0,
            height: '1px',
            background: colors.gray[400],
            opacity: 0.6,
            borderTop: `2px dashed ${colors.gray[400]}`,
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <span style={{
              position: 'absolute',
              right: spacing[2],
              top: '-10px',
              fontSize: typography.fontSize.xs,
              fontFamily: typography.fontMono,
              color: colors.gray[400],
              background: colors.gray[950],
              padding: `0 ${spacing[1]}`
            }}>
              Avg: {avgTotal.toFixed(1)}
            </span>
          </div>

          {/* Bars */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            padding: `0 ${spacing[2]}`
          }}>
            {gamesWithTotals.map((game) => {
              const barHeight = getBarHeight(game.combinedTotal)
              const isOver = game.combinedTotal > totalLine
              const isHovered = hoveredGame === game.game_id

              return (
                <div
                  key={game.game_id}
                  style={{
                    flex: 1,
                    position: 'relative',
                    height: `${barHeight}%`,
                    background: isOver
                      ? `linear-gradient(to top, ${colors.positive}, rgba(16, 185, 129, 0.6))`
                      : `linear-gradient(to top, ${colors.negative}, rgba(239, 68, 68, 0.6))`,
                    borderRadius: `${radius.sm} ${radius.sm} 0 0`,
                    cursor: 'pointer',
                    transition: transitions.fast,
                    opacity: isHovered ? 1 : 0.8
                  }}
                  onMouseEnter={() => setHoveredGame(game.game_id)}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginBottom: spacing[2],
                      padding: spacing[3],
                      background: colors.gray[900],
                      border: `1px solid ${colors.gray[700]}`,
                      borderRadius: radius.md,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 0 24px rgba(255, 255, 255, 0.12)',
                      zIndex: 100,
                      pointerEvents: 'none'
                    }}>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.foreground,
                        marginBottom: spacing[1]
                      }}>
                        vs {game.opponent_abbr}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        fontFamily: typography.fontMono,
                        color: colors.foreground,
                        marginBottom: spacing[1]
                      }}>
                        Combined: {game.combinedTotal} PTS
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.gray[400],
                        marginBottom: spacing[1]
                      }}>
                        {game.team_score} + {game.opponent_score}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.gray[400]
                      }}>
                        {new Date(game.game_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })} • {game.location}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        color: isOver ? colors.positive : colors.negative,
                        marginTop: spacing[1]
                      }}>
                        {isOver ? 'OVER' : 'UNDER'} {totalLine} ({isOver ? '+' : ''}{game.combinedTotal - totalLine})
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* X-Axis Labels */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginLeft: '44px',
        marginTop: spacing[2],
        padding: `0 ${spacing[2]}`
      }}>
        {gamesWithTotals.map((game) => (
          <div
            key={game.game_id}
            style={{
              flex: 1,
              fontSize: typography.fontSize.xs,
              fontFamily: typography.fontMono,
              color: colors.gray[500],
              textAlign: 'center',
              transform: 'rotate(-45deg)',
              transformOrigin: 'top center',
              marginTop: spacing[2],
              whiteSpace: 'nowrap'
            }}
          >
            {game.opponent_abbr}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: spacing[6],
        marginTop: spacing[6],
        fontSize: typography.fontSize.sm,
        color: colors.gray[400]
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: colors.positive,
            borderRadius: radius.sm
          }} />
          <span>Over {totalLine}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: colors.negative,
            borderRadius: radius.sm
          }} />
          <span>Under {totalLine}</span>
        </div>
      </div>
    </div>
  )
}
