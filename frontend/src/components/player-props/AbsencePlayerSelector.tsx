'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StarterOption {
  player_id: number
  player_name: string
  team_id: number
  team_abbreviation: string
  games_played: number
  games_missed: number
}

interface AbsencePlayerSelectorProps {
  starters: StarterOption[]
  currentPlayerId?: number
}

export function AbsencePlayerSelector({ starters, currentPlayerId }: AbsencePlayerSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Group starters by team
  const teams = Array.from(new Set(starters.map(s => s.team_abbreviation))).sort()

  // Find the current player's team to initialize correctly
  const currentPlayer = currentPlayerId
    ? starters.find(s => s.player_id === currentPlayerId)
    : starters[0]

  // Get current selections from URL or defaults
  const [selectedTeam, setSelectedTeam] = useState<string>(
    searchParams.get('team') || currentPlayer?.team_abbreviation || starters[0]?.team_abbreviation || ''
  )

  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(
    parseInt(searchParams.get('player') || '0') || currentPlayerId || starters[0]?.player_id || 0
  )

  // Filter starters by selected team
  const teamStarters = starters.filter(s => s.team_abbreviation === selectedTeam)

  // Update URL when selections change
  useEffect(() => {
    if (selectedPlayerId && selectedTeam) {
      const params = new URLSearchParams()
      params.set('team', selectedTeam)
      params.set('player', selectedPlayerId.toString())
      // Use full page navigation to force Server Component re-render
      // This ensures the DOM updates with fresh data
      window.location.href = `?${params.toString()}`
    }
  }, [selectedPlayerId, selectedTeam])

  const handleTeamChange = (team: string) => {
    setSelectedTeam(team)
    // Set first player of new team as selected
    const firstPlayerInTeam = starters.find(s => s.team_abbreviation === team)
    if (firstPlayerInTeam) {
      setSelectedPlayerId(firstPlayerInTeam.player_id)
    }
  }

  const handlePlayerChange = (playerId: number) => {
    setSelectedPlayerId(playerId)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
      <h2 className="text-lg font-bold text-white mb-4">Select Team & Player</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Team</label>
          <select
            value={selectedTeam}
            onChange={(e) => handleTeamChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {teams.map(team => {
              const teamCount = starters.filter(s => s.team_abbreviation === team).length
              return (
                <option key={team} value={team}>
                  {team} ({teamCount} player{teamCount !== 1 ? 's' : ''})
                </option>
              )
            })}
          </select>
        </div>

        {/* Player Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Player</label>
          <select
            value={selectedPlayerId}
            onChange={(e) => handlePlayerChange(parseInt(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {teamStarters.map(starter => (
              <option key={starter.player_id} value={starter.player_id}>
                {starter.player_name} ({starter.games_missed} missed • {starter.games_played} played)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">Teams Available</p>
            <p className="text-2xl font-bold text-white">{teams.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Players Available</p>
            <p className="text-2xl font-bold text-white">{starters.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Team Players</p>
            <p className="text-2xl font-bold text-white">{teamStarters.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
