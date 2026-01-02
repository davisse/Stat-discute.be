'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ComposedChart, Line, Cell, Legend
} from 'recharts'

interface TeamStats {
  abbr: string
  name: string
  color: string
  seasonAvg: number
  homeAvg: number
  awayAvg: number
  homeGames: number
  awayGames: number
  recentGames: {
    date: string
    location: 'HOME' | 'AWAY'
    opponent: string
    points: number
    oppPoints: number
    total: number
  }[]
}

interface H2HData {
  away: TeamStats
  home: TeamStats
  bettingLine: {
    total: number
    overOdds: number
    underOdds: number
    gameId: string
    gameDate: string
  } | null
  projections: {
    season: number
    situational: number
    gap: number | null
  }
  verdict: {
    text: string
    confidence: number
  } | null
  highTotalsHistory: {
    date: string
    matchup: string
    line: number
    actual: number
    result: string
  }[]
}

function StatBox({ label, value, subtitle, highlight }: {
  label: string
  value: string | number
  subtitle?: string
  highlight?: 'green' | 'red' | 'yellow' | null
}) {
  const bgColor = highlight === 'green' ? 'bg-green-900/30 border-green-700' :
                  highlight === 'red' ? 'bg-red-900/30 border-red-700' :
                  highlight === 'yellow' ? 'bg-yellow-900/30 border-yellow-700' :
                  'bg-gray-800/50 border-gray-700'

  return (
    <div className={`${bgColor} border rounded-xl p-4`}>
      <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      {subtitle && <div className="text-gray-500 text-xs mt-1">{subtitle}</div>}
    </div>
  )
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white font-mono font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Team Scoring Chart
function TeamScoringChart({ team, role, avgLine }: { team: TeamStats; role: 'away' | 'home'; avgLine: number }) {
  const relevantAvg = role === 'away' ? team.awayAvg : team.homeAvg

  // Reverse to show oldest to newest (left to right)
  const chartData = [...team.recentGames].reverse().map((game, idx) => ({
    name: game.date,
    points: game.points,
    opponent: game.opponent,
    location: game.location,
    isRelevant: (role === 'away' && game.location === 'AWAY') || (role === 'home' && game.location === 'HOME'),
  }))

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <h4 className="text-white font-semibold mb-4">{team.abbr} Scoring (Last 10 Games)</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis
              domain={['dataMin - 10', 'dataMax + 10']}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={team.seasonAvg}
              stroke="#6B7280"
              strokeDasharray="5 5"
              label={{ value: `Season: ${team.seasonAvg.toFixed(0)}`, fill: '#6B7280', fontSize: 10, position: 'right' }}
            />
            <ReferenceLine
              y={relevantAvg}
              stroke={team.color}
              strokeWidth={2}
              label={{ value: `${role === 'away' ? 'Away' : 'Home'}: ${relevantAvg.toFixed(0)}`, fill: team.color, fontSize: 10, position: 'left' }}
            />
            <Bar dataKey="points" name="Points" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isRelevant ? team.color : '#4B5563'}
                  opacity={entry.isRelevant ? 1 : 0.5}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: team.color }}></div>
          <span className="text-gray-400">{role === 'away' ? 'Away' : 'Home'} games</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-600"></div>
          <span className="text-gray-400">{role === 'away' ? 'Home' : 'Away'} games</span>
        </div>
      </div>
    </div>
  )
}

