/**
 * Search Types
 * Type definitions for the global search feature (Command Palette)
 */

export type SearchResultType = 'team' | 'player' | 'game' | 'page'

export interface BaseSearchResult {
  type: SearchResultType
  id: string | number
  title: string
  subtitle?: string
  url: string
  icon?: string
  meta?: Record<string, string | number>
}

export interface TeamSearchResult extends BaseSearchResult {
  type: 'team'
  id: number
  abbreviation: string
  record: string
  conferenceRank: number
  conference: 'East' | 'West'
}

export interface PlayerSearchResult extends BaseSearchResult {
  type: 'player'
  id: number
  teamAbbreviation: string
  ppg: number
  position?: string
}

export interface GameSearchResult extends BaseSearchResult {
  type: 'game'
  id: string
  homeTeam: string
  homeAbbr: string
  awayTeam: string
  awayAbbr: string
  gameTime: string
  gameDate: string
  isToday: boolean
}

export interface PageSearchResult extends BaseSearchResult {
  type: 'page'
  category: string
}

export type SearchResult = TeamSearchResult | PlayerSearchResult | GameSearchResult | PageSearchResult

export interface SearchResults {
  teams: TeamSearchResult[]
  players: PlayerSearchResult[]
  games: GameSearchResult[]
  pages: PageSearchResult[]
}

export interface SearchState {
  query: string
  isOpen: boolean
  isLoading: boolean
  results: SearchResults
  selectedIndex: number
  recentSearches: string[]
  error: string | null
}

export interface UseSearchReturn {
  query: string
  setQuery: (query: string) => void
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  isLoading: boolean
  results: SearchResults
  flatResults: SearchResult[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  selectNext: () => void
  selectPrevious: () => void
  handleSelect: (result?: SearchResult) => void
  error: string | null
  recentSearches: string[]
  clearRecentSearches: () => void
}

// API Response types
export interface SearchAPIResponse {
  players: PlayerSearchResult[]
  games: GameSearchResult[]
}
