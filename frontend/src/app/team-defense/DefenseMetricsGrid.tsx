'use client'

import { type TeamDefenseMetrics } from '@/lib/queries'
import { colors, spacing, radius, typography, shadows } from '@/lib/design-tokens'

interface DefenseMetricsGridProps {
  metrics: TeamDefenseMetrics
}

export function DefenseMetricsGrid({ metrics }: DefenseMetricsGridProps) {
  // League average is approximately 113-114 PPG
  const leagueAvgPpg = 113.5
  const avgDiff = Number(metrics.avg_points_allowed) - leagueAvgPpg
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
        background: colors.neutral[950],
        border: `1px solid ${colors.neutral[800]}`,
        borderRadius: radius.lg,
        padding: spacing[6],
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: '300ms ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.text.primary
        e.currentTarget.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.neutral[800]
        e.currentTarget.style.boxShadow = 'none'
      }}>
        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[400],
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[2]
        }}>
          Avg Points Allowed
        </div>

        <div style={{
          fontSize: typography.sizes['4xl'],
          fontWeight: typography.weights.bold,
          fontFamily: typography.fonts.mono,
          color: colors.text.primary,
          marginBottom: spacing[2]
        }}>
          {Number(metrics.avg_points_allowed).toFixed(1)}
        </div>

        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[500]
        }}>
          League Avg: <span style={{
            fontFamily: typography.fonts.mono,
            color: colors.neutral[400]
          }}>{leagueAvgPpg.toFixed(1)}</span>
        </div>

        {/* Comparison indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1],
          fontSize: typography.sizes.sm,
          fontFamily: typography.fonts.mono,
          color: isGoodDefense ? colors.positive : colors.negative,
          marginTop: spacing[2]
        }}>
          <span>{isGoodDefense ? '↓' : '↑'}</span>
          <span>{Math.abs(avgDiff).toFixed(1)} pts</span>
        </div>
      </div>

      {/* Average Total */}
      <div style={{
        background: colors.neutral[950],
        border: `1px solid ${colors.neutral[800]}`,
        borderRadius: radius.lg,
        padding: spacing[6],
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: '300ms ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.text.primary
        e.currentTarget.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.neutral[800]
        e.currentTarget.style.boxShadow = 'none'
      }}>
        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[400],
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[2]
        }}>
          Avg Combined Total
        </div>

        <div style={{
          fontSize: typography.sizes['4xl'],
          fontWeight: typography.weights.bold,
          fontFamily: typography.fonts.mono,
          color: colors.text.primary,
          marginBottom: spacing[2]
        }}>
          {Number(metrics.avg_total).toFixed(1)}
        </div>

        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[500]
        }}>
          Team + Opponent scores
        </div>
      </div>

      {/* Games Analyzed */}
      <div style={{
        background: colors.neutral[950],
        border: `1px solid ${colors.neutral[800]}`,
        borderRadius: radius.lg,
        padding: spacing[6],
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: '300ms ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.text.primary
        e.currentTarget.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.neutral[800]
        e.currentTarget.style.boxShadow = 'none'
      }}>
        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[400],
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[2]
        }}>
          Games Analyzed
        </div>

        <div style={{
          fontSize: typography.sizes['4xl'],
          fontWeight: typography.weights.bold,
          fontFamily: typography.fonts.mono,
          color: colors.text.primary,
          marginBottom: spacing[2]
        }}>
          {metrics.games_analyzed}
        </div>

        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[500]
        }}>
          {metrics.team_abbreviation}
        </div>
      </div>
    </div>
  )
}