// Combined Totals Chart with Betting Line
function CombinedTotalsChart({ data }: { data: H2HData }) {
  // Combine both teams' games and show totals
  const awayGames = [...data.away.recentGames].reverse().map((g, idx) => ({
    name: g.date,
    total: g.total,
    team: data.away.abbr,
    location: g.location,
  }))

  const homeGames = [...data.home.recentGames].reverse().map((g, idx) => ({
    name: g.date,
    total: g.total,
    team: data.home.abbr,
    location: g.location,
  }))

  // Interleave games by date for combined view
  const allGames = [...awayGames.map(g => ({ ...g, teamType: 'away' as const })),
                    ...homeGames.map(g => ({ ...g, teamType: 'home' as const }))]
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
    .slice(-10)

  const bettingLine = data.bettingLine?.total || 0
  const situationalProjection = data.projections.situational

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold">Game Totals vs Betting Line</h4>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-yellow-500"></div>
            <span className="text-yellow-500">Line: {bettingLine}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-green-500">Projection: {situationalProjection.toFixed(0)}</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={allGames} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis
              domain={[200, 280]}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  const vsLine = data.total - bettingLine
                  return (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                      <p className="text-gray-400 text-xs">{data.name} - {data.team}</p>
                      <p className="text-white font-mono font-bold text-lg">{data.total}</p>
                      <p className={`text-sm ${vsLine >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {vsLine >= 0 ? 'OVER' : 'UNDER'} by {Math.abs(vsLine).toFixed(1)}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            {/* Betting Line */}
            <ReferenceLine
              y={bettingLine}
              stroke="#EAB308"
              strokeWidth={2}
              label={{ value: `Line: ${bettingLine}`, fill: '#EAB308', fontSize: 12, position: 'top' }}
            />
            {/* Situational Projection */}
            <ReferenceLine
              y={situationalProjection}
              stroke="#22C55E"
              strokeWidth={2}
              strokeDasharray="8 4"
              label={{ value: `Proj: ${situationalProjection.toFixed(0)}`, fill: '#22C55E', fontSize: 12, position: 'top' }}
            />
            <Bar dataKey="total" name="Game Total" radius={[4, 4, 0, 0]}>
              {allGames.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.total >= bettingLine ? '#EF4444' : '#22C55E'}
                  opacity={0.8}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-400">Under the line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-400">Over the line</span>
        </div>
      </div>
    </div>
  )
}

function TeamColumn({ team, role }: { team: TeamStats; role: 'away' | 'home' }) {
  const relevantAvg = role === 'away' ? team.awayAvg : team.homeAvg
  const relevantGames = role === 'away' ? team.awayGames : team.homeGames
  const roleLabel = role === 'away' ? 'AWAY' : 'HOME'

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: team.color }}
        >
          {team.abbr}
        </div>
        <div>
          <div className="text-white font-bold text-xl">{team.name}</div>
          <div className="text-gray-400 text-sm">{roleLabel} tonight</div>
        </div>
      </div>

      {/* Scoring Averages */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Season Avg" value={team.seasonAvg.toFixed(1)} />
        <StatBox
          label={`${roleLabel} Avg`}
          value={relevantAvg.toFixed(1)}
          subtitle={`${relevantGames} games`}
          highlight={role === 'away' ? (relevantAvg < team.seasonAvg ? 'green' : 'red') :
                                       (relevantAvg > team.seasonAvg ? 'red' : 'green')}
        />
        <StatBox
          label={role === 'away' ? 'Home Avg' : 'Away Avg'}
          value={(role === 'away' ? team.homeAvg : team.awayAvg).toFixed(1)}
          subtitle={`${role === 'away' ? team.homeGames : team.awayGames} games`}
        />
      </div>

      {/* Scoring Chart */}
      <TeamScoringChart team={team} role={role} avgLine={relevantAvg} />

      {/* Recent Games Table */}
      <div>
        <h3 className="text-white font-semibold mb-3">Game Log</h3>
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left text-gray-400 font-medium px-3 py-2">Date</th>
                <th className="text-left text-gray-400 font-medium px-3 py-2">Game</th>
                <th className="text-right text-gray-400 font-medium px-3 py-2">Pts</th>
                <th className="text-right text-gray-400 font-medium px-3 py-2">Opp</th>
                <th className="text-right text-gray-400 font-medium px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {team.recentGames.map((game, idx) => {
                const isRelevantLocation = (role === 'away' && game.location === 'AWAY') ||
                                          (role === 'home' && game.location === 'HOME')
                return (
                  <tr
                    key={idx}
                    className={`border-t border-gray-800 ${isRelevantLocation ? 'bg-blue-900/20' : ''}`}
                  >
                    <td className="px-3 py-2 text-gray-400">{game.date}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded mr-2 ${
                        game.location === 'HOME' ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {game.location === 'HOME' ? 'vs' : '@'}
                      </span>
                      <span className="text-white">{game.opponent}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-white">{game.points}</td>
                    <td className="px-3 py-2 text-right font-mono text-gray-400">{game.oppPoints}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-yellow-400">{game.total}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Highlighted rows = {role === 'away' ? 'away' : 'home'} games (relevant for tonight)
        </div>
      </div>
    </div>
  )
}

function VerdictSection({ data }: { data: H2HData }) {
  if (!data.bettingLine || !data.verdict) return null

  const isUnder = data.verdict.text.includes('UNDER')
  const isOver = data.verdict.text.includes('OVER')
  const isStrong = data.verdict.text.includes('STRONG')

  const bgColor = isUnder ? (isStrong ? 'bg-green-600' : 'bg-green-700/70') :
                  isOver ? (isStrong ? 'bg-red-600' : 'bg-red-700/70') :
                  'bg-gray-700'

  const gap = data.projections.gap || 0

  return (
    <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Line */}
        <div className="text-center">
          <div className="text-gray-400 text-sm uppercase tracking-wide mb-2">Tonight's Line</div>
          <div className="text-5xl font-bold text-white font-mono">{data.bettingLine.total}</div>
          <div className="text-gray-500 text-sm mt-2">
            O {data.bettingLine.overOdds > 0 ? '+' : ''}{data.bettingLine.overOdds} /
            U {data.bettingLine.underOdds > 0 ? '+' : ''}{data.bettingLine.underOdds}
          </div>
        </div>

        {/* Projections */}
        <div className="text-center">
          <div className="text-gray-400 text-sm uppercase tracking-wide mb-2">Season Projection</div>
          <div className="text-3xl font-bold text-gray-400 font-mono">{data.projections.season.toFixed(1)}</div>
          <div className="text-gray-500 text-sm mt-2">
            {data.away.abbr} ({data.away.seasonAvg.toFixed(1)}) + {data.home.abbr} ({data.home.seasonAvg.toFixed(1)})
          </div>
        </div>

        <div className="text-center">
          <div className="text-gray-400 text-sm uppercase tracking-wide mb-2">Situational Projection</div>
          <div className="text-3xl font-bold text-yellow-400 font-mono">{data.projections.situational.toFixed(1)}</div>
          <div className="text-gray-500 text-sm mt-2">
            {data.away.abbr} away ({data.away.awayAvg.toFixed(1)}) + {data.home.abbr} home ({data.home.homeAvg.toFixed(1)})
          </div>
        </div>

        {/* Verdict */}
        <div className="text-center">
          <div className="text-gray-400 text-sm uppercase tracking-wide mb-2">Verdict</div>
          <div className={`${bgColor} inline-block px-6 py-3 rounded-xl`}>
            <div className="text-2xl font-bold text-white">{data.verdict.text}</div>
            <div className="text-white/70 text-sm">{data.verdict.confidence}/5 confidence</div>
          </div>
          <div className={`text-lg font-mono font-bold mt-3 ${gap > 0 ? 'text-green-400' : 'text-red-400'}`}>
            Gap: {gap > 0 ? '+' : ''}{gap.toFixed(1)} pts
          </div>
        </div>
      </div>
    </div>
  )
}

function HighTotalsHistory({ history }: { history: H2HData['highTotalsHistory'] }) {
  if (history.length === 0) return null

  const overs = history.filter(h => h.result === 'OVER').length
  const unders = history.filter(h => h.result === 'UNDER').length

  return (
    <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">High Totals (235+) This Season</h3>
        <div className="flex gap-4 text-sm">
          <span className="text-red-400">OVER: {overs}</span>
          <span className="text-green-400">UNDER: {unders}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {history.map((game, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${
              game.result === 'OVER' ? 'bg-red-900/20 border-red-800' : 'bg-green-900/20 border-green-800'
            }`}
          >
            <div className="text-gray-400 text-xs">{game.date}</div>
            <div className="text-white text-sm font-medium">{game.matchup}</div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400 text-xs">Line: {game.line}</span>
              <span className={`font-mono font-bold ${
                game.result === 'OVER' ? 'text-red-400' : 'text-green-400'
              }`}>
                {game.actual}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function H2HPage() {
  const params = useParams()
  const away = (params.away as string).toUpperCase()
  const home = (params.home as string).toUpperCase()

  const [data, setData] = useState<H2HData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/analysis/h2h/${away}/${home}`)
        if (!res.ok) throw new Error('Failed to fetch data')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [away, home])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">{error || 'Failed to load data'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/analysis" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Analysis
            </Link>
            <h1 className="text-xl font-bold text-white">
              Head to Head Analysis
            </h1>
            <div className="text-gray-400 text-sm">
              {data.bettingLine?.gameDate || 'No game scheduled'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Matchup Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: data.away.color }}
              >
                {data.away.abbr}
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-2xl">{data.away.name}</div>
                <div className="text-gray-400">Away</div>
              </div>
            </div>

            <div className="text-4xl font-bold text-gray-600">@</div>

            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className="text-white font-bold text-2xl">{data.home.name}</div>
                <div className="text-gray-400">Home</div>
              </div>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: data.home.color }}
              >
                {data.home.abbr}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8 space-y-8">
        {/* Verdict Section */}
        <VerdictSection data={data} />

        {/* Combined Totals Chart */}
        <CombinedTotalsChart data={data} />

        {/* Team Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TeamColumn team={data.away} role="away" />
          <TeamColumn team={data.home} role="home" />
        </div>

        {/* High Totals History */}
        <HighTotalsHistory history={data.highTotalsHistory} />

        {/* Key Insights */}
        <div className="bg-gray-900/80 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-white font-semibold mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">{data.away.abbr} Away vs Season</div>
              <div className={`text-xl font-bold font-mono ${
                data.away.awayAvg < data.away.seasonAvg ? 'text-green-400' : 'text-red-400'
              }`}>
                {data.away.awayAvg < data.away.seasonAvg ? '' : '+'}{(data.away.awayAvg - data.away.seasonAvg).toFixed(1)} pts
              </div>
              <div className="text-gray-500 text-xs">
                Scores {data.away.awayAvg < data.away.seasonAvg ? 'less' : 'more'} on the road
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">{data.home.abbr} Home vs Season</div>
              <div className={`text-xl font-bold font-mono ${
                data.home.homeAvg < data.home.seasonAvg ? 'text-green-400' : 'text-red-400'
              }`}>
                {data.home.homeAvg >= data.home.seasonAvg ? '+' : ''}{(data.home.homeAvg - data.home.seasonAvg).toFixed(1)} pts
              </div>
              <div className="text-gray-500 text-xs">
                Scores {data.home.homeAvg >= data.home.seasonAvg ? 'more' : 'less'} at home
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Line vs Season Avg</div>
              <div className={`text-xl font-bold font-mono ${
                (data.bettingLine?.total || 0) - data.projections.season > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {((data.bettingLine?.total || 0) - data.projections.season) > 0 ? '+' : ''}
                {((data.bettingLine?.total || 0) - data.projections.season).toFixed(1)} pts
              </div>
              <div className="text-gray-500 text-xs">
                Line is {(data.bettingLine?.total || 0) > data.projections.season ? 'above' : 'below'} season projection
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Line vs Situational</div>
              <div className={`text-xl font-bold font-mono ${
                (data.projections.gap || 0) > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(data.projections.gap || 0) > 0 ? '+' : ''}{(data.projections.gap || 0).toFixed(1)} pts
              </div>
              <div className="text-gray-500 text-xs">
                Line is {(data.projections.gap || 0) > 0 ? 'above' : 'below'} situational projection
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
