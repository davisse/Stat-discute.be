'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { colors, spacing, radius, typography } from '@/lib/design-tokens'
import { BetPlayerImpactAnalysis } from './components/BetPlayerImpactAnalysis'
import { RecentGamesTrend } from './components/RecentGamesTrend'
import { HeadToHeadHistory } from './components/HeadToHeadHistory'
import { ScoreProjectionRange } from './components/ScoreProjectionRange'
import { PlayerStatusCard } from './components/PlayerStatusCard'
import { PaceAnalysis } from './components/PaceAnalysis'
import { OddsMovement } from './components/OddsMovement'
import { ValueCalculation } from './components/ValueCalculation'
import { RiskAssessmentGrid } from './components/RiskAssessmentGrid'
import { DecisionSummary } from './components/DecisionSummary'

interface BetStats {
  total_bets: number
  wins: number
  losses: number
  pushes: number
  pending: number
  win_percentage: number
  total_profit_loss: number
  total_winnings: number
  total_losses: number
  avg_profit_loss: number
  roi_per_bet: number
}

interface Bet {
  bet_id: number
  bet_date: string
  game_datetime: string
  home_team_abbr: string
  away_team_abbr: string
  bet_type: string
  bet_selection: string
  line_value: number
  odds_decimal: number
  odds_american: number
  stake_units: number
  result: 'win' | 'loss' | 'push' | 'pending' | null
  actual_total: number | null
  profit_loss: number | null
  confidence_rating: number
  notes: string
  key_factors: string[]
  analysis_steps: string[]
  home_team_score: number | null
  away_team_score: number | null
  combined_total: number | null
}

