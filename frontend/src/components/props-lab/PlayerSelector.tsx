'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Types
interface TeamOption {
  team_id: number
  abbreviation: string
  full_name: string
}

interface TeamPlayer {
  player_id: number
  full_name: string
  position: string
  games_played: number
}

interface PlayerResult {
  player_id: number
  full_name: string
  team_abbreviation: string
  position: string | null
  jersey_number: string | null
  points_avg: number
  rebounds_avg: number
  assists_avg: number
  games_played: number
}

export interface SelectedPlayer {
  playerId: number
  fullName: string
  teamAbbreviation: string
  position: string | null
}

interface PlayerSelectorProps {
  teams: TeamOption[]
  onPlayerSelect: (player: SelectedPlayer | null) => void
}

type TabType = 'team' | 'search'

export function PlayerSelector({ teams, onPlayerSelect }: PlayerSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('team')
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayer[]>([])
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlayerResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch team players when team is selected
  useEffect(() => {
    if (!selectedTeamId) {
      setTeamPlayers([])
      return
    }

    const fetchPlayers = async () => {
      setIsLoadingPlayers(true)
      try {
        const res = await fetch(`/api/teams/${selectedTeamId}/players`)
        const data = await res.json()
        setTeamPlayers(data.players || [])
      } catch (error) {
        console.error('Error fetching team players:', error)
        setTeamPlayers([])
      } finally {
        setIsLoadingPlayers(false)
      }
    }

    fetchPlayers()
  }, [selectedTeamId])

  // Search API with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSearchResults(data.players || [])
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Keyboard navigation for search
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % searchResults.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + searchResults.length) % searchResults.length)
        break
      case 'Enter':
        e.preventDefault()
        if (searchResults[selectedIndex]) {
          handleSelectSearchResult(searchResults[selectedIndex])
        }
        break
    }
  }, [searchResults, selectedIndex])

  const handleSelectTeam = (teamId: number) => {
    setSelectedTeamId(teamId)
  }

  const handleSelectTeamPlayer = (player: TeamPlayer) => {
    const team = teams.find(t => t.team_id === selectedTeamId)
    onPlayerSelect({
      playerId: player.player_id,
      fullName: player.full_name,
      teamAbbreviation: team?.abbreviation || '',
      position: player.position
    })
  }

  const handleSelectSearchResult = (player: PlayerResult) => {
    onPlayerSelect({
      playerId: player.player_id,
      fullName: player.full_name,
      teamAbbreviation: player.team_abbreviation,
      position: player.position
    })
    setSearchQuery('')
    setSearchResults([])
  }

  const handleBackToTeams = () => {
    setSelectedTeamId(null)
    setTeamPlayers([])
  }

  const selectedTeam = teams.find(t => t.team_id === selectedTeamId)

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-4">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'team'
              ? 'text-white border-b-2 border-white -mb-px'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Par Équipe
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'search'
              ? 'text-white border-b-2 border-white -mb-px'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Recherche
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Team Tab */}
        {activeTab === 'team' && (
          <div>
            {!selectedTeamId ? (
              // Team Grid
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
                {teams.map(team => (
                  <button
                    key={team.team_id}
                    onClick={() => handleSelectTeam(team.team_id)}
                    className="aspect-square flex items-center justify-center bg-zinc-900/50 border border-zinc-800 rounded-lg text-xs sm:text-sm font-bold text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/50 transition-all"
                  >
                    {team.abbreviation}
                  </button>
                ))}
              </div>
            ) : (
              // Team Roster
              <div>
                {/* Back button + Team header */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={handleBackToTeams}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    aria-label="Retour aux équipes"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <span className="text-lg font-bold text-white">{selectedTeam?.full_name}</span>
                    <span className="ml-2 text-sm text-zinc-500">({selectedTeam?.abbreviation})</span>
                  </div>
                </div>

                {/* Players List */}
                {isLoadingPlayers ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                  </div>
                ) : teamPlayers.length === 0 ? (
                  <p className="text-center text-zinc-500 py-8">Aucun joueur trouvé</p>
                ) : (
                  <div className="space-y-1">
                    {teamPlayers.map(player => (
                      <button
                        key={player.player_id}
                        onClick={() => handleSelectTeamPlayer(player)}
                        className="w-full flex items-center justify-between p-3 bg-zinc-900/30 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700 rounded-lg transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white group-hover:text-white">
                            {player.full_name}
                          </span>
                          {player.position && (
                            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                              {player.position}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-600">
                            {player.games_played} matchs
                          </span>
                          <span className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                            &rarr;
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            {/* Search Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher un joueur..."
                className="w-full bg-transparent border-b-2 border-zinc-700 focus:border-white py-4 text-xl sm:text-2xl font-bold text-white placeholder:text-zinc-600 focus:outline-none transition-colors uppercase tracking-tight"
              />
              {isSearching && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && (
              <div className="mt-4">
                {searchResults.length === 0 && !isSearching ? (
                  <p className="text-center text-zinc-500 py-8">Aucun joueur trouvé</p>
                ) : (
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {searchResults.map((player, index) => (
                      <button
                        key={player.player_id}
                        onClick={() => handleSelectSearchResult(player)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          index === selectedIndex
                            ? 'bg-white/10 border border-zinc-700'
                            : 'bg-zinc-900/30 border border-transparent hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Jersey Number */}
                          <div className="w-10 h-10 flex items-center justify-center border border-zinc-700 rounded-lg">
                            <span className="text-sm font-mono font-bold text-zinc-400">
                              {player.jersey_number || '#'}
                            </span>
                          </div>
                          {/* Name & Team */}
                          <div className="text-left">
                            <p className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                              {player.full_name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-zinc-400">
                                {player.team_abbreviation}
                              </span>
                              {player.position && (
                                <>
                                  <span className="text-zinc-600">|</span>
                                  <span className="text-xs text-zinc-500">{player.position}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats - Hidden on mobile */}
                        <div className="hidden sm:flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-black font-mono text-white">
                              {parseFloat(String(player.points_avg ?? 0)).toFixed(1)}
                            </p>
                            <p className="text-[9px] text-zinc-500 uppercase">PPG</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold font-mono text-zinc-400">
                              {parseFloat(String(player.rebounds_avg ?? 0)).toFixed(1)}
                            </p>
                            <p className="text-[9px] text-zinc-600 uppercase">RPG</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold font-mono text-zinc-400">
                              {parseFloat(String(player.assists_avg ?? 0)).toFixed(1)}
                            </p>
                            <p className="text-[9px] text-zinc-600 uppercase">APG</p>
                          </div>
                        </div>

                        <span className={`ml-2 text-zinc-600 transition-transform ${
                          index === selectedIndex ? 'translate-x-1 text-white' : ''
                        }`}>
                          &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hint when empty */}
            {searchQuery.length < 2 && (
              <p className="text-sm text-zinc-600 mt-4">
                Tapez au moins 2 caractères pour rechercher
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
