'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'

// Team colors
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

interface TeamData {
  abbr: string
  name: string
  color: string
  avgPoints: number
  impliedTotal: number
  gap: number
  recentGames: { game: string; points: number }[]
}

interface GameAnalysisData {
  gameId: string
  gameDate: string
  away: TeamData
  home: TeamData
  line: number
  overOdds: number
  underOdds: number
  avgLine: number
  lineRank: number
  totalGames: number
  combinedAvg: number
  gap: number
  verdict: string
  confidence: number
  highTotalsHistory: {
    date: string
    game: string
    line: number
    actual: number
    result: string
    margin: number
  }[]
  lineDistribution: { range: string; count: number; isHighlighted: boolean }[]
}

function getVerdict(gap: number): { verdict: string; confidence: number } {
  if (gap <= -15) return { verdict: 'STRONG UNDER', confidence: 5 }
  if (gap <= -8) return { verdict: 'LEAN UNDER', confidence: 4 }
  if (gap <= -3) return { verdict: 'LEAN UNDER', confidence: 3 }
  if (gap >= 15) return { verdict: 'STRONG OVER', confidence: 5 }
  if (gap >= 8) return { verdict: 'LEAN OVER', confidence: 4 }
  if (gap >= 3) return { verdict: 'LEAN OVER', confidence: 3 }
  return { verdict: 'NEUTRAL', confidence: 2 }
}

// Hero Section
function HeroSection({ data }: { data: GameAnalysisData }) {
  const verdictColor = data.verdict.includes('UNDER') ? 'bg-green-600' : data.verdict.includes('OVER') ? 'bg-red-600' : 'bg-gray-600'
  const verdictType = data.verdict.includes('UNDER') ? 'UNDER' : data.verdict.includes('OVER') ? 'OVER' : 'NEUTRAL'

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-4">Bet Analysis</p>

        {/* Teams */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: data.away.color }}
            >
              {data.away.abbr}
            </div>
            <p className="text-gray-400 text-sm">{data.away.name.split(' ').pop()}</p>
          </div>
          <div className="text-gray-500 text-2xl">@</div>
          <div className="flex items-center gap-2">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: data.home.color }}
            >
              {data.home.abbr}
            </div>
            <p className="text-gray-400 text-sm">{data.home.name.split(' ').pop()}</p>
          </div>
        </div>

        {/* Line */}
        <div className={`inline-flex items-center gap-2 ${verdictColor} px-6 py-3 rounded-xl mb-4`}>
          <span className="text-white font-bold">{verdictType}</span>
          <span className="text-white text-2xl font-bold">{data.line}</span>
          <span className="text-white/70">({data.overOdds > 0 ? '+' : ''}{data.underOdds})</span>
        </div>

        {/* Date */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
          <span>{new Date(data.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Verdict */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">VERDICT:</span>
            <span className={`font-bold ${data.verdict.includes('UNDER') ? 'text-green-400' : data.verdict.includes('OVER') ? 'text-red-400' : 'text-gray-400'}`}>
              {data.verdict}
            </span>
          </div>
          <p className="text-gray-400">Confidence: {data.confidence}/5</p>
        </div>
      </div>
    </div>
  )
}

// Line Context Section
function LineContextSection({ data }: { data: GameAnalysisData }) {
  const gapFromAvg = (data.line - data.avgLine).toFixed(1)
  const isAboveAvg = data.line > data.avgLine

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
        <span>📊</span> Where Does This Line Rank?
      </h2>
      <p className="text-gray-400 text-sm mb-4">Historical Total Lines Distribution ({data.totalGames} games tracked)</p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Average Line</p>
          <p className="text-white text-2xl font-bold">{data.avgLine.toFixed(1)}</p>
        </div>
        <div className={`${isAboveAvg ? 'bg-amber-900/30' : 'bg-green-900/30'} rounded-xl p-4`}>
          <p className="text-gray-400 text-sm">This Line vs Avg</p>
          <p className={`text-2xl font-bold ${isAboveAvg ? 'text-amber-400' : 'text-green-400'}`}>
            {isAboveAvg ? '+' : ''}{gapFromAvg}
          </p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.lineDistribution} layout="vertical" margin={{ left: 60, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <YAxis type="category" dataKey="range" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.lineDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isHighlighted ? '#F59E0B' : '#6B7280'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight */}
      <div className="mt-4 p-4 bg-blue-900/20 rounded-xl border border-blue-800/50 flex items-start gap-3">
        <span className="text-blue-400">💡</span>
        <p className="text-gray-300 text-sm">
          <strong>{data.line} ranks #{data.lineRank} in our database.</strong>{' '}
          {data.line >= 235
            ? 'High totals like this tend to go UNDER more often than expected.'
            : data.line <= 225
              ? 'Low totals like this can be vulnerable to OVER hits.'
              : 'This is a moderate line near the historical average.'
          }
        </p>
      </div>
    </div>
  )
}