export default function MyBetsPage() {
  const [stats, setStats] = useState<BetStats | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedBetId, setExpandedBetId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [statsResponse, betsResponse] = await Promise.all([
        fetch('/api/my-bets?action=stats'),
        fetch('/api/my-bets')
      ])
      const statsData = await statsResponse.json()
      const betsData = await betsResponse.json()
      setStats(statsData)
      setBets(betsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getResultColor = (result: string | null) => {
    if (result === 'win') return colors.positive
    if (result === 'loss') return colors.negative
    if (result === 'push') return colors.gray[400]
    return colors.gray[500]
  }

  const getResultBg = (result: string | null) => {
    if (result === 'win') return colors.positiveBg
    if (result === 'loss') return colors.negativeBg
    if (result === 'push') return colors.gray[800]
    return colors.gray[900]
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          paddingLeft: spacing[6],
          paddingRight: spacing[6],
          paddingTop: spacing[12],
          paddingBottom: spacing[6],
          textAlign: 'center',
          fontSize: typography.fontSize.lg,
          color: colors.gray[500]
        }}>
          Loading your bets...
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: spacing[6]
      }}>
        {/* Page Header */}
        <div style={{ marginBottom: spacing[8] }}>
          <h1 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.foreground,
            marginBottom: spacing[2]
          }}>
            My Betting Tracker
          </h1>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[400]
          }}>
            One bet per day - Track performance and analyze results
          </p>
        </div>

        {/* Statistics Grid */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[4],
            marginBottom: spacing[8]
          }}>
            {/* Current Bankroll */}
            <div style={{
              background: colors.gray[950],
              border: `1px solid ${colors.gray[900]}`,
              borderRadius: radius.lg,
              padding: spacing[4]
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                Current Bankroll
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.foreground,
                fontFamily: typography.fontMono
              }}>
                {(100 + Number(stats.total_profit_loss || 0)).toFixed(2)}€
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.gray[500],
                marginTop: spacing[1]
              }}>
                Started with 100.00€
              </div>
            </div>

            {/* Total Profit/Loss */}
            <div style={{
              background: colors.gray[950],
              border: `1px solid ${colors.gray[900]}`,
              borderRadius: radius.lg,
              padding: spacing[4]
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                Total P/L
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: Number(stats.total_profit_loss || 0) >= 0 ? colors.positive : colors.negative,
                fontFamily: typography.fontMono
              }}>
                {Number(stats.total_profit_loss || 0) >= 0 ? '+' : ''}{Number(stats.total_profit_loss || 0).toFixed(2)}€
              </div>
            </div>

            {/* Win Percentage */}
            <div style={{
              background: colors.gray[950],
              border: `1px solid ${colors.gray[900]}`,
              borderRadius: radius.lg,
              padding: spacing[4]
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                Win Rate
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.foreground,
                fontFamily: typography.fontMono
              }}>
                {Number(stats.win_percentage || 0).toFixed(1)}%
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.gray[500],
                marginTop: spacing[1]
              }}>
                {stats.wins}W - {stats.losses}L - {stats.pushes}P
              </div>
            </div>

            {/* ROI Per Bet */}
            <div style={{
              background: colors.gray[950],
              border: `1px solid ${colors.gray[900]}`,
              borderRadius: radius.lg,
              padding: spacing[4]
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                Avg P/L per Bet
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: Number(stats.roi_per_bet || 0) >= 0 ? colors.positive : colors.negative,
                fontFamily: typography.fontMono
              }}>
                {Number(stats.roi_per_bet || 0) >= 0 ? '+' : ''}{Number(stats.roi_per_bet || 0).toFixed(2)}€
              </div>
            </div>

            {/* Total Bets */}
            <div style={{
              background: colors.gray[950],
              border: `1px solid ${colors.gray[900]}`,
              borderRadius: radius.lg,
              padding: spacing[4]
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                Total Bets
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.foreground,
                fontFamily: typography.fontMono
              }}>
                {stats.total_bets}
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.gray[500],
                marginTop: spacing[1]
              }}>
                {stats.pending} pending
              </div>
            </div>
          </div>
        )}

        {/* Bets List */}
        <div style={{
          background: colors.gray[950],
          border: `1px solid ${colors.gray[900]}`,
          borderRadius: radius.lg,
          padding: spacing[6]
        }}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.foreground,
            marginBottom: spacing[6]
          }}>
            All Bets
          </h2>

          {bets.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: spacing[12],
              color: colors.gray[500]
            }}>
              <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>🎲</div>
              <div style={{ fontSize: typography.fontSize.lg }}>No bets yet</div>
              <div style={{ fontSize: typography.fontSize.sm, marginTop: spacing[2] }}>
                Your bets will appear here
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              {bets.map((bet) => (
                <div
                  key={bet.bet_id}
                  style={{
                    background: colors.background,
                    border: `1px solid ${colors.gray[900]}`,
                    borderRadius: radius.md,
                    overflow: 'hidden'
                  }}
                >
                  {/* Bet Header */}
                  <div
                    style={{
                      padding: spacing[4],
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: spacing[4]
                    }}
                    onClick={() => setExpandedBetId(expandedBetId === bet.bet_id ? null : bet.bet_id)}
                  >
                    {/* Left: Date and Game */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.gray[400],
                        marginBottom: spacing[1]
                      }}>
                        {new Date(bet.bet_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.foreground,
                        fontFamily: typography.fontMono
                      }}>
                        {bet.home_team_abbr} vs {bet.away_team_abbr}
                      </div>
                    </div>

                    {/* Center: Bet Details */}
                    <div style={{ flex: 2, textAlign: 'center' }}>
                      <div style={{
                        fontSize: typography.fontSize.xl,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.foreground,
                        marginBottom: spacing[1]
                      }}>
                        {bet.bet_selection}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.gray[400]
                      }}>
                        {Number(bet.stake_units).toFixed(2)}€ @ {bet.odds_decimal} • Confidence: {bet.confidence_rating}/10
                      </div>
                    </div>

                    {/* Right: Result */}
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: `${spacing[2]} ${spacing[4]}`,
                        borderRadius: radius.md,
                        background: getResultBg(bet.result),
                        color: getResultColor(bet.result),
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.bold,
                        fontFamily: typography.fontMono,
                        marginBottom: spacing[2]
                      }}>
                        {bet.result?.toUpperCase() || 'PENDING'}
                      </div>
                      {bet.profit_loss !== null && (
                        <div style={{
                          fontSize: typography.fontSize.lg,
                          fontWeight: typography.fontWeight.bold,
                          color: Number(bet.profit_loss) >= 0 ? colors.positive : colors.negative,
                          fontFamily: typography.fontMono
                        }}>
                          {Number(bet.profit_loss) >= 0 ? '+' : ''}{Number(bet.profit_loss).toFixed(2)}€
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedBetId === bet.bet_id && (
                    <div style={{
                      padding: spacing[4],
                      borderTop: `1px solid ${colors.gray[900]}`,
                      background: colors.gray[950]
                    }}>
                      {/* Game Result */}
                      {bet.combined_total !== null && (
                        <div style={{ marginBottom: spacing[4] }}>
                          <div style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.gray[400],
                            marginBottom: spacing[2]
                          }}>
                            Final Score
                          </div>
                          <div style={{
                            fontSize: typography.fontSize.xl,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.foreground,
                            fontFamily: typography.fontMono
                          }}>
                            {bet.home_team_abbr} {bet.home_team_score} - {bet.away_team_score} {bet.away_team_abbr}
                            <span style={{
                              marginLeft: spacing[4],
                              color: colors.gray[400],
                              fontSize: typography.fontSize.base
                            }}>
                              (Total: {bet.combined_total})
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Key Factors */}
                      {bet.key_factors && bet.key_factors.length > 0 && (
                        <div style={{ marginBottom: spacing[4] }}>
                          <div style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.gray[400],
                            marginBottom: spacing[2]
                          }}>
                            Key Factors
                          </div>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: spacing[2]
                          }}>
                            {bet.key_factors.map((factor, index) => (
                              <div
                                key={index}
                                style={{
                                  padding: `${spacing[1]} ${spacing[3]}`,
                                  background: colors.gray[900],
                                  borderRadius: radius.sm,
                                  fontSize: typography.fontSize.xs,
                                  color: colors.gray[400]
                                }}
                              >
                                {factor}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Analysis Flow */}
                      {bet.analysis_steps && bet.analysis_steps.length > 0 && (
                        <div>
                          <div style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.gray[400],
                            marginBottom: spacing[3]
                          }}>
                            📊 Detailed Analysis Flow
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: spacing[3]
                          }}>
                            {bet.analysis_steps.map((step, index) => {
                              // Parse step format: "1. Title: Description" or "1. Title - Description"
                              const stepMatch = step.match(/^(\d+)\.\s*(.+?)(?::|-)(.+)$/)
                              const stepNumber = stepMatch ? stepMatch[1] : (index + 1).toString()
                              const stepTitle = stepMatch ? stepMatch[2].trim() : 'Analysis'
                              const stepDescription = stepMatch ? stepMatch[3].trim() : step

                              return (
                                <div
                                  key={index}
                                  style={{
                                    display: 'flex',
                                    gap: spacing[3],
                                    background: colors.background,
                                    padding: spacing[3],
                                    borderRadius: radius.md,
                                    borderLeft: `3px solid ${colors.gray[700]}`
                                  }}
                                >
                                  {/* Step Number */}
                                  <div style={{
                                    minWidth: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: colors.gray[900],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: typography.fontWeight.bold,
                                    color: colors.gray[400],
                                    fontFamily: typography.fontMono,
                                    flexShrink: 0
                                  }}>
                                    {stepNumber}
                                  </div>

                                  {/* Step Content */}
                                  <div style={{ flex: 1 }}>
                                    <div style={{
                                      fontSize: typography.fontSize.sm,
                                      fontWeight: typography.fontWeight.semibold,
                                      color: colors.foreground,
                                      marginBottom: spacing[1]
                                    }}>
                                      {stepTitle}
                                    </div>
                                    <div style={{
                                      fontSize: typography.fontSize.sm,
                                      color: colors.gray[400],
                                      lineHeight: 1.6,
                                      marginBottom: stepNumber === '2' ? spacing[3] : 0
                                    }}>
                                      {stepDescription}
                                    </div>

                                    {/* Step 2 Visualization: Home Performance Without Embiid */}
                                    {stepNumber === '2' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <BetPlayerImpactAnalysis
                                          teamId={1610612755}  // PHI
                                          teamAbbreviation="PHI"
                                          playerId={203954}  // Joel Embiid
                                          playerName="Joel Embiid"
                                          bettingLine={bet.line_value || 239.5}
                                          location="HOME"
                                        />
                                      </div>
                                    )}

                                    {/* Step 3 Visualization: Recent Form Analysis */}
                                    {stepNumber === '3' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <RecentGamesTrend
                                          teamAbbreviation="PHI"
                                          playerId={203954}  // Joel Embiid
                                          playerName="Joel Embiid"
                                          bettingLine={bet.line_value || 239.5}
                                          limit={6}
                                          location="HOME"
                                        />
                                      </div>
                                    )}

                                    {/* Step 4 Visualization: Head-to-Head Pattern */}
                                    {stepNumber === '4' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <HeadToHeadHistory
                                          team1Abbr={bet.home_team_abbr}
                                          team2Abbr={bet.away_team_abbr}
                                          bettingLine={bet.line_value || 239.5}
                                          limit={4}
                                        />
                                      </div>
                                    )}

                                    {/* Step 1 Visualization: Player Status Card */}
                                    {stepNumber === '1' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <PlayerStatusCard
                                          playerName="Joel Embiid"
                                          status="OUT"
                                          impactMetric="PPG Impact"
                                          impactValue={-9.9}
                                          reason="PHI averages 9.9 fewer points per game without Embiid"
                                        />
                                      </div>
                                    )}

                                    {/* Step 5 Visualization: Miami Lineup Impact (Bam Adebayo) */}
                                    {stepNumber === '5' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <BetPlayerImpactAnalysis
                                          teamId={1610612748}  // MIA
                                          teamAbbreviation="MIA"
                                          playerId={1628389}  // Bam Adebayo
                                          playerName="Bam Adebayo"
                                          bettingLine={bet.line_value || 239.5}
                                        />
                                      </div>
                                    )}

                                    {/* Step 6 Visualization: Pace Analysis */}
                                    {stepNumber === '6' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <PaceAnalysis
                                          teamAbbr="PHI"
                                          playerName="Joel Embiid"
                                          paceWithPlayer={100.2}
                                          paceWithoutPlayer={95.8}
                                          possessionDifference={-4.4}
                                          projectedPossessions={95.8}
                                        />
                                      </div>
                                    )}

                                    {/* Step 7 Visualization: Odds Movement */}
                                    {stepNumber === '7' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <OddsMovement
                                          openingLine={241}
                                          currentLine={bet.line_value || 239.5}
                                          openingOdds={1.95}
                                          currentOdds={bet.odds_decimal || 2.07}
                                        />
                                      </div>
                                    )}

                                    {/* Step 8 Visualization: Value Calculation */}
                                    {stepNumber === '8' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <ValueCalculation
                                          oddsDecimal={bet.odds_decimal || 2.07}
                                          edge={21}
                                          expectedROI={38.75}
                                          estimatedProbability={58.5}
                                          impliedProbability={48.3}
                                        />
                                      </div>
                                    )}

                                    {/* Step 9 Visualization: Score Projection Range */}
                                    {stepNumber === '9' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <ScoreProjectionRange
                                          projectedMin={218}
                                          projectedMax={230}
                                          bettingLine={bet.line_value || 239.5}
                                        />
                                      </div>
                                    )}

                                    {/* Step 10 Visualization: Risk Assessment Grid */}
                                    {stepNumber === '10' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <RiskAssessmentGrid
                                          riskFactors={[
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
                                          ]}
                                        />
                                      </div>
                                    )}

                                    {/* Step 11 Visualization: Decision Summary */}
                                    {stepNumber === '11' && (
                                      <div style={{ marginTop: spacing[3] }}>
                                        <DecisionSummary
                                          betSelection={bet.bet_selection}
                                          lineValue={bet.line_value}
                                          oddsDecimal={bet.odds_decimal || 2.07}
                                          expectedROI={38.75}
                                          confidence={bet.confidence_rating}
                                        />

                                        {/* Actual Result (if game completed) */}
                                        {bet.result && bet.result !== 'pending' && bet.actual_total !== null && (
                                          <div style={{
                                            marginTop: spacing[4],
                                            padding: spacing[6],
                                            background: bet.result === 'win' ? `${colors.positive}10` : `${colors.negative}10`,
                                            border: `2px solid ${bet.result === 'win' ? colors.positive : colors.negative}`,
                                            borderRadius: radius.md,
                                            boxShadow: `0 0 20px ${bet.result === 'win' ? colors.positive : colors.negative}20`
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
                                              Actual Result
                                            </div>

                                            {/* Result Status */}
                                            <div style={{
                                              textAlign: 'center',
                                              marginBottom: spacing[6]
                                            }}>
                                              <div style={{
                                                fontSize: typography.fontSize['4xl'],
                                                fontWeight: typography.fontWeight.bold,
                                                color: bet.result === 'win' ? colors.positive : colors.negative,
                                                fontFamily: typography.fontMono,
                                                marginBottom: spacing[2]
                                              }}>
                                                {bet.result === 'win' ? '✅ WON' : '❌ LOST'}
                                              </div>
                                              <div style={{
                                                fontSize: typography.fontSize['2xl'],
                                                color: colors.foreground,
                                                fontFamily: typography.fontMono,
                                                fontWeight: typography.fontWeight.semibold
                                              }}>
                                                {Number(bet.actual_total).toFixed(1)} points
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
                                              {/* Betting Line */}
                                              <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                  fontSize: typography.fontSize.xs,
                                                  color: colors.gray[400],
                                                  marginBottom: spacing[1],
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.05em'
                                                }}>
                                                  Line
                                                </div>
                                                <div style={{
                                                  fontSize: typography.fontSize['2xl'],
                                                  fontWeight: typography.fontWeight.bold,
                                                  color: colors.foreground,
                                                  fontFamily: typography.fontMono
                                                }}>
                                                  {Number(bet.line_value).toFixed(1)}
                                                </div>
                                              </div>

                                              {/* Actual Total */}
                                              <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                  fontSize: typography.fontSize.xs,
                                                  color: colors.gray[400],
                                                  marginBottom: spacing[1],
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.05em'
                                                }}>
                                                  Actual
                                                </div>
                                                <div style={{
                                                  fontSize: typography.fontSize['2xl'],
                                                  fontWeight: typography.fontWeight.bold,
                                                  color: bet.result === 'win' ? colors.positive : colors.negative,
                                                  fontFamily: typography.fontMono
                                                }}>
                                                  {Number(bet.actual_total).toFixed(1)}
                                                </div>
                                              </div>

                                              {/* Difference */}
                                              <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                  fontSize: typography.fontSize.xs,
                                                  color: colors.gray[400],
                                                  marginBottom: spacing[1],
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.05em'
                                                }}>
                                                  Difference
                                                </div>
                                                <div style={{
                                                  fontSize: typography.fontSize['2xl'],
                                                  fontWeight: typography.fontWeight.bold,
                                                  color: bet.result === 'win' ? colors.positive : colors.negative,
                                                  fontFamily: typography.fontMono
                                                }}>
                                                  {Number(bet.actual_total) > Number(bet.line_value) ? '+' : ''}
                                                  {(Number(bet.actual_total) - Number(bet.line_value)).toFixed(1)}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Profit/Loss Summary */}
                                            <div style={{
                                              textAlign: 'center',
                                              fontSize: typography.fontSize.sm,
                                              color: colors.gray[400],
                                              lineHeight: 1.6
                                            }}>
                                              {bet.result === 'win' ? (
                                                <>
                                                  Bet <span style={{ color: colors.positive, fontWeight: typography.fontWeight.semibold }}>WON</span>
                                                  {' '}with profit of{' '}
                                                  <span style={{
                                                    color: colors.positive,
                                                    fontFamily: typography.fontMono,
                                                    fontWeight: typography.fontWeight.bold,
                                                    fontSize: typography.fontSize.lg
                                                  }}>
                                                    +{Number(bet.profit_loss).toFixed(2)}€
                                                  </span>
                                                  {' '}({((Number(bet.profit_loss) / Number(bet.stake_units)) * 100).toFixed(1)}% ROI)
                                                </>
                                              ) : (
                                                <>
                                                  Bet <span style={{ color: colors.negative, fontWeight: typography.fontWeight.semibold }}>LOST</span>
                                                  {'. '}Game went{' '}
                                                  <span style={{ color: colors.negative, fontWeight: typography.fontWeight.semibold }}>
                                                    {Number(bet.actual_total) > Number(bet.line_value) ? 'OVER' : 'UNDER'}
                                                  </span>
                                                  {' '}the line by {Math.abs(Number(bet.actual_total) - Number(bet.line_value)).toFixed(1)} points.
                                                  {' '}Loss of{' '}
                                                  <span style={{
                                                    color: colors.negative,
                                                    fontFamily: typography.fontMono,
                                                    fontWeight: typography.fontWeight.bold,
                                                    fontSize: typography.fontSize.lg
                                                  }}>
                                                    {Number(bet.profit_loss).toFixed(2)}€
                                                  </span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
