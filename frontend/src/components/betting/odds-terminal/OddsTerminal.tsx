'use client'

import { useState, useEffect, useCallback } from 'react'
import { ASCIIMoneylines } from './ASCIIMoneylines'
import { ASCIITotals } from './ASCIITotals'
import { ASCIIPlayerProps } from './ASCIIPlayerProps'
import { ASCIIInsights } from './ASCIIInsights'

type TabType = 'moneylines' | 'totals' | 'props' | 'insights'

interface GameData {
  gameId: string
  game: string
  gameDate: string
  gameTime: string | null
  gameStatus: string
  awayScore: number | null
  homeScore: number | null
  awayTeam: {
    abbr: string
    name: string
    openOdds: number | null
    currentOdds: number | null
    movement: number | null
  }
  homeTeam: {
    abbr: string
    name: string
    openOdds: number | null
    currentOdds: number | null
    movement: number | null
  }
  total: {
    openLine: number | null
    currentLine: number | null
    movement: number
    overOdds: number | null
    underOdds: number | null
  } | null
  hasOdds: boolean
  readings: number
}

interface OddsTerminalData {
  fetchedAt: string
  allGames: GameData[]
  totalGamesCount: number
  gamesWithOdds: number
  gamesCount: number
  marketsCount: number
  propsCount: number
  moneylines: any[]
  totals: any[]
  playerProps: any[]
  insights: {
    biggestMLMovers: { team: string; movement: number; direction: 'steam' | 'drift' }[]
    totalsTrend: 'all_under' | 'all_over' | 'mixed'
    totalPointsDropped: number
    propsWithMovement: number
  }
}

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'moneylines', label: 'MONEYLINES', icon: '💰' },
  { id: 'totals', label: 'TOTALS', icon: '📊' },
  { id: 'props', label: 'PROPS', icon: '🎲' },
  { id: 'insights', label: 'INSIGHTS', icon: '⚡' },
]

export function OddsTerminal() {
  const [activeTab, setActiveTab] = useState<TabType>('moneylines')
  const [data, setData] = useState<OddsTerminalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/betting/odds-terminal')
      if (!response.ok) {
        throw new Error('Failed to fetch odds data')
      }
      const json = await response.json()
      setData(json)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 60 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        fetchData()
      }
      if (e.key === '1') setActiveTab('moneylines')
      if (e.key === '2') setActiveTab('totals')
      if (e.key === '3') setActiveTab('props')
      if (e.key === '4') setActiveTab('insights')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fetchData])

  return (
    <div className="font-mono">
      {/* Terminal Header */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <h1 className="text-white font-bold text-lg">
              ODDS TERMINAL <span className="text-gray-500">v1.0</span>
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Auto-refresh toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded bg-gray-800 border-gray-700"
              />
              Auto-refresh (60s)
            </label>

            {/* Manual refresh */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <span>⟳</span>
              )}
              Refresh (R)
            </button>

            {/* Last updated */}
            {lastRefresh && (
              <span className="text-xs text-gray-500">
                Updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-900/60 border-x border-gray-800 px-4">
        <div className="flex gap-1">
          {TABS.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-white text-white bg-gray-800/50'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              <span className="ml-2 text-xs text-gray-600">[{idx + 1}]</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-[#0a0a0a] border border-gray-800 border-t-0 rounded-b-lg p-6 min-h-[500px]">
        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl animate-pulse mb-4">⟳</div>
              <div className="text-gray-500">Loading odds data...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-red-500">{error}</div>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : data ? (
          <>
            {activeTab === 'moneylines' && <ASCIIMoneylines data={data.allGames} />}
            {activeTab === 'totals' && <ASCIITotals data={data.allGames} />}
            {activeTab === 'props' && <ASCIIPlayerProps data={data.playerProps} />}
            {activeTab === 'insights' && (
              <ASCIIInsights
                insights={data.insights}
                gamesCount={data.totalGamesCount}
                marketsCount={data.marketsCount}
                propsCount={data.propsCount}
                fetchedAt={data.fetchedAt}
                gamesWithOdds={data.gamesWithOdds}
              />
            )}
          </>
        ) : null}
      </div>

      {/* Footer with keyboard shortcuts */}
      <div className="mt-4 text-center text-xs text-gray-600">
        Keyboard shortcuts: <span className="text-gray-400">[R]</span> Refresh •{' '}
        <span className="text-gray-400">[1-4]</span> Switch tabs
      </div>
    </div>
  )
}