// High Totals History Section
function HighTotalsHistorySection({ data }: { data: GameAnalysisData }) {
  if (data.highTotalsHistory.length === 0) {
    return null
  }

  const underCount = data.highTotalsHistory.filter(g => g.result === 'UNDER').length
  const underPct = Math.round((underCount / data.highTotalsHistory.length) * 100)
  const avgMargin = data.highTotalsHistory
    .filter(g => g.result === 'UNDER')
    .reduce((sum, g) => sum + g.margin, 0) / (underCount || 1)

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
        <span>🔥</span> What Happens When Lines Are 235+?
      </h2>
      <p className="text-gray-400 text-sm mb-4">Historical performance of high-total games</p>

      {/* Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 py-2 px-2">Date</th>
              <th className="text-left text-gray-400 py-2 px-2">Game</th>
              <th className="text-right text-gray-400 py-2 px-2">Line</th>
              <th className="text-right text-gray-400 py-2 px-2">Actual</th>
              <th className="text-center text-gray-400 py-2 px-2">Result</th>
              <th className="text-right text-gray-400 py-2 px-2">Margin</th>
            </tr>
          </thead>
          <tbody>
            {data.highTotalsHistory.map((game, idx) => (
              <tr key={idx} className="border-b border-gray-800">
                <td className="py-2 px-2 text-gray-300">{game.date}</td>
                <td className="py-2 px-2 text-white font-mono">{game.game}</td>
                <td className="py-2 px-2 text-right text-gray-300">{game.line}</td>
                <td className="py-2 px-2 text-right text-white">{game.actual}</td>
                <td className="py-2 px-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${game.result === 'UNDER' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {game.result}
                  </span>
                </td>
                <td className={`py-2 px-2 text-right font-mono ${game.margin < 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {game.margin > 0 ? '+' : ''}{game.margin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-900/20 rounded-xl p-4 text-center border border-green-800/50">
          <p className="text-gray-400 text-sm">High Lines (235+) UNDER</p>
          <p className="text-green-400 text-2xl font-bold">{underCount}/{data.highTotalsHistory.length} ({underPct}%)</p>
        </div>
        <div className="bg-green-900/20 rounded-xl p-4 text-center border border-green-800/50">
          <p className="text-gray-400 text-sm">Avg Margin When UNDER</p>
          <p className="text-green-400 text-2xl font-bold">{avgMargin.toFixed(0)} pts</p>
        </div>
      </div>
    </div>
  )
}

// Team Performance Section
function TeamPerformanceSection({ data }: { data: GameAnalysisData }) {
  const awayImplied = data.line / 2
  const homeImplied = data.line / 2

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
        <span>📈</span> Team Scoring vs Implied Totals
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        The line implies: {data.away.abbr} scores ~{awayImplied.toFixed(1)} | {data.home.abbr} scores ~{homeImplied.toFixed(1)}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Away Team */}
        <TeamChart team={data.away} implied={awayImplied} location="Away" />
        {/* Home Team */}
        <TeamChart team={data.home} implied={homeImplied} location="Home" />
      </div>

      {/* Combined Gap */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-xl text-center">
        <p className="text-gray-400 text-sm">Combined Gap vs Implied Team Totals</p>
        <p className={`text-3xl font-bold ${data.gap < 0 ? 'text-green-400' : 'text-red-400'}`}>
          {data.gap > 0 ? '+' : ''}{data.gap.toFixed(1)} pts
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {data.gap < 0 ? 'Both teams scoring below implied' : 'Both teams scoring above implied'}
        </p>
      </div>
    </div>
  )
}

