'use client'

import { colors, spacing, radius, typography } from '@/lib/design-tokens'

interface OddsMovement {
  timestamp: string
  line: number
  odds: number
}

interface OddsMovementProps {
  openingLine: number
  currentLine: number
  openingOdds?: number
  currentOdds?: number
  movementHistory?: OddsMovement[]
}

export function OddsMovement({
  openingLine,
  currentLine,
  openingOdds = 1.95,
  currentOdds = 2.07,
  movementHistory = []
}: OddsMovementProps) {
  // Convert to numbers (database returns numeric as string)
  const openingLineNum = Number(openingLine)
  const currentLineNum = Number(currentLine)
  const openingOddsNum = Number(openingOdds)
  const currentOddsNum = Number(currentOdds)

  // Calculate line movement
  const lineMovement = currentLineNum - openingLineNum
  const lineMovementPercent = (lineMovement / openingLineNum) * 100

  // Calculate odds movement
  const oddsMovement = currentOddsNum - openingOddsNum
  const oddsMovementPercent = (oddsMovement / openingOddsNum) * 100

  // Determine movement direction and significance
  const isLineDown = lineMovement < 0
  const isOddsUp = oddsMovement > 0
  const isSignificantMove = Math.abs(lineMovement) >= 1.5

  // Movement direction indicator
  const getMovementLabel = () => {
    if (isLineDown) return 'UNDER Pressure'
    if (lineMovement > 0) return 'OVER Pressure'
    return 'No Movement'
  }

  const getMovementColor = () => {
    if (isLineDown) return colors.betting.positive  // Good for UNDER bet
    if (lineMovement > 0) return colors.betting.negative
    return colors.neutral[400]
  }

  return (
    <div>
      {/* Movement Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[4]
      }}>
        {/* Opening Line */}
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
            OPENING LINE
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: colors.text.primary,
            fontFamily: typography.fonts.mono,
            marginBottom: spacing[1]
          }}>
            {openingLineNum.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500]
          }}>
            @ {openingOddsNum.toFixed(2)} odds
          </div>
        </div>

        {/* Current Line */}
        <div style={{
          background: colors.background.card,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `2px solid ${getMovementColor()}`
        }}>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            CURRENT LINE
          </div>
          <div style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: getMovementColor(),
            fontFamily: typography.fonts.mono,
            marginBottom: spacing[1]
          }}>
            {currentLineNum.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500]
          }}>
            @ {currentOddsNum.toFixed(2)} odds
          </div>
        </div>

        {/* Movement Indicator */}
        <div style={{
          background: colors.background.card,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${getMovementColor()}`
        }}>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            LINE MOVEMENT
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: spacing[2],
            marginBottom: spacing[1]
          }}>
            <div style={{
              fontSize: typography.sizes['3xl'],
              fontWeight: typography.weights.bold,
              color: getMovementColor(),
              fontFamily: typography.fonts.mono
            }}>
              {lineMovement > 0 ? '+' : ''}{lineMovement.toFixed(1)}
            </div>
            <div style={{
              fontSize: typography.sizes.sm,
              color: getMovementColor(),
              fontFamily: typography.fonts.mono
            }}>
              ({lineMovementPercent > 0 ? '+' : ''}{lineMovementPercent.toFixed(2)}%)
            </div>
          </div>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.neutral[500]
          }}>
            {getMovementLabel()}
          </div>
        </div>
      </div>

      {/* Movement Visualization */}
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
          Line Movement Tracker
        </div>

        {/* Arrow Visualization */}
        <div style={{
          position: 'relative',
          height: '120px',
          marginBottom: spacing[6]
        }}>
          {/* Center Line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '2px',
            background: colors.neutral[800],
            transform: 'translateY(-50%)'
          }} />

          {/* Opening Line Marker */}
          <div style={{
            position: 'absolute',
            left: '25%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: colors.neutral[700],
              border: `2px solid ${colors.text.primary}`,
              marginBottom: spacing[2]
            }} />
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: typography.sizes.xs,
                color: colors.neutral[400],
                marginBottom: spacing[1]
              }}>
                Opening
              </div>
              <div style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
                color: colors.text.primary,
                fontFamily: typography.fonts.mono
              }}>
                {openingLineNum.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Movement Arrow */}
          <svg style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill={getMovementColor()}
                />
              </marker>
            </defs>
            <line
              x1="25%"
              y1="50%"
              x2="75%"
              y2="50%"
              stroke={getMovementColor()}
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
            />
          </svg>

          {/* Current Line Marker */}
          <div style={{
            position: 'absolute',
            left: '75%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: getMovementColor(),
              border: `3px solid ${colors.background.card}`,
              boxShadow: `0 0 0 2px ${getMovementColor()}`,
              marginBottom: spacing[2]
            }} />
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: typography.sizes.xs,
                color: colors.neutral[400],
                marginBottom: spacing[1]
              }}>
                Current
              </div>
              <div style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
                color: getMovementColor(),
                fontFamily: typography.fonts.mono
              }}>
                {currentLineNum.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Movement Impact */}
        <div style={{
          padding: spacing[4],
          background: `${getMovementColor()}10`,
          borderRadius: radius.md,
          border: `1px solid ${getMovementColor()}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontSize: typography.sizes.xs,
              color: colors.neutral[400],
              marginBottom: spacing[1],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Market Sentiment
            </div>
            <div style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: getMovementColor()
            }}>
              {getMovementLabel()}
              {isSignificantMove && ' (Significant)'}
            </div>
          </div>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              fontSize: typography.sizes.xs,
              color: colors.neutral[400],
              marginBottom: spacing[1]
            }}>
              Direction
            </div>
            <div style={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: getMovementColor()
            }}>
              {isLineDown ? '↓' : lineMovement > 0 ? '↑' : '→'}
            </div>
          </div>
        </div>
      </div>

      {/* Odds Movement Detail */}
      <div style={{
        marginTop: spacing[4],
        background: colors.background.card,
        padding: spacing[4],
        borderRadius: radius.md,
        border: `1px solid ${colors.neutral[900]}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontSize: typography.sizes.xs,
              color: colors.neutral[400],
              marginBottom: spacing[1],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Odds Movement
            </div>
            <div style={{
              fontSize: typography.sizes.sm,
              color: colors.neutral[400]
            }}>
              {openingOddsNum.toFixed(2)} → {currentOddsNum.toFixed(2)}
            </div>
          </div>
          <div style={{
            fontSize: typography.sizes['2xl'],
            fontWeight: typography.weights.bold,
            color: isOddsUp ? colors.betting.positive : colors.betting.negative,
            fontFamily: typography.fonts.mono
          }}>
            {oddsMovement > 0 ? '+' : ''}{oddsMovement.toFixed(2)}
            <span style={{
              fontSize: typography.sizes.sm,
              color: colors.neutral[400],
              marginLeft: spacing[2]
            }}>
              ({oddsMovementPercent > 0 ? '+' : ''}{oddsMovementPercent.toFixed(1)}%)
            </span>
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
        <strong>Market Analysis:</strong> The line has moved from{' '}
        <span style={{ fontFamily: typography.fonts.mono, fontWeight: typography.weights.bold }}>
          {openingLineNum.toFixed(1)}
        </span>
        {' '}to{' '}
        <span style={{
          color: getMovementColor(),
          fontFamily: typography.fonts.mono,
          fontWeight: typography.weights.bold
        }}>
          {currentLineNum.toFixed(1)}
        </span>
        {' '}({lineMovement > 0 ? '+' : ''}{lineMovement.toFixed(1)} points,{' '}
        {lineMovementPercent > 0 ? '+' : ''}{lineMovementPercent.toFixed(2)}%), indicating{' '}
        <span style={{
          color: getMovementColor(),
          fontWeight: typography.weights.semibold
        }}>
          {getMovementLabel().toLowerCase()}
        </span>
        {'. '}
        {isLineDown ? (
          <>
            This downward movement suggests sharp money is betting the UNDER, creating{' '}
            <span style={{ color: colors.betting.positive, fontWeight: typography.weights.semibold }}>
              increased value for UNDER bettors
            </span>
            {' '}as the odds have improved to{' '}
            <span style={{ fontFamily: typography.fonts.mono, fontWeight: typography.weights.bold }}>
              {currentOddsNum.toFixed(2)}
            </span>.
          </>
        ) : lineMovement > 0 ? (
          <>
            This upward movement suggests public money is betting the OVER, which may indicate{' '}
            <span style={{ color: colors.betting.negative, fontWeight: typography.weights.semibold }}>
              potential value on the UNDER
            </span>
            {' '}as contrarian bet.
          </>
        ) : (
          <>
            Minimal line movement suggests balanced action on both sides of the market.
          </>
        )}
      </div>
    </div>
  )
}
