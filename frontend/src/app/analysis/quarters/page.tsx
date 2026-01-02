'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

// Team colors for styling
const TEAM_COLORS: Record<string, string> = {
  ATL: '#E03A3E', BOS: '#007A33', BKN: '#000000', CHA: '#1D1160',
  CHI: '#CE1141', CLE: '#860038', DAL: '#00538C', DEN: '#0E2240',
  DET: '#C8102E', GSW: '#1D428A', HOU: '#CE1141', IND: '#002D62',
  LAC: '#C8102E', LAL: '#552583', MEM: '#5D76A9', MIA: '#98002E',
  MIL: '#00471B', MIN: '#0C2340', NOP: '#0C2340', NYK: '#006BB6',
  OKC: '#007AC1', ORL: '#0077C0', PHI: '#006BB6', PHX: '#1D1160',
  POR: '#E03A3E', SAC: '#5A2D81', SAS: '#C4CED4', TOR: '#CE1141',
  UTA: '#002B5C', WAS: '#002B5C',
}

interface TeamQuarterStats {
  teamId: number
  abbreviation: string
  teamName: string
  avgPoints: number
  avgAllowed: number
  periodWinPct: number
  gamesPlayed: number
  differential: number
}

interface TeamHalfStats {
  teamId: number
  abbreviation: string
  teamName: string
  avgPoints: number
  avgTotal: number
  avgMargin: number
  gamesPlayed: number
}

type AnalysisType = 'q1' | '1h'
type LocationFilter = 'ALL' | 'HOME' | 'AWAY'
type SortField = 'avgPoints' | 'avgAllowed' | 'periodWinPct' | 'differential' | 'avgTotal' | 'avgMargin'

