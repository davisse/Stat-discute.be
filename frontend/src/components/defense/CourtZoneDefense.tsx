'use client'

import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

interface ZoneData {
  fgm: number
  fga: number
  fg_pct: number
  points: number
  ppp: number
  leagueAvg: number
  defenseRating: number
}

interface ZoneStats {
  restrictedArea: ZoneData
  paint: ZoneData
  midRange: ZoneData
  leftCorner3: ZoneData
  rightCorner3: ZoneData
  aboveBreak3: ZoneData
}

interface TeamInfo {
  team_id: string
  abbreviation: string
  full_name: string
}

interface DefenseZoneData {
  team: TeamInfo
  zoneStats: ZoneStats
  gamesAnalyzed: number
  overall: {
    fg_pct: number
    three_point_pct: number
    two_point_pct: number
    total_fgm: number
    total_fga: number
    total_points: number
  }
  season: string
  filters: {
    games: string
    location: string
  }
  note?: string
}

interface CourtZoneDefenseProps {
  initialTeamId?: string
  availableTeams?: TeamInfo[]
}

type ZoneName = 'restrictedArea' | 'paint' | 'midRange' | 'leftCorner3' | 'rightCorner3' | 'aboveBreak3'

const zoneLabels: Record<ZoneName, string> = {
  restrictedArea: 'Restricted Area',
  paint: 'Paint (Non-RA)',
  midRange: 'Mid-Range',
  leftCorner3: 'Left Corner 3',
  rightCorner3: 'Right Corner 3',
  aboveBreak3: 'Above Break 3'
}

function getZoneColor(fg_pct: number): string {
  if (fg_pct < 35) return '#10B981'  // Excellent - dark green
  if (fg_pct < 40) return '#34D399'  // Good - light green
  if (fg_pct < 45) return '#6B7280'  // Average - gray
  if (fg_pct < 50) return '#F87171'  // Poor - light red
  return '#EF4444'                    // Very poor - dark red
}

