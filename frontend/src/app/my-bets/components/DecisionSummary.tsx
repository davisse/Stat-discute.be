'use client'

import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface DecisionSummaryProps {
  betSelection: string
  lineValue: number
  oddsDecimal: number
  expectedROI?: number
  confidence?: number
}

export function DecisionSummary({
  betSelection,
  lineValue,
  oddsDecimal,
  expectedROI = 38.75,
  confidence = 8
}: DecisionSummaryProps) {
  // Convert to numbers (database returns numeric as string)
  const lineValueNum = Number(lineValue)
  const oddsDecimalNum = Number(oddsDecimal)
  const expectedROINum = Number(expectedROI)
  const confidenceNum = Number(confidence)

  // Calculate potential profit from odds
  const potentialProfit = ((oddsDecimalNum - 1) * 100).toFixed(0)

  // Confidence level indicators
  const getConfidenceColor = (level: number) => {
    if (level >= 8) return colors.positive
    if (level >= 6) return colors.foreground
    return colors.negative
  }

  const getConfidenceLabel = (level: number) => {
    if (level >= 9) return 'Very High'
    if (level >= 7) return 'High'
    if (level >= 5) return 'Moderate'
    return 'Low'
  }

  return (
    <div style={{
      background: colors.background,
      padding: spacing[6],
      borderRadius: radius.md,
      border: `2px solid ${colors.positive}`,
      boxShadow: `0 0 20px ${colors.positive}20`
    }}>
      {/* Header */}
      <div style={{
        fontSize: typography.fontSize.xs,
        color: colors.gray[400],
        marginBottom: spacing[4],
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: 'center'
      }}>
        Final Decision
      </div>

      {/* Main Decision */}
      <div style={{
        textAlign: 'center',
        marginBottom: spacing[6]
      }}>
        <div style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.positive,
          fontFamily: typography.fontMono,
          marginBottom: spacing[2]
        }}>
          {betSelection}
        </div>
        <div style={{
          fontSize: typography.fontSize['2xl'],
          color: colors.foreground,
          fontFamily: typography.fontMono,
          fontWeight: typography.fontWeight.semibold
        }}>
          {lineValueNum.toFixed(1)}
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: spacing[4],
        marginBottom: spacing[4],
        paddingBottom: spacing[4],
        borderBottom: `1px solid ${colors.gray[900]}`
      }}>
        {/* Odds */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Odds
          </div>
          <div style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.foreground,
            fontFamily: typography.fontMono
          }}>
            {oddsDecimalNum.toFixed(2)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            +{potentialProfit}%
          </div>
        </div>

        {/* Expected ROI */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Expected ROI
          </div>
          <div style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: expectedROINum > 0 ? colors.positive : colors.negative,
            fontFamily: typography.fontMono
          }}>
            {expectedROINum > 0 ? '+' : ''}{expectedROINum.toFixed(1)}%
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            Value bet
          </div>
        </div>

        {/* Confidence */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Confidence
          </div>
          <div style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: getConfidenceColor(confidenceNum),
            fontFamily: typography.fontMono
          }}>
            {confidenceNum}/10
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            {getConfidenceLabel(confidenceNum)}
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div style={{
        marginBottom: spacing[4]
      }}>
        <div style={{
          height: '8px',
          background: colors.gray[900],
          borderRadius: radius.sm,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${confidenceNum * 10}%`,
            height: '100%',
            background: `linear-gradient(to right, ${getConfidenceColor(confidenceNum)}, ${getConfidenceColor(confidenceNum)}dd)`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Summary Text */}
      <div style={{
        fontSize: typography.fontSize.sm,
        color: colors.gray[400],
        textAlign: 'center',
        lineHeight: 1.6
      }}>
        Strong value bet with{' '}
        <span style={{
          color: colors.positive,
          fontWeight: typography.fontWeight.semibold
        }}>
          {expectedROINum.toFixed(1)}% expected ROI
        </span>
        {' '}at {oddsDecimalNum.toFixed(2)} odds.{' '}
        <span style={{
          color: getConfidenceColor(confidenceNum),
          fontWeight: typography.fontWeight.semibold
        }}>
          {getConfidenceLabel(confidenceNum)} confidence
        </span>
        {' '}({confidenceNum}/10) based on comprehensive analysis.
      </div>
    </div>
  )
}
