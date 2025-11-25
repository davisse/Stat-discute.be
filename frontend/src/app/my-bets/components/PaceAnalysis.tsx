'use client'

import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface PaceAnalysisProps {
  teamAbbr: string
  playerName: string
  paceWithPlayer?: number
  paceWithoutPlayer?: number
  possessionDifference?: number
  projectedPossessions?: number
}

export function PaceAnalysis({
  teamAbbr,
  playerName,
  paceWithPlayer = 100.2,
  paceWithoutPlayer = 95.8,
  possessionDifference = -4.4,
  projectedPossessions = 95.8
}: PaceAnalysisProps) {
  // Convert to numbers (database returns numeric as string)
  const paceWithPlayerNum = Number(paceWithPlayer)
  const paceWithoutPlayerNum = Number(paceWithoutPlayer)
  const possessionDifferenceNum = Number(possessionDifference)
  const projectedPossessionsNum = Number(projectedPossessions)

  // Calculate percentage change
  const percentageChange = ((paceWithoutPlayerNum - paceWithPlayerNum) / paceWithPlayerNum) * 100

  // Determine impact level
  const getImpactLevel = (diff: number) => {
    const absDiff = Math.abs(diff)
    if (absDiff >= 5) return 'Significant'
    if (absDiff >= 3) return 'Moderate'
    return 'Minimal'
  }

  const impactLevel = getImpactLevel(possessionDifferenceNum)
  const isSlower = possessionDifferenceNum < 0

  return (
    <div>
      {/* Pace Comparison Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[4]
      }}>
        {/* Pace WITH Player */}
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
            WITH {playerName.split(' ')[1] || playerName}
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.foreground,
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {paceWithPlayerNum.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            Possessions/48 min
          </div>
        </div>

        {/* Pace WITHOUT Player */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${isSlower ? colors.positive : colors.negative}`
        }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            WITHOUT {playerName.split(' ')[1] || playerName}
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: isSlower ? colors.positive : colors.negative,
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {paceWithoutPlayerNum.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            Possessions/48 min
          </div>
        </div>

        {/* Difference */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${isSlower ? colors.positive : colors.negative}`
        }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            DIFFERENCE
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: isSlower ? colors.positive : colors.negative,
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {possessionDifferenceNum > 0 ? '+' : ''}{possessionDifferenceNum.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}% change
          </div>
        </div>
      </div>

      {/* Pace Visualization */}
      <div style={{
        background: colors.background,
        padding: spacing[6],
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`,
        marginBottom: spacing[4]
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          marginBottom: spacing[4],
          fontWeight: typography.fontWeight.medium
        }}>
          Pace Factor Impact for {teamAbbr}
        </div>

        {/* Pace Bars */}
        <div style={{
          marginBottom: spacing[6]
        }}>
          {/* WITH Player Bar */}
          <div style={{
            marginBottom: spacing[4]
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[2]
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.foreground,
                fontWeight: typography.fontWeight.medium
              }}>
                WITH {playerName.split(' ')[1] || playerName}
              </div>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.foreground,
                fontFamily: typography.fontMono,
                fontWeight: typography.fontWeight.bold
              }}>
                {paceWithPlayerNum.toFixed(1)}
              </div>
            </div>
            <div style={{
              height: '32px',
              background: colors.gray[900],
              borderRadius: radius.md,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(paceWithPlayerNum / 110) * 100}%`,
                background: colors.foreground,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: spacing[3]
              }} />
            </div>
          </div>

          {/* WITHOUT Player Bar */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[2]
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.foreground,
                fontWeight: typography.fontWeight.medium
              }}>
                WITHOUT {playerName.split(' ')[1] || playerName}
              </div>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: isSlower ? colors.positive : colors.negative,
                fontFamily: typography.fontMono,
                fontWeight: typography.fontWeight.bold
              }}>
                {paceWithoutPlayerNum.toFixed(1)}
              </div>
            </div>
            <div style={{
              height: '32px',
              background: colors.gray[900],
              borderRadius: radius.md,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(paceWithoutPlayerNum / 110) * 100}%`,
                background: `linear-gradient(to right, ${isSlower ? colors.positive : colors.negative}, ${isSlower ? colors.positive : colors.negative}dd)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: spacing[3]
              }} />
            </div>
          </div>
        </div>

        {/* Impact Indicator */}
        <div style={{
          padding: spacing[4],
          background: `${isSlower ? colors.positive : colors.negative}10`,
          borderRadius: radius.md,
          border: `1px solid ${isSlower ? colors.positive : colors.negative}`,
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
              Pace Impact Assessment
            </div>
            <div style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: isSlower ? colors.positive : colors.negative
            }}>
              {impactLevel} {isSlower ? 'Slowdown' : 'Speedup'}
            </div>
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: isSlower ? colors.positive : colors.negative,
            fontFamily: typography.fontMono
          }}>
            {possessionDifferenceNum > 0 ? '+' : ''}{possessionDifferenceNum.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Projected Impact */}
      <div style={{
        background: colors.background,
        padding: spacing[4],
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          marginBottom: spacing[3],
          fontWeight: typography.fontWeight.medium
        }}>
          Scoring Impact Projection
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[400],
              marginBottom: spacing[1]
            }}>
              Projected Possessions (48 min)
            </div>
            <div style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.foreground,
              fontFamily: typography.fontMono
            }}>
              {projectedPossessionsNum.toFixed(1)}
            </div>
          </div>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[400],
              marginBottom: spacing[1]
            }}>
              Estimated Point Impact
            </div>
            <div style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: isSlower ? colors.positive : colors.negative,
              fontFamily: typography.fontMono
            }}>
              {(possessionDifferenceNum * 1.1).toFixed(1)} pts
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div style={{
        marginTop: spacing[4],
        padding: spacing[3],
        background: colors.background,
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`,
        fontSize: typography.fontSize.sm,
        color: colors.gray[400]
      }}>
        <strong>Pace Analysis:</strong> Without {playerName}, {teamAbbr} averages{' '}
        <span style={{
          color: isSlower ? colors.positive : colors.negative,
          fontFamily: typography.fontMono,
          fontWeight: typography.fontWeight.bold
        }}>
          {paceWithoutPlayerNum.toFixed(1)} possessions per 48 minutes
        </span>
        {' '}compared to{' '}
        <span style={{ fontFamily: typography.fontMono, fontWeight: typography.fontWeight.bold }}>
          {paceWithPlayerNum.toFixed(1)}
        </span>
        {' '}with him ({possessionDifferenceNum > 0 ? '+' : ''}{possessionDifferenceNum.toFixed(1)} possessions,{' '}
        {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%).
        {' '}This{' '}
        <span style={{
          color: isSlower ? colors.positive : colors.negative,
          fontWeight: typography.fontWeight.semibold
        }}>
          {impactLevel.toLowerCase()} {isSlower ? 'slowdown' : 'speedup'}
        </span>
        {' '}translates to approximately{' '}
        <span style={{
          color: isSlower ? colors.positive : colors.negative,
          fontFamily: typography.fontMono,
          fontWeight: typography.fontWeight.bold
        }}>
          {Math.abs(possessionDifferenceNum * 1.1).toFixed(1)} fewer points
        </span>
        {' '}in combined game totals, strongly supporting the UNDER thesis.
      </div>
    </div>
  )
}
