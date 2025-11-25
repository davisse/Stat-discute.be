export const dynamic = 'force-dynamic'

import { getStartersWithSignificantAbsences, getTeammatePerformanceSplits } from '@/lib/queries'
import { AppLayout } from '@/components/layout'
import { AbsenceCascadeView, AbsencePlayerSelector } from '@/components/player-props'

interface PageProps {
  searchParams: Promise<{ team?: string; player?: string }>
}

export default async function AbsenceCascadeTestPage({ searchParams }: PageProps) {
  const params = await searchParams
  const starters = await getStartersWithSignificantAbsences()

  console.log('🔍 [SERVER] Page rendering with params:', params)

  // Determine selected player from URL params or default
  let selectedStarter = starters[0]

  if (params.player) {
    const playerId = parseInt(params.player)
    const playerFromUrl = starters.find((s: any) => s.player_id === playerId)
    if (playerFromUrl) {
      selectedStarter = playerFromUrl
      console.log('✅ [SERVER] Selected player from URL:', selectedStarter.player_name, `(${selectedStarter.team_abbreviation})`)
    }
  } else if (params.team) {
    // If only team is specified, use first player from that team
    const teamPlayer = starters.find((s: any) => s.team_abbreviation === params.team)
    if (teamPlayer) {
      selectedStarter = teamPlayer
      console.log('✅ [SERVER] Selected first player from team:', selectedStarter.player_name, `(${selectedStarter.team_abbreviation})`)
    }
  } else {
    // Default: Try Stephen Curry first, otherwise first in list
    const curryStarter = starters.find((s: any) => s.player_name.includes('Stephen Curry'))
    selectedStarter = curryStarter || starters[0]
    console.log('✅ [SERVER] Using default player:', selectedStarter?.player_name)
  }

  if (!selectedStarter) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-4">Absence Cascade Analysis</h1>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">No starters with significant absences found</p>
            <p className="text-sm text-gray-500 mt-2">
              Starters need 5+ games played, 3+ games missed, and 20+ mpg
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Get teammate performance splits
  const teammates = await getTeammatePerformanceSplits(
    selectedStarter.player_id,
    selectedStarter.team_id,
    3 // Minimum 3 games threshold
  )

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Absence Cascade Analysis</h1>
          <p className="text-gray-400">
            How do teammates perform when a starter is absent? Identify betting opportunities from usage redistribution.
          </p>
        </div>

        {/* Player Selection Controls */}
        <AbsencePlayerSelector
          starters={starters}
          currentPlayerId={selectedStarter.player_id}
        />

        {/* Main Component */}
        <AbsenceCascadeView
          key={`cascade-${selectedStarter.player_id}`}
          absentPlayer={{
            playerId: selectedStarter.player_id,
            playerName: selectedStarter.player_name,
            teamId: selectedStarter.team_id,
            teamAbbr: selectedStarter.team_abbreviation,
            gamesPlayed: selectedStarter.games_played,
            gamesMissed: selectedStarter.games_missed,
          }}
          teammates={teammates}
        />

        {/* Betting Intelligence Summary */}
        {teammates.length > 0 && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">💡 Betting Intelligence Summary</h2>
            <div className="space-y-4">
              {/* Top Beneficiaries */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">Top Beneficiaries (Points)</h3>
                <div className="space-y-2">
                  {teammates
                    .filter((t) => t.stats.points.delta > 3.0 && t.stats.points.deltaPercent > 20)
                    .slice(0, 3)
                    .map((teammate) => (
                      <div key={teammate.player_id} className="flex items-center justify-between text-sm">
                        <span className="text-white">{teammate.player_name}</span>
                        <span className="font-mono text-green-400">
                          +{teammate.stats.points.delta} PPG ({teammate.stats.points.deltaPercent > 0 ? '+' : ''}
                          {teammate.stats.points.deltaPercent}%)
                        </span>
                      </div>
                    ))}
                  {teammates.filter((t) => t.stats.points.delta > 3.0 && t.stats.points.deltaPercent > 20).length ===
                    0 && <p className="text-sm text-gray-500">No significant point increases detected</p>}
                </div>
              </div>

              {/* Usage Increases */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">Biggest Usage Increases (FG Attempts)</h3>
                <div className="space-y-2">
                  {teammates
                    .filter((t) => t.stats.fg_attempts.delta > 2.0)
                    .slice(0, 3)
                    .map((teammate) => (
                      <div key={teammate.player_id} className="flex items-center justify-between text-sm">
                        <span className="text-white">{teammate.player_name}</span>
                        <span className="font-mono text-blue-400">
                          +{teammate.stats.fg_attempts.delta} FGA ({teammate.stats.fg_attempts.deltaPercent > 0 ? '+' : ''}
                          {teammate.stats.fg_attempts.deltaPercent}%)
                        </span>
                      </div>
                    ))}
                  {teammates.filter((t) => t.stats.fg_attempts.delta > 2.0).length === 0 && (
                    <p className="text-sm text-gray-500">No significant usage increases detected</p>
                  )}
                </div>
              </div>

              {/* Prop Betting Strategy */}
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-white">Strategy:</span> When {selectedStarter.player_name} is ruled
                  out, target <span className="text-green-400">over props</span> on teammates showing +20% or greater
                  increases in points, assists, or rebounds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Notes */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-yellow-400 mb-2">📊 Data Notes</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Minimum 3 games threshold for both "with" and "without" categories</li>
            <li>• Prop opportunities marked when delta ≥ 3.0 PPG (or 1.5 APG, 2.0 RPG) AND ≥20% increase</li>
            <li>• Usage measured by FG attempts increase when starter is absent</li>
            <li>• Color coding: Green = positive change, Red = negative change, Gray = minimal change (&lt;10%)</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  )
}
