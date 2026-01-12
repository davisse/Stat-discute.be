'use client'

import { useMemo, useState } from 'react'
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
  Cell
} from 'recharts'
import { TeamGameDay } from './TeamPresenceCalendar'

// ============================================
// TYPES AND INTERFACES
// ============================================

type TabValue = 'offense' | 'defense' | 'total'

interface TeamScoringTrendChartProps {
  games: TeamGameDay[]
  className?: string
}

interface EnhancedChartDataPoint {
  game: number
  date: string
  opponent: string
  teamPts: number
  oppPts: number
  total: number
  result: 'W' | 'L'
  isHome: boolean
  rollingTeam: number | null
  rollingOpp: number | null
  rollingTotal: number | null
  isOver: boolean  // Dynamic based on ouLine
}

interface SeasonStats {
  avgPts: number
  avgOppPts: number
  avgTotal: number
  netRating: number
  wins: number
  losses: number
  overCount: number
  underCount: number
  overPct: number
  last5Trend: 'up' | 'down' | 'stable'
  offenseTrend: 'up' | 'down' | 'stable'
  defenseTrend: 'up' | 'down' | 'stable'
}

interface Insight {
  type: 'streak' | 'trend' | 'milestone'
  label: string
  color: 'green' | 'red' | 'yellow'
}

/**
 * TeamScoringTrendChart Component (Hybrid B+C Design)
 *
 * Tabbed chart showing team scoring trends with O/U betting focus:
 * - Offense tab: Team scoring with rolling average
 * - Defense tab: Opponent scoring with rolling average
 * - Total O/U tab: Combined total with adjustable O/U line
 *
 * Features:
 * - Net Rating header with trend indicator
 * - Pill tabs navigation (Offense | Defense | Total O/U)
 * - Adjustable Over/Under line with step 0.5
 * - Over/Under progress bar
 * - Auto-generated insight badges
 */
