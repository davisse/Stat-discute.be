'use client'

import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface RiskFactor {
  name: string
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH'
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
  description: string
  mitigation?: string
}

interface RiskAssessmentGridProps {
  riskFactors?: RiskFactor[]
}

export function RiskAssessmentGrid({
  riskFactors = [
    {
      name: 'Star Player Explosion',
      likelihood: 'MEDIUM',
      impact: 'HIGH',
      description: 'Maxey could have an exceptional scoring night (30+ pts)',
      mitigation: 'Historical averages suggest this is uncommon without Embiid'
    },
    {
      name: 'Overtime Period',
      likelihood: 'LOW',
      impact: 'HIGH',
      description: 'Extra 5 minutes adds ~20-25 points to total',
      mitigation: 'Only ~6% of NBA games go to overtime'
    },
    {
      name: 'Foul Trouble Impact',
      likelihood: 'LOW',
      impact: 'MEDIUM',
      description: 'Key players in foul trouble affects pace and scoring',
      mitigation: 'Strong defensive personnel on both teams'
    }
  ]
}: RiskAssessmentGridProps) {
  // Color mapping for traffic lights
  const getLikelihoodColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return colors.negative
      case 'MEDIUM':
        return '#f59e0b' // Orange
      case 'LOW':
        return colors.positive
      default:
        return colors.gray[400]
    }
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return colors.negative
      case 'MEDIUM':
        return '#f59e0b'
      case 'LOW':
        return colors.positive
      default:
        return colors.gray[400]
    }
  }

  const getRiskScore = (likelihood: string, impact: string) => {
    const likelihoodScore = likelihood === 'HIGH' ? 3 : likelihood === 'MEDIUM' ? 2 : 1
    const impactScore = impact === 'HIGH' ? 3 : impact === 'MEDIUM' ? 2 : 1
    return likelihoodScore * impactScore
  }

  const getOverallRiskColor = (score: number) => {
    if (score >= 6) return colors.negative
    if (score >= 4) return '#f59e0b'
    return colors.positive
  }

  const getOverallRiskLevel = (score: number) => {
    if (score >= 6) return 'HIGH RISK'
    if (score >= 4) return 'MODERATE RISK'
    return 'LOW RISK'
  }

  // Calculate overall risk
  const totalRiskScore = riskFactors.reduce((sum, factor) =>
    sum + getRiskScore(factor.likelihood, factor.impact), 0
  )
  const averageRiskScore = totalRiskScore / riskFactors.length
  const overallRiskColor = getOverallRiskColor(averageRiskScore)
  const overallRiskLevel = getOverallRiskLevel(averageRiskScore)

  return (
    <div>
      {/* Overall Risk Summary */}
      <div style={{
        background: colors.background,
        padding: spacing[4],
        borderRadius: radius.md,
        border: `2px solid ${overallRiskColor}`,
        marginBottom: spacing[4]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[400],
              marginBottom: spacing[1],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Overall Risk Level
            </div>
            <div style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: overallRiskColor,
              fontFamily: typography.fontMono
            }}>
              {overallRiskLevel}
            </div>
          </div>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: `${overallRiskColor}20`,
            border: `3px solid ${overallRiskColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: overallRiskColor,
            fontFamily: typography.fontMono
          }}>
            {averageRiskScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Risk Factors Grid */}
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
          Risk Factor Assessment
        </div>

        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: spacing[3],
          paddingBottom: spacing[3],
          borderBottom: `1px solid ${colors.gray[900]}`,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          color: colors.gray[400],
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div>Risk Factor</div>
          <div style={{ textAlign: 'center' }}>Likelihood</div>
          <div style={{ textAlign: 'center' }}>Impact</div>
          <div style={{ textAlign: 'center' }}>Risk Score</div>
        </div>

        {/* Risk Factors */}
        {riskFactors.map((factor, index) => {
          const riskScore = getRiskScore(factor.likelihood, factor.impact)
          const riskColor = getOverallRiskColor(riskScore)

          return (
            <div
              key={index}
              style={{
                borderBottom: index < riskFactors.length - 1 ? `1px solid ${colors.gray[900]}` : 'none'
              }}
            >
              {/* Main Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: spacing[3],
                paddingTop: spacing[4],
                paddingBottom: spacing[2],
                alignItems: 'center'
              }}>
                {/* Risk Name */}
                <div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.foreground,
                    marginBottom: spacing[1]
                  }}>
                    {factor.name}
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.gray[400]
                  }}>
                    {factor.description}
                  </div>
                </div>

                {/* Likelihood Badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    borderRadius: radius.sm,
                    background: `${getLikelihoodColor(factor.likelihood)}20`,
                    border: `1px solid ${getLikelihoodColor(factor.likelihood)}`,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    color: getLikelihoodColor(factor.likelihood),
                    textTransform: 'uppercase'
                  }}>
                    {factor.likelihood}
                  </div>
                </div>

                {/* Impact Badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    borderRadius: radius.sm,
                    background: `${getImpactColor(factor.impact)}20`,
                    border: `1px solid ${getImpactColor(factor.impact)}`,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    color: getImpactColor(factor.impact),
                    textTransform: 'uppercase'
                  }}>
                    {factor.impact}
                  </div>
                </div>

                {/* Risk Score */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `${riskColor}20`,
                    border: `2px solid ${riskColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: riskColor,
                    fontFamily: typography.fontMono
                  }}>
                    {riskScore}
                  </div>
                </div>
              </div>

              {/* Mitigation */}
              {factor.mitigation && (
                <div style={{
                  paddingBottom: spacing[4],
                  paddingLeft: spacing[3],
                  fontSize: typography.fontSize.xs,
                  color: colors.gray[500]
                }}>
                  <span style={{ color: colors.positive, fontWeight: typography.fontWeight.semibold }}>
                    Mitigation:
                  </span>
                  {' '}{factor.mitigation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Risk Legend */}
      <div style={{
        marginTop: spacing[4],
        padding: spacing[3],
        background: colors.background,
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`,
        fontSize: typography.fontSize.sm,
        color: colors.gray[400]
      }}>
        <strong>Risk Assessment Summary:</strong> Identified {riskFactors.length} risk factors with an average risk score of{' '}
        <span style={{
          color: overallRiskColor,
          fontFamily: typography.fontMono,
          fontWeight: typography.fontWeight.bold
        }}>
          {averageRiskScore.toFixed(1)}/9
        </span>
        {' '}({overallRiskLevel}). All risks have documented mitigations and are within acceptable tolerances for this betting opportunity.
      </div>
    </div>
  )
}
