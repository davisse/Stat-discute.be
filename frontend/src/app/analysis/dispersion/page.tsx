'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

interface GameDetail {
  gameId: string
  gameDate: string
  opponent: string
  isHome: boolean
  teamPts: number
  oppPts: number
  total: number
  result: 'W' | 'L'
}

interface TeamDispersionData {
  abbreviation: string
  games: number
  meanTotal: number
  totalStd: number
  minTotal: number
  maxTotal: number
  range: number
  avgTeamPts: number
  teamStd: number
  avgOppPts: number
  oppStd: number
  ptDiff: number
  q1: number
  median: number
  q3: number
  iqr: number
  volatilityClass: 'high' | 'medium' | 'low'
  gameDetails: GameDetail[]
}

interface DispersionResponse {
  success: boolean
  season: string
  teams: TeamDispersionData[]
  stats: {
    highVolatility: number
    mediumVolatility: number
    lowVolatility: number
    avgStd: string
    avgRange: number
  }
}

export default function DispersionPage() {
  const [data, setData] = useState<DispersionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'std' | 'range' | 'mean' | 'alpha'>('std')
  const [filterVolatility, setFilterVolatility] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/teams/dispersion')
        const result = await response.json()
        if (result.success) {
          setData(result)
        } else {
          setError(result.error || 'Failed to fetch data')
        }
      } catch (err) {
        setError('Failed to fetch dispersion data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const sortedTeams = useMemo(() => {
    if (!data?.teams) return []

    let filtered = data.teams
    if (filterVolatility !== 'all') {
      filtered = filtered.filter(t => t.volatilityClass === filterVolatility)
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'std':
          return b.totalStd - a.totalStd
        case 'range':
          return b.range - a.range
        case 'mean':
          return b.meanTotal - a.meanTotal
        case 'alpha':
          return a.abbreviation.localeCompare(b.abbreviation)
        default:
          return 0
      }
    })
  }, [data?.teams, sortBy, filterVolatility])

  const selectedTeamData = useMemo(() => {
    if (!selectedTeam || !data?.teams) return null
    return data.teams.find(t => t.abbreviation === selectedTeam)
  }, [selectedTeam, data?.teams])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-lg">Loading dispersion data...</div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Team Totals Dispersion Analysis
          </h1>
          <p className="text-gray-400">
            Season {data?.season} - Detailed game total volatility for all 30 NBA teams
          </p>
        </div>

        {/* Summary Stats */}
        {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-red-400 text-2xl font-bold">{data.stats.highVolatility}</div>
              <div className="text-gray-400 text-sm">High Volatility (σ&gt;20)</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-yellow-400 text-2xl font-bold">{data.stats.mediumVolatility}</div>
              <div className="text-gray-400 text-sm">Medium Volatility</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-green-400 text-2xl font-bold">{data.stats.lowVolatility}</div>
              <div className="text-gray-400 text-sm">Low Volatility (σ&lt;17)</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white text-2xl font-bold">{data.stats.avgStd}</div>
              <div className="text-gray-400 text-sm">Avg Std Dev</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white text-2xl font-bold">{data.stats.avgRange}</div>
              <div className="text-gray-400 text-sm">Avg Range</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="text-gray-400 text-sm mr-2">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20"
            >
              <option value="std">Std Deviation (High→Low)</option>
              <option value="range">Range (High→Low)</option>
              <option value="mean">Mean Total (High→Low)</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mr-2">Filter:</label>
            <select
              value={filterVolatility}
              onChange={(e) => setFilterVolatility(e.target.value as typeof filterVolatility)}
              className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20"
            >
              <option value="all">All Teams</option>
              <option value="high">High Volatility</option>
              <option value="medium">Medium Volatility</option>
              <option value="low">Low Volatility</option>
            </select>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {sortedTeams.map((team) => (
            <TeamCard
              key={team.abbreviation}
              team={team}
              isSelected={selectedTeam === team.abbreviation}
              onSelect={() => setSelectedTeam(
                selectedTeam === team.abbreviation ? null : team.abbreviation
              )}
            />
          ))}
        </div>

        {/* Selected Team Detail */}
        {selectedTeamData && (
          <TeamDetailPanel team={selectedTeamData} onClose={() => setSelectedTeam(null)} />
        )}
      </div>
    </AppLayout>
  )
}

