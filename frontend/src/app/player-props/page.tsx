'use client'

import { AppLayout } from '@/components/layout'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Player {
  player_id: string
  first_name: string
  last_name: string
  full_name: string
  team_abbr: string
  team_name: string
  games_played: number
  avg_points: number | null
  avg_rebounds: number | null
  avg_assists: number | null
}

export default function PlayerPropsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()

  useEffect(() => {
    // Fade in on mount
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle click outside to clear search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if click is outside the search container
      if (!target.closest('.search-container')) {
        setSearchQuery('')
        setShowResults(false)
        setSearchResults([])
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchPlayers(searchQuery)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchPlayers = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data.players || [])
      setShowResults(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const selectPlayer = (player: Player) => {
    // Navigate to player props detail page
    router.push(`/player-props/${player.player_id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        selectPlayer(searchResults[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowResults(false)
      setSelectedIndex(-1)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      selectPlayer(searchResults[selectedIndex >= 0 ? selectedIndex : 0])
    }
  }

  return (
    <AppLayout>
      <div
        className="min-h-[calc(100vh-11rem)] flex flex-col items-center justify-center px-8"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out'
        }}
      >
        {/* Search Form with Results */}
        <div
          className="w-full max-w-md relative search-container"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1.5s ease-out 0.5s'
          }}
        >
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                placeholder="Tapez le nom d'un joueur..."
                className="w-full px-8 py-4 text-lg bg-transparent border border-gray-800 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors duration-500"
                style={{
                  borderRadius: '50px',
                  letterSpacing: '0.02em'
                }}
                autoFocus
              />

              {/* Loading indicator */}
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div
                className="absolute w-full mt-2 border border-gray-800 bg-black max-h-96 overflow-y-auto"
                style={{
                  boxShadow: '0 4px 20px rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px'
                }}
              >
                {searchResults.map((player, index) => (
                  <button
                    key={player.player_id}
                    type="button"
                    onClick={() => selectPlayer(player)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-6 py-4 text-left transition-colors duration-200 ${
                      selectedIndex === index
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-gray-900'
                    }`}
                    style={{
                      borderTopLeftRadius: index === 0 ? '20px' : '0',
                      borderTopRightRadius: index === 0 ? '20px' : '0',
                      borderBottomLeftRadius: index === searchResults.length - 1 ? '20px' : '0',
                      borderBottomRightRadius: index === searchResults.length - 1 ? '20px' : '0'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{player.full_name}</div>
                        <div className={`text-sm ${
                          selectedIndex === index ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                          {player.team_abbr} • {player.games_played} matchs
                        </div>
                      </div>
                      {player.avg_points && (
                        <div className={`text-sm ${
                          selectedIndex === index ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                          {player.avg_points} pts • {player.avg_rebounds} reb • {player.avg_assists} ast
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showResults && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
              <div
                className="absolute w-full mt-2 px-6 py-4 border border-gray-800 bg-black text-gray-500"
                style={{ borderRadius: '20px' }}
              >
                Aucun joueur trouvé
              </div>
            )}
          </form>
        </div>
      </div>
    </AppLayout>
  )
}