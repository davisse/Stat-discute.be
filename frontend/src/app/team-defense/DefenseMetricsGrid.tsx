'use client'

import { type TeamDefenseMetrics } from '@/lib/queries'
import { colors, spacing, radius, typography, shadows } from '@/lib/design-tokens'

interface DefenseMetricsGridProps {
  metrics: TeamDefenseMetrics
}

export function DefenseMetricsGrid({ metrics }: DefenseMetricsGridProps) {
  const avgDiff = parseFloat(metrics.avg_opponent_ppg) - parseFloat(metrics.league_avg_ppg)
  const isGoodDefense = avgDiff < 0

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: spacing[6],
      marginBottom: spacing[8]
    }}>
      {/* Average Opponent PPG */}
      <div style={{
        background: colors.gray[950],
        border: `1px solid ${colors.gray[800]}`,
        borderRadius: radius.lg,
        padding: spacing[6],
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: '300ms ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.foreground
        e.currentTarget.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.gray[800]
        e.currentTarget.style.boxShadow = 'none'
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[2]
        }}>
          Avg Opponent PPG
        </div>

        <div style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          fontFamily: typography.fontMono,
          color: colors.foreground,
          marginBottom: spacing[2]
        }}>
          {metrics.avg_opponent_ppg}
        </div>

        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[500]
        }}>
          League Avg: <span style={{
            fontFamily: typography.fontMono,
            color: colors.gray[400]
          }}>{metrics.league_avg_ppg}</span>
        </div>

        {/* Comparison indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1],
          fontSize: typography.fontSize.sm,
          fontFamily: typography.fontMono,
          color: isGoodDefense ? colors.positive : colors.negative,
          marginTop: spacing[2]
        }}>
          <span>{isGoodDefense ? '↓' : '↑'}</span>
          <span>{Math.abs(avgDiff).toFixed(1)} pts</span>
        </div>
      </div>

      {/* Best Defense Game */}
      <div style={{
        background: colors.gray[950],
        border: `1px solid ${colors.gray[800]}`,
        borderRadius: radius.lg,
        padding: spacing[6],
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: '300ms ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.foreground
        e.currentTarget.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.gray[800]
        e.currentTarget.style.boxShadow = 'none'
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[2]
        }}>
          Best Defense
        </div>

        <div style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          fontFamily: typography.fontMono,
          color: colors.positive,
          marginBottom: spacing[2]
        }}>
          {metrics.best_defense_game?.opponent_score || '-'}
        </div>

        {metrics.best_defense_game && (
          <>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[400]
            }}>
              vs {metrics.best_defense_game.opponent_abbr}
            </div>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[500],
              marginTop: spacing[1]
            }}>
              {new Date(metrics.best_defense_game.game_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </>
        )}
      </div>

      {/* Worst Defense Game */}
      <div style={{
        background: colors.gray[950],
        border: `1px solid ${colors.gray[800]}`,
        borderRadius: radius.lg,
        padding: spacing[6],
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: '300ms ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.foreground
        e.currentTarget.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.gray[800]
        e.currentTarget.style.boxShadow = 'none'
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[2]
        }}>
          Worst Defense
        </div>

        <div style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          fontFamily: typography.fontMono,
          color: colors.negative,
          marginBottom: spacing[2]
        }}>
          {metrics.worst_defense_game?.opponent_score || '-'}
        </div>

        {metrics.worst_defense_game && (
          <>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[400]
            }}>
              vs {metrics.worst_defense_game.opponent_abbr}
            </div>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[500],
              marginTop: spacing[1]
            }}>
              {new Date(metrics.worst_defense_game.game_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </>
        )}
      </div>

      {/* Consistency */}
      <div style={{
        background: colors.gray[950],
        border: `1px solid ${colors.gray[800]}`,
        borderRadius: radius.lg,
        padding: spacing[6],
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: '300ms ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.foreground
        e.currentTarget.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.gray[800]
        e.currentTarget.style.boxShadow = 'none'
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[2]
        }}>
          Consistency
        </div>

        <div style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          fontFamily: typography.fontMono,
          color: colors.foreground,
          marginBottom: spacing[2]
        }}>
          ±{metrics.consistency_score}
        </div>

        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[500],
          marginBottom: spacing[1]
        }}>
          Std Deviation
        </div>

        <div style={{
          fontSize: typography.fontSize.sm,
          fontFamily: typography.fontMono,
          color: colors.gray[400]
        }}>
          {metrics.games_under_avg}/{metrics.games_played} under avg
        </div>
      </div>
    </div>
  )
}
