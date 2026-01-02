'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronUp, ChevronDown, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface PlayerProp {
  player_id: number
  player_name: string
  position: string
  team_abbr: string
  games_played: number
  ppg: string
  rpg: string
  apg: string
  threes_pg: string
  pra_pg: string
  mpg: string
  game_id: string
  event_id?: string
  opponent_abbr: string
  is_home: boolean
  defense_starter_ppg_allowed: number
  defense_rank: number
  edge_points: number
  edge_verdict: 'STRONG_OVER' | 'LEAN_OVER' | 'NEUTRAL' | 'LEAN_UNDER' | 'STRONG_UNDER'
  // New fields for props filtering
  starter_rate: number
  prop_line: number | null
  prop_type: string | null
  prop_over_odds: number | null
  prop_under_odds: number | null
  all_props: Array<{
    prop_type: string
    line: number
    over_odds: number
    under_odds: number
    bookmaker: string
  }>
}

interface PropsAnalysisTableProps {
  players: PlayerProp[]
  onSelectPlayer: (player: PlayerProp) => void
  selectedPlayerId: number | null
}

type SortField = 'edge' | 'ppg' | 'defense' | 'player' | 'position' | 'line'
type SortDirection = 'asc' | 'desc'

const verdictColors = {
  STRONG_OVER: 'text-green-400 bg-green-400/10',
  LEAN_OVER: 'text-green-300 bg-green-300/5',
  NEUTRAL: 'text-gray-400 bg-gray-400/5',
  LEAN_UNDER: 'text-red-300 bg-red-300/5',
  STRONG_UNDER: 'text-red-400 bg-red-400/10'
}

const verdictLabels = {
  STRONG_OVER: 'STRONG OVER',
  LEAN_OVER: 'LEAN OVER',
  NEUTRAL: 'NEUTRAL',
  LEAN_UNDER: 'LEAN UNDER',
  STRONG_UNDER: 'STRONG UNDER'
}

