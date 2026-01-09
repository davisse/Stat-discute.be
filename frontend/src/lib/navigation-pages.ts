/**
 * Navigation Pages
 * Static page data for client-side search
 */

import type { PageSearchResult } from '@/types/search'

export const NAVIGATION_PAGES: PageSearchResult[] = [
  // Main
  { type: 'page', id: 'dashboard', title: 'Dashboard', url: '/', category: 'Main', icon: '🏠' },

  // Teams & Schedule
  { type: 'page', id: 'teams', title: 'All Teams', url: '/teams', category: 'Teams', icon: '🏀' },
  { type: 'page', id: 'games', title: 'Games Schedule', url: '/games', category: 'Teams', icon: '📅' },

  // Players
  { type: 'page', id: 'players', title: 'All Players', url: '/players', category: 'Players', icon: '👤' },
  { type: 'page', id: 'player-props', title: 'Player Props', url: '/player-props', category: 'Players', icon: '🎲' },

  // Betting
  { type: 'page', id: 'totals', title: 'Totals Analysis', url: '/betting/totals', category: 'Betting', icon: '📊' },
  { type: 'page', id: 'value-finder', title: 'Value Finder', url: '/betting/value-finder', category: 'Betting', icon: '🎯' },

  // Analysis
  { type: 'page', id: 'q1-value', title: 'Q1 Value', url: '/analysis/q1-value', category: 'Analysis', icon: '📈' },
  { type: 'page', id: 'h2h', title: 'Head to Head', url: '/analysis/h2h', category: 'Analysis', icon: '⚔️' },
  { type: 'page', id: 'quarters', title: 'Quarters Analysis', url: '/analysis/quarters', category: 'Analysis', icon: '🔢' },
  { type: 'page', id: 'pace', title: 'Pace Analysis', url: '/analysis/pace', category: 'Analysis', icon: '⚡' },
  { type: 'page', id: 'dispersion', title: 'Dispersion Analysis', url: '/analysis/dispersion', category: 'Analysis', icon: '📉' },
]

/**
 * Search pages by query (client-side instant search)
 */
export function searchPages(query: string): PageSearchResult[] {
  if (!query || query.length < 1) return []

  const normalizedQuery = query.toLowerCase().trim()

  return NAVIGATION_PAGES.filter(page => {
    const searchableText = `${page.title} ${page.category}`.toLowerCase()
    return searchableText.includes(normalizedQuery)
  })
}
