'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users, AlertCircle, Trophy } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import BettingDashboard from './BettingDashboard'
import type { GameOdds as SharedGameOdds } from '@/types/betting'

interface TeamOdds {
  spread: string
  spreadOdds: string
  moneyline: string
  total: string
  overOdds: string
  underOdds: string
}

interface GameOdds {
  gameId: string
  homeTeam: string
  awayTeam: string
  startTime: string
  homeOdds: TeamOdds
  awayOdds: TeamOdds
  playerProps?: PlayerProp[]
}

interface PlayerProp {
  playerId: string
  playerName: string
  market: string
  line: number
  overOdds: string
  underOdds: string
}

export default function OddsFetcher() {
  const [odds, setOdds] = useState<GameOdds[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [dataSource, setDataSource] = useState<'auto' | 'database' | 'live' | 'file' | 'mock'>('auto')
  const [currentSource, setCurrentSource] = useState<string>('')
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const fetchOdds = async (source: 'auto' | 'database' | 'live' | 'file' | 'mock' = dataSource) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/betting/odds?source=${source}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch odds: ${response.statusText}`)
      }

      const data = await response.json()
      setOdds(data.games || [])
      setCurrentSource(data.source || 'unknown')
      setLastFetch(new Date())

      // Auto-select first game if none selected
      if (!selectedGame && data.games && data.games.length > 0) {
        setSelectedGame(data.games[0].gameId)
      }

      // Show message about data source
      if (data.source === 'mock') {
        console.log('Using mock data with IND vs OKC and GSW vs DEN games')
      } else if (data.source === 'database') {
        console.log('Using real betting data from database')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch odds')
      console.error('Error fetching odds:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get the currently selected game
  const selectedGameData = odds.find(game => game.gameId === selectedGame)

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Fetch Button and Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              onClick={() => fetchOdds()}
              disabled={loading}
              size="lg"
              className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              variant="primary"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Fetching Odds...' : 'Fetch Current Odds'}
            </Button>

            {/* Data Source Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Source:</label>
              <select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value as any)}
                className="px-3 py-1 text-sm border rounded-md bg-background"
              >
                <option value="auto">Auto</option>
                <option value="database">Database</option>
                <option value="live">Live (ps3838)</option>
                <option value="file">Local File</option>
                <option value="mock">Mock Data</option>
              </select>
            </div>

            {lastFetch && (
              <div className="flex flex-col">
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-xs text-muted-foreground">
                  {lastFetch.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })} ({currentSource})
                </p>
              </div>
            )}
          </div>

          {odds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{odds.length} Games Available</span>
            </div>
          )}
        </div>

        {/* Data Source Info */}
        {currentSource && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Data Source:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              currentSource === 'database' ? 'bg-purple-100 text-purple-700' :
              currentSource === 'live' ? 'bg-green-100 text-green-700' :
              currentSource === 'file' ? 'bg-blue-100 text-blue-700' :
              currentSource === 'mock' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {currentSource === 'database' ? '💾 Database (Real Odds)' :
               currentSource === 'live' ? '🟢 Live from ps3838.com' :
               currentSource === 'file' ? '📁 Local JSON File' :
               currentSource === 'mock' ? '🎮 Mock Data (IND vs OKC, GSW vs DEN)' :
               currentSource}
            </span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Game Selector (if odds available) */}
      {!loading && odds.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <label className="text-sm font-medium">Select Game:</label>
            <select
              value={selectedGame || ''}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="flex-1 max-w-sm px-3 py-1.5 text-sm border rounded-md bg-background"
            >
              {odds.map(game => (
                <option key={game.gameId} value={game.gameId}>
                  {game.awayTeam} @ {game.homeTeam} - {formatDate(game.startTime)}
                </option>
              ))}
            </select>
          </div>

          {/* Betting Dashboard with Tabs */}
          <BettingDashboard game={selectedGameData as SharedGameOdds | undefined || null} />
        </div>
      )}

      {/* Empty State */}
      {!loading && odds.length === 0 && !error && (
        <BettingDashboard game={null} />
      )}
    </div>
  )
}