'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'

// Team colors for styling
const TEAM_COLORS: Record<string, string> = {
  ATL: '#E03A3E', BOS: '#007A33', BKN: '#000000', CHA: '#1D1160',
  CHI: '#CE1141', CLE: '#860038', DAL: '#00538C', DEN: '#0E2240',
  DET: '#C8102E', GSW: '#1D428A', HOU: '#CE1141', IND: '#002D62',
  LAC: '#C8102E', LAL: '#552583', MEM: '#5D76A9', MIA: '#98002E',
  MIL: '#00471B', MIN: '#0C2340', NOP: '#0C2340', NYK: '#006BB6',
  OKC: '#007AC1', ORL: '#0077C0', PHI: '#006BB6', PHX: '#1D1160',
  POR: '#E03A3E', SAC: '#5A2D81', SAS: '#C4CED4', TOR: '#CE1141',
  UTA: '#002B5C', WAS: '#002B5C',
}

interface GameAnalysis {
  gameId: string
  gameDate: string
  home: { abbr: string; name: string; avgPoints: number }
  away: { abbr: string; name: string; avgPoints: number }
  line: number
  overOdds: number
  underOdds: number
  combinedAvg: number
  gap: number
  verdict: 'STRONG UNDER' | 'LEAN UNDER' | 'NEUTRAL' | 'LEAN OVER' | 'STRONG OVER'
  confidence: number
}

function getVerdict(gap: number): { verdict: GameAnalysis['verdict']; confidence: number } {
  // Gap = Line - Combined Average
  // Positive gap = line is ABOVE average = expect UNDER
  // Negative gap = line is BELOW average = expect OVER
  if (gap >= 15) return { verdict: 'STRONG UNDER', confidence: 5 }
  if (gap >= 8) return { verdict: 'LEAN UNDER', confidence: 4 }
  if (gap >= 3) return { verdict: 'LEAN UNDER', confidence: 3 }
  if (gap <= -15) return { verdict: 'STRONG OVER', confidence: 5 }
  if (gap <= -8) return { verdict: 'LEAN OVER', confidence: 4 }
  if (gap <= -3) return { verdict: 'LEAN OVER', confidence: 3 }
  return { verdict: 'NEUTRAL', confidence: 2 }
}

function VerdictBadge({ verdict, confidence }: { verdict: string; confidence: number }) {
  const isUnder = verdict.includes('UNDER')
  const isOver = verdict.includes('OVER')
  const isStrong = verdict.includes('STRONG')

  let bgColor = 'bg-gray-700'
  if (isUnder) bgColor = isStrong ? 'bg-green-600' : 'bg-green-700/70'
  if (isOver) bgColor = isStrong ? 'bg-red-600' : 'bg-red-700/70'

  return (
    <div className={`${bgColor} px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2`}>
      <span>{verdict}</span>
      <span className="text-xs opacity-75">({confidence}/5)</span>
    </div>
  )
}

function GapIndicator({ gap }: { gap: number }) {
  const isPositive = gap > 0
  const absGap = Math.abs(gap).toFixed(1)
  const color = isPositive ? 'text-red-400' : 'text-green-400'
  const arrow = isPositive ? '↑' : '↓'

  return (
    <div className={`${color} font-mono text-lg font-bold`}>
      {arrow} {absGap}
    </div>
  )
}

