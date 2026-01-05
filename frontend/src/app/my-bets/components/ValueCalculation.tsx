'use client'

import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface ValueCalculationProps {
  oddsDecimal: number
  impliedProbability?: number
  estimatedProbability?: number
  edge?: number
  expectedROI?: number
}

export function ValueCalculation({
  oddsDecimal,
  impliedProbability,
  estimatedProbability,
  edge = 21,
  expectedROI = 38.75
}: ValueCalculationProps) {
  // Convert to numbers (database returns numeric as string)
  const oddsDecimalNum = Number(oddsDecimal)
  const impliedProbabilityNum = impliedProbability ? Number(impliedProbability) : null
  const estimatedProbabilityNum = estimatedProbability ? Number(estimatedProbability) : null
  const edgeNum = Number(edge)
  const expectedROINum = Number(expectedROI)

  // Calculate implied probability from odds if not provided
  const impliedProb = impliedProbabilityNum || (1 / oddsDecimalNum) * 100

  // Estimated probability based on analysis (default to higher than implied for value bet)
  const estimatedProb = estimatedProbabilityNum || impliedProb + edgeNum

  // Calculate edge and ROI if not provided
  const calculatedEdge = edgeNum || estimatedProb - impliedProb
  const calculatedROI = expectedROINum || ((estimatedProb / 100) * (oddsDecimalNum - 1) - (1 - estimatedProb / 100)) * 100

  // Determine if this is a value bet
  const isValueBet = calculatedEdge > 0

  return (
    <div>
      {/* Main Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[4]
      }}>
        {/* Implied Probability */}
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
            Implied Probability
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: colors.text.primary,
            fontFamily: typography.fonts.mono,
            marginBottom: spacing[1]
          }}>
            {impliedProb.toFixed(1)}%
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500]
          }}>
            From {oddsDecimalNum.toFixed(2)} odds
          </div>
        </div>

        {/* Estimated Probability */}
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
            Estimated Probability
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: colors.betting.positive,
            fontFamily: typography.fonts.mono,
            marginBottom: spacing[1]
          }}>
            {estimatedProb.toFixed(1)}%
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500]
          }}>
            Based on analysis
          </div>
        </div>

        {/* Edge */}
        <div style={{
          background: colors.background.card,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${isValueBet ? colors.betting.positive : colors.neutral[900]}`
        }}>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Betting Edge
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: isValueBet ? colors.betting.positive : colors.betting.negative,
            fontFamily: typography.fonts.mono,
            marginBottom: spacing[1]
          }}>
            {calculatedEdge > 0 ? '+' : ''}{calculatedEdge.toFixed(1)}%
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500]
          }}>
            {isValueBet ? 'Value bet' : 'No value'}
          </div>
        </div>
      </div>

      {/* Expected Value Calculation */}
      <div style={{
        background: colors.background.card,
        padding: spacing[6],
        borderRadius: radius.md,
        border: `1px solid ${colors.neutral[900]}`
      }}>
        <div style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral[400],
          marginBottom: spacing[4],
          fontWeight: typography.weights.medium
        }}>
          Expected Value Calculation
        </div>

        {/* Formula Display */}
        <div style={{
          background: colors.neutral[950],
          padding: spacing[4],
          borderRadius: radius.md,
          marginBottom: spacing[4],
          fontFamily: typography.fonts.mono,
          fontSize: typography.sizes.sm,
          color: colors.text.primary
        }}>
          <div style={{ marginBottom: spacing[2] }}>
            EV = (Win Probability × Profit) - (Loss Probability × Stake)
          </div>
          <div style={{ color: colors.neutral[400] }}>
            EV = ({estimatedProb.toFixed(1)}% × {((oddsDecimalNum - 1) * 100).toFixed(0)}%) - ({(100 - estimatedProb).toFixed(1)}% × 100%)
          </div>
        </div>

        {/* Expected ROI Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing[4],
          background: isValueBet ? `${colors.betting.positive}10` : `${colors.betting.negative}10`,
          borderRadius: radius.md,
          border: `1px solid ${isValueBet ? colors.betting.positive : colors.betting.negative}`
        }}>
          <div>
            <div style={{
              fontSize: typography.sizes.xs,
              color: colors.neutral[400],
              marginBottom: spacing[1],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Expected Return on Investment
            </div>
            <div style={{
              fontSize: typography.sizes.sm,
              color: colors.neutral[400]
            }}>
              Per unit staked
            </div>
          </div>
          <div style={{
            fontSize: typography.sizes['4xl'],
            fontWeight: typography.weights.bold,
            color: isValueBet ? colors.betting.positive : colors.betting.negative,
            fontFamily: typography.fonts.mono
          }}>
            {calculatedROI > 0 ? '+' : ''}{calculatedROI.toFixed(2)}%
          </div>
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
        <strong>Value Assessment:</strong> The market odds of{' '}
        <span style={{ fontFamily: typography.fonts.mono, fontWeight: typography.weights.bold }}>
          {oddsDecimalNum.toFixed(2)}
        </span>
        {' '}imply a{' '}
        <span style={{ fontFamily: typography.fonts.mono, fontWeight: typography.weights.bold }}>
          {impliedProb.toFixed(1)}%
        </span>
        {' '}probability. Analysis suggests the true probability is{' '}
        <span style={{ color: colors.betting.positive, fontFamily: typography.fonts.mono, fontWeight: typography.weights.bold }}>
          {estimatedProb.toFixed(1)}%
        </span>, creating a{' '}
        <span style={{
          color: isValueBet ? colors.betting.positive : colors.betting.negative,
          fontWeight: typography.weights.semibold
        }}>
          {calculatedEdge > 0 ? '+' : ''}{calculatedEdge.toFixed(1)}% edge
        </span>
        {' '}with an expected ROI of{' '}
        <span style={{
          color: isValueBet ? colors.betting.positive : colors.betting.negative,
          fontFamily: typography.fonts.mono,
          fontWeight: typography.weights.bold
        }}>
          {calculatedROI > 0 ? '+' : ''}{calculatedROI.toFixed(2)}%
        </span>
        {' '}per unit staked.
        {isValueBet ? (
          <span style={{ color: colors.betting.positive, fontWeight: typography.weights.semibold }}>
            {' '}This represents a strong value betting opportunity.
          </span>
        ) : (
          <span style={{ color: colors.betting.negative, fontWeight: typography.weights.semibold }}>
            {' '}No value detected at current odds.
          </span>
        )}
      </div>
    </div>
  )
}