export function TeamScoringTrendChart({ games, className = '' }: TeamScoringTrendChartProps) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [activeTab, setActiveTab] = useState<TabValue>('total')
  const [ouLine, setOuLine] = useState<number | null>(null) // Will default to avgTotal

  // ============================================
  // CHART DATA COMPUTATION
  // ============================================
  const chartData = useMemo((): EnhancedChartDataPoint[] => {
    const finishedGames = games.filter(g => g.game_status === 'Final' && g.team_pts !== null)

    // Sort chronologically: oldest games first (left), newest games last (right)
    const chronologicalGames = [...finishedGames].sort((a, b) =>
      new Date(a.game_date).getTime() - new Date(b.game_date).getTime()
    )

    return chronologicalGames.map((g, i, arr) => {
      const windowSize = 5
      let rollingTeam: number | null = null
      let rollingOpp: number | null = null
      let rollingTotal: number | null = null

      if (i >= windowSize - 1) {
        const window = arr.slice(i - windowSize + 1, i + 1)
        rollingTeam = window.reduce((sum, game) => sum + (game.team_pts ?? 0), 0) / windowSize
        rollingOpp = window.reduce((sum, game) => sum + (game.opp_pts ?? 0), 0) / windowSize
        rollingTotal = rollingTeam + rollingOpp
      }

      const total = (g.team_pts ?? 0) + (g.opp_pts ?? 0)

      return {
        game: i + 1,
        date: new Date(g.game_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit'
        }),
        opponent: g.opponent,
        teamPts: g.team_pts ?? 0,
        oppPts: g.opp_pts ?? 0,
        total,
        result: g.result as 'W' | 'L',
        isHome: g.is_home,
        rollingTeam,
        rollingOpp,
        rollingTotal,
        isOver: false // Will be recalculated dynamically
      }
    })
  }, [games])

  // ============================================
  // SEASON STATS COMPUTATION
  // ============================================
  const seasonStats = useMemo((): SeasonStats | null => {
    if (chartData.length === 0) return null

    const avgPts = chartData.reduce((sum, g) => sum + g.teamPts, 0) / chartData.length
    const avgOppPts = chartData.reduce((sum, g) => sum + g.oppPts, 0) / chartData.length
    const avgTotal = chartData.reduce((sum, g) => sum + g.total, 0) / chartData.length
    const netRating = avgPts - avgOppPts

    // Win/Loss record
    const wins = chartData.filter(g => g.result === 'W').length
    const losses = chartData.filter(g => g.result === 'L').length

    // Calculate trends (last 5 games vs season average)
    const last5 = chartData.slice(-5)
    const last5AvgPts = last5.length > 0 ? last5.reduce((sum, g) => sum + g.teamPts, 0) / last5.length : avgPts
    const last5AvgOpp = last5.length > 0 ? last5.reduce((sum, g) => sum + g.oppPts, 0) / last5.length : avgOppPts
    const last5AvgTotal = last5.length > 0 ? last5.reduce((sum, g) => sum + g.total, 0) / last5.length : avgTotal

    const getTrend = (recent: number, season: number): 'up' | 'down' | 'stable' => {
      const diff = recent - season
      if (diff > 2) return 'up'
      if (diff < -2) return 'down'
      return 'stable'
    }

    const offenseTrend = getTrend(last5AvgPts, avgPts)
    // For defense, lower is better so invert the logic
    const defenseTrend = getTrend(avgOppPts, last5AvgOpp)
    const last5Trend = getTrend(last5AvgTotal, avgTotal)

    return {
      avgPts,
      avgOppPts,
      avgTotal,
      netRating,
      wins,
      losses,
      overCount: 0, // Will be calculated in effectiveOuLine memo
      underCount: 0,
      overPct: 0,
      last5Trend,
      offenseTrend,
      defenseTrend
    }
  }, [chartData])

  // Effective O/U line (defaults to avgTotal rounded to 0.5)
  const effectiveOuLine = useMemo(() => {
    if (ouLine !== null) return ouLine
    if (seasonStats) {
      return Math.round(seasonStats.avgTotal * 2) / 2 // Round to nearest 0.5
    }
    return 220 // Default fallback
  }, [ouLine, seasonStats])

  // Chart data with dynamic isOver based on effectiveOuLine
  const chartDataWithOU = useMemo((): EnhancedChartDataPoint[] => {
    return chartData.map(point => ({
      ...point,
      isOver: point.total > effectiveOuLine
    }))
  }, [chartData, effectiveOuLine])

  // O/U stats based on current line
  const ouStats = useMemo(() => {
    const overCount = chartDataWithOU.filter(g => g.isOver).length
    const underCount = chartDataWithOU.length - overCount
    const overPct = chartDataWithOU.length > 0 ? (overCount / chartDataWithOU.length) * 100 : 0
    return { overCount, underCount, overPct }
  }, [chartDataWithOU])

  // ============================================
  // INSIGHT GENERATION
  // ============================================
  const insights = useMemo((): Insight[] => {
    const result: Insight[] = []
    if (chartData.length === 0) return result

    // Win/Loss streak
    let streak = 1
    const lastResult = chartData[chartData.length - 1]?.result
    for (let i = chartData.length - 2; i >= 0; i--) {
      if (chartData[i].result === lastResult) streak++
      else break
    }
    if (streak >= 3) {
      result.push({
        type: 'streak',
        label: `${streak}${lastResult === 'W' ? 'W' : 'L'}`,
        color: lastResult === 'W' ? 'green' : 'red'
      })
    }

    // Offensive trend (last 5 vs season)
    if (seasonStats) {
      const last5 = chartData.slice(-5)
      const last5AvgPts = last5.reduce((sum, g) => sum + g.teamPts, 0) / last5.length
      const diff = last5AvgPts - seasonStats.avgPts
      if (Math.abs(diff) >= 3) {
        result.push({
          type: 'trend',
          label: `${diff > 0 ? '↗' : '↘'} ${diff > 0 ? '+' : ''}${diff.toFixed(1)} PPG L5`,
          color: diff > 0 ? 'green' : 'red'
        })
      }
    }

    // O/U streak
    let ouStreak = 1
    const lastOU = chartDataWithOU[chartDataWithOU.length - 1]?.isOver
    for (let i = chartDataWithOU.length - 2; i >= 0; i--) {
      if (chartDataWithOU[i].isOver === lastOU) ouStreak++
      else break
    }
    if (ouStreak >= 3) {
      result.push({
        type: 'streak',
        label: `${ouStreak}x ${lastOU ? 'Over' : 'Under'}`,
        color: 'yellow'
      })
    }

    // High-scoring game milestone
    const highScoringGames = chartData.filter(g => g.total >= 240).length
    if (highScoringGames >= 3) {
      result.push({
        type: 'milestone',
        label: `🎯 ${highScoringGames}x 240+`,
        color: 'yellow'
      })
    }

    return result.slice(0, 4) // Max 4 insights
  }, [chartData, chartDataWithOU, seasonStats])

  // ============================================
  // TABS CONFIGURATION
  // ============================================
  const tabs: { value: TabValue; label: string }[] = [
    { value: 'offense', label: 'Offense' },
    { value: 'defense', label: 'Defense' },
    { value: 'total', label: 'Total O/U' }
  ]

  // ============================================
  // RENDER HELPERS
  // ============================================
  const getTrendArrow = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↗'
    if (trend === 'down') return '↘'
    return '→'
  }

  const getInsightBgColor = (color: Insight['color']) => {
    switch (color) {
      case 'green': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'red': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'yellow': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  // ============================================
  // CHART TOOLTIP
  // ============================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null
    const data = payload[0].payload as EnhancedChartDataPoint

    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs min-w-[160px]">
        <p className="text-zinc-400 mb-1">
          Match #{label} • {data.date}
        </p>
        <p className="text-white mb-2">
          {data.isHome ? 'vs' : '@'} {data.opponent}{' '}
          <span className={data.result === 'W' ? 'text-emerald-400' : 'text-red-400'}>
            ({data.result})
          </span>
        </p>
        <div className="space-y-0.5">
          {activeTab === 'offense' && (
            <>
              <p className="text-emerald-400">Points: {data.teamPts}</p>
              {data.rollingTeam && (
                <p className="text-emerald-300/70">Moy. 5: {data.rollingTeam.toFixed(1)}</p>
              )}
            </>
          )}
          {activeTab === 'defense' && (
            <>
              <p className="text-red-400">Adversaire: {data.oppPts}</p>
              {data.rollingOpp && (
                <p className="text-red-300/70">Moy. 5: {data.rollingOpp.toFixed(1)}</p>
              )}
            </>
          )}
          {activeTab === 'total' && (
            <>
              <p className="text-white">Total: {data.total}</p>
              <p className={data.isOver ? 'text-emerald-400' : 'text-red-400'}>
                {data.isOver ? 'OVER' : 'UNDER'} {effectiveOuLine}
              </p>
              {data.rollingTotal && (
                <p className="text-zinc-400">Moy. 5: {data.rollingTotal.toFixed(1)}</p>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // ============================================
  // EMPTY STATE
  // ============================================
  if (chartData.length === 0) {
    return (
      <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8 ${className}`}>
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            TENDANCES
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base tracking-[0.2em] uppercase mt-2">
            Évolution des Scores
          </p>
        </div>
        <p className="text-zinc-500 text-sm text-center py-8">Aucune donnée disponible</p>
      </div>
    )
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8 ${className}`}>
      {/* Cinematic Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          TENDANCES
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base tracking-[0.2em] uppercase mt-2">
          Évolution des Scores
        </p>

        {/* Stats Pills */}
        {seasonStats && (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4">
            <div className={`px-3 py-1.5 rounded-full ${
              seasonStats.netRating >= 0
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <span className={`text-sm font-bold font-mono ${seasonStats.netRating >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                Net: {seasonStats.netRating >= 0 ? '+' : ''}{seasonStats.netRating.toFixed(1)}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-full">
              <span className="text-zinc-300 text-sm font-bold">
                {getTrendArrow(seasonStats.last5Trend)} L5
              </span>
            </div>
            <div className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-full">
              <span className="text-zinc-300 text-sm font-bold font-mono">
                {seasonStats.wins}-{seasonStats.losses}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========== PILL TABS ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex justify-center sm:justify-start">
          <div className="inline-flex bg-zinc-800/50 rounded-full p-0.5 sm:p-1">
            {tabs.map((tab) => {
              const isActive = tab.value === activeTab
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`
                    px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium
                    transition-all duration-200 min-w-[52px] sm:min-w-[64px]
                    ${isActive
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                    }
                  `}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* O/U Line Input (only visible on Total tab) */}
        {activeTab === 'total' && (
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <span className="text-[10px] sm:text-xs text-zinc-500">O/U:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOuLine(prev => (prev ?? effectiveOuLine) - 0.5)}
                className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm flex items-center justify-center transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={effectiveOuLine}
                onChange={(e) => setOuLine(parseFloat(e.target.value) || null)}
                step={0.5}
                className="w-16 sm:w-20 h-6 px-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-center text-white font-mono focus:outline-none focus:border-zinc-500"
              />
              <button
                onClick={() => setOuLine(prev => (prev ?? effectiveOuLine) + 0.5)}
                className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm flex items-center justify-center transition-colors"
              >
                +
              </button>
              {ouLine !== null && (
                <button
                  onClick={() => setOuLine(null)}
                  className="ml-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Reset to average"
                >
                  ↺
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========== CHART AREA ========== */}
      <div className="h-48 sm:h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'offense' ? (
            // OFFENSE CHART - Bar for each game
            <ComposedChart
              data={chartDataWithOU}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="game" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} />
              <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} domain={[80, 150]} />
              <Tooltip content={renderTooltip} />
              {seasonStats && (
                <ReferenceLine y={seasonStats.avgPts} stroke="#71717a" strokeDasharray="5 5" strokeWidth={1} />
              )}
              <Bar dataKey="teamPts" radius={[2, 2, 0, 0]} maxBarSize={20}>
                {chartDataWithOU.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.result === 'W' ? '#22c55e' : '#22c55e80'}
                  />
                ))}
              </Bar>
              <Line type="monotone" dataKey="rollingTeam" stroke="#86efac" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
            </ComposedChart>
          ) : activeTab === 'defense' ? (
            // DEFENSE CHART - Bar for each game
            <ComposedChart
              data={chartDataWithOU}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="game" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} />
              <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} domain={[80, 150]} />
              <Tooltip content={renderTooltip} />
              {seasonStats && (
                <ReferenceLine y={seasonStats.avgOppPts} stroke="#71717a" strokeDasharray="5 5" strokeWidth={1} />
              )}
              <Bar dataKey="oppPts" radius={[2, 2, 0, 0]} maxBarSize={20}>
                {chartDataWithOU.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.result === 'W' ? '#ef444480' : '#ef4444'}
                  />
                ))}
              </Bar>
              <Line type="monotone" dataKey="rollingOpp" stroke="#fca5a5" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
            </ComposedChart>
          ) : (
            // TOTAL O/U CHART - Bar colored by Over/Under
            <ComposedChart
              data={chartDataWithOU}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis dataKey="game" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} />
              <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} domain={[180, 280]} />
              <Tooltip content={renderTooltip} />
              {/* O/U Reference Line */}
              <ReferenceLine y={effectiveOuLine} stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" label={{ value: `O/U ${effectiveOuLine}`, position: 'right', fill: '#f59e0b', fontSize: 10 }} />
              <Bar dataKey="total" radius={[2, 2, 0, 0]} maxBarSize={20}>
                {chartDataWithOU.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isOver ? '#22c55e' : '#ef4444'}
                  />
                ))}
              </Bar>
              <Line type="monotone" dataKey="rollingTotal" stroke="#c4b5fd" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ========== O/U PROGRESS BAR (Total tab only) ========== */}
      {activeTab === 'total' && (
        <div className="mt-3 sm:mt-4">
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
            <span className="text-emerald-400 font-mono">
              Over: {ouStats.overCount}/{chartDataWithOU.length} ({ouStats.overPct.toFixed(1)}%)
            </span>
            <span className="text-red-400 font-mono">
              Under: {ouStats.underCount}/{chartDataWithOU.length} ({(100 - ouStats.overPct).toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${ouStats.overPct}%` }}
            />
            <div
              className="bg-red-500 transition-all duration-300"
              style={{ width: `${100 - ouStats.overPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ========== INSIGHT BADGES ========== */}
      {insights.length > 0 && (
        <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-2">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${getInsightBgColor(insight.color)}`}
            >
              {insight.label}
            </div>
          ))}
        </div>
      )}

      {/* ========== LEGEND ========== */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 text-[10px] text-zinc-500">
        {activeTab === 'offense' && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-emerald-500" />
              <span>Points</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-emerald-300/70" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0' }} />
              <span>Moy. 5</span>
            </div>
          </>
        )}
        {activeTab === 'defense' && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-red-500" />
              <span>Adversaire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-red-300/70" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0' }} />
              <span>Moy. 5</span>
            </div>
          </>
        )}
        {activeTab === 'total' && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-purple-500" />
              <span>Total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-amber-500" style={{ borderStyle: 'dashed', borderWidth: '2px 0 0 0' }} />
              <span>Ligne O/U</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-purple-300/70" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0' }} />
              <span>Moy. 5</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
