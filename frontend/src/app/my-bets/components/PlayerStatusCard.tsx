'use client'

import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface PlayerStatusCardProps {
  playerName: string
  status: 'OUT' | 'QUESTIONABLE' | 'DOUBTFUL' | 'PROBABLE' | 'ACTIVE'
  impactMetric?: string
  impactValue?: number
  reason?: string
}

export function PlayerStatusCard({
  playerName,
  status,
  impactMetric = 'PPG Impact',
  impactValue = -9.9,
  reason
}: PlayerStatusCardProps) {
  // Convert to number (database returns numeric as string)
  const impactValueNum = Number(impactValue)

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OUT':
        return colors.negative
      case 'QUESTIONABLE':
      case 'DOUBTFUL':
        return '#f59e0b' // Warning orange
      case 'PROBABLE':
        return '#eab308' // Yellow
      case 'ACTIVE':
        return colors.positive
      default:
        return colors.gray[400]
    }
  }

  // Impact color based on value
  const getImpactColor = (value: number) => {
    if (value < -5) return colors.negative
    if (value < 0) return '#f59e0b'
    if (value > 5) return colors.positive
    return colors.foreground
  }

  const statusColor = getStatusColor(status)
  const impactColor = getImpactColor(impactValueNum)

  return (
    <div style={{
      background: colors.background,
      padding: spacing[6],
      borderRadius: radius.md,
      border: `2px solid ${statusColor}`,
      boxShadow: `0 0 15px ${statusColor}20`
    }}>
      {/* Header */}
      <div style={{
        fontSize: typography.fontSize.xs,
        color: colors.gray[400],
        marginBottom: spacing[4],
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Key Player Status
      </div>

      {/* Player Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[6]
      }}>
        <div>
          <div style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.foreground,
            marginBottom: spacing[1]
          }}>
            {playerName}
          </div>
          {reason && (
            <div style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[400]
            }}>
              {reason}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div style={{
          padding: `${spacing[2]} ${spacing[4]}`,
          borderRadius: radius.md,
          background: `${statusColor}20`,
          border: `2px solid ${statusColor}`,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.bold,
          color: statusColor,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {status}
        </div>
      </div>

      {/* Impact Metric */}
      <div style={{
        background: colors.gray[950],
        padding: spacing[4],
        borderRadius: radius.md,
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: typography.fontSize.xs,
          color: colors.gray[400],
          marginBottom: spacing[2],
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Historical Impact
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: spacing[2],
          marginBottom: spacing[2]
        }}>
          <div style={{
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            color: impactColor,
            fontFamily: typography.fontMono
          }}>
            {impactValueNum > 0 ? '+' : ''}{impactValueNum.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.lg,
            color: colors.gray[400],
            fontFamily: typography.fontMono
          }}>
            {impactMetric}
          </div>
        </div>

        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[500]
        }}>
          Team performance without {playerName.split(' ')[1] || playerName}
        </div>
      </div>

      {/* Impact Indicator Bar */}
      <div style={{
        marginTop: spacing[4],
        padding: spacing[3],
        background: `${impactColor}10`,
        borderRadius: radius.md,
        border: `1px solid ${impactColor}40`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: typography.fontSize.sm,
          color: colors.gray[400]
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: impactColor
            }} />
            <span style={{ fontWeight: typography.fontWeight.medium }}>
              {impactValueNum < -5 ? 'Significant Negative Impact' :
               impactValueNum < 0 ? 'Moderate Negative Impact' :
               impactValueNum > 5 ? 'Significant Positive Impact' :
               'Minimal Impact'}
            </span>
          </div>
          <div style={{
            fontFamily: typography.fontMono,
            color: impactColor,
            fontWeight: typography.fontWeight.bold
          }}>
            {Math.abs(impactValueNum).toFixed(1)} pts
          </div>
        </div>
      </div>

      {/* Analysis Note */}
      {status === 'OUT' && impactValueNum < 0 && (
        <div style={{
          marginTop: spacing[4],
          padding: spacing[3],
          background: colors.background,
          borderRadius: radius.md,
          border: `1px solid ${colors.gray[900]}`,
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          lineHeight: 1.6
        }}>
          <strong>Analysis:</strong> With {playerName} ruled out, historical data shows the team scores{' '}
          <span style={{
            color: impactColor,
            fontFamily: typography.fontMono,
            fontWeight: typography.fontWeight.bold
          }}>
            {Math.abs(impactValueNum).toFixed(1)} fewer points
          </span>
          {' '}on average. This absence significantly affects team offensive output and should be factored into total scoring projections.
        </div>
      )}
    </div>
  )
}
