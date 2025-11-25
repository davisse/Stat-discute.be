'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface Props {
  teams: { team_id: number; abbreviation: string; full_name: string }[]
}

interface TeamStats {
  pace: number
  ortg: number
  drtg: number
  total_avg: number
  total_stddev: number
  over_rate: number
}

const safeNum = (val: number | string | null | undefined): number => {
  if (val === null || val === undefined) return 0
  const num = typeof val === 'string' ? parseFloat(val) : val
  return isNaN(num) ? 0 : num
}

type MatchupType = 'FAST vs FAST' | 'SLOW vs SLOW' | 'MISMATCH' | 'MIXED'

const getMatchupType = (paceA: number, paceB: number): MatchupType => {
  const diff = Math.abs(paceA - paceB)

  if (diff > 4) return 'MISMATCH'
  if (paceA >= 102 && paceB >= 102) return 'FAST vs FAST'
  if (paceA < 99 && paceB < 99) return 'SLOW vs SLOW'
  return 'MIXED'
}

const getMatchupColor = (type: MatchupType): string => {
  switch (type) {
    case 'FAST vs FAST': return 'bg-orange-500/20 text-orange-300 border-orange-500/50'
    case 'SLOW vs SLOW': return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
    case 'MISMATCH': return 'bg-purple-500/20 text-purple-300 border-purple-500/50'
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
  }
}

