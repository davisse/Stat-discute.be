'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { GameCardsSelector } from '@/components/player-props/GameCardsSelector'
import { PropsAnalysisTable, PlayerProp } from '@/components/player-props/PropsAnalysisTable'
import { PropAnalysisModal } from '@/components/player-props/PropAnalysisModal'
import { Loader2, RefreshCw, Calendar, TrendingUp } from 'lucide-react'

interface Game {
  game_id: string
  game_date: string
  home_team_id: number
  home_abbr: string
  home_team: string
  away_team_id: number
  away_abbr: string
  away_team: string
  event_id?: string
}

interface AnalysisData {
  games: Game[]
  players: PlayerProp[]
  defenseRankings: any[]
  generatedAt: string
}

export default function TonightPropsPage() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProp | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    fetchData()
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Dedupe games by game_id (API can return duplicates from LEFT JOIN)
  const uniqueGames = data?.games
    ? [...new Map(data.games.map(g => [g.game_id, g])).values()]
    : []

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/betting/props-analysis')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Filter players by selected game
  const filteredPlayers = data?.players.filter(player => {
    if (selectedGameId === null) return true
    return player.game_id === selectedGameId
  }) || []

  // Get top edges summary
  const topOvers = filteredPlayers
    .filter(p => p.edge_verdict.includes('OVER'))
    .sort((a, b) => b.edge_points - a.edge_points)
    .slice(0, 3)

  const topUnders = filteredPlayers
    .filter(p => p.edge_verdict.includes('UNDER'))
    .sort((a, b) => a.edge_points - b.edge_points)
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
                <Calendar className="w-8 h-8" />
                Tonight&apos;s Props Analysis
              </h1>
              <p className="text-gray-500 mt-2">
                Position defense matchups and edge calculations for player props
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

          {data?.generatedAt && (
            <p className="text-xs text-gray-600 mt-2">
              Last updated: {new Date(data.generatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
            <p className="text-gray-500">Loading tonight&apos;s analysis...</p>
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
        {!loading && !error && uniqueGames.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Games Tonight</h2>
            <p className="text-gray-500">Check back tomorrow for props analysis</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && data && uniqueGames.length > 0 && (
          <>
            {/* Games Selector */}
            <GameCardsSelector
              games={uniqueGames}
              selectedGameId={selectedGameId}
              onSelectGame={setSelectedGameId}
            />

            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Top Overs */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Top Over Edges
                </h3>
                {topOvers.length > 0 ? (
                  <div className="space-y-2">
                    {topOvers.map((p, idx) => (
                      <div key={p.player_id} className="flex items-center justify-between text-sm">
                        <span className="text-white">{p.player_name}</span>
                        <span className="text-green-400 font-mono">+{p.edge_points.toFixed(1)}</span>
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
                  <TrendingUp className="w-4 h-4 rotate-180" />
                  Top Under Edges
                </h3>
                {topUnders.length > 0 ? (
                  <div className="space-y-2">
                    {topUnders.map((p, idx) => (
                      <div key={p.player_id} className="flex items-center justify-between text-sm">
                        <span className="text-white">{p.player_name}</span>
                        <span className="text-red-400 font-mono">{p.edge_points.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No significant under edges</p>
                )}
              </div>
            </div>

            {/* Props Table */}
            <PropsAnalysisTable
              players={filteredPlayers}
              onSelectPlayer={setSelectedPlayer}
              selectedPlayerId={selectedPlayer?.player_id || null}
            />
          </>
        )}

        {/* Analysis Modal */}
        {selectedPlayer && (
          <PropAnalysisModal
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </div>
    </AppLayout>
  )
}
