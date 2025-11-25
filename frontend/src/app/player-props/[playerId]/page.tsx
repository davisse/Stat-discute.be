'use client'

import { AppLayout } from '@/components/layout'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { PlayerHeader } from '@/components/player-props/PlayerHeader'
import { NextGameMatchup } from '@/components/player-props/NextGameMatchup'
import { PlayerSplits } from '@/components/player-props/PlayerSplits'
import { GameLogTable } from '@/components/player-props/GameLogTable'
import { PropLinesPanel } from '@/components/player-props/PropLinesPanel'
import { PerformanceTrends } from '@/components/player-props/PerformanceTrends'
import { PropPerformanceBarChart } from '@/components/player-props/PropPerformanceBarChart'

interface PlayerData {
  player: {
    player_id: string
    full_name: string
    position: string | null
    jersey_number: string | null
    team_abbr: string
    team_name: string
    height: string | null
    weight: string | null
    games_played: number
    points_avg: number
    rebounds_avg: number
    assists_avg: number
    steals_avg: number
    blocks_avg: number
    turnovers_avg: number
    minutes_avg: number
    threes_avg: number
    fgm_avg: number
    ftm_avg: number
    fg_pct: number
  }
  nextGame: {
    game_id: string
    game_date: string
    game_time: string | null
    venue: string | null
    home_team: string
    home_abbr: string
    away_team: string
    away_abbr: string
    player_location: 'home' | 'away' | null
  } | null
  recentGames: any[]
  splits: {
    home: any | null
    away: any | null
  }
  season: string
}

export default function PlayerPropsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.playerId as string

  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlayerData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/players/${playerId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Player not found')
          }
          throw new Error('Failed to fetch player data')
        }

        const data = await response.json()
        setPlayerData(data)
      } catch (err) {
        console.error('Error fetching player data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerData()
  }, [playerId])

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-11rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading player data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !playerData) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-11rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'Failed to load player data'}</p>
            <button
              onClick={() => router.push('/player-props')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Search
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/player-props')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </button>

        {/* Player Header */}
        <PlayerHeader player={playerData.player} />

        {/* Prop Performance Bar Chart - Full Width */}
        <PropPerformanceBarChart
          games={playerData.recentGames}
          playerAvg={{
            points_avg: playerData.player.points_avg,
            rebounds_avg: playerData.player.rebounds_avg,
            assists_avg: playerData.player.assists_avg,
            steals_avg: playerData.player.steals_avg,
            blocks_avg: playerData.player.blocks_avg,
            turnovers_avg: playerData.player.turnovers_avg,
            threes_avg: playerData.player.threes_avg,
            fgm_avg: playerData.player.fgm_avg,
            ftm_avg: playerData.player.ftm_avg,
            minutes_avg: playerData.player.minutes_avg
          }}
          playerTeam={playerData.player.team_abbr}
          initialProp="points"
        />

        {/* Two Column Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <NextGameMatchup
              nextGame={playerData.nextGame}
              playerTeam={playerData.player.team_abbr}
            />
            <PlayerSplits splits={playerData.splits} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PropLinesPanel
              playerId={playerData.player.player_id}
              playerName={playerData.player.full_name}
              stats={{
                points_avg: playerData.player.points_avg,
                rebounds_avg: playerData.player.rebounds_avg,
                assists_avg: playerData.player.assists_avg,
                games_played: playerData.player.games_played
              }}
              recentGames={playerData.recentGames}
            />

            <PerformanceTrends
              games={playerData.recentGames}
              playerAvg={{
                points_avg: playerData.player.points_avg,
                rebounds_avg: playerData.player.rebounds_avg,
                assists_avg: playerData.player.assists_avg
              }}
            />
          </div>
        </div>

        {/* Full Width Game Log */}
        <GameLogTable
          games={playerData.recentGames}
          playerTeam={playerData.player.team_abbr}
        />
      </div>
    </AppLayout>
  )
}