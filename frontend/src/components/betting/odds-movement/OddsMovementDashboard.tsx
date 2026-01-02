'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface MoneylinePoint {
  timestamp: string
  time: string
  away: number
  home: number
}

interface SpreadPoint {
  timestamp: string
  time: string
  line: number
  favorite: string
  awayOdds: number
  homeOdds: number
}

interface TotalPoint {
  timestamp: string
  time: string
  line: number
  overOdds: number
  underOdds: number
}

interface GameSummary {
  mlOpen: { away: number; home: number }
  mlCurrent: { away: number; home: number }
  mlMovement: { away: number; home: number }
  spreadOpen: number
  spreadCurrent: number
  spreadMovement: number
  totalOpen: number
  totalCurrent: number
  totalMovement: number
  dataPoints: number
}

interface GameData {
  gameId: string
  matchup: string
  awayTeam: string
  homeTeam: string
  awayName: string
  homeName: string
  gameDate: string
  gameStatus: string
  moneyline: MoneylinePoint[]
  spread: SpreadPoint[]
  total: TotalPoint[]
  summary: GameSummary
}

interface OddsMovementResponse {
  fetchedAt: string
  games: GameData[]
  insights: {
    totalGames: number
    totalDataPoints: number
    biggestMLMovers: { game: string; team: string; movement: number }[]
    biggestTotalMovers: { game: string; movement: number }[]
    overallTotalTrend: number
  }
}

function MovementBadge({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="text-gray-500">-</span>

  const isPositive = value > 0
  const color = isPositive ? 'text-green-400' : 'text-red-400'
  const arrow = isPositive ? '↑' : '↓'

  return (
    <span className={`${color} font-mono`}>
      {arrow} {Math.abs(value).toFixed(2)}{suffix}
    </span>
  )
}

function SummaryCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-900/60 border border-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{title}</h3>
      {children}
    </div>
  )
}

function MoneylineChart({ data, awayTeam, homeTeam }: { data: MoneylinePoint[]; awayTeam: string; homeTeam: string }) {
  if (data.length === 0) {
    return <div className="text-gray-500 text-center py-8">No moneyline data available</div>
  }

  const openAway = data[0]?.away || 0

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="time"
          stroke="#6B7280"
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          domain={['dataMin - 0.1', 'dataMax + 0.1']}
          tickFormatter={(v) => v.toFixed(2)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px'
          }}
          labelStyle={{ color: '#9CA3AF' }}
          formatter={(value: number, name: string) => [value.toFixed(3), name]}
        />
        <Legend />
        <ReferenceLine y={openAway} stroke="#6B7280" strokeDasharray="5 5" label={{ value: 'Open', fill: '#6B7280', fontSize: 10 }} />
        <Line
          type="stepAfter"
          dataKey="away"
          name={awayTeam}
          stroke="#F87171"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="stepAfter"
          dataKey="home"
          name={homeTeam}
          stroke="#60A5FA"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function TotalsChart({ data }: { data: TotalPoint[] }) {
  if (data.length === 0) {
    return <div className="text-gray-500 text-center py-8">No totals data available</div>
  }

  const openLine = data[0]?.line || 0

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="time"
          stroke="#6B7280"
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          domain={['dataMin - 1', 'dataMax + 1']}
          tickFormatter={(v) => v.toFixed(1)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px'
          }}
          labelStyle={{ color: '#9CA3AF' }}
          formatter={(value: number, name: string) => [value.toFixed(1), name]}
        />
        <Legend />
        <ReferenceLine
          y={openLine}
          stroke="#6B7280"
          strokeDasharray="5 5"
          label={{ value: `Open: ${openLine}`, fill: '#6B7280', fontSize: 10, position: 'right' }}
        />
        <Line
          type="stepAfter"
          dataKey="line"
          name="Total Line"
          stroke="#A78BFA"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function TotalsOddsChart({ data }: { data: TotalPoint[] }) {
  if (data.length === 0) {
    return <div className="text-gray-500 text-center py-8">No odds data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="time"
          stroke="#6B7280"
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          domain={[1.7, 2.2]}
          tickFormatter={(v) => v.toFixed(2)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px'
          }}
          labelStyle={{ color: '#9CA3AF' }}
          formatter={(value: number, name: string) => [value.toFixed(3), name]}
        />
        <Legend />
        <ReferenceLine y={1.91} stroke="#6B7280" strokeDasharray="5 5" />
        <Line
          type="stepAfter"
          dataKey="overOdds"
          name="Over"
          stroke="#34D399"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="stepAfter"
          dataKey="underOdds"
          name="Under"
          stroke="#FB923C"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function GameCard({ game, isSelected, onClick }: { game: GameData; isSelected: boolean; onClick: () => void }) {
  const { summary, awayTeam, homeTeam } = game

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? 'bg-gray-800 border-blue-500'
          : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-white">{game.matchup}</span>
        <span className="text-xs text-gray-500">{summary.dataPoints} pts</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-gray-500">ML {awayTeam}</span>
          <div><MovementBadge value={summary.mlMovement.away} /></div>
        </div>
        <div>
          <span className="text-gray-500">ML {homeTeam}</span>
          <div><MovementBadge value={summary.mlMovement.home} /></div>
        </div>
        <div>
          <span className="text-gray-500">Total</span>
          <div><MovementBadge value={summary.totalMovement} /></div>
        </div>
      </div>
    </button>
  )
}

