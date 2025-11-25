'use client'

import { type BettingValueAnalysis } from '@/lib/queries'

// Helper function to determine bet outcome
function getBetOutcome(rec: BettingValueAnalysis): { status: 'win' | 'loss' | 'push' | 'pending'; label: string; color: string } {
  // Game not finished yet
  if (rec.game_status !== 'Final' || rec.home_team_score === null || rec.away_team_score === null) {
    return { status: 'pending', label: 'Pending', color: '#6b7280' }
  }

  const homeWon = rec.home_team_score > rec.away_team_score

  // Simplified outcome logic (without exact betting lines)
  // For spread bets, check if recommended side won
  if (rec.recommended_bet_type === 'spread') {
    if (rec.recommended_side === 'home') {
      return homeWon
        ? { status: 'win', label: 'Won', color: '#10b981' }
        : { status: 'loss', label: 'Lost', color: '#ef4444' }
    } else {
      return !homeWon
        ? { status: 'win', label: 'Won', color: '#10b981' }
        : { status: 'loss', label: 'Lost', color: '#ef4444' }
    }
  }

  // For moneyline, just check winner
  if (rec.recommended_bet_type === 'moneyline') {
    const correctPick = (rec.recommended_side === 'home' && homeWon) || (rec.recommended_side === 'away' && !homeWon)
    return correctPick
      ? { status: 'win', label: 'Won', color: '#10b981' }
      : { status: 'loss', label: 'Lost', color: '#ef4444' }
  }

  // For other bet types, mark as pending (need more data)
  return { status: 'pending', label: 'N/A', color: '#6b7280' }
}

function getTierColor(tier: string | null): string {
  if (!tier) return 'rgba(255, 255, 255, 0.1)'
  switch (tier.toLowerCase()) {
    case 'exceptional': return '#10b981'
    case 'strong': return '#3b82f6'
    case 'good': return '#6366f1'
    case 'slight': return '#eab308'
    default: return 'rgba(255, 255, 255, 0.1)'
  }
}

function getTierEmoji(tier: string | null): string {
  if (!tier) return '📊'
  switch (tier.toLowerCase()) {
    case 'exceptional': return '🔥'
    case 'strong': return '⭐'
    case 'good': return '✅'
    case 'slight': return '⚖️'
    default: return '❌'
  }
}

interface GameCardProps {
  rec: BettingValueAnalysis
}

export function GameCard({ rec }: GameCardProps) {
  const score = parseFloat(rec.total_value_score.toString())
  const tierColor = getTierColor(rec.value_tier)
  const tierEmoji = getTierEmoji(rec.value_tier)
  const outcome = getBetOutcome(rec)

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
    >
      {/* Game Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          {/* Team Names and Date */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '4px'
            }}>
              {rec.away_team} @ {rec.home_team}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              {new Date(rec.game_date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>

            {/* Game Score */}
            {rec.game_status === 'Final' && rec.home_team_score !== null && rec.away_team_score !== null ? (
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#10b981',
                marginTop: '8px'
              }}>
                Final: {rec.away_team} {rec.away_team_score} - {rec.home_team} {rec.home_team_score}
              </div>
            ) : (
              <div style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontStyle: 'italic',
                marginTop: '8px'
              }}>
                {rec.game_status === 'Final' ? 'Score not available' : 'Game not started'}
              </div>
            )}
          </div>

          {/* Value Score Badge */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            padding: '12px 20px',
            marginLeft: '16px'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              fontFamily: 'JetBrains Mono, monospace',
              color: tierColor,
              lineHeight: '1'
            }}>
              {score.toFixed(0)}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Value
            </div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Value Tier Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: `${tierColor}22`,
            borderRadius: '8px',
            border: `1px solid ${tierColor}`,
            fontSize: '14px',
            fontWeight: '600',
            color: tierColor
          }}>
            <span>{tierEmoji}</span>
            <span>{rec.value_tier} Value</span>
          </div>

          {/* Bet Outcome Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: `${outcome.color}22`,
            borderRadius: '8px',
            border: `1px solid ${outcome.color}`,
            fontSize: '14px',
            fontWeight: '600',
            color: outcome.color
          }}>
            <span>{outcome.status === 'win' ? '✅' : outcome.status === 'loss' ? '❌' : '⏳'}</span>
            <span>{outcome.label}</span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '8px',
          fontWeight: '600'
        }}>
          Recommended Bet
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'white',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {rec.recommended_bet_type === 'spread' ? 'Spread' :
           rec.recommended_bet_type === 'moneyline' ? 'Moneyline' :
           rec.recommended_bet_type} - {rec.recommended_side === 'home' ? rec.home_team : rec.away_team}
        </div>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginTop: '4px'
        }}>
          Confidence: {rec.confidence_level}
        </div>
      </div>

      {/* Score Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '4px'
          }}>
            Matchup
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'white',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {parseFloat(rec.positional_matchup_score?.toString() || '0').toFixed(0)}/25
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '4px'
          }}>
            Trends
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'white',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {parseFloat(rec.betting_trend_score?.toString() || '0').toFixed(0)}/20
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '4px'
          }}>
            Stats
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'white',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {parseFloat(rec.advanced_stats_score?.toString() || '0').toFixed(0)}/20
          </div>
        </div>
      </div>
    </div>
  )
}
