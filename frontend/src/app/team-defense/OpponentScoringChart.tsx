'use client'

import { useState } from 'react'
import { type TeamDefenseGame } from '@/lib/queries'
import { colors, spacing, radius, typography, transitions } from '@/lib/design-tokens'

interface OpponentScoringChartProps {
  games: TeamDefenseGame[]
  avgOpponentPpg: number
  opponentLine?: number
}

export function OpponentScoringChart({ games, avgOpponentPpg, opponentLine }: OpponentScoringChartProps) {
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
          Select a team to view defensive performance
        </div>
      </div>
    )
  }

  // Reverse to show chronologically (oldest first)
  const chronologicalGames = [...games].reverse()

  // Calculate chart dimensions
  const scores = chronologicalGames.map(g => g.opponent_score)
  const actualMax = Math.max(...scores)
  const actualMin = Math.min(...scores)

  // Add padding to ensure all bars are visible and properly scaled
  // Extend range above and below by at least 10 points
  const maxScore = Math.max(actualMax + 10, avgOpponentPpg + 20)
  const minScore = Math.max(0, Math.min(actualMin - 10, avgOpponentPpg - 20))
  const scoreRange = maxScore - minScore
  const chartHeight = 400

  // Calculate bar height percentage - now naturally proportional to Y-axis
  const getBarHeight = (score: number) => {
    return ((score - minScore) / scoreRange) * 100
  }

  // Y-axis labels (every 20 points)
  const yAxisLabels = []
  const startLabel = Math.floor(minScore / 20) * 20
  for (let i = startLabel; i <= maxScore; i += 20) {
    yAxisLabels.push(i)
  }

  // Average line position
  const avgLinePosition = ((avgOpponentPpg - minScore) / scoreRange) * 100

  // Opponent line position (betting line)
  const opponentLinePosition = opponentLine ? ((opponentLine - minScore) / scoreRange) * 100 : null

  return (
    <div style={{
      background: colors.gray[950],
      border: `1px solid ${colors.gray[800]}`,
      borderRadius: radius.lg,
      padding: spacing[6]
    }}>
      {/* Chart Title */}
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.foreground,
        marginBottom: spacing[6]
      }}>
        Opponent Scoring by Game
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
            const position = ((label - minScore) / scoreRange) * 100
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
            const position = ((label - minScore) / scoreRange) * 100
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

          {/* Average Line */}
          <div style={{
            position: 'absolute',
            bottom: `${avgLinePosition}%`,
            left: 0,
            right: 0,
            height: '1px',
            background: colors.foreground,
            opacity: 0.6,
            borderTop: `2px dashed ${colors.foreground}`,
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <span style={{
              position: 'absolute',
              right: spacing[2],
              top: '-10px',
              fontSize: typography.fontSize.xs,
              fontFamily: typography.fontMono,
              color: colors.foreground,
              background: colors.gray[950],
              padding: `0 ${spacing[1]}`
            }}>
              Avg: {avgOpponentPpg.toFixed(1)}
            </span>
          </div>

          {/* Opponent Line (Betting Line) */}
          {opponentLinePosition !== null && (
            <div style={{
              position: 'absolute',
              bottom: `${opponentLinePosition}%`,
              left: 0,
              right: 0,
              height: '1px',
              background: 'rgb(234, 179, 8)',
              opacity: 0.7,
              borderTop: '2px dashed rgb(234, 179, 8)',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              <span style={{
                position: 'absolute',
                left: spacing[2],
                top: '-10px',
                fontSize: typography.fontSize.xs,
                fontFamily: typography.fontMono,
                color: 'rgb(234, 179, 8)',
                background: colors.gray[950],
                padding: `0 ${spacing[1]}`
              }}>
                Line: {opponentLine?.toFixed(1)}
              </span>
            </div>
          )}

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
            {chronologicalGames.map((game) => {
              const barHeight = getBarHeight(game.opponent_score)
              const isAboveAvg = game.opponent_score > avgOpponentPpg
              const isHovered = hoveredGame === game.game_id

              return (
                <div
                  key={game.game_id}
                  style={{
                    flex: 1,
                    position: 'relative',
                    height: `${barHeight}%`,
                    background: isAboveAvg
                      ? `linear-gradient(to top, ${colors.negative}, rgba(239, 68, 68, 0.6))`
                      : `linear-gradient(to top, ${colors.positive}, rgba(16, 185, 129, 0.6))`,
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
                        color: isAboveAvg ? colors.negative : colors.positive,
                        marginBottom: spacing[1]
                      }}>
                        {game.opponent_score} PTS
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
                        color: game.result === 'W' ? colors.positive : colors.negative,
                        marginTop: spacing[1]
                      }}>
                        {game.result === 'W' ? 'Won' : 'Lost'} {game.team_score}-{game.opponent_score}
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
        {chronologicalGames.map((game) => (
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
        color: colors.gray[400],
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: colors.positive,
            borderRadius: radius.sm
          }} />
          <span>Below Average (Good Defense)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: colors.negative,
            borderRadius: radius.sm
          }} />
          <span>Above Average (Poor Defense)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div style={{
            width: '24px',
            height: '2px',
            background: 'rgb(234, 179, 8)',
            borderTop: '2px dashed rgb(234, 179, 8)'
          }} />
          <span>Betting Line</span>
        </div>
      </div>
    </div>
  )
}
