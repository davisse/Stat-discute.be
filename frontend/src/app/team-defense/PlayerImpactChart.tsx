'use client'

import { useState } from 'react'
import { type PlayerImpactGame } from '@/lib/queries'
import { colors, spacing, radius, typography, transitions } from '@/lib/design-tokens'

interface PlayerImpactChartProps {
  games: PlayerImpactGame[]
  viewMode: 'opponent-scoring' | 'combined-totals'
  avgWithPlayer: number
  avgWithoutPlayer: number
  totalLine?: number
}

export function PlayerImpactChart({
  games,
  viewMode,
  avgWithPlayer,
  avgWithoutPlayer,
  totalLine
}: PlayerImpactChartProps) {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  if (games.length === 0) {
    return (
      <div style={{
        background: colors.neutral[950],
        border: `1px solid ${colors.neutral[800]}`,
        borderRadius: radius.lg,
        padding: spacing[12],
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>📊</div>
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
          Select a player to view impact analysis
        </div>
      </div>
    )
  }

  // Reverse to show chronologically (oldest first)
  const chronologicalGames = [...games].reverse()

  // Calculate chart dimensions based on view mode
  const getGameValue = (game: PlayerImpactGame) => {
    if (viewMode === 'opponent-scoring') {
      return game.opponent_points
    } else {
      return game.team_points + game.opponent_points
    }
  }

  const values = chronologicalGames.map(g => getGameValue(g))
  const actualMax = Math.max(...values)
  const actualMin = Math.min(...values)

  // Add padding to ensure all bars are visible and properly scaled
  const maxScore = Math.max(
    actualMax + 10,
    avgWithPlayer + 20,
    avgWithoutPlayer + 20,
    ...(totalLine ? [totalLine + 20] : [])
  )
  const minScore = Math.max(
    0,
    Math.min(
      actualMin - 10,
      avgWithPlayer - 20,
      avgWithoutPlayer - 20,
      ...(totalLine ? [totalLine - 20] : [])
    )
  )
  const scoreRange = maxScore - minScore
  const chartHeight = 400

  // Calculate bar height percentage
  const getBarHeight = (score: number) => {
    return ((score - minScore) / scoreRange) * 100
  }

  // Y-axis labels (every 20 points)
  const yAxisLabels = []
  const startLabel = Math.floor(minScore / 20) * 20
  for (let i = startLabel; i <= maxScore; i += 20) {
    yAxisLabels.push(i)
  }

  // Average line positions
  const avgWithPlayerPosition = ((avgWithPlayer - minScore) / scoreRange) * 100
  const avgWithoutPlayerPosition = ((avgWithoutPlayer - minScore) / scoreRange) * 100
  const totalLinePosition = totalLine ? ((totalLine - minScore) / scoreRange) * 100 : null

  return (
    <div style={{
      background: colors.neutral[950],
      border: `1px solid ${colors.neutral[800]}`,
      borderRadius: radius.lg,
      padding: spacing[6]
    }}>
      {/* Chart Title */}
      <h3 style={{
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.semibold,
        color: colors.text.primary,
        marginBottom: spacing[6]
      }}>
        {viewMode === 'opponent-scoring' ? 'Opponent Scoring' : 'Combined Totals'} by Game
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
                  fontSize: typography.sizes.xs,
                  fontFamily: typography.fonts.mono,
                  color: colors.neutral[500],
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
          borderLeft: `1px solid ${colors.neutral[800]}`,
          borderBottom: `1px solid ${colors.neutral[800]}`
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
                  background: colors.neutral[800],
                  opacity: 0.3,
                  zIndex: 5,
                  pointerEvents: 'none'
                }}
              />
            )
          })}

          {/* Average Lines */}
          <div style={{
            position: 'absolute',
            bottom: `${avgWithPlayerPosition}%`,
            left: 0,
            right: 0,
            height: '1px',
            background: colors.positive,
            opacity: 0.6,
            borderTop: `2px dashed ${colors.positive}`,
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <span style={{
              position: 'absolute',
              right: spacing[2],
              top: '-10px',
              fontSize: typography.sizes.xs,
              fontFamily: typography.fonts.mono,
              color: colors.positive,
              background: colors.neutral[950],
              padding: `0 ${spacing[1]}`
            }}>
              With: {avgWithPlayer.toFixed(1)}
            </span>
          </div>

          <div style={{
            position: 'absolute',
            bottom: `${avgWithoutPlayerPosition}%`,
            left: 0,
            right: 0,
            height: '1px',
            background: colors.negative,
            opacity: 0.6,
            borderTop: `2px dashed ${colors.negative}`,
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <span style={{
              position: 'absolute',
              right: spacing[2],
              top: '-10px',
              fontSize: typography.sizes.xs,
              fontFamily: typography.fonts.mono,
              color: colors.negative,
              background: colors.neutral[950],
              padding: `0 ${spacing[1]}`
            }}>
              Without: {avgWithoutPlayer.toFixed(1)}
            </span>
          </div>

          {/* Betting Line (for both modes) */}
          {totalLinePosition !== null && (
            <div style={{
              position: 'absolute',
              bottom: `${totalLinePosition}%`,
              left: 0,
              right: 0,
              height: '1px',
              background: colors.text.primary,
              opacity: 0.4,
              borderTop: `2px dashed ${colors.text.primary}`,
              zIndex: 9,
              pointerEvents: 'none'
            }}>
              <span style={{
                position: 'absolute',
                left: spacing[2],
                top: '-10px',
                fontSize: typography.sizes.xs,
                fontFamily: typography.fonts.mono,
                color: colors.text.primary,
                background: colors.neutral[950],
                padding: `0 ${spacing[1]}`
              }}>
                {viewMode === 'opponent-scoring' ? 'Opp Line: ' : 'Total Line: '}{totalLine}
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
            gap: '2px',
            padding: `0 ${spacing[2]}`
          }}>
            {chronologicalGames.map((game) => {
              const value = getGameValue(game)
              const barHeight = getBarHeight(value)
              const isHovered = hoveredGame === game.game_id
              const barColor = game.player_played ? colors.positive : colors.negative

              return (
                <div
                  key={game.game_id}
                  style={{
                    flex: 1,
                    position: 'relative',
                    height: `${barHeight}%`,
                    background: `linear-gradient(to top, ${barColor}, ${barColor}cc)`,
                    borderRadius: `${radius.sm} ${radius.sm} 0 0`,
                    cursor: 'pointer',
                    transition: transitions.presets.fast,
                    opacity: isHovered ? 1 : 0.8,
                    border: game.player_played ? `1px solid ${colors.positive}` : `1px solid ${colors.negative}`
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
                      background: colors.neutral[900],
                      border: `1px solid ${colors.neutral[700]}`,
                      borderRadius: radius.md,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 0 24px rgba(255, 255, 255, 0.12)',
                      zIndex: 100,
                      pointerEvents: 'none'
                    }}>
                      <div style={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.semibold,
                        color: colors.text.primary,
                        marginBottom: spacing[1]
                      }}>
                        vs {game.opponent}
                      </div>
                      <div style={{
                        fontSize: typography.sizes.sm,
                        fontFamily: typography.fonts.mono,
                        color: barColor,
                        marginBottom: spacing[1]
                      }}>
                        {viewMode === 'opponent-scoring'
                          ? `${game.opponent_points} PTS (Opp)`
                          : `${game.team_points + game.opponent_points} PTS (Total)`}
                      </div>
                      <div style={{
                        fontSize: typography.sizes.xs,
                        color: colors.neutral[400]
                      }}>
                        {new Date(game.game_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })} • {game.location}
                      </div>
                      <div style={{
                        fontSize: typography.sizes.xs,
                        color: game.player_played ? colors.positive : colors.negative,
                        marginTop: spacing[1],
                        fontWeight: typography.weights.semibold
                      }}>
                        {game.player_played ? '✓ Played' : 'Did Not Play'}
                      </div>
                      <div style={{
                        fontSize: typography.sizes.xs,
                        color: game.team_points > game.opponent_points ? colors.positive : colors.negative,
                        marginTop: spacing[1]
                      }}>
                        {game.team_points > game.opponent_points ? 'Won' : 'Lost'} {game.team_points}-{game.opponent_points}
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
        gap: '2px',
        marginLeft: '44px',
        marginTop: spacing[2],
        padding: `0 ${spacing[2]}`
      }}>
        {chronologicalGames.map((game) => (
          <div
            key={game.game_id}
            style={{
              flex: 1,
              fontSize: typography.sizes.xs,
              fontFamily: typography.fonts.mono,
              color: colors.neutral[500],
              textAlign: 'center',
              transform: 'rotate(-45deg)',
              transformOrigin: 'top center',
              marginTop: spacing[2],
              whiteSpace: 'nowrap'
            }}
          >
            {game.opponent}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: spacing[6],
        marginTop: spacing[6],
        fontSize: typography.sizes.sm,
        color: colors.neutral[400]
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: colors.positive,
            border: `1px solid ${colors.positive}`,
            borderRadius: radius.sm
          }} />
          <span>Player Played</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: colors.negative,
            border: `1px solid ${colors.negative}`,
            borderRadius: radius.sm
          }} />
          <span>Player Absent</span>
        </div>
      </div>
    </div>
  )
}
