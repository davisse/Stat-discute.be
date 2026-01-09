'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type {
  SearchResult,
  SearchResults,
  UseSearchReturn,
  TeamSearchResult,
  SearchAPIResponse
} from '@/types/search'
import { searchPages } from '@/lib/navigation-pages'

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2
const RECENT_SEARCHES_KEY = 'stat-discute-recent-searches'
const MAX_RECENT_SEARCHES = 5

// Teams data will be fetched once and cached
let teamsCache: TeamSearchResult[] | null = null

async function fetchTeams(): Promise<TeamSearchResult[]> {
  if (teamsCache) return teamsCache

  try {
    const res = await fetch('/api/teams/search-data')
    if (!res.ok) throw new Error('Failed to fetch teams')
    const data = await res.json()
    teamsCache = data
    return data
  } catch {
    console.error('Failed to fetch teams for search')
    return []
  }
}

function searchTeams(teams: TeamSearchResult[], query: string): TeamSearchResult[] {
  if (!query || query.length < 1) return []

  const normalizedQuery = query.toLowerCase().trim()

  return teams.filter(team => {
    const searchableText = `${team.title} ${team.abbreviation} ${team.subtitle || ''}`.toLowerCase()
    return searchableText.includes(normalizedQuery)
  })
}

export function useSearch(): UseSearchReturn {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [teams, setTeams] = useState<TeamSearchResult[]>([])
  const [serverResults, setServerResults] = useState<SearchAPIResponse>({ players: [], games: [] })
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load teams on mount
  useEffect(() => {
    fetchTeams().then(setTeams)
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, MAX_RECENT_SEARCHES)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch {
        // Ignore localStorage errors
      }
      return updated
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Client-side search results (instant)
  const clientResults = useMemo((): Pick<SearchResults, 'teams' | 'pages'> => {
    return {
      teams: searchTeams(teams, query),
      pages: searchPages(query)
    }
  }, [teams, query])

  // Combined results
  const results: SearchResults = useMemo(() => ({
    teams: clientResults.teams,
    pages: clientResults.pages,
    players: serverResults.players,
    games: serverResults.games
  }), [clientResults, serverResults])

  // Flat results array for keyboard navigation
  const flatResults: SearchResult[] = useMemo(() => {
    return [
      ...results.teams,
      ...results.players,
      ...results.games,
      ...results.pages
    ]
  }, [results])

  // Server-side search with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Reset server results if query is too short
    if (query.length < MIN_QUERY_LENGTH) {
      setServerResults({ players: [], games: [] })
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error('Search failed')
        const data: SearchAPIResponse = await res.json()
        setServerResults(data)
        setError(null)
      } catch (err) {
        console.error('Search error:', err)
        setError('Erreur de recherche')
        setServerResults({ players: [], games: [] })
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  const selectNext = useCallback(() => {
    setSelectedIndex(prev => (prev + 1) % Math.max(1, flatResults.length))
  }, [flatResults.length])

  const selectPrevious = useCallback(() => {
    setSelectedIndex(prev => (prev - 1 + flatResults.length) % Math.max(1, flatResults.length))
  }, [flatResults.length])

  const handleSelect = useCallback((result?: SearchResult) => {
    const selectedResult = result || flatResults[selectedIndex]
    if (!selectedResult) return

    saveRecentSearch(query)
    close()
    router.push(selectedResult.url)
  }, [flatResults, selectedIndex, query, saveRecentSearch, close, router])

  return {
    query,
    setQuery,
    isOpen,
    open,
    close,
    toggle,
    isLoading,
    results,
    flatResults,
    selectedIndex,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    handleSelect,
    error,
    recentSearches,
    clearRecentSearches
  }
}
