'use client'

import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface ScoreProjectionRangeProps {
  projectedMin: number
  projectedMax: number
  bettingLine: number
}

export function ScoreProjectionRange({
  projectedMin,
  projectedMax,
  bettingLine
}: ScoreProjectionRangeProps) {
  // Calculate metrics
  const rangeAverage = (projectedMin + projectedMax) / 2
  const cushionMin = bettingLine - projectedMax  // Minimum cushion (best case)
  const cushionMax = bettingLine - projectedMin  // Maximum cushion (worst case)
  const isUnderSupported = projectedMax < bettingLine

  // For visualization scale (add padding on both sides)
  const scaleMin = Math.min(projectedMin, bettingLine) - 20
  const scaleMax = Math.max(projectedMax, bettingLine) + 20
  const scaleRange = scaleMax - scaleMin

  // Calculate positions (percentage from left)
  const getPosition = (value: number) => {
    return ((value - scaleMin) / scaleRange) * 100
  }

  const projectedMinPos = getPosition(projectedMin)
  const projectedMaxPos = getPosition(projectedMax)
  const bettingLinePos = getPosition(bettingLine)
  const rangeWidth = projectedMaxPos - projectedMinPos

  return (
    <div>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[4]
      }}>
        {/* Projected Range Card */}
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
            PROJECTED RANGE
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.foreground,
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {projectedMin} - {projectedMax}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            Average: {rangeAverage.toFixed(1)} points
          </div>
        </div>

        {/* Cushion Card */}
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
            CUSHION BELOW LINE
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: isUnderSupported ? colors.positive : colors.negative,
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {cushionMin.toFixed(1)} - {cushionMax.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            vs {Number(bettingLine).toFixed(1)} line
          </div>
        </div>
      </div>

      {/* Range Visualization */}
      <div style={{
        background: colors.background,
        padding: spacing[6],
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          marginBottom: spacing[6],
          fontWeight: typography.fontWeight.medium
        }}>
          Score Projection vs Betting Line
        </div>

        {/* Visualization Container */}
        <div style={{
          position: 'relative',
          height: '180px',
          marginBottom: spacing[6]
        }}>
          {/* Scale Line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '2px',
            background: colors.gray[800],
            transform: 'translateY(-50%)'
          }} />

          {/* Scale Labels */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            display: 'flex',
            justifyContent: 'space-between',
            transform: 'translateY(calc(-50% + 16px))'
          }}>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[500],
              fontFamily: typography.fontMono
            }}>
              {scaleMin}
            </div>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[500],
              fontFamily: typography.fontMono
            }}>
              {scaleMax}
            </div>
          </div>

          {/* Projected Range Bar */}
          <div style={{
            position: 'absolute',
            left: `${projectedMinPos}%`,
            top: '50%',
            width: `${rangeWidth}%`,
            height: '32px',
            background: isUnderSupported ? colors.positiveBg : colors.negativeBg,
            border: `2px solid ${isUnderSupported ? colors.positive : colors.negative}`,
            borderRadius: radius.md,
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.bold,
              color: isUnderSupported ? colors.positive : colors.negative,
              fontFamily: typography.fontMono
            }}>
              {projectedMin}-{projectedMax}
            </span>
          </div>

          {/* Betting Line Marker */}
          <div style={{
            position: 'absolute',
            left: `${bettingLinePos}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            background: colors.gray[700],
            zIndex: 2
          }}>
            {/* Arrow at top */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `8px solid ${colors.gray[700]}`
            }} />

            {/* Arrow at bottom */}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: `8px solid ${colors.gray[700]}`
            }} />
          </div>

          {/* Betting Line Label */}
          <div style={{
            position: 'absolute',
            left: `${bettingLinePos}%`,
            bottom: '-40px',
            transform: 'translateX(-50%)',
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            fontFamily: typography.fontMono,
            fontWeight: typography.fontWeight.bold,
            background: colors.background,
            padding: `${spacing[1]} ${spacing[2]}`,
            borderRadius: radius.sm,
            border: `1px solid ${colors.gray[800]}`,
            whiteSpace: 'nowrap'
          }}>
            LINE: {Number(bettingLine).toFixed(1)}
          </div>

          {/* Projected Min Label */}
          <div style={{
            position: 'absolute',
            left: `${projectedMinPos}%`,
            top: '-30px',
            transform: 'translateX(-50%)',
            fontSize: typography.fontSize.xs,
            color: colors.gray[500],
            fontFamily: typography.fontMono,
            whiteSpace: 'nowrap'
          }}>
            Min: {projectedMin}
          </div>

          {/* Projected Max Label */}
          <div style={{
            position: 'absolute',
            left: `${projectedMaxPos}%`,
            top: '-30px',
            transform: 'translateX(-50%)',
            fontSize: typography.fontSize.xs,
            color: colors.gray[500],
            fontFamily: typography.fontMono,
            whiteSpace: 'nowrap'
          }}>
            Max: {projectedMax}
          </div>

          {/* Cushion Zone Indicators */}
          {isUnderSupported && (
            <>
              {/* Best Case Cushion (projectedMax to line) */}
              <div style={{
                position: 'absolute',
                left: `${projectedMaxPos}%`,
                top: '50%',
                width: `${bettingLinePos - projectedMaxPos}%`,
                height: '4px',
                background: `linear-gradient(to right, ${colors.positive}20, transparent)`,
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }} />
            </>
          )}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: spacing[6],
          justifyContent: 'center',
          paddingTop: spacing[4],
          borderTop: `1px solid ${colors.gray[900]}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <div style={{
              width: '24px',
              height: '16px',
              background: isUnderSupported ? colors.positiveBg : colors.negativeBg,
              border: `2px solid ${isUnderSupported ? colors.positive : colors.negative}`,
              borderRadius: radius.sm
            }} />
            <span style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[400]
            }}>
              Projected Range
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <div style={{
              width: '2px',
              height: '16px',
              background: colors.gray[700]
            }} />
            <span style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[400]
            }}>
              Betting Line
            </span>
          </div>
          {isUnderSupported && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}>
              <div style={{
                width: '24px',
                height: '4px',
                background: `${colors.positive}20`
              }} />
              <span style={{
                fontSize: typography.fontSize.xs,
                color: colors.gray[400]
              }}>
                Safety Cushion
              </span>
            </div>
          )}
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
        <strong>Projection Analysis:</strong> The projected score range of{' '}
        <span style={{ color: colors.foreground, fontFamily: typography.fontMono, fontWeight: typography.fontWeight.bold }}>
          {projectedMin}-{projectedMax} points
        </span>
        {' '}(average: {rangeAverage.toFixed(1)}) sits{' '}
        {isUnderSupported ? (
          <>
            <span style={{ color: colors.positive, fontWeight: typography.fontWeight.semibold }}>
              {cushionMin.toFixed(1)}-{cushionMax.toFixed(1)} points below
            </span>
            {' '}the betting line of{' '}
            <span style={{ fontFamily: typography.fontMono, fontWeight: typography.fontWeight.bold }}>
              {Number(bettingLine).toFixed(1)}
            </span>.
            {' '}This provides a{' '}
            <span style={{ color: colors.positive, fontWeight: typography.fontWeight.semibold }}>
              comfortable cushion supporting the UNDER
            </span>, as even the worst-case projection (max: {projectedMax}) remains below the line.
          </>
        ) : (
          <>
            <span style={{ color: colors.negative, fontWeight: typography.fontWeight.semibold }}>
              above
            </span>
            {' '}the betting line of{' '}
            <span style={{ fontFamily: typography.fontMono, fontWeight: typography.fontWeight.bold }}>
              {Number(bettingLine).toFixed(1)}
            </span>.
            {' '}This suggests the projection{' '}
            <span style={{ color: colors.negative, fontWeight: typography.fontWeight.semibold }}>
              favors the OVER
            </span>, with the minimum projection ({projectedMin}) exceeding the line.
          </>
        )}
      </div>
    </div>
  )
}