function TeamChart({ team, implied, location }: { team: TeamData; implied: number; location: string }) {
  const chartData = team.recentGames.map((g, idx) => ({
    name: `G${idx + 1}`,
    points: g.points,
  }))

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: team.color }}
        >
          {team.abbr}
        </div>
        <div>
          <p className="text-white font-medium">{team.name}</p>
          <p className="text-gray-400 text-sm">{location} Team</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <p className="text-gray-500 text-xs">Season Avg</p>
          <p className="text-white font-mono">{team.avgPoints.toFixed(1)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <p className="text-gray-500 text-xs">Implied</p>
          <p className="text-amber-400 font-mono">{implied.toFixed(1)}</p>
        </div>
        <div className={`rounded-lg p-2 text-center ${team.gap < 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
          <p className="text-gray-500 text-xs">Gap</p>
          <p className={`font-mono ${team.gap < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {team.gap > 0 ? '+' : ''}{team.gap.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis domain={[90, 140]} stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <ReferenceLine y={implied} stroke="#F59E0B" strokeDasharray="5 5" />
              <Bar dataKey="points" fill={team.color} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.points > implied ? '#EF4444' : '#22C55E'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="text-gray-500 text-xs text-center mt-1">Yellow line = Implied total ({implied.toFixed(1)})</p>
    </div>
  )
}

// Combined Analysis Section
function CombinedAnalysisSection({ data }: { data: GameAnalysisData }) {
  const minGauge = 210
  const maxGauge = 260
  const range = maxGauge - minGauge

  const avgLinePos = ((data.avgLine - minGauge) / range) * 100
  const combinedAvgPos = ((data.combinedAvg - minGauge) / range) * 100
  const linePos = ((data.line - minGauge) / range) * 100

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
        <span>⚖️</span> Line vs Reality
      </h2>
      <p className="text-gray-400 text-sm mb-6">Comparing the betting line to actual combined performance</p>

      {/* Visual Gauge */}
      <div className="relative mb-6">
        <div className="h-8 bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 rounded-full relative overflow-hidden">
          {/* Markers */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white"
            style={{ left: `${avgLinePos}%` }}
            title={`Avg: ${data.avgLine.toFixed(1)}`}
          />
          <div
            className="absolute top-0 bottom-0 w-1 bg-blue-400"
            style={{ left: `${combinedAvgPos}%` }}
            title={`Combined Avg: ${data.combinedAvg.toFixed(1)}`}
          />
          <div
            className="absolute top-0 bottom-0 w-2 bg-black border-2 border-white rounded"
            style={{ left: `${linePos}%`, transform: 'translateX(-50%)' }}
            title={`Line: ${data.line}`}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{minGauge}</span>
          <span>230</span>
          <span>240</span>
          <span>{maxGauge}</span>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-white rounded" /> Avg: {data.avgLine.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-400 rounded" /> Combined: {data.combinedAvg.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-black border border-white rounded" /> Line: {data.line}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">Tonight's Line</p>
          <p className="text-white text-2xl font-bold">{data.line}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">Combined Season Avg</p>
          <p className="text-white text-2xl font-bold">{data.combinedAvg.toFixed(1)}</p>
        </div>
        <div className={`rounded-xl p-4 text-center ${data.gap < 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
          <p className="text-gray-400 text-sm">Value Gap</p>
          <p className={`text-2xl font-bold ${data.gap < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.gap > 0 ? '+' : ''}{data.gap.toFixed(1)} pts
          </p>
        </div>
      </div>

      <p className="text-gray-300 text-sm mt-4">
        The line is set <strong>{Math.abs(data.gap).toFixed(1)} points {data.gap > 0 ? 'HIGHER' : 'LOWER'}</strong> than
        combined season averages would suggest.
        {Math.abs(data.gap) > 10 && ' This represents significant value.'}
      </p>
    </div>
  )
}

// Key Factors Section
function KeyFactorsSection({ data }: { data: GameAnalysisData }) {
  const isUnder = data.verdict.includes('UNDER')

  const bullishFactors = isUnder ? [
    data.line > data.avgLine + 5 && `Line is ${(data.line - data.avgLine).toFixed(1)} pts above historical average`,
    data.away.gap < -5 && `${data.away.abbr} scoring ${Math.abs(data.away.gap).toFixed(1)} pts below implied`,
    data.home.gap < -5 && `${data.home.abbr} scoring ${Math.abs(data.home.gap).toFixed(1)} pts below implied`,
    Math.abs(data.gap) > 10 && `Combined ${Math.abs(data.gap).toFixed(1)} point gap from line`,
  ].filter(Boolean) : [
    data.line < data.avgLine - 5 && `Line is ${(data.avgLine - data.line).toFixed(1)} pts below historical average`,
    data.away.gap > 5 && `${data.away.abbr} scoring ${data.away.gap.toFixed(1)} pts above implied`,
    data.home.gap > 5 && `${data.home.abbr} scoring ${data.home.gap.toFixed(1)} pts above implied`,
    Math.abs(data.gap) > 10 && `Combined ${Math.abs(data.gap).toFixed(1)} point gap from line`,
  ].filter(Boolean)

  const riskFactors = [
    'Sample size may be limited',
    'Pace variance could affect outcome',
    'Injury reports not factored',
  ]

  return (
    <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
        <span>🎯</span> The Case For {isUnder ? 'UNDER' : 'OVER'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bullish Factors */}
        <div>
          <h3 className="text-green-400 font-semibold mb-3">Bullish Factors</h3>
          <div className="space-y-2">
            {bullishFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">{factor}</span>
              </div>
            ))}
            {bullishFactors.length === 0 && (
              <p className="text-gray-500 text-sm">No strong bullish factors identified</p>
            )}
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h3 className="text-amber-400 font-semibold mb-3">Risk Factors</h3>
          <div className="space-y-2">
            {riskFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-amber-400">⚠️</span>
                <span className="text-gray-300">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Verdict Section
function VerdictSection({ data }: { data: GameAnalysisData }) {
  const isUnder = data.verdict.includes('UNDER')
  const isStrong = data.verdict.includes('STRONG')

  return (
    <div className={`rounded-2xl p-6 border ${isUnder ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
      <h2 className="text-white text-xl font-semibold text-center mb-4">Final Verdict</h2>

      <div className="text-center">
        <span className="text-4xl mb-2 block">{isUnder ? '🔥' : '🚀'}</span>
        <h3 className={`text-2xl font-bold mb-4 ${isUnder ? 'text-green-400' : 'text-red-400'}`}>
          {isStrong ? 'STRONG' : 'LEAN'} {isUnder ? 'UNDER' : 'OVER'} {data.line}
        </h3>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`text-2xl ${star <= data.confidence ? 'text-amber-400' : 'text-gray-600'}`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-gray-400 mb-4">Confidence: {data.confidence}/5 Stars</p>

        {/* Summary */}
        <div className="text-gray-300 text-sm space-y-2 max-w-md mx-auto">
          <p>
            The line is set <strong>{Math.abs(data.gap).toFixed(1)} points</strong>{' '}
            {data.gap > 0 ? 'above' : 'below'} what combined team averages suggest.
          </p>
          {Math.abs(data.gap) > 10 && (
            <p>This represents <strong>significant value</strong> on the {isUnder ? 'UNDER' : 'OVER'}.</p>
          )}
        </div>

        {/* Projected */}
        <div className="mt-6 p-4 bg-gray-900/50 rounded-xl inline-block">
          <p className="text-gray-400 text-sm">Projected Final Score</p>
          <p className="text-white text-2xl font-bold">~{Math.round(data.combinedAvg / 2)}-{Math.round(data.combinedAvg / 2)} ({Math.round(data.combinedAvg)} total)</p>
          <p className="text-gray-400 text-sm">
            That's <strong>{Math.abs(data.line - data.combinedAvg).toFixed(1)} points {data.gap > 0 ? 'UNDER' : 'OVER'}</strong> the line
          </p>
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function GameAnalysisPage() {
  const params = useParams()
  const gameId = params.gameId as string
  const [data, setData] = useState<GameAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch(`/api/analysis/game/${gameId}`)
        if (!res.ok) throw new Error('Failed to fetch analysis')
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalysis()
  }, [gameId])

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analysis...</p>
        </div>
      </AppLayout>
    )
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-400">{error || 'Analysis not found'}</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <HeroSection data={data} />
        <LineContextSection data={data} />
        {data.highTotalsHistory.length > 0 && <HighTotalsHistorySection data={data} />}
        <TeamPerformanceSection data={data} />
        <CombinedAnalysisSection data={data} />
        <KeyFactorsSection data={data} />
        <VerdictSection data={data} />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Analysis generated on {new Date().toLocaleDateString()}</p>
          <p>Data from Pinnacle Sports • Historical data from {data.totalGames} tracked games</p>
        </div>
      </div>
    </AppLayout>
  )
}
