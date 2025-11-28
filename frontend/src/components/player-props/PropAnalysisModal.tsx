'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, TrendingUp, TrendingDown, Target, Shield, BarChart3, Loader2 } from 'lucide-react'
import { PlayerProp } from './PropsAnalysisTable'

interface GameLog {
  game_id: string
  game_date: string
  points: number
  rebounds: number
  assists: number
  fg3_made: number
  steals: number
  blocks: number
  minutes: number
  opponent_abbr: string
  location: 'home' | 'away'
  result: 'W' | 'L'
}

interface DefenseLog {
  game_id: string
  game_date: string
  defending_team_abbr: string
  opponent_abbr: string
  scorer_name: string
  points: number
}

interface PropAnalysisModalProps {
  player: PlayerProp
  onClose: () => void
}

export function PropAnalysisModal({ player, onClose }: PropAnalysisModalProps) {
  const [gameLog, setGameLog] = useState<GameLog[]>([])
  const [defenseLog, setDefenseLog] = useState<DefenseLog[]>([])
  const [loading, setLoading] = useState(true)
  const [threshold, setThreshold] = useState<number>(parseFloat(player.ppg))

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [playerRes, defenseRes] = await Promise.all([
          fetch(`/api/betting/props-analysis?action=player-log&playerId=${player.player_id}`),
          fetch(`/api/betting/props-analysis?action=defense-log&teamAbbr=${player.opponent_abbr}&position=${player.position}`)
        ])

        const playerData = await playerRes.json()
        const defenseData = await defenseRes.json()

        setGameLog(playerData.gameLog || [])
        setDefenseLog(defenseData.defenseLog || [])
      } catch (error) {
        console.error('Failed to fetch analysis data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [player.player_id, player.opponent_abbr, player.position])

  // Calculate player stats
  const playerStats = useMemo(() => {
    if (gameLog.length === 0) return null

    const points = gameLog.map(g => g.points)
    const overGames = points.filter(p => p > threshold)
    const underGames = points.filter(p => p < threshold)

    // Last 5 games
    const last5 = points.slice(0, 5)
    const last5Over = last5.filter(p => p > threshold).length

    return {
      games: gameLog.length,
      overCount: overGames.length,
      underCount: underGames.length,
      overPct: (overGames.length / gameLog.length) * 100,
      avg: points.reduce((a, b) => a + b, 0) / points.length,
      max: Math.max(...points),
      min: Math.min(...points),
      last5Over,
      last5Under: 5 - last5Over
    }
  }, [gameLog, threshold])

  // Calculate defense stats
  const defenseStats = useMemo(() => {
    if (defenseLog.length === 0) return null

    const points = defenseLog.map(d => d.points)
    const avg = points.reduce((a, b) => a + b, 0) / points.length

    return {
      games: defenseLog.length,
      avgAllowed: avg,
      max: Math.max(...points),
      min: Math.min(...points)
    }
  }, [defenseLog])

  // Chart calculations
  const chartHeight = 200
  const maxPointsPlayer = playerStats ? Math.max(playerStats.max, threshold * 1.2) : 40
  const maxPointsDefense = defenseStats ? Math.max(defenseStats.max, threshold * 1.2) : 40

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              {player.player_name}
              <span className={`text-sm px-2 py-0.5 rounded ${
                player.edge_verdict.includes('OVER') ? 'bg-green-400/20 text-green-400' :
                player.edge_verdict.includes('UNDER') ? 'bg-red-400/20 text-red-400' :
                'bg-gray-400/20 text-gray-400'
              }`}>
                {player.edge_verdict.replace('_', ' ')}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {player.team_abbr} {player.position} • {player.is_home ? 'vs' : '@'} {player.opponent_abbr}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Key Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 text-center">
                <div className="text-3xl font-bold text-white font-mono">{player.ppg}</div>
                <div className="text-xs text-gray-500 mt-1">Season PPG</div>
              </div>
              <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 text-center">
                <div className="text-3xl font-bold text-white font-mono">{player.defense_starter_ppg_allowed.toFixed(1)}</div>
                <div className="text-xs text-gray-500 mt-1">Starter {player.position} PPG vs {player.opponent_abbr}</div>
              </div>
              <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 text-center">
                <div className={`text-3xl font-bold font-mono ${
                  player.edge_points > 0 ? 'text-green-400' : player.edge_points < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {player.edge_points > 0 ? '+' : ''}{player.edge_points.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Edge</div>
              </div>
              <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 text-center">
                <div className="text-3xl font-bold text-white font-mono">#{player.defense_rank}</div>
                <div className="text-xs text-gray-500 mt-1">Defense Rank (Worst)</div>
              </div>
            </div>

            {/* Threshold Control */}
            <div className="bg-gray-950 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-gray-400 uppercase font-medium">
                  Analysis Threshold (Line)
                </label>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
                  step={0.5}
                  className="w-24 px-3 py-1.5 bg-transparent border border-gray-700 rounded text-white text-center font-mono
                           focus:border-white focus:outline-none"
                />
              </div>
              <input
                type="range"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                min={0}
                max={50}
                step={0.5}
                className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Player Scoring Chart */}
              <div className="bg-gray-950 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {player.player_name} Scoring (Last {gameLog.length} Games)
                </h3>

                {playerStats && (
                  <div className="mb-4 flex items-center justify-center gap-4 text-sm">
                    <span className="text-green-400">{playerStats.overCount} Over</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-red-400">{playerStats.underCount} Under</span>
                    <span className="text-gray-600">|</span>
                    <span className={`font-semibold ${playerStats.overPct >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {playerStats.overPct.toFixed(0)}% Over
                    </span>
                  </div>
                )}

                <div className="relative" style={{ height: chartHeight }}>
                  {/* Threshold line */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-white z-10"
                    style={{ bottom: `${(threshold / maxPointsPlayer) * 100}%` }}
                  >
                    <span className="absolute -right-2 -top-3 text-xs font-mono text-white bg-gray-900 px-1">
                      {threshold.toFixed(1)}
                    </span>
                  </div>

                  {/* Bars */}
                  <div className="flex items-end justify-around h-full gap-1">
                    {[...gameLog].reverse().map((game, idx) => {
                      const heightPct = (game.points / maxPointsPlayer) * 100
                      const isOver = game.points > threshold

                      return (
                        <div key={game.game_id} className="flex flex-col items-center group flex-1">
                          <div className="relative w-full flex justify-center" style={{ height: chartHeight }}>
                            <div
                              className={`w-3/4 max-w-[24px] rounded-t transition-all ${
                                isOver ? 'bg-green-500/80 hover:bg-green-500' : 'bg-red-500/80 hover:bg-red-500'
                              }`}
                              style={{
                                height: `${heightPct}%`,
                                position: 'absolute',
                                bottom: 0
                              }}
                            >
                              {/* Tooltip */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                                            transition-opacity text-xs bg-gray-800 px-2 py-1 rounded whitespace-nowrap z-20">
                                {game.points} pts vs {game.opponent_abbr}
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-600 mt-1 truncate w-full text-center">
                            {game.opponent_abbr}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Defense Chart */}
              <div className="bg-gray-950 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Top Starter {player.position} vs {player.opponent_abbr} (Last {defenseLog.length} Games)
                </h3>

                {defenseStats && (
                  <div className="mb-4 flex items-center justify-center gap-4 text-sm">
                    <span className="text-white">Avg: {defenseStats.avgAllowed.toFixed(1)}</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-400">Range: {defenseStats.min}-{defenseStats.max}</span>
                  </div>
                )}

                <div className="relative" style={{ height: chartHeight }}>
                  {/* Threshold line */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-gray-500 z-10"
                    style={{ bottom: `${(threshold / maxPointsDefense) * 100}%` }}
                  >
                    <span className="absolute -right-2 -top-3 text-xs font-mono text-gray-500 bg-gray-900 px-1">
                      {threshold.toFixed(1)}
                    </span>
                  </div>

                  {/* Bars */}
                  <div className="flex items-end justify-around h-full gap-1">
                    {[...defenseLog].reverse().map((game, idx) => {
                      const heightPct = (game.points / maxPointsDefense) * 100
                      const isOver = game.points > threshold

                      return (
                        <div key={game.game_id} className="flex flex-col items-center group flex-1">
                          <div className="relative w-full flex justify-center" style={{ height: chartHeight }}>
                            <div
                              className={`w-3/4 max-w-[24px] rounded-t transition-all ${
                                isOver ? 'bg-orange-500/80 hover:bg-orange-500' : 'bg-blue-500/80 hover:bg-blue-500'
                              }`}
                              style={{
                                height: `${heightPct}%`,
                                position: 'absolute',
                                bottom: 0
                              }}
                            >
                              {/* Tooltip */}
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                                            transition-opacity text-xs bg-gray-800 px-2 py-1 rounded whitespace-nowrap z-20">
                                <div>{game.scorer_name}</div>
                                <div>{game.points} pts ({game.opponent_abbr})</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-600 mt-1 truncate w-full text-center">
                            {game.opponent_abbr}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-gray-950 rounded-lg border border-gray-800 p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analysis Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player Analysis */}
                <div>
                  <h4 className="text-xs text-gray-400 uppercase mb-2">Player Trend</h4>
                  {playerStats && (
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-400">Season Average</span>
                        <span className="text-white font-mono">{playerStats.avg.toFixed(1)} PPG</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Hit Rate (Over {threshold})</span>
                        <span className={`font-mono ${playerStats.overPct >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {playerStats.overCount}/{playerStats.games} ({playerStats.overPct.toFixed(0)}%)
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Last 5 Games</span>
                        <span className={`font-mono ${playerStats.last5Over >= 3 ? 'text-green-400' : 'text-red-400'}`}>
                          {playerStats.last5Over}/5 Over
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Range</span>
                        <span className="text-white font-mono">{playerStats.min} - {playerStats.max}</span>
                      </li>
                    </ul>
                  )}
                </div>

                {/* Matchup Analysis */}
                <div>
                  <h4 className="text-xs text-gray-400 uppercase mb-2">Matchup Factor</h4>
                  {defenseStats && (
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-400">Top Starter {player.position} vs {player.opponent_abbr}</span>
                        <span className="text-white font-mono">{defenseStats.avgAllowed.toFixed(1)} PPG</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Defense Rank</span>
                        <span className={`font-mono ${player.defense_rank <= 10 ? 'text-green-400' : 'text-red-400'}`}>
                          #{player.defense_rank} (Worst)
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Range Allowed</span>
                        <span className="text-white font-mono">{defenseStats.min} - {defenseStats.max}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Edge vs Line</span>
                        <span className={`font-mono font-semibold ${
                          player.edge_points > 0 ? 'text-green-400' : player.edge_points < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {player.edge_points > 0 ? '+' : ''}{player.edge_points.toFixed(1)}
                        </span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>

              {/* Verdict */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 uppercase">Verdict</span>
                    <div className={`text-lg font-bold mt-1 flex items-center gap-2 ${
                      player.edge_verdict.includes('OVER') ? 'text-green-400' :
                      player.edge_verdict.includes('UNDER') ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {player.edge_verdict.includes('OVER') ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      {player.edge_verdict.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 uppercase">Edge</span>
                    <div className={`text-2xl font-bold font-mono mt-1 ${
                      player.edge_points > 0 ? 'text-green-400' : player.edge_points < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {player.edge_points > 0 ? '+' : ''}{player.edge_points.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
