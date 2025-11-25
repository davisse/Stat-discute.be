'use client'

import { type BettingValueAnalysis } from '@/lib/queries'

// Helper function to determine bet outcome
function getBetOutcome(rec: BettingValueAnalysis): { status: 'win' | 'loss' | 'push' | 'pending' } {
  if (rec.game_status !== 'Final' || rec.home_team_score === null || rec.away_team_score === null) {
    return { status: 'pending' }
  }

  const homeWon = rec.home_team_score > rec.away_team_score

  if (rec.recommended_bet_type === 'spread') {
    if (rec.recommended_side === 'home') {
      return homeWon ? { status: 'win' } : { status: 'loss' }
    } else {
      return !homeWon ? { status: 'win' } : { status: 'loss' }
    }
  }

  if (rec.recommended_bet_type === 'moneyline') {
    const correctPick = (rec.recommended_side === 'home' && homeWon) || (rec.recommended_side === 'away' && !homeWon)
    return correctPick ? { status: 'win' } : { status: 'loss' }
  }

  return { status: 'pending' }
}

interface PerformanceMetricsProps {
  recommendations: BettingValueAnalysis[]
}

export function PerformanceMetrics({ recommendations }: PerformanceMetricsProps) {
  // Calculate performance metrics
  const finishedGames = recommendations.filter(r => r.game_status === 'Final' && r.home_team_score !== null)
  const outcomes = finishedGames.map(getBetOutcome)
  const wins = outcomes.filter(o => o.status === 'win').length
  const losses = outcomes.filter(o => o.status === 'loss').length
  const winRate = finishedGames.length > 0 ? ((wins / finishedGames.length) * 100).toFixed(1) : '0.0'
  const avgScore = recommendations.length > 0
    ? (recommendations.reduce((sum, r) => sum + parseFloat(r.total_value_score.toString()), 0) / recommendations.length).toFixed(1)
    : '0.0'

  return (
    <div style={{
      display: 'flex',
      gap: '24px',
      flexWrap: 'wrap'
    }}>
      <div style={{
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
          Total Recommendations
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
          {recommendations.length}
        </div>
      </div>

      <div style={{
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
          Win Rate
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: parseFloat(winRate) >= 55 ? '#10b981' : '#ef4444' }}>
          {winRate}%
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
          {wins}W - {losses}L ({finishedGames.length} tracked)
        </div>
      </div>

      <div style={{
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
          Pending Results
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>
          {recommendations.filter(r => r.game_status !== 'Final').length}
        </div>
      </div>

      <div style={{
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
          Average Value Score
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
          {avgScore}
        </div>
      </div>
    </div>
  )
}