function TeamCard({
  team,
  isSelected,
  onSelect
}: {
  team: TeamDispersionData
  isSelected: boolean
  onSelect: () => void
}) {
  const volatilityColors = {
    high: 'border-red-500/50 bg-red-500/5',
    medium: 'border-yellow-500/50 bg-yellow-500/5',
    low: 'border-green-500/50 bg-green-500/5'
  }

  const volatilityBadgeColors = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-green-500/20 text-green-400'
  }

  // Mini distribution visualization
  const minVal = 190
  const maxVal = 300
  const scaleRange = maxVal - minVal

  return (
    <div
      onClick={onSelect}
      className={`
        rounded-xl p-4 border-2 cursor-pointer transition-all duration-200
        ${volatilityColors[team.volatilityClass]}
        ${isSelected ? 'ring-2 ring-white/50 scale-[1.02]' : 'hover:scale-[1.01]'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">{team.abbreviation}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${volatilityBadgeColors[team.volatilityClass]}`}>
            {team.volatilityClass.toUpperCase()}
          </span>
        </div>
        <span className="text-gray-400 text-sm">{team.games} games</span>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-white font-mono text-lg">{team.meanTotal.toFixed(1)}</div>
          <div className="text-gray-500 text-xs">Mean</div>
        </div>
        <div className="text-center">
          <div className="text-white font-mono text-lg">±{team.totalStd.toFixed(1)}</div>
          <div className="text-gray-500 text-xs">Std Dev</div>
        </div>
        <div className="text-center">
          <div className="text-white font-mono text-lg">{team.range}</div>
          <div className="text-gray-500 text-xs">Range</div>
        </div>
      </div>

      {/* Mini Range Visualization */}
      <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
        {/* Range bar */}
        <div
          className="absolute h-full bg-white/20"
          style={{
            left: `${((team.minTotal - minVal) / scaleRange) * 100}%`,
            width: `${(team.range / scaleRange) * 100}%`
          }}
        />
        {/* IQR bar */}
        <div
          className="absolute h-full bg-white/40"
          style={{
            left: `${((team.q1 - minVal) / scaleRange) * 100}%`,
            width: `${(team.iqr / scaleRange) * 100}%`
          }}
        />
        {/* Mean marker */}
        <div
          className="absolute w-0.5 h-full bg-white"
          style={{ left: `${((team.meanTotal - minVal) / scaleRange) * 100}%` }}
        />
        {/* Min/Max labels */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {team.minTotal}
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {team.maxTotal}
        </div>
      </div>

      {/* Scoring Split */}
      <div className="flex justify-between mt-3 text-sm">
        <div>
          <span className="text-gray-400">Team:</span>{' '}
          <span className="text-white font-mono">{team.avgTeamPts.toFixed(1)}</span>
          <span className="text-gray-500 text-xs ml-1">±{team.teamStd.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-gray-400">Opp:</span>{' '}
          <span className="text-white font-mono">{team.avgOppPts.toFixed(1)}</span>
          <span className="text-gray-500 text-xs ml-1">±{team.oppStd.toFixed(1)}</span>
        </div>
        <div className={team.ptDiff >= 0 ? 'text-green-400' : 'text-red-400'}>
          {team.ptDiff >= 0 ? '+' : ''}{team.ptDiff.toFixed(1)}
        </div>
      </div>
    </div>
  )
}

function TeamDetailPanel({
  team,
  onClose
}: {
  team: TeamDispersionData
  onClose: () => void
}) {
  // Calculate distribution buckets
  const buckets = useMemo(() => {
    const bucketsMap: Record<string, number> = {}
    const bucketSize = 10
    const games = team.gameDetails

    games.forEach(g => {
      const bucketStart = Math.floor(g.total / bucketSize) * bucketSize
      const key = `${bucketStart}-${bucketStart + bucketSize - 1}`
      bucketsMap[key] = (bucketsMap[key] || 0) + 1
    })

    return Object.entries(bucketsMap)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([range, count]) => ({ range, count }))
  }, [team.gameDetails])

  const maxBucketCount = Math.max(...buckets.map(b => b.count))

  // Outliers (games beyond 2σ)
  const outliers = team.gameDetails.filter(g => {
    const zScore = Math.abs(g.total - team.meanTotal) / team.totalStd
    return zScore > 2
  })

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{team.abbreviation} Detailed Analysis</h2>
          <p className="text-gray-400">{team.games} games analyzed</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          Close
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatBox label="Mean Total" value={team.meanTotal.toFixed(1)} />
        <StatBox label="Std Deviation" value={`±${team.totalStd.toFixed(1)}`} />
        <StatBox label="Range" value={`${team.minTotal}-${team.maxTotal}`} />
        <StatBox label="IQR" value={team.iqr.toFixed(1)} />
        <StatBox label="Q1 / Median / Q3" value={`${team.q1} / ${team.median} / ${team.q3}`} />
        <StatBox label="Point Diff" value={`${team.ptDiff >= 0 ? '+' : ''}${team.ptDiff.toFixed(1)}`} highlight={team.ptDiff >= 0 ? 'green' : 'red'} />
      </div>

      {/* Distribution Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Total Points Distribution</h3>
        <div className="flex items-end gap-1 h-32">
          {buckets.map((bucket) => (
            <div
              key={bucket.range}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className="w-full bg-white/30 hover:bg-white/50 transition-colors rounded-t"
                style={{ height: `${(bucket.count / maxBucketCount) * 100}%` }}
                title={`${bucket.range}: ${bucket.count} games`}
              />
              <div className="text-xs text-gray-500 mt-1 rotate-45 origin-left whitespace-nowrap">
                {bucket.range}
              </div>
            </div>
          ))}
        </div>
        <div className="text-gray-500 text-sm mt-6">Games count per 10-point bucket</div>
      </div>

      {/* Sigma Ranges */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Statistical Ranges</h3>
        <div className="space-y-2">
          <RangeBar
            label="1σ Range (68%)"
            min={Math.round(team.meanTotal - team.totalStd)}
            max={Math.round(team.meanTotal + team.totalStd)}
            color="bg-blue-500/50"
          />
          <RangeBar
            label="2σ Range (95%)"
            min={Math.round(team.meanTotal - 2 * team.totalStd)}
            max={Math.round(team.meanTotal + 2 * team.totalStd)}
            color="bg-purple-500/50"
          />
          <RangeBar
            label="IQR (Q1-Q3)"
            min={team.q1}
            max={team.q3}
            color="bg-green-500/50"
          />
        </div>
      </div>

      {/* Outliers */}
      {outliers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Outliers (Beyond 2σ)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {outliers.map((game) => (
              <div
                key={game.gameId}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-mono">
                    {game.isHome ? 'vs' : '@'} {game.opponent}
                  </span>
                  <span className={`font-bold ${game.total > team.meanTotal ? 'text-red-400' : 'text-blue-400'}`}>
                    {game.total}
                  </span>
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(game.gameDate).toLocaleDateString()} •{' '}
                  {game.teamPts}-{game.oppPts} ({game.result})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game-by-Game Log */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Game-by-Game Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Opponent</th>
                <th className="text-center py-2 px-3">Score</th>
                <th className="text-center py-2 px-3">Total</th>
                <th className="text-center py-2 px-3">vs Mean</th>
                <th className="text-center py-2 px-3">Z-Score</th>
              </tr>
            </thead>
            <tbody>
              {team.gameDetails.map((game) => {
                const diff = game.total - team.meanTotal
                const zScore = diff / team.totalStd

                return (
                  <tr
                    key={game.gameId}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-2 px-3 text-gray-400">
                      {new Date(game.gameDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-white">
                      {game.isHome ? 'vs' : '@'} {game.opponent}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={game.result === 'W' ? 'text-green-400' : 'text-red-400'}>
                        {game.teamPts}-{game.oppPts}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-white">
                      {game.total}
                    </td>
                    <td className={`py-2 px-3 text-center font-mono ${diff >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                    </td>
                    <td className={`py-2 px-3 text-center font-mono ${Math.abs(zScore) > 2 ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}>
                      {zScore >= 0 ? '+' : ''}{zScore.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatBox({
  label,
  value,
  highlight
}: {
  label: string
  value: string
  highlight?: 'green' | 'red'
}) {
  const highlightClass = highlight === 'green'
    ? 'text-green-400'
    : highlight === 'red'
      ? 'text-red-400'
      : 'text-white'

  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
      <div className={`font-mono text-lg ${highlightClass}`}>{value}</div>
      <div className="text-gray-500 text-xs">{label}</div>
    </div>
  )
}

function RangeBar({
  label,
  min,
  max,
  color
}: {
  label: string
  min: number
  max: number
  color: string
}) {
  const scaleMin = 180
  const scaleMax = 320
  const scaleRange = scaleMax - scaleMin

  const leftPct = ((min - scaleMin) / scaleRange) * 100
  const widthPct = ((max - min) / scaleRange) * 100

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-sm text-gray-400">{label}</div>
      <div className="flex-1 relative h-6 bg-white/5 rounded">
        <div
          className={`absolute h-full rounded ${color}`}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        <div
          className="absolute text-xs text-white font-mono"
          style={{ left: `${leftPct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {min}
        </div>
        <div
          className="absolute text-xs text-white font-mono"
          style={{ left: `${leftPct + widthPct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {max}
        </div>
      </div>
    </div>
  )
}