export function OddsMovementDashboard() {
  const [data, setData] = useState<OddsMovementResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/betting/odds-movement')
      if (!response.ok) {
        throw new Error('Failed to fetch odds movement data')
      }
      const json = await response.json()
      setData(json)
      setLastRefresh(new Date())
      setError(null)

      // Auto-select first game if none selected
      if (!selectedGameId && json.games?.length > 0) {
        setSelectedGameId(json.games[0].gameId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [selectedGameId])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  const selectedGame = data?.games.find(g => g.gameId === selectedGameId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Odds Movement</h1>
          <p className="text-gray-400 text-sm">Tonight&apos;s games line movement analysis</p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-gray-800 border-gray-700"
            />
            Auto-refresh (60s)
          </label>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <span className="animate-spin">⟳</span> : <span>⟳</span>}
            Refresh
          </button>

          {lastRefresh && (
            <span className="text-xs text-gray-500">
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl animate-pulse mb-4">⟳</div>
            <div className="text-gray-500">Loading odds movement data...</div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">Error</div>
            <div className="text-red-500">{error}</div>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Game Selector Sidebar */}
          <div className="col-span-3 space-y-4">
            <h2 className="text-sm font-medium text-gray-400 uppercase">Select Game</h2>
            <div className="space-y-2">
              {data.games.map(game => (
                <GameCard
                  key={game.gameId}
                  game={game}
                  isSelected={game.gameId === selectedGameId}
                  onClick={() => setSelectedGameId(game.gameId)}
                />
              ))}
            </div>

            {/* Insights */}
            {data.insights && (
              <div className="mt-6 space-y-4">
                <h2 className="text-sm font-medium text-gray-400 uppercase">Insights</h2>

                <SummaryCard title="Biggest ML Movers">
                  <div className="space-y-1">
                    {data.insights.biggestMLMovers.slice(0, 3).map((m, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-300">{m.team}</span>
                        <MovementBadge value={m.movement} />
                      </div>
                    ))}
                    {data.insights.biggestMLMovers.length === 0 && (
                      <span className="text-gray-500 text-xs">No significant movement</span>
                    )}
                  </div>
                </SummaryCard>

                <SummaryCard title="Total Line Trend">
                  <div className="text-2xl font-bold">
                    <MovementBadge value={data.insights.overallTotalTrend} suffix=" pts" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.insights.overallTotalTrend < 0 ? 'Market moving under' : data.insights.overallTotalTrend > 0 ? 'Market moving over' : 'Stable'}
                  </p>
                </SummaryCard>
              </div>
            )}
          </div>

          {/* Charts Area */}
          <div className="col-span-9 space-y-6">
            {selectedGame ? (
              <>
                {/* Game Header */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedGame.matchup}</h2>
                      <p className="text-sm text-gray-400">{selectedGame.summary.dataPoints} data points collected</p>
                    </div>

                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">ML {selectedGame.awayTeam}</div>
                        <div className="font-mono">
                          <span className="text-gray-400">{selectedGame.summary.mlOpen.away.toFixed(2)}</span>
                          <span className="mx-2">→</span>
                          <span className="text-white">{selectedGame.summary.mlCurrent.away.toFixed(2)}</span>
                        </div>
                        <MovementBadge value={selectedGame.summary.mlMovement.away} />
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">ML {selectedGame.homeTeam}</div>
                        <div className="font-mono">
                          <span className="text-gray-400">{selectedGame.summary.mlOpen.home.toFixed(2)}</span>
                          <span className="mx-2">→</span>
                          <span className="text-white">{selectedGame.summary.mlCurrent.home.toFixed(2)}</span>
                        </div>
                        <MovementBadge value={selectedGame.summary.mlMovement.home} />
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">Total</div>
                        <div className="font-mono">
                          <span className="text-gray-400">{selectedGame.summary.totalOpen.toFixed(1)}</span>
                          <span className="mx-2">→</span>
                          <span className="text-white">{selectedGame.summary.totalCurrent.toFixed(1)}</span>
                        </div>
                        <MovementBadge value={selectedGame.summary.totalMovement} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Moneyline Chart */}
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase mb-4">Moneyline Movement</h3>
                  <MoneylineChart
                    data={selectedGame.moneyline}
                    awayTeam={selectedGame.awayTeam}
                    homeTeam={selectedGame.homeTeam}
                  />
                </div>

                {/* Totals Charts */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-400 uppercase mb-4">Total Line Movement</h3>
                    <TotalsChart data={selectedGame.total} />
                  </div>

                  <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-400 uppercase mb-4">Over/Under Odds</h3>
                    <TotalsOddsChart data={selectedGame.total} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Select a game to view odds movement charts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
