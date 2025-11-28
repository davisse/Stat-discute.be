'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import {
  Loader2, RefreshCw, TrendingUp, TrendingDown, Minus, Calendar,
  BarChart3, Percent, DollarSign, AlertTriangle, Zap, Info
} from 'lucide-react'

interface MonteCarloResult {
  p_over: number
  p_under: number
  mean_total: number
  median_total: number
  std_total: number
  percentiles: {
    p5: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
  }
  ci_95_over: [number, number]
  ci_95_under: [number, number]
  ot_games_pct: number
}

interface EVMetrics {
  ev_over: number
  ev_under: number
  edge_over: number
  edge_under: number
  kelly_over: number
  kelly_under: number
  recommended_bet: string
}

interface TotalsGame {
  game_id: string
  game_date: string
  home_team_id: number
  home_abbr: string
  home_team: string
  away_team_id: number
  away_abbr: string
  away_team: string
  home_ppg: number
  home_opp_ppg: number
  home_std?: number
  home_games: number
  away_ppg: number
  away_opp_ppg: number
  away_std?: number
  away_games: number
  line: number | null
  over_odds: number | null
  under_odds: number | null
  projected: number
  edge: number | null
  avg_pace: number
  verdict: string
  bookmaker: string | null
  // Monte Carlo data (from agent)
  monte_carlo?: MonteCarloResult
  ev_metrics?: EVMetrics
}

const verdictColors: Record<string, string> = {
  STRONG_OVER: 'text-green-400 bg-green-400/10',
  LEAN_OVER: 'text-green-300 bg-green-300/5',
  NEUTRAL: 'text-gray-400 bg-gray-400/5',
  LEAN_UNDER: 'text-red-300 bg-red-300/5',
  STRONG_UNDER: 'text-red-400 bg-red-400/10',
  NO_LINE: 'text-yellow-400 bg-yellow-400/10',
  BET_OVER: 'text-green-400 bg-green-400/10',
  BET_UNDER: 'text-red-400 bg-red-400/10',
  STRONG_BET_OVER: 'text-green-500 bg-green-500/15',
  STRONG_BET_UNDER: 'text-red-500 bg-red-500/15',
  LEAN_BET: 'text-yellow-400 bg-yellow-400/10',
  NO_BET: 'text-gray-500 bg-gray-500/5',
}

const verdictLabels: Record<string, string> = {
  STRONG_OVER: 'STRONG OVER',
  LEAN_OVER: 'LEAN OVER',
  NEUTRAL: 'NEUTRAL',
  LEAN_UNDER: 'LEAN UNDER',
  STRONG_UNDER: 'STRONG UNDER',
  NO_LINE: 'NO LINE',
  BET_OVER: 'BET OVER',
  BET_UNDER: 'BET UNDER',
  STRONG_BET_OVER: 'STRONG BET OVER',
  STRONG_BET_UNDER: 'STRONG BET UNDER',
  LEAN_BET: 'LEAN BET',
  NO_BET: 'NO BET',
}

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict.includes('OVER')) return <TrendingUp className="w-4 h-4" />
  if (verdict.includes('UNDER')) return <TrendingDown className="w-4 h-4" />
  return <Minus className="w-4 h-4" />
}