function GameCard({ game }: { game: GameAnalysis }) {
  const homeColor = TEAM_COLORS[game.home.abbr] || '#666'
  const awayColor = TEAM_COLORS[game.away.abbr] || '#666'
  const h2hUrl = `/analysis/h2h/${game.away.abbr.toLowerCase()}/${game.home.abbr.toLowerCase()}`

  return (
    <Link
      href={h2hUrl}
      className="block bg-gray-900/80 rounded-2xl border border-gray-800 hover:border-gray-600 transition-all hover:scale-[1.02] overflow-hidden"
    >
      {/* Teams Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Away Team */}
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: awayColor }}
              >
                {game.away.abbr}
              </div>
              <div className="text-gray-400 text-sm">@</div>
              {/* Home Team */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: homeColor }}
              >
                {game.home.abbr}
              </div>
            </div>
          </div>

          <VerdictBadge verdict={game.verdict} confidence={game.confidence} />
        </div>
      </div>

      {/* Stats Body */}
      <div className="p-4 space-y-4">
        {/* Line and Gap */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">Total Line</div>
            <div className="text-2xl font-bold text-white">{game.line}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-xs uppercase tracking-wide">vs Combined Avg</div>
            <GapIndicator gap={game.gap} />
          </div>
        </div>

        {/* Team Averages */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-500 text-xs">{game.away.abbr} Avg</div>
            <div className="text-white font-mono">{game.away.avgPoints.toFixed(1)}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-500 text-xs">{game.home.abbr} Avg</div>
            <div className="text-white font-mono">{game.home.avgPoints.toFixed(1)}</div>
          </div>
        </div>

        {/* Combined */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-800">
          <span className="text-gray-500 text-sm">Combined Season Avg</span>
          <span className="text-white font-mono font-bold">{game.combinedAvg.toFixed(1)}</span>
        </div>

        {/* Odds */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Over: <span className="text-white">{game.overOdds > 0 ? '+' : ''}{game.overOdds}</span>
          </span>
          <span className="text-gray-500">
            Under: <span className="text-white">{game.underOdds > 0 ? '+' : ''}{game.underOdds}</span>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-800/30 text-center">
        <span className="text-gray-400 text-sm">View H2H Analysis →</span>
      </div>
    </Link>
  )
}

export default function AnalysisPage() {
  const [games, setGames] = useState<GameAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableDates, setAvailableDates] = useState<string[]>([])

  // Fetch available dates
  useEffect(() => {
    async function fetchDates() {
      try {
        const res = await fetch('/api/analysis/dates')
        if (!res.ok) throw new Error('Failed to fetch dates')
        const data = await res.json()
        setAvailableDates(data.dates)
        if (data.dates.length > 0) {
          setSelectedDate(data.dates[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dates')
      }
    }
    fetchDates()
  }, [])

  // Fetch games for selected date
  useEffect(() => {
    if (!selectedDate) return

    async function fetchGames() {
      setLoading(true)
      try {
        const res = await fetch(`/api/analysis/games?date=${selectedDate}`)
        if (!res.ok) throw new Error('Failed to fetch games')
        const data = await res.json()
        setGames(data.games)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load games')
      } finally {
        setLoading(false)
      }
    }
    fetchGames()
  }, [selectedDate])

  // Stats summary
  const strongUnders = games.filter(g => g.verdict === 'STRONG UNDER').length
  const strongOvers = games.filter(g => g.verdict === 'STRONG OVER').length
  const avgGap = games.length > 0 ? games.reduce((sum, g) => sum + g.gap, 0) / games.length : 0

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📊 Totals Analysis
          </h1>
          <p className="text-gray-400">
            Betting line analysis for NBA game totals
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex justify-center mb-8">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-500"
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Stats */}
        {games.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-900/30 border border-green-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{strongUnders}</div>
              <div className="text-green-400/70 text-sm">Strong Unders</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{games.length}</div>
              <div className="text-gray-400 text-sm">Games</div>
            </div>
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{strongOvers}</div>
              <div className="text-red-400/70 text-sm">Strong Overs</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading games...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && games.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <GameCard key={game.gameId} game={game} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No games with betting lines for this date.</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 p-6 bg-gray-900/50 rounded-xl border border-gray-800">
          <h3 className="text-white font-semibold mb-4">How to Read</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-green-400 font-bold">↓ Negative Gap</div>
              <div className="text-gray-400">Line is higher than team averages suggest → UNDER</div>
            </div>
            <div>
              <div className="text-red-400 font-bold">↑ Positive Gap</div>
              <div className="text-gray-400">Line is lower than team averages suggest → OVER</div>
            </div>
            <div>
              <div className="text-green-500 font-bold">STRONG UNDER</div>
              <div className="text-gray-400">Gap of -15 or more points</div>
            </div>
            <div>
              <div className="text-red-500 font-bold">STRONG OVER</div>
              <div className="text-gray-400">Gap of +15 or more points</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