export default function HeadToHeadAnalyzer({ teams }: Props) {
  const [teamAId, setTeamAId] = useState<number | null>(null)
  const [teamBId, setTeamBId] = useState<number | null>(null)
  const [teamAStats, setTeamAStats] = useState<TeamStats | null>(null)
  const [teamBStats, setTeamBStats] = useState<TeamStats | null>(null)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [bettingLine, setBettingLine] = useState<string>('')

  const fetchTeamStats = async (teamId: number, setStats: (stats: TeamStats) => void, setLoading: (loading: boolean) => void) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teams/${teamId}/stats`)
      if (!res.ok) throw new Error('Failed to fetch team stats')
      const data = await res.json()

      const stats: TeamStats = {
        pace: safeNum(data.pace),
        ortg: safeNum(data.ortg),
        drtg: safeNum(data.drtg),
        total_avg: safeNum(data.avg_total),      // API returns avg_total
        total_stddev: safeNum(data.stddev_total), // API returns stddev_total
        over_rate: 0 // Not available from this endpoint
      }
      setStats(stats)
    } catch (error) {
      console.error('Error fetching team stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamAChange = (teamId: number) => {
    setTeamAId(teamId)
    if (teamId) {
      fetchTeamStats(teamId, setTeamAStats, setLoadingA)
    } else {
      setTeamAStats(null)
    }
  }

  const handleTeamBChange = (teamId: number) => {
    setTeamBId(teamId)
    if (teamId) {
      fetchTeamStats(teamId, setTeamBStats, setLoadingB)
    } else {
      setTeamBStats(null)
    }
  }

  // Convert to Number for comparison since PostgreSQL BIGINT may come as string
  const teamA = teams.find(t => Number(t.team_id) === teamAId)
  const teamB = teams.find(t => Number(t.team_id) === teamBId)

  // Calculate projections
  let combinedPace = 0
  let combinedORTG = 0
  let projectedTotal = 0
  let combinedStdDev = 0
  let matchupType: MatchupType = 'MIXED'
  let confidence68Low = 0
  let confidence68High = 0
  let confidence95Low = 0
  let confidence95High = 0

  if (teamAStats && teamBStats) {
    combinedPace = (teamAStats.pace + teamBStats.pace) / 2
    combinedORTG = (teamAStats.ortg + teamBStats.ortg) / 2
    projectedTotal = (combinedPace * combinedORTG) / 50
    combinedStdDev = Math.sqrt(
      Math.pow(teamAStats.total_stddev, 2) + Math.pow(teamBStats.total_stddev, 2)
    )
    matchupType = getMatchupType(teamAStats.pace, teamBStats.pace)

    confidence68Low = projectedTotal - combinedStdDev
    confidence68High = projectedTotal + combinedStdDev
    confidence95Low = projectedTotal - (2 * combinedStdDev)
    confidence95High = projectedTotal + (2 * combinedStdDev)
  }

  const lineValue = parseFloat(bettingLine)
  const edge = !isNaN(lineValue) && projectedTotal > 0 ? projectedTotal - lineValue : null

  return (
    <div className="space-y-6">
      {/* Team Selection */}
      <Card className="bg-white/5 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Team Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-white/60 mb-2">Team A</label>
              <select
                value={teamAId || ''}
                onChange={(e) => handleTeamAChange(parseInt(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="">Select Team A</option>
                {teams.map((team) => (
                  <option key={team.team_id} value={team.team_id} className="bg-gray-900">
                    {team.full_name} ({team.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-2xl font-bold text-white/40 pt-6">VS</div>

            <div className="flex-1">
              <label className="block text-sm text-white/60 mb-2">Team B</label>
              <select
                value={teamBId || ''}
                onChange={(e) => handleTeamBChange(parseInt(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Select Team B</option>
                {teams.map((team) => (
                  <option key={team.team_id} value={team.team_id} className="bg-gray-900">
                    {team.full_name} ({team.abbreviation})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Comparison */}
      {teamAStats && teamBStats && teamA && teamB && (
        <>
          <Card className="bg-white/5 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Team Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {/* Team A Column */}
                <div className="space-y-4">
                  <div className="text-center pb-3 border-b border-white/10">
                    <div className="text-2xl font-bold text-orange-400">{teamA.abbreviation}</div>
                    <div className="text-sm text-white/60">{teamA.full_name}</div>
                  </div>
                  <StatRow label="Pace" value={teamAStats.pace.toFixed(1)} />
                  <StatRow label="ORTG" value={teamAStats.ortg.toFixed(1)} />
                  <StatRow label="DRTG" value={teamAStats.drtg.toFixed(1)} />
                  <StatRow label="Total Avg" value={teamAStats.total_avg.toFixed(1)} />
                  <StatRow label="Std Dev" value={teamAStats.total_stddev.toFixed(1)} />
                  <StatRow label="Over Rate" value={`${(teamAStats.over_rate * 100).toFixed(0)}%`} />
                </div>

                {/* Stat Labels Column */}
                <div className="space-y-4">
                  <div className="h-[72px] flex items-center justify-center text-white/40 font-semibold">
                    Metric
                  </div>
                  <div className="h-8 flex items-center justify-center text-white/60 text-sm">Pace</div>
                  <div className="h-8 flex items-center justify-center text-white/60 text-sm">ORTG</div>
                  <div className="h-8 flex items-center justify-center text-white/60 text-sm">DRTG</div>
                  <div className="h-8 flex items-center justify-center text-white/60 text-sm">Total Avg</div>
                  <div className="h-8 flex items-center justify-center text-white/60 text-sm">Std Dev</div>
                  <div className="h-8 flex items-center justify-center text-white/60 text-sm">Over Rate</div>
                </div>

                {/* Team B Column */}
                <div className="space-y-4">
                  <div className="text-center pb-3 border-b border-white/10">
                    <div className="text-2xl font-bold text-blue-400">{teamB.abbreviation}</div>
                    <div className="text-sm text-white/60">{teamB.full_name}</div>
                  </div>
                  <StatRow label="Pace" value={teamBStats.pace.toFixed(1)} align="right" />
                  <StatRow label="ORTG" value={teamBStats.ortg.toFixed(1)} align="right" />
                  <StatRow label="DRTG" value={teamBStats.drtg.toFixed(1)} align="right" />
                  <StatRow label="Total Avg" value={teamBStats.total_avg.toFixed(1)} align="right" />
                  <StatRow label="Std Dev" value={teamBStats.total_stddev.toFixed(1)} align="right" />
                  <StatRow label="Over Rate" value={`${(teamBStats.over_rate * 100).toFixed(0)}%`} align="right" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projected Matchup */}
          <Card className="bg-white/5 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                Projected Matchup
                <span className={`text-sm px-3 py-1 rounded-full border ${getMatchupColor(matchupType)}`}>
                  {matchupType}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-white/60 mb-2">Combined Pace</div>
                  <div className="text-3xl font-bold text-white">{combinedPace.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-white/60 mb-2">Combined ORTG</div>
                  <div className="text-3xl font-bold text-white">{combinedORTG.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-white/60 mb-2">Projected Total</div>
                  <div className="text-5xl font-bold text-green-400">{projectedTotal.toFixed(1)}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <div className="text-xs text-white/60 mb-2">Calculation:</div>
                <div className="text-sm text-white/80 font-mono">
                  ({teamAStats.pace.toFixed(1)} + {teamBStats.pace.toFixed(1)}) / 2 × ({teamAStats.ortg.toFixed(1)} + {teamBStats.ortg.toFixed(1)}) / 2 / 50
                  = <span className="text-green-400 font-bold">{projectedTotal.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variance & Confidence */}
          <Card className="bg-white/5 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Variance & Confidence Bands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-sm text-white/60 mb-2">Combined Standard Deviation</div>
                  <div className="text-3xl font-bold text-white">{combinedStdDev.toFixed(2)}</div>
                  <div className="text-xs text-white/40 mt-1">
                    √({teamAStats.total_stddev.toFixed(2)}² + {teamBStats.total_stddev.toFixed(2)}²)
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-400">68% Confidence Interval (±1σ)</span>
                      <span className="text-xs text-green-400/60">~68% of games</span>
                    </div>
                    <div className="text-2xl font-bold text-white text-center">
                      {confidence68Low.toFixed(1)} - {confidence68High.toFixed(1)}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-400">95% Confidence Interval (±2σ)</span>
                      <span className="text-xs text-blue-400/60">~95% of games</span>
                    </div>
                    <div className="text-2xl font-bold text-white text-center">
                      {confidence95Low.toFixed(1)} - {confidence95High.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Visual Bands */}
                <div className="relative h-24 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="absolute h-full bg-blue-500/20 border-x-2 border-blue-500/40"
                    style={{
                      left: '10%',
                      right: '10%'
                    }}
                  />
                  <div
                    className="absolute h-full bg-green-500/20 border-x-2 border-green-500/40"
                    style={{
                      left: '30%',
                      right: '30%'
                    }}
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-1 h-full bg-white" />
                    <div className="text-xs text-white font-bold mt-1 whitespace-nowrap">
                      {projectedTotal.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Betting Analysis */}
          <Card className="bg-white/5 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Betting Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Betting Line (O/U)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={bettingLine}
                    onChange={(e) => setBettingLine(e.target.value)}
                    placeholder="e.g., 223.5"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {edge !== null && !isNaN(lineValue) && (
                  <>
                    <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-white/60 mb-2">Projected Edge</div>
                        <div className={`text-5xl font-bold ${edge > 0 ? 'text-green-400' : edge < 0 ? 'text-red-400' : 'text-white/60'}`}>
                          {edge > 0 ? '+' : ''}{edge.toFixed(1)}
                        </div>
                        <div className="text-sm text-white/60 mt-2">
                          {projectedTotal.toFixed(1)} - {lineValue.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        {edge > 2 ? (
                          <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : edge < -2 ? (
                          <TrendingDown className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {edge > 2 ? 'OVER Lean' : edge < -2 ? 'UNDER Lean' : 'Close to Line'}
                          </div>
                          <div className="text-xs text-white/60 mt-1">
                            {edge > 2 && 'Model projects significantly higher than the line'}
                            {edge < -2 && 'Model projects significantly lower than the line'}
                            {edge >= -2 && edge <= 2 && 'Projection is close to the betting line - proceed with caution'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-white">Confidence Check</div>
                          <div className="text-xs text-white/60 mt-1">
                            Line falls {lineValue < confidence68Low ? 'below' : lineValue > confidence68High ? 'above' : 'within'} the 68% confidence interval
                            ({confidence68Low.toFixed(1)} - {confidence68High.toFixed(1)})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-white">Matchup Context</div>
                          <div className="text-xs text-white/60 mt-1">
                            {matchupType === 'FAST vs FAST' && 'Both teams play fast - expect high possession count and scoring'}
                            {matchupType === 'SLOW vs SLOW' && 'Both teams play slow - expect lower possession count'}
                            {matchupType === 'MISMATCH' && 'Significant pace difference - volatile matchup, use caution'}
                            {matchupType === 'MIXED' && 'Moderate pace difference - standard matchup dynamics'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Loading States */}
      {(loadingA || loadingB) && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <div className="text-white/60 mt-2">Loading team stats...</div>
        </div>
      )}

      {/* Empty State */}
      {!teamAId && !teamBId && !loadingA && !loadingB && (
        <Card className="bg-white/5 backdrop-blur border-white/10">
          <CardContent className="py-12">
            <div className="text-center text-white/40">
              <ArrowRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select two teams to analyze their head-to-head matchup</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatRow({ label, value, align = 'left' }: { label: string; value: string; align?: 'left' | 'right' }) {
  return (
    <div className={`flex ${align === 'right' ? 'flex-row-reverse' : 'flex-row'} items-center justify-between h-8`}>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
  )
}