function ProbabilityBar({ pOver, pUnder }: { pOver: number; pUnder: number }) {
  const overPct = Math.round(pOver * 100)
  const underPct = Math.round(pUnder * 100)

  return (
    <div className="w-full">
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${overPct}%` }}
        />
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${underPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-green-400">{overPct}% O</span>
        <span className="text-red-400">{underPct}% U</span>
      </div>
    </div>
  )
}

function DistributionTooltip({ mc }: { mc: MonteCarloResult }) {
  return (
    <div className="absolute z-50 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl w-64 -translate-x-1/2 left-1/2 top-full mt-2">
      <h4 className="text-sm font-semibold text-white mb-2">Distribution</h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Mean:</span>
          <span className="text-white font-mono">{mc.mean_total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Median:</span>
          <span className="text-white font-mono">{mc.median_total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Std Dev:</span>
          <span className="text-white font-mono">{mc.std_total}</span>
        </div>
        <div className="border-t border-gray-700 my-2" />
        <div className="flex justify-between">
          <span className="text-gray-400">5th %ile:</span>
          <span className="text-white font-mono">{mc.percentiles.p5}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">25th %ile:</span>
          <span className="text-white font-mono">{mc.percentiles.p25}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">75th %ile:</span>
          <span className="text-white font-mono">{mc.percentiles.p75}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">95th %ile:</span>
          <span className="text-white font-mono">{mc.percentiles.p95}</span>
        </div>
        <div className="border-t border-gray-700 my-2" />
        <div className="flex justify-between">
          <span className="text-gray-400">OT Games:</span>
          <span className="text-white font-mono">{(mc.ot_games_pct * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

export default function TotalsAnalysisPage() {
  const [games, setGames] = useState<TotalsGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [agentMode, setAgentMode] = useState(false)
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    // Try agent endpoint first (has Monte Carlo)
    try {
      const agentResponse = await fetch('/api/betting/agent')
      if (agentResponse.ok) {
        const agentData = await agentResponse.json()
        if (agentData.success && agentData.games) {
          setGames(agentData.games || [])
          setAgentMode(true)
          setLoading(false)
          return
        }
      }
    } catch {
      // Agent not running, fall back to simple API
    }

    // Fallback to simple API
    try {
      const response = await fetch('/api/betting/totals-analysis')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setGames(result.games || [])
      setAgentMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Get top plays (sorted by EV if agent mode, otherwise by edge)
  const sortedGames = [...games].sort((a, b) => {
    if (agentMode && a.ev_metrics && b.ev_metrics) {
      const aMaxEV = Math.max(a.ev_metrics.ev_over, a.ev_metrics.ev_under)
      const bMaxEV = Math.max(b.ev_metrics.ev_over, b.ev_metrics.ev_under)
      return bMaxEV - aMaxEV
    }
    return Math.abs(b.edge || 0) - Math.abs(a.edge || 0)
  })

  const topOvers = games
    .filter(g => {
      if (agentMode && g.ev_metrics) {
        return g.ev_metrics.recommended_bet?.includes('OVER') && g.ev_metrics.ev_over > 0
      }
      return g.verdict.includes('OVER') && g.edge !== null
    })
    .sort((a, b) => {
      if (agentMode && a.ev_metrics && b.ev_metrics) {
        return b.ev_metrics.ev_over - a.ev_metrics.ev_over
      }
      return (b.edge || 0) - (a.edge || 0)
    })
    .slice(0, 3)

  const topUnders = games
    .filter(g => {
      if (agentMode && g.ev_metrics) {
        return g.ev_metrics.recommended_bet?.includes('UNDER') && g.ev_metrics.ev_under > 0
      }
      return g.verdict.includes('UNDER') && g.edge !== null
    })
    .sort((a, b) => {
      if (agentMode && a.ev_metrics && b.ev_metrics) {
        return b.ev_metrics.ev_under - a.ev_metrics.ev_under
      }
      return (a.edge || 0) - (b.edge || 0)
    })
    .slice(0, 3)

  return (
    <AppLayout>
      <div
        className="min-h-[calc(100vh-11rem)] px-4 md:px-8 py-8 max-w-7xl mx-auto"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease-in-out'
        }}
      >
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Game Totals Analysis
                {agentMode && (
                  <span className="text-sm font-normal bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Monte Carlo
                  </span>
                )}
              </h1>
              <p className="text-gray-500 mt-2">
                {agentMode
                  ? 'Powered by 10,000 Monte Carlo simulations per game'
                  : 'Over/Under projections based on team scoring trends'}
              </p>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-700 rounded-lg
                       text-gray-400 hover:border-white hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
            <p className="text-gray-500">Loading totals analysis...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Games State */}
        {!loading && !error && games.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Games Tonight</h2>
            <p className="text-gray-500">Check back tomorrow for totals analysis</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && games.length > 0 && (
          <>
            {/* Top Plays Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Top Overs */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Top Over Plays
                  {agentMode && <span className="text-xs text-gray-500">(by EV)</span>}
                </h3>
                {topOvers.length > 0 ? (
                  <div className="space-y-3">
                    {topOvers.map(g => (
                      <div key={g.game_id} className="flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{g.away_abbr} @ {g.home_abbr}</span>
                          <span className="text-gray-500 text-sm ml-2">O {g.line}</span>
                        </div>
                        <div className="text-right">
                          {agentMode && g.monte_carlo ? (
                            <div>
                              <span className="text-green-400 font-mono font-semibold">
                                {Math.round(g.monte_carlo.p_over * 100)}%
                              </span>
                              <span className="text-gray-500 text-xs ml-2">
                                EV: {g.ev_metrics?.ev_over.toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-green-400 font-mono font-semibold">+{g.edge?.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No significant over edges</p>
                )}
              </div>

              {/* Top Unders */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Top Under Plays
                  {agentMode && <span className="text-xs text-gray-500">(by EV)</span>}
                </h3>
                {topUnders.length > 0 ? (
                  <div className="space-y-3">
                    {topUnders.map(g => (
                      <div key={g.game_id} className="flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{g.away_abbr} @ {g.home_abbr}</span>
                          <span className="text-gray-500 text-sm ml-2">U {g.line}</span>
                        </div>
                        <div className="text-right">
                          {agentMode && g.monte_carlo ? (
                            <div>
                              <span className="text-red-400 font-mono font-semibold">
                                {Math.round(g.monte_carlo.p_under * 100)}%
                              </span>
                              <span className="text-gray-500 text-xs ml-2">
                                EV: {g.ev_metrics?.ev_under.toFixed(1)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-red-400 font-mono font-semibold">{g.edge?.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No significant under edges</p>
                )}
              </div>
            </div>

            {/* Games Table */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="bg-gray-950 px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Tonight&apos;s Games ({games.length})
                </h2>
                {agentMode && (
                  <span className="text-xs text-gray-500">10K simulations per game</span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                      <th className="px-4 py-3 text-left">Matchup</th>
                      <th className="px-4 py-3 text-center">Home PPG</th>
                      <th className="px-4 py-3 text-center">Away PPG</th>
                      <th className="px-4 py-3 text-center">Projected</th>
                      <th className="px-4 py-3 text-center">Line</th>
                      {agentMode ? (
                        <>
                          <th className="px-4 py-3 text-center">
                            <span className="flex items-center justify-center gap-1">
                              <Percent className="w-3 h-3" />
                              Prob
                            </span>
                          </th>
                          <th className="px-4 py-3 text-center">
                            <span className="flex items-center justify-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              EV
                            </span>
                          </th>
                          <th className="px-4 py-3 text-center">Kelly</th>
                        </>
                      ) : (
                        <th className="px-4 py-3 text-center">Edge</th>
                      )}
                      <th className="px-4 py-3 text-center">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGames.map(game => (
                      <tr
                        key={game.game_id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                        onMouseEnter={() => setHoveredGame(game.game_id)}
                        onMouseLeave={() => setHoveredGame(null)}
                      >
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{game.away_abbr} @ {game.home_abbr}</div>
                          <div className="text-xs text-gray-500">
                            {game.away_team} at {game.home_team}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="text-white font-mono">{game.home_ppg}</div>
                          <div className="text-xs text-gray-500">Allow: {game.home_opp_ppg}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="text-white font-mono">{game.away_ppg}</div>
                          <div className="text-xs text-gray-500">Allow: {game.away_opp_ppg}</div>
                        </td>
                        <td className="px-4 py-4 text-center relative">
                          <span className="text-white font-mono font-semibold">{game.projected}</span>
                          {agentMode && game.monte_carlo && hoveredGame === game.game_id && (
                            <DistributionTooltip mc={game.monte_carlo} />
                          )}
                          {agentMode && game.monte_carlo && (
                            <Info className="w-3 h-3 text-gray-600 inline ml-1" />
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {game.line ? (
                            <div>
                              <div className="text-yellow-400 font-mono font-semibold">{game.line}</div>
                              {game.over_odds && game.under_odds && (
                                <div className="text-xs text-gray-500">
                                  O {game.over_odds.toFixed(2)} / U {game.under_odds.toFixed(2)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>

                        {agentMode ? (
                          <>
                            {/* Monte Carlo Probability */}
                            <td className="px-4 py-4">
                              {game.monte_carlo ? (
                                <div className="w-24">
                                  <ProbabilityBar
                                    pOver={game.monte_carlo.p_over}
                                    pUnder={game.monte_carlo.p_under}
                                  />
                                </div>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>

                            {/* EV */}
                            <td className="px-4 py-4 text-center">
                              {game.ev_metrics ? (
                                <div className="text-sm">
                                  <div className={game.ev_metrics.ev_over > 0 ? 'text-green-400' : 'text-gray-500'}>
                                    O: {game.ev_metrics.ev_over > 0 ? '+' : ''}{game.ev_metrics.ev_over.toFixed(1)}%
                                  </div>
                                  <div className={game.ev_metrics.ev_under > 0 ? 'text-red-400' : 'text-gray-500'}>
                                    U: {game.ev_metrics.ev_under > 0 ? '+' : ''}{game.ev_metrics.ev_under.toFixed(1)}%
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>

                            {/* Kelly */}
                            <td className="px-4 py-4 text-center">
                              {game.ev_metrics ? (
                                <div className="text-xs font-mono">
                                  {game.ev_metrics.kelly_over > 0 && (
                                    <div className="text-green-400">{game.ev_metrics.kelly_over.toFixed(1)}%</div>
                                  )}
                                  {game.ev_metrics.kelly_under > 0 && (
                                    <div className="text-red-400">{game.ev_metrics.kelly_under.toFixed(1)}%</div>
                                  )}
                                  {game.ev_metrics.kelly_over === 0 && game.ev_metrics.kelly_under === 0 && (
                                    <span className="text-gray-600">-</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>
                          </>
                        ) : (
                          <td className="px-4 py-4 text-center">
                            {game.edge !== null ? (
                              <span className={`font-mono font-semibold ${
                                game.edge > 0 ? 'text-green-400' : game.edge < 0 ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {game.edge > 0 ? '+' : ''}{game.edge.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>
                        )}

                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            verdictColors[agentMode && game.ev_metrics ? game.ev_metrics.recommended_bet : game.verdict] || verdictColors['NEUTRAL']
                          }`}>
                            <VerdictIcon verdict={agentMode && game.ev_metrics ? game.ev_metrics.recommended_bet : game.verdict} />
                            {verdictLabels[agentMode && game.ev_metrics ? game.ev_metrics.recommended_bet : game.verdict] || game.verdict}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                {agentMode ? <Zap className="w-4 h-4 text-purple-400" /> : <AlertTriangle className="w-4 h-4" />}
                {agentMode ? 'Monte Carlo Methodology' : 'Projection Methodology'}
              </h3>
              {agentMode ? (
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Simulation:</strong> 10,000 iterations using correlated bivariate normal distribution</p>
                  <p><strong>Correlation:</strong> 0.5 score correlation between teams (games tend to be high or low scoring together)</p>
                  <p><strong>Overtime:</strong> 6% probability with ~12 additional points on average</p>
                  <p><strong>EV:</strong> Expected Value = P(win) x (odds - 1) - P(lose)</p>
                  <p><strong>Kelly:</strong> Fractional Kelly (25%) capped at 5% of bankroll</p>
                </div>
              ) : (
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Projection:</strong> (Home PPG + Away PPG + Home OppPPG + Away OppPPG) / 2</p>
                  <p><strong>Edge:</strong> Projected - Line. Positive = Over, Negative = Under.</p>
                  <p className="text-yellow-500 mt-2">
                    Start the betting agent for Monte Carlo analysis:
                    <code className="bg-gray-800 px-2 py-0.5 rounded ml-1">
                      cd betting-agent && uvicorn src.api.server:app --port 8001
                    </code>
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
