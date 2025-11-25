'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { TeamSelector } from './TeamSelector'
import { DefenseMetricsGrid } from './DefenseMetricsGrid'
import { OpponentScoringSection } from './OpponentScoringSection'
import { CombinedTotalAnalysis } from './CombinedTotalAnalysis'
import { PlayerImpactAnalysis } from './PlayerImpactAnalysis'
import { type TeamOption, type TeamDefenseGame, type TeamDefenseMetrics } from '@/lib/queries'
import { colors, spacing, typography } from '@/lib/design-tokens'

export default function TeamDefensePage() {
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [games, setGames] = useState<TeamDefenseGame[]>([])
  const [metrics, setMetrics] = useState<TeamDefenseMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch teams on mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch('/api/team-defense?action=teams')
        const data = await response.json()
        setTeams(data)
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      }
    }
    fetchTeams()
  }, [])

  // Fetch team defensive performance when team changes (no filters - fetch all games)
  useEffect(() => {
    if (!selectedTeamId) {
      setGames([])
      setMetrics(null)
      return
    }

    const teamIdToFetch = selectedTeamId // Capture for async closure

    async function fetchDefensivePerformance() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          teamId: teamIdToFetch.toString()
        })

        const response = await fetch(`/api/team-defense?${params}`)
        const data = await response.json()

        setGames(data.games)
        setMetrics(data.metrics)
      } catch (error) {
        console.error('Failed to fetch defensive performance:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDefensivePerformance()
  }, [selectedTeamId])

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
            Team Defensive Performance
          </h1>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[400]
          }}>
            Analyze how opponents score against selected teams throughout the season
          </p>
        </div>

        {/* Team Selector */}
        <div style={{ marginBottom: spacing[8] }}>
          <TeamSelector
            teams={teams}
            selectedTeamId={selectedTeamId}
            onTeamSelect={setSelectedTeamId}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{
            textAlign: 'center',
            padding: spacing[12],
            fontSize: typography.fontSize.lg,
            color: colors.gray[500]
          }}>
            Loading defensive performance data...
          </div>
        )}

        {/* Content - Show when team is selected */}
        {!isLoading && selectedTeamId && metrics && (
          <>
            {/* Metrics Grid */}
            <DefenseMetricsGrid metrics={metrics} />

            {/* Combined Total Analysis */}
            <CombinedTotalAnalysis
              games={games}
              teamAbbreviation={teams.find(t => t.team_id === selectedTeamId)?.abbreviation || ''}
            />

            {/* Player Impact Analysis */}
            <PlayerImpactAnalysis
              teamId={selectedTeamId}
              teamAbbreviation={teams.find(t => t.team_id === selectedTeamId)?.abbreviation || ''}
            />

            {/* Opponent Scoring Section with its own filters */}
            <OpponentScoringSection
              games={games}
              avgOpponentPpg={parseFloat(metrics.avg_opponent_ppg)}
            />
          </>
        )}

        {/* Empty State - Show when no team selected */}
        {!isLoading && !selectedTeamId && (
          <div style={{
            textAlign: 'center',
            padding: spacing[24],
            color: colors.gray[500]
          }}>
            <div style={{ fontSize: '64px', marginBottom: spacing[4] }}>🏀</div>
            <div style={{
              fontSize: typography.fontSize.xl,
              marginBottom: spacing[2]
            }}>
              Select a team to view defensive performance
            </div>
            <div style={{ fontSize: typography.fontSize.sm }}>
              Use the selector above to choose a team and analyze how their opponents score
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
