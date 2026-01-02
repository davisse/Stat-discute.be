'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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

export function PlayerSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlayerResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search API call with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.players || [])
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [query])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          navigateToPlayer(results[selectedIndex])
        }
        break
    }
  }, [isOpen, results, selectedIndex])

  const navigateToPlayer = (player: PlayerResult) => {
    setIsOpen(false)
    setQuery('')
    router.push(`/players/${player.player_id}`)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Hero Search Field */}
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search players..."
            className="w-full bg-transparent border-b-2 border-zinc-700 focus:border-white py-6 text-4xl md:text-5xl lg:text-6xl font-black text-white placeholder:text-zinc-600 focus:outline-none transition-colors duration-300 uppercase tracking-tighter"
          />

          {/* Keyboard hint */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            ) : (
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-700 rounded">
                <span className="text-[10px]">&#8984;</span>K
              </kbd>
            )}
          </div>
        </div>

        {/* Results Dropdown */}
        {isOpen && query.length >= 2 && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />

            {/* Results Panel */}
            <div
              className="absolute top-full left-0 right-0 mt-4 z-40 bg-black border border-zinc-800 rounded-lg overflow-hidden shadow-2xl"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {results.length === 0 && !isLoading && (
                <div className="px-6 py-8 text-center">
                  <p className="text-zinc-500 text-lg">No players found</p>
                  <p className="text-zinc-600 text-sm mt-1">Try a different search term</p>
                </div>
              )}

              {results.length > 0 && (
                <ul className="max-h-[400px] overflow-y-auto">
                  {results.map((player, index) => (
                    <li key={player.player_id}>
                      <button
                        onClick={() => navigateToPlayer(player)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full px-6 py-4 flex items-center justify-between transition-colors duration-150 ${
                          index === selectedIndex
                            ? 'bg-white/10'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {/* Player Info */}
                        <div className="flex items-center gap-4">
                          {/* Jersey Number */}
                          <div className="w-12 h-12 flex items-center justify-center border border-zinc-700 rounded-lg">
                            <span className="text-lg font-mono font-bold text-zinc-400">
                              {player.jersey_number || '#'}
                            </span>
                          </div>

                          {/* Name & Team */}
                          <div className="text-left">
                            <p className="text-xl font-bold text-white uppercase tracking-tight">
                              {player.full_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-mono text-zinc-400">
                                {player.team_abbreviation}
                              </span>
                              {player.position && (
                                <>
                                  <span className="text-zinc-600">|</span>
                                  <span className="text-sm text-zinc-500">
                                    {player.position}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="hidden sm:flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-2xl font-black font-mono text-white">
                              {(player.points_avg ?? 0).toFixed(1)}
                            </p>
                            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                              PPG
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold font-mono text-zinc-400">
                              {(player.rebounds_avg ?? 0).toFixed(1)}
                            </p>
                            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">
                              RPG
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold font-mono text-zinc-400">
                              {(player.assists_avg ?? 0).toFixed(1)}
                            </p>
                            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">
                              APG
                            </p>
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <span className={`ml-4 text-zinc-600 transition-transform duration-150 ${
                          index === selectedIndex ? 'translate-x-1 text-white' : ''
                        }`}>
                          &#8594;
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer hint */}
              <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px]">&#8593;</kbd>
                    <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px]">&#8595;</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px]">&#8629;</kbd>
                    to select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px]">esc</kbd>
                  to close
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