export function PropsAnalysisTable({ players, onSelectPlayer, selectedPlayerId }: PropsAnalysisTableProps) {
  const [sortField, setSortField] = useState<SortField>('edge')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [positionFilter, setPositionFilter] = useState<string>('ALL')
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL')
  const [propTypeFilter, setPropTypeFilter] = useState<string>('points')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Get all unique prop types from all players
  const propTypes = useMemo(() => {
    const types = new Set<string>()
    players.forEach(p => {
      p.all_props?.forEach((prop: any) => {
        if (prop.prop_type) types.add(prop.prop_type)
      })
    })
    return ['points', 'pra', 'rebounds', 'assists', '3pm', 'steals', 'blocks'].filter(t => types.has(t))
  }, [players])

  // Sync propTypeFilter with available prop types (fix for 0 players bug)
  useEffect(() => {
    if (propTypes.length > 0 && !propTypes.includes(propTypeFilter)) {
      setPropTypeFilter(propTypes[0])
    }
  }, [propTypes, propTypeFilter])

  const sortedPlayers = useMemo(() => {
    // Map players with selected prop type
    let filtered = players.map(p => {
      // Find the prop matching the selected type
      const selectedProp = p.all_props?.find((prop: any) => prop.prop_type === propTypeFilter)
      if (!selectedProp) return null // Filter out players without this prop type

      return {
        ...p,
        prop_line: selectedProp.line,
        prop_type: selectedProp.prop_type,
        prop_over_odds: selectedProp.over_odds,
        prop_under_odds: selectedProp.under_odds
      }
    }).filter(Boolean) as PlayerProp[]

    // Apply position filter
    if (positionFilter !== 'ALL') {
      filtered = filtered.filter(p => p.position === positionFilter)
    }

    // Apply verdict filter
    if (verdictFilter !== 'ALL') {
      if (verdictFilter === 'OVER') {
        filtered = filtered.filter(p => p.edge_verdict.includes('OVER'))
      } else if (verdictFilter === 'UNDER') {
        filtered = filtered.filter(p => p.edge_verdict.includes('UNDER'))
      } else if (verdictFilter === 'STRONG') {
        filtered = filtered.filter(p => p.edge_verdict.includes('STRONG'))
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'edge':
          comparison = Math.abs(b.edge_points) - Math.abs(a.edge_points)
          break
        case 'ppg':
          comparison = parseFloat(b.ppg) - parseFloat(a.ppg)
          break
        case 'defense':
          comparison = b.defense_starter_ppg_allowed - a.defense_starter_ppg_allowed
          break
        case 'player':
          comparison = a.player_name.localeCompare(b.player_name)
          break
        case 'position':
          comparison = a.position.localeCompare(b.position)
          break
        case 'line':
          comparison = (b.prop_line || 0) - (a.prop_line || 0)
          break
      }

      return sortDirection === 'asc' ? -comparison : comparison
    })

    return filtered
  }, [players, sortField, sortDirection, positionFilter, verdictFilter, propTypeFilter])

  const positions = ['ALL', ...Array.from(new Set(players.map(p => p.position)))]

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'desc' ? (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    )
  }

  const EdgeIcon = ({ verdict }: { verdict: string }) => {
    if (verdict.includes('OVER')) return <TrendingUp className="w-4 h-4" />
    if (verdict.includes('UNDER')) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  // Helper to get prop type display name
  const getPropTypeLabel = (type: string) => {
    switch (type) {
      case 'points': return 'PTS'
      case 'pra': return 'PRA'
      case 'rebounds': return 'REB'
      case 'assists': return 'AST'
      case '3pm': return '3PM'
      case 'steals': return 'STL'
      case 'blocks': return 'BLK'
      default: return type.toUpperCase()
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-950 px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span className="hidden sm:inline">Props Edge Analysis</span>
            <span className="sm:hidden">Props</span>
            <span className="text-sm text-gray-500 font-normal">({sortedPlayers.length})</span>
          </h2>
        </div>

        {/* Prop Type Pills - Horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {propTypes.map(type => (
            <button
              key={type}
              onClick={() => setPropTypeFilter(type)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                propTypeFilter === type
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {getPropTypeLabel(type)}
            </button>
          ))}
        </div>

        {/* Position and Verdict Filters - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white
                     focus:border-white focus:outline-none cursor-pointer"
          >
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos === 'ALL' ? 'All Positions' : pos}</option>
            ))}
          </select>

          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white
                     focus:border-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Verdicts</option>
            <option value="OVER">Over Only</option>
            <option value="UNDER">Under Only</option>
            <option value="STRONG">Strong Only</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-800">
        {sortedPlayers.map((player) => (
          <div
            key={player.player_id}
            onClick={() => onSelectPlayer(player)}
            className={`p-4 cursor-pointer active:bg-gray-800/50 transition-colors ${
              selectedPlayerId === player.player_id ? 'bg-gray-800/50' : ''
            }`}
          >
            {/* Top Row: Player Name + Verdict */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium text-white">{player.player_name}</div>
                <div className="text-xs text-gray-500">
                  {player.team_abbr} • {player.position} • {player.is_home ? 'vs' : '@'} {player.opponent_abbr}
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${verdictColors[player.edge_verdict]}`}>
                <EdgeIcon verdict={player.edge_verdict} />
                {player.edge_verdict.includes('STRONG') ? 'STRONG' : player.edge_verdict.includes('OVER') ? 'OVER' : player.edge_verdict.includes('UNDER') ? 'UNDER' : 'NEUTRAL'}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">Avg</div>
                <div className="text-sm font-mono text-white">{player.ppg}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Line</div>
                <div className="text-sm font-mono text-yellow-400 font-semibold">
                  {player.prop_line || '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Allows</div>
                <div className="text-sm font-mono text-white">
                  {player.defense_starter_ppg_allowed.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Edge</div>
                <div className={`text-sm font-mono font-semibold ${
                  player.edge_points > 0 ? 'text-green-400' : player.edge_points < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {player.edge_points > 0 ? '+' : ''}{player.edge_points.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Odds Row */}
            {player.prop_over_odds && player.prop_under_odds && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                O {player.prop_over_odds.toFixed(2)} / U {player.prop_under_odds.toFixed(2)}
              </div>
            )}
          </div>
        ))}

        {sortedPlayers.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500">
            No players match your filters
          </div>
        )}
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
              <th
                className="px-4 py-3 text-left cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('player')}
              >
                Player <SortIcon field="player" />
              </th>
              <th
                className="px-4 py-3 text-center cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('position')}
              >
                Pos <SortIcon field="position" />
              </th>
              <th className="px-4 py-3 text-center">
                Matchup
              </th>
              <th
                className="px-4 py-3 text-center cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('ppg')}
              >
                PPG <SortIcon field="ppg" />
              </th>
              <th
                className="px-4 py-3 text-center cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('line')}
              >
                Line <SortIcon field="line" />
              </th>
              <th className="px-4 py-3 text-center">
                Type
              </th>
              <th
                className="px-4 py-3 text-center cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('defense')}
              >
                Opp Allows <SortIcon field="defense" />
              </th>
              <th
                className="px-4 py-3 text-center cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('edge')}
              >
                Edge <SortIcon field="edge" />
              </th>
              <th className="px-4 py-3 text-center">
                Verdict
              </th>
              <th className="px-4 py-3 text-center">
                Analysis
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <tr
                key={player.player_id}
                className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                  selectedPlayerId === player.player_id ? 'bg-gray-800/50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{player.player_name}</div>
                  <div className="text-xs text-gray-500">{player.team_abbr} • {player.games_played}G</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-gray-400">{player.position}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-white">
                    {player.is_home ? 'vs' : '@'} {player.opponent_abbr}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-mono text-white">{player.ppg}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {player.prop_line ? (
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-mono text-yellow-400 font-semibold">{player.prop_line}</span>
                      {player.prop_over_odds && player.prop_under_odds && (
                        <span className="text-xs text-gray-500">
                          O {player.prop_over_odds.toFixed(2)} / U {player.prop_under_odds.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-600">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {player.prop_type ? (
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300 uppercase">
                      {player.prop_type}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-mono text-white">{player.defense_starter_ppg_allowed.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">Rank #{player.defense_rank}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-mono font-semibold ${
                    player.edge_points > 0 ? 'text-green-400' : player.edge_points < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {player.edge_points > 0 ? '+' : ''}{player.edge_points.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${verdictColors[player.edge_verdict]}`}>
                    <EdgeIcon verdict={player.edge_verdict} />
                    {verdictLabels[player.edge_verdict]}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onSelectPlayer(player)}
                    className="px-3 py-1.5 bg-transparent border border-gray-700 rounded text-xs text-gray-400
                             hover:border-white hover:text-white transition-all"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedPlayers.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500">
            No players match your filters
          </div>
        )}
      </div>
    </div>
  )
}
