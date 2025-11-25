'use client'

import { useState } from 'react'
import { Trophy, TrendingUp, TrendingDown, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import type { GameOdds, PlayerProp } from '@/types/betting'

interface AnalysisResult {
  player_name: string
  team: string
  stat_type: string
  line: number
  over_odds: number
  under_odds: number
  season_avg: number
  home_avg: number | null
  away_avg: number | null
  last_5_avg: number | null
  vs_opponent_avg: number | null
  games_played: number
  weighted_projection: number
  defensive_adjustment: number
  final_projection: number
  value_pct: number
  edge_vs_line: number
  implied_probability: number
  recommendation: 'STRONG OVER' | 'LEAN OVER' | 'NEUTRAL' | 'LEAN UNDER' | 'STRONG UNDER'
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  breakdown: {
    weighted_components: {
      season: { value: number; weight: number; contribution: number }
      location: { value: number | null; weight: number; contribution: number }
      last_5: { value: number | null; weight: number; contribution: number }
      h2h: { value: number | null; weight: number; contribution: number }
    }
    defensive_context: {
      opponent_defense: string
      league_avg: number
      opponent_allows: number
      defense_rating: string
      adjustment_factor: number
      team_offensive_context?: {
        team_location_avg: number
        league_avg: number
        split_rating: string
        adjustment_factor: number
      }
    }
  }
}

interface AnalysisResponse {
  success: boolean
  game: {
    home_team: string
    away_team: string
    season: string
  }
  analyses: AnalysisResult[]
  summary: {
    total_props: number
    strong_over: number
    lean_over: number
    neutral: number
    lean_under: number
    strong_under: number
    high_confidence: number
  }
}

interface PlayerPropsAnalysisProps {
  game: GameOdds
}

export default function PlayerPropsAnalysis({ game }: PlayerPropsAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null)
  const [expandedProp, setExpandedProp] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Group props by player
  const propsByPlayer: Record<string, PlayerProp[]> = {}
  ;(game.playerProps || []).forEach((prop) => {
    if (!propsByPlayer[prop.player_name]) {
      propsByPlayer[prop.player_name] = []
    }
    propsByPlayer[prop.player_name].push(prop)
  })

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/betting/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home_team: game.homeTeam,
          away_team: game.awayTeam,
          player_props: game.playerProps,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const data: AnalysisResponse = await response.json()
      setAnalysisResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRecommendationColor = (recommendation: AnalysisResult['recommendation']) => {
    switch (recommendation) {
      case 'STRONG OVER':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'LEAN OVER':
        return 'bg-green-500/10 text-green-300 border-green-500/20'
      case 'NEUTRAL':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      case 'LEAN UNDER':
        return 'bg-red-500/10 text-red-300 border-red-500/20'
      case 'STRONG UNDER':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  }

  const getConfidenceBadge = (confidence: AnalysisResult['confidence']) => {
    const colors = {
      HIGH: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      MEDIUM: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      LOW: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    return colors[confidence]
  }

  const toggleExpand = (propKey: string) => {
    setExpandedProp(expandedProp === propKey ? null : propKey)
  }

  return (
    <div className="space-y-6">
      {/* Header with Run Analysis Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            Player Props Analysis
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {(game.playerProps || []).length} props available • {Object.keys(propsByPlayer).length} players
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Run Full Analysis'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Analysis Failed</p>
            <p className="text-red-300/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Compact Props Display (Before Analysis) */}
      {!analysisResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(propsByPlayer).map(([playerName, props]) => (
            <div key={playerName} className="p-4 bg-muted/20 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
              <div className="font-medium text-white mb-3 flex items-center justify-between">
                <span className="truncate">{playerName}</span>
                <span className="text-xs text-gray-400 ml-2">{props.length}</span>
              </div>
              <div className="space-y-2">
                {props.slice(0, 3).map((prop, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 truncate flex-1">{prop.stat_type}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white font-mono">{prop.line}</span>
                      <span className="text-green-400 text-xs font-mono">{prop.over_odds.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                {props.length > 3 && (
                  <p className="text-xs text-gray-500 text-center pt-1">+{props.length - 3} more</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{analysisResults.summary.total_props}</div>
              <div className="text-xs text-gray-400 mt-1">Total Props</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">{analysisResults.summary.strong_over}</div>
              <div className="text-xs text-gray-400 mt-1">Strong Over</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-300">{analysisResults.summary.lean_over}</div>
              <div className="text-xs text-gray-400 mt-1">Lean Over</div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="text-2xl font-bold text-red-300">{analysisResults.summary.lean_under}</div>
              <div className="text-xs text-gray-400 mt-1">Lean Under</div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="text-2xl font-bold text-red-400">{analysisResults.summary.strong_under}</div>
              <div className="text-xs text-gray-400 mt-1">Strong Under</div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{analysisResults.summary.high_confidence}</div>
              <div className="text-xs text-gray-400 mt-1">High Confidence</div>
            </div>
          </div>

          {/* Value Bets (Top Recommendations) */}
          <div>
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              High-Value Opportunities
            </h4>
            <div className="space-y-3">
              {analysisResults.analyses
                .filter((a) => a.recommendation !== 'NEUTRAL' && (a.confidence === 'HIGH' || Math.abs(a.value_pct) >= 10))
                .slice(0, 10)
                .map((analysis) => {
                  const propKey = `${analysis.player_name}-${analysis.stat_type}`
                  const isExpanded = expandedProp === propKey

                  return (
                    <div
                      key={propKey}
                      className={`p-4 rounded-lg border transition-all ${getRecommendationColor(analysis.recommendation)}`}
                    >
                      {/* Compact View */}
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleExpand(propKey)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-white">{analysis.player_name}</h5>
                            <span className="text-sm text-gray-400">{analysis.team}</span>
                            <span className={`text-xs px-2 py-0.5 rounded border ${getConfidenceBadge(analysis.confidence)}`}>
                              {analysis.confidence}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-300">{analysis.stat_type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-mono">Line: {analysis.line}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-white font-mono font-semibold">Proj: {analysis.final_projection}</span>
                            </div>
                            <div
                              className={`font-mono font-bold ${
                                analysis.value_pct > 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {analysis.value_pct > 0 ? '+' : ''}
                              {analysis.value_pct.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{analysis.recommendation}</div>
                            <div className="text-xs text-gray-400">@ {analysis.over_odds.toFixed(2)}</div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Breakdown */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-current/20 space-y-4">
                          {/* Player Statistics */}
                          <div>
                            <h6 className="text-sm font-semibold text-white mb-2">Player Averages</h6>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                              <div className="p-2 bg-black/20 rounded">
                                <div className="text-gray-400 text-xs">Season</div>
                                <div className="text-white font-mono font-semibold">{analysis.season_avg.toFixed(1)}</div>
                              </div>
                              {analysis.home_avg !== null && (
                                <div className="p-2 bg-black/20 rounded">
                                  <div className="text-gray-400 text-xs">Home</div>
                                  <div className="text-white font-mono font-semibold">{analysis.home_avg.toFixed(1)}</div>
                                </div>
                              )}
                              {analysis.away_avg !== null && (
                                <div className="p-2 bg-black/20 rounded">
                                  <div className="text-gray-400 text-xs">Away</div>
                                  <div className="text-white font-mono font-semibold">{analysis.away_avg.toFixed(1)}</div>
                                </div>
                              )}
                              {analysis.last_5_avg !== null && (
                                <div className="p-2 bg-black/20 rounded">
                                  <div className="text-gray-400 text-xs">Last 5</div>
                                  <div className="text-white font-mono font-semibold">{analysis.last_5_avg.toFixed(1)}</div>
                                </div>
                              )}
                              {analysis.vs_opponent_avg !== null && (
                                <div className="p-2 bg-black/20 rounded">
                                  <div className="text-gray-400 text-xs">vs Opp</div>
                                  <div className="text-white font-mono font-semibold">{analysis.vs_opponent_avg.toFixed(1)}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Weighted Projection Breakdown */}
                          <div>
                            <h6 className="text-sm font-semibold text-white mb-2">Projection Breakdown</h6>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">
                                  Season ({(analysis.breakdown.weighted_components.season.weight * 100).toFixed(0)}%)
                                </span>
                                <span className="text-white font-mono">
                                  {analysis.breakdown.weighted_components.season.value.toFixed(1)} ={' '}
                                  {analysis.breakdown.weighted_components.season.contribution.toFixed(2)}
                                </span>
                              </div>
                              {analysis.breakdown.weighted_components.location.value !== null && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400">
                                    Location ({(analysis.breakdown.weighted_components.location.weight * 100).toFixed(0)}%)
                                  </span>
                                  <span className="text-white font-mono">
                                    {analysis.breakdown.weighted_components.location.value.toFixed(1)} ={' '}
                                    {analysis.breakdown.weighted_components.location.contribution.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {analysis.breakdown.weighted_components.last_5.value !== null && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400">
                                    Last 5 ({(analysis.breakdown.weighted_components.last_5.weight * 100).toFixed(0)}%)
                                  </span>
                                  <span className="text-white font-mono">
                                    {analysis.breakdown.weighted_components.last_5.value.toFixed(1)} ={' '}
                                    {analysis.breakdown.weighted_components.last_5.contribution.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {analysis.breakdown.weighted_components.h2h.value !== null && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400">
                                    H2H ({(analysis.breakdown.weighted_components.h2h.weight * 100).toFixed(0)}%)
                                  </span>
                                  <span className="text-white font-mono">
                                    {analysis.breakdown.weighted_components.h2h.value.toFixed(1)} ={' '}
                                    {analysis.breakdown.weighted_components.h2h.contribution.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="pt-2 border-t border-current/20 flex justify-between items-center font-semibold">
                                <span className="text-white">Weighted Projection</span>
                                <span className="text-white font-mono">{analysis.weighted_projection.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Defensive Context */}
                          <div>
                            <h6 className="text-sm font-semibold text-white mb-2">Defensive Matchup</h6>
                            <div className="p-3 bg-black/20 rounded space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Opponent Defense</span>
                                <span className="text-white font-semibold">
                                  {analysis.breakdown.defensive_context.opponent_defense} (
                                  {analysis.breakdown.defensive_context.defense_rating})
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">League Average</span>
                                <span className="text-white font-mono">
                                  {analysis.breakdown.defensive_context.league_avg.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Opponent Allows</span>
                                <span
                                  className={`font-mono ${
                                    analysis.breakdown.defensive_context.opponent_allows >
                                    analysis.breakdown.defensive_context.league_avg
                                      ? 'text-green-400'
                                      : 'text-red-400'
                                  }`}
                                >
                                  {analysis.breakdown.defensive_context.opponent_allows.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-white/10">
                                <span className="text-white font-semibold">Adjustment Factor</span>
                                <span
                                  className={`font-mono font-bold ${
                                    analysis.defensive_adjustment > 1 ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {analysis.defensive_adjustment.toFixed(3)}x
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-white/10 font-semibold">
                                <span className="text-white">Final Projection</span>
                                <span className="text-white font-mono text-lg">{analysis.final_projection.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Value Analysis */}
                          <div>
                            <h6 className="text-sm font-semibold text-white mb-2">Value Analysis</h6>
                            <div className="p-3 bg-black/20 rounded space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Edge vs Line</span>
                                <span
                                  className={`font-mono font-semibold ${
                                    analysis.edge_vs_line > 0 ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {analysis.edge_vs_line > 0 ? '+' : ''}
                                  {analysis.edge_vs_line.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Value %</span>
                                <span
                                  className={`font-mono font-bold text-lg ${
                                    analysis.value_pct > 0 ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {analysis.value_pct > 0 ? '+' : ''}
                                  {analysis.value_pct.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Implied Probability</span>
                                <span className="text-white font-mono">{analysis.implied_probability.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Games Played</span>
                                <span className="text-white font-mono">{analysis.games_played}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>

          {/* All Props (Expandable) */}
          {analysisResults.analyses.length > 10 && (
            <div>
              <h4 className="text-md font-semibold text-white mb-4">All Analyzed Props</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysisResults.analyses.slice(10).map((analysis) => {
                  const propKey = `${analysis.player_name}-${analysis.stat_type}`
                  return (
                    <div
                      key={propKey}
                      className={`p-3 rounded-lg border ${getRecommendationColor(analysis.recommendation)}`}
                    >
                      <div className="font-medium text-white text-sm mb-1">{analysis.player_name}</div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{analysis.stat_type}</span>
                        <span
                          className={`font-mono font-bold ${analysis.value_pct > 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {analysis.value_pct > 0 ? '+' : ''}
                          {analysis.value_pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-gray-400">{analysis.line} → {analysis.final_projection.toFixed(1)}</span>
                        <span className={`px-1.5 py-0.5 rounded ${getConfidenceBadge(analysis.confidence)}`}>
                          {analysis.confidence}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
