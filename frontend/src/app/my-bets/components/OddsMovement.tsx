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
    if (isLineDown) return colors.positive  // Good for UNDER bet
    if (lineMovement > 0) return colors.negative
    return colors.gray[400]
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
            OPENING LINE
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.foreground,
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {openingLineNum.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            @ {openingOddsNum.toFixed(2)} odds
          </div>
        </div>

        {/* Current Line */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `2px solid ${getMovementColor()}`
        }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            CURRENT LINE
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: getMovementColor(),
            fontFamily: typography.fontMono,
            marginBottom: spacing[1]
          }}>
            {currentLineNum.toFixed(1)}
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            @ {currentOddsNum.toFixed(2)} odds
          </div>
        </div>

        {/* Movement Indicator */}
        <div style={{
          background: colors.background,
          padding: spacing[4],
          borderRadius: radius.md,
          border: `1px solid ${getMovementColor()}`
        }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[400],
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
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: getMovementColor(),
              fontFamily: typography.fontMono
            }}>
              {lineMovement > 0 ? '+' : ''}{lineMovement.toFixed(1)}
            </div>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: getMovementColor(),
              fontFamily: typography.fontMono
            }}>
              ({lineMovementPercent > 0 ? '+' : ''}{lineMovementPercent.toFixed(2)}%)
            </div>
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.gray[500]
          }}>
            {getMovementLabel()}
          </div>
        </div>
      </div>

      {/* Movement Visualization */}
      <div style={{
        background: colors.background,
        padding: spacing[6],
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          marginBottom: spacing[4],
          fontWeight: typography.fontWeight.medium
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
            background: colors.gray[800],
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
              background: colors.gray[700],
              border: `2px solid ${colors.foreground}`,
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
                fontSize: typography.fontSize.xs,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                Opening
              </div>
              <div style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.foreground,
                fontFamily: typography.fontMono
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
              border: `3px solid ${colors.background}`,
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
                fontSize: typography.fontSize.xs,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                Current
              </div>
              <div style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: getMovementColor(),
                fontFamily: typography.fontMono
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
              fontSize: typography.fontSize.xs,
              color: colors.gray[400],
              marginBottom: spacing[1],
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Market Sentiment
            </div>
            <div style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
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
              fontSize: typography.fontSize.xs,
              color: colors.gray[400],
              marginBottom: spacing[1]
            }}>
              Direction
            </div>
            <div style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
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
        background: colors.background,
        padding: spacing[4],
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`
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
              Odds Movement
            </div>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[400]
            }}>
              {openingOddsNum.toFixed(2)} → {currentOddsNum.toFixed(2)}
            </div>
          </div>
          <div style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: isOddsUp ? colors.positive : colors.negative,
            fontFamily: typography.fontMono
          }}>
            {oddsMovement > 0 ? '+' : ''}{oddsMovement.toFixed(2)}
            <span style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[400],
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
        background: colors.background,
        borderRadius: radius.md,
        border: `1px solid ${colors.gray[900]}`,
        fontSize: typography.fontSize.sm,
        color: colors.gray[400]
      }}>
        <strong>Market Analysis:</strong> The line has moved from{' '}
        <span style={{ fontFamily: typography.fontMono, fontWeight: typography.fontWeight.bold }}>
          {openingLineNum.toFixed(1)}
        </span>
        {' '}to{' '}
        <span style={{
          color: getMovementColor(),
          fontFamily: typography.fontMono,
          fontWeight: typography.fontWeight.bold
        }}>
          {currentLineNum.toFixed(1)}
        </span>
        {' '}({lineMovement > 0 ? '+' : ''}{lineMovement.toFixed(1)} points,{' '}
        {lineMovementPercent > 0 ? '+' : ''}{lineMovementPercent.toFixed(2)}%), indicating{' '}
        <span style={{
          color: getMovementColor(),
          fontWeight: typography.fontWeight.semibold
        }}>
          {getMovementLabel().toLowerCase()}
        </span>
        {'. '}
        {isLineDown ? (
          <>
            This downward movement suggests sharp money is betting the UNDER, creating{' '}
            <span style={{ color: colors.positive, fontWeight: typography.fontWeight.semibold }}>
              increased value for UNDER bettors
            </span>
            {' '}as the odds have improved to{' '}
            <span style={{ fontFamily: typography.fontMono, fontWeight: typography.fontWeight.bold }}>
              {currentOddsNum.toFixed(2)}
            </span>.
          </>
        ) : lineMovement > 0 ? (
          <>
            This upward movement suggests public money is betting the OVER, which may indicate{' '}
            <span style={{ color: colors.negative, fontWeight: typography.fontWeight.semibold }}>
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