export function CourtZoneDefense({
  initialTeamId = '1610612758', // Default to Sacramento Kings
  availableTeams = []
}: CourtZoneDefenseProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeamId)
  const [gameFilter, setGameFilter] = useState<string>('10')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [data, setData] = useState<DefenseZoneData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedZone, setSelectedZone] = useState<ZoneName | null>(null)
  const [hoveredZone, setHoveredZone] = useState<ZoneName | null>(null)

  // Fetch defense zone data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const url = `/api/teams/${selectedTeamId}/defense-zones?games=${gameFilter}&location=${locationFilter}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching defense zones:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedTeamId, gameFilter, locationFilter])

  const handleZoneClick = (zone: ZoneName) => {
    setSelectedZone(selectedZone === zone ? null : zone)
  }

  const getZoneOpacity = (zone: ZoneName) => {
    if (!selectedZone) return 1
    return selectedZone === zone ? 1 : 0.5
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" />
            Defensive Zone Analysis
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-gray-400">Loading defense data...</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-white" />
            Defensive Zone Analysis
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-red-400">{error || 'No data available'}</div>
        </div>
      </div>
    )
  }

  const { team, zoneStats, gamesAnalyzed, overall } = data
  const currentZone = selectedZone || hoveredZone
  const currentZoneData = currentZone ? zoneStats[currentZone] : null

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-white" />
          Defensive Zone Analysis - {team.abbreviation}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Track opponent shooting effectiveness by court zone
        </p>
        {data.note && (
          <p className="text-xs text-yellow-600 mt-1">
            ⚠️ {data.note}
          </p>
        )}
      </div>

      <div className="p-4 md:p-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs text-gray-400 uppercase mb-2 font-medium">
              Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-gray-800
                       rounded-md text-white text-base font-medium
                       transition-all duration-300
                       focus:border-white focus:ring-1 focus:ring-white focus:outline-none
                       hover:bg-gray-950 cursor-pointer"
            >
              <option value={team.team_id}>{team.full_name}</option>
              {availableTeams.map(t => (
                <option key={t.team_id} value={t.team_id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase mb-2 font-medium">
              Games
            </label>
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-gray-800
                       rounded-md text-white text-base font-medium
                       transition-all duration-300
                       focus:border-white focus:ring-1 focus:ring-white focus:outline-none
                       hover:bg-gray-950 cursor-pointer"
            >
              <option value="10">Last 10 Games</option>
              <option value="20">Last 20 Games</option>
              <option value="all">All Games</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase mb-2 font-medium">
              Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-gray-800
                       rounded-md text-white text-base font-medium
                       transition-all duration-300
                       focus:border-white focus:ring-1 focus:ring-white focus:outline-none
                       hover:bg-gray-950 cursor-pointer"
            >
              <option value="all">All Games</option>
              <option value="home">Home Only</option>
              <option value="away">Away Only</option>
            </select>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Court Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-gray-950 rounded-lg border border-gray-800 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
                Half Court Zones
              </h3>

              {/* SVG Court */}
              <svg
                viewBox="0 0 500 470"
                className="w-full h-auto"
                style={{ maxWidth: '500px', margin: '0 auto', display: 'block' }}
              >
                {/* Court Background */}
                <rect x="0" y="0" width="500" height="470" fill="#000000" />

                {/* Court Outline */}
                <rect x="10" y="10" width="480" height="450" fill="none" stroke="#FFFFFF" strokeWidth="2" />

                {/* 3-Point Arc */}
                <path
                  d="M 30 460 Q 250 220, 470 460"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* Paint */}
                <rect x="170" y="10" width="160" height="190" fill="none" stroke="#FFFFFF" strokeWidth="2" />

                {/* Free Throw Circle */}
                <circle cx="250" cy="200" r="60" fill="none" stroke="#FFFFFF" strokeWidth="2" />

                {/* Basket */}
                <circle cx="250" cy="40" r="7.5" fill="none" stroke="#FFFFFF" strokeWidth="2" />

                {/* Zone: Restricted Area */}
                <rect
                  x="200"
                  y="10"
                  width="100"
                  height="80"
                  fill={getZoneColor(zoneStats.restrictedArea.fg_pct)}
                  opacity={getZoneOpacity('restrictedArea')}
                  stroke={selectedZone === 'restrictedArea' || hoveredZone === 'restrictedArea' ? '#FFFFFF' : 'none'}
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleZoneClick('restrictedArea')}
                  onMouseEnter={() => setHoveredZone('restrictedArea')}
                  onMouseLeave={() => setHoveredZone(null)}
                  style={{ transformOrigin: 'center', transform: hoveredZone === 'restrictedArea' ? 'scale(1.02)' : 'scale(1)' }}
                />

                {/* Zone: Paint (Non-RA) */}
                <path
                  d="M 170 90 L 170 200 L 330 200 L 330 90 L 300 90 L 300 10 L 200 10 L 200 90 Z"
                  fill={getZoneColor(zoneStats.paint.fg_pct)}
                  opacity={getZoneOpacity('paint')}
                  stroke={selectedZone === 'paint' || hoveredZone === 'paint' ? '#FFFFFF' : 'none'}
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleZoneClick('paint')}
                  onMouseEnter={() => setHoveredZone('paint')}
                  onMouseLeave={() => setHoveredZone(null)}
                />

                {/* Zone: Mid-Range */}
                <path
                  d="M 50 200 L 170 200 L 170 10 L 50 10 Z M 330 10 L 330 200 L 450 200 L 450 10 Z M 170 200 Q 250 300, 330 200 L 250 260 Z"
                  fill={getZoneColor(zoneStats.midRange.fg_pct)}
                  opacity={getZoneOpacity('midRange')}
                  stroke={selectedZone === 'midRange' || hoveredZone === 'midRange' ? '#FFFFFF' : 'none'}
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleZoneClick('midRange')}
                  onMouseEnter={() => setHoveredZone('midRange')}
                  onMouseLeave={() => setHoveredZone(null)}
                />

                {/* Zone: Left Corner 3 */}
                <rect
                  x="10"
                  y="200"
                  width="40"
                  height="260"
                  fill={getZoneColor(zoneStats.leftCorner3.fg_pct)}
                  opacity={getZoneOpacity('leftCorner3')}
                  stroke={selectedZone === 'leftCorner3' || hoveredZone === 'leftCorner3' ? '#FFFFFF' : 'none'}
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleZoneClick('leftCorner3')}
                  onMouseEnter={() => setHoveredZone('leftCorner3')}
                  onMouseLeave={() => setHoveredZone(null)}
                />

                {/* Zone: Right Corner 3 */}
                <rect
                  x="450"
                  y="200"
                  width="40"
                  height="260"
                  fill={getZoneColor(zoneStats.rightCorner3.fg_pct)}
                  opacity={getZoneOpacity('rightCorner3')}
                  stroke={selectedZone === 'rightCorner3' || hoveredZone === 'rightCorner3' ? '#FFFFFF' : 'none'}
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleZoneClick('rightCorner3')}
                  onMouseEnter={() => setHoveredZone('rightCorner3')}
                  onMouseLeave={() => setHoveredZone(null)}
                />

                {/* Zone: Above Break 3 */}
                <path
                  d="M 50 200 Q 250 300, 450 200 L 470 220 Q 250 320, 30 220 Z M 30 220 L 30 460 L 470 460 L 470 220"
                  fill={getZoneColor(zoneStats.aboveBreak3.fg_pct)}
                  opacity={getZoneOpacity('aboveBreak3')}
                  stroke={selectedZone === 'aboveBreak3' || hoveredZone === 'aboveBreak3' ? '#FFFFFF' : 'none'}
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleZoneClick('aboveBreak3')}
                  onMouseEnter={() => setHoveredZone('aboveBreak3')}
                  onMouseLeave={() => setHoveredZone(null)}
                />
              </svg>

              {/* Color Legend */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                  Color Legend
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }} />
                    <span className="text-gray-400">&lt;35% Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#34D399' }} />
                    <span className="text-gray-400">35-40% Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6B7280' }} />
                    <span className="text-gray-400">40-45% Avg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F87171' }} />
                    <span className="text-gray-400">45-50% Poor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }} />
                    <span className="text-gray-400">&gt;50% V.Poor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            {/* Selected Zone Stats */}
            {currentZoneData && currentZone ? (
              <div className="bg-gray-950 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                  📍 {zoneLabels[currentZone]}
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-gray-500">Opponent FG%</span>
                      <span className="text-2xl font-bold font-mono text-white">
                        {currentZoneData.fg_pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      League Avg: <span className="font-mono">{currentZoneData.leagueAvg.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-800">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Defense Rating</span>
                      <span
                        className="font-bold font-mono"
                        style={{ color: currentZoneData.defenseRating > 0 ? '#10B981' : '#EF4444' }}
                      >
                        {currentZoneData.defenseRating > 0 ? '+' : ''}
                        {currentZoneData.defenseRating.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-800 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Attempts</span>
                      <span className="font-mono text-white">{currentZoneData.fga}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Makes</span>
                      <span className="font-mono text-white">{currentZoneData.fgm}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Points Allowed</span>
                      <span className="font-mono text-white">{currentZoneData.points}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">PPP</span>
                      <span className="font-mono text-white">{currentZoneData.ppp.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-950 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                  Zone Statistics
                </h3>
                <p className="text-sm text-gray-500">
                  Click a zone on the court to view detailed statistics
                </p>
              </div>
            )}

            {/* Overall Summary */}
            <div className="bg-gray-950 rounded-lg border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                All Zones Summary
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total FGA</span>
                  <span className="font-mono text-white">{overall.total_fga}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total FGM</span>
                  <span className="font-mono text-white">{overall.total_fgm}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Overall FG%</span>
                  <span className="font-mono text-white">{overall.fg_pct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">3P%</span>
                  <span className="font-mono text-white">{overall.three_point_pct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">2P%</span>
                  <span className="font-mono text-white">{overall.two_point_pct.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
                  Based on {gamesAnalyzed} games analyzed
                </div>
              </div>
            </div>

            {/* Zone Breakdown */}
            <div className="bg-gray-950 rounded-lg border border-gray-800 p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Zone Breakdown
              </h3>

              <div className="space-y-2 text-sm">
                {(Object.entries(zoneStats) as [ZoneName, ZoneData][]).map(([zone, data]) => (
                  <div
                    key={zone}
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-900 p-1 rounded transition-colors"
                    onClick={() => handleZoneClick(zone)}
                  >
                    <span className="text-gray-400">{zoneLabels[zone]}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">{data.fg_pct.toFixed(1)}%</span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getZoneColor(data.fg_pct) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