export default function QuartersAnalysisPage() {
  const [q1Stats, setQ1Stats] = useState<TeamQuarterStats[]>([])
  const [halfStats, setHalfStats] = useState<TeamHalfStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<AnalysisType>('q1')
  const [location, setLocation] = useState<LocationFilter>('ALL')
  const [sortField, setSortField] = useState<SortField>('avgPoints')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/analysis/quarters?type=${analysisType}&location=${location}`)
        if (!res.ok) throw new Error('Failed to fetch quarter stats')
        const data = await res.json()

        if (analysisType === 'q1') {
          setQ1Stats(data.data)
        } else {
          setHalfStats(data.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [analysisType, location])

  // Sorting logic
  const sortedQ1Stats = [...q1Stats].sort((a, b) => {
    const field = sortField as keyof TeamQuarterStats
    const aVal = a[field] as number
    const bVal = b[field] as number
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal
  })

  const sortedHalfStats = [...halfStats].sort((a, b) => {
    const field = sortField as keyof TeamHalfStats
    const aVal = a[field] as number
    const bVal = b[field] as number
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="text-white">{sortDir === 'desc' ? '↓' : '↑'}</span>
        )}
      </div>
    </th>
  )

  // Calculate league averages
  const q1LeagueAvg = q1Stats.length > 0
    ? {
        avgPoints: q1Stats.reduce((sum, t) => sum + t.avgPoints, 0) / q1Stats.length,
        avgAllowed: q1Stats.reduce((sum, t) => sum + t.avgAllowed, 0) / q1Stats.length,
        winPct: q1Stats.reduce((sum, t) => sum + t.periodWinPct, 0) / q1Stats.length,
      }
    : null

  const halfLeagueAvg = halfStats.length > 0
    ? {
        avgPoints: halfStats.reduce((sum, t) => sum + t.avgPoints, 0) / halfStats.length,
        avgTotal: halfStats.reduce((sum, t) => sum + t.avgTotal, 0) / halfStats.length,
      }
    : null

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🏀 Quarter & Half Analysis
          </h1>
          <p className="text-gray-400">
            Team performance by period for Q1 and 1H betting
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Analysis Type Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => {
                setAnalysisType('q1')
                setSortField('avgPoints')
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisType === 'q1'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Q1 Analysis
            </button>
            <button
              onClick={() => {
                setAnalysisType('1h')
                setSortField('avgPoints')
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisType === '1h'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              1H Analysis
            </button>
          </div>

          {/* Location Filter */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['ALL', 'HOME', 'AWAY'] as LocationFilter[]).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === loc
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* League Averages */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {analysisType === 'q1' && q1LeagueAvg && (
              <>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{q1LeagueAvg.avgPoints.toFixed(1)}</div>
                  <div className="text-gray-400 text-sm">League Avg Q1 Pts</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{q1LeagueAvg.avgAllowed.toFixed(1)}</div>
                  <div className="text-gray-400 text-sm">League Avg Q1 Allowed</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{(q1LeagueAvg.avgPoints * 2).toFixed(1)}</div>
                  <div className="text-gray-400 text-sm">Avg Q1 Total</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{q1Stats.length}</div>
                  <div className="text-gray-400 text-sm">Teams</div>
                </div>
              </>
            )}
            {analysisType === '1h' && halfLeagueAvg && (
              <>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{halfLeagueAvg.avgPoints.toFixed(1)}</div>
                  <div className="text-gray-400 text-sm">League Avg 1H Pts</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{halfLeagueAvg.avgTotal.toFixed(1)}</div>
                  <div className="text-gray-400 text-sm">League Avg 1H Total</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{(halfLeagueAvg.avgTotal / 2).toFixed(1)}</div>
                  <div className="text-gray-400 text-sm">Avg Team 1H Pts</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{halfStats.length}</div>
                  <div className="text-gray-400 text-sm">Teams</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading stats...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <p className="text-gray-500 text-sm mt-2">
              Note: Run the ETL pipeline to populate period data first.
            </p>
          </div>
        )}

        {/* Q1 Table */}
        {!loading && !error && analysisType === 'q1' && sortedQ1Stats.length > 0 && (
          <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Team
                    </th>
                    <SortHeader field="avgPoints" label="Q1 Pts" />
                    <SortHeader field="avgAllowed" label="Q1 Allowed" />
                    <SortHeader field="differential" label="Diff" />
                    <SortHeader field="periodWinPct" label="Q1 Win %" />
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Games
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {sortedQ1Stats.map((team, idx) => {
                    const color = TEAM_COLORS[team.abbreviation] || '#666'
                    const diffColor = team.differential > 0 ? 'text-green-400' : team.differential < 0 ? 'text-red-400' : 'text-gray-400'
                    const winPctColor = team.periodWinPct > 0.55 ? 'text-green-400' : team.periodWinPct < 0.45 ? 'text-red-400' : 'text-white'

                    return (
                      <tr key={team.teamId} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 text-sm">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: color }}
                            >
                              {team.abbreviation}
                            </div>
                            <span className="text-white font-medium">{team.teamName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white font-mono font-bold">{team.avgPoints.toFixed(1)}</td>
                        <td className="px-4 py-3 text-white font-mono">{team.avgAllowed.toFixed(1)}</td>
                        <td className={`px-4 py-3 font-mono font-bold ${diffColor}`}>
                          {team.differential > 0 ? '+' : ''}{team.differential.toFixed(1)}
                        </td>
                        <td className={`px-4 py-3 font-mono ${winPctColor}`}>
                          {(team.periodWinPct * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-gray-400">{team.gamesPlayed}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 1H Table */}
        {!loading && !error && analysisType === '1h' && sortedHalfStats.length > 0 && (
          <div className="bg-gray-900/80 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Team
                    </th>
                    <SortHeader field="avgPoints" label="1H Pts" />
                    <SortHeader field="avgTotal" label="1H Total" />
                    <SortHeader field="avgMargin" label="1H Margin" />
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Games
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {sortedHalfStats.map((team, idx) => {
                    const color = TEAM_COLORS[team.abbreviation] || '#666'
                    const marginColor = team.avgMargin > 0 ? 'text-green-400' : team.avgMargin < 0 ? 'text-red-400' : 'text-gray-400'

                    return (
                      <tr key={team.teamId} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 text-sm">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: color }}
                            >
                              {team.abbreviation}
                            </div>
                            <span className="text-white font-medium">{team.teamName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white font-mono font-bold">{team.avgPoints.toFixed(1)}</td>
                        <td className="px-4 py-3 text-white font-mono">{team.avgTotal.toFixed(1)}</td>
                        <td className={`px-4 py-3 font-mono font-bold ${marginColor}`}>
                          {team.avgMargin > 0 ? '+' : ''}{team.avgMargin.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{team.gamesPlayed}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && ((analysisType === 'q1' && q1Stats.length === 0) || (analysisType === '1h' && halfStats.length === 0)) && (
          <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
            <p className="text-gray-400 mb-2">No period data available yet.</p>
            <p className="text-gray-500 text-sm">
              Run the ETL pipeline to fetch quarter scores:
            </p>
            <code className="text-xs text-blue-400 mt-2 block">
              python3 1.DATABASE/etl/fetch_period_scores.py && python3 1.DATABASE/etl/analytics/calculate_period_stats.py
            </code>
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
          <h3 className="text-white font-semibold mb-4">About Period Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-blue-400 font-bold mb-2">Q1 Analysis</div>
              <ul className="text-gray-400 space-y-1">
                <li>• <span className="text-white">Avg Points</span>: Team&apos;s average Q1 scoring</li>
                <li>• <span className="text-white">Avg Allowed</span>: Points allowed in Q1</li>
                <li>• <span className="text-white">Q1 Win %</span>: % of games where team outscored opponent in Q1</li>
              </ul>
            </div>
            <div>
              <div className="text-green-400 font-bold mb-2">1H Analysis</div>
              <ul className="text-gray-400 space-y-1">
                <li>• <span className="text-white">1H Pts</span>: Team&apos;s average first half scoring</li>
                <li>• <span className="text-white">1H Total</span>: Combined score (team + opponent) at halftime</li>
                <li>• <span className="text-white">1H Margin</span>: Average halftime lead/deficit</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-yellow-400 font-bold mb-2">Betting Application</div>
            <p className="text-gray-400 text-sm">
              Use Q1 and 1H averages to identify value in period-specific bets. Teams with high Q1 scoring
              and low Q1 allowed are strong &quot;Race to X&quot; candidates. 1H totals help identify games likely
              to go over/under the first half line.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
