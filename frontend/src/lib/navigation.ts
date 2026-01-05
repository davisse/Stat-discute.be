/**
 * Navigation Configuration
 * Centralized navigation structure for the app
 */

export interface NavLink {
  href: string
  label: string
  icon?: string
  badge?: string
  badgeColor?: string
}

export interface NavSection {
  id: string
  number: string
  label: string
  description: string
  links: NavLink[]
}

export const navSections: NavSection[] = [
  {
    id: 'teams',
    number: '01',
    label: 'Teams',
    description: 'Explore team statistics, standings, and performance metrics across the NBA.',
    links: [
      { href: '/teams', label: 'Standings' },
      { href: '/teams/stats', label: 'Team Stats' },
      { href: '/teams/comparison', label: 'Compare Teams' },
    ]
  },
  {
    id: 'players',
    number: '02',
    label: 'Players',
    description: 'Deep dive into player statistics, averages, and advanced metrics.',
    links: [
      { href: '/players', label: 'Player Stats' },
      { href: '/players/leaders', label: 'League Leaders' },
      { href: '/players/comparison', label: 'Compare Players' },
    ]
  },
  {
    id: 'betting',
    number: '03',
    label: 'Betting',
    description: 'Betting analytics, odds tracking, and value opportunities.',
    links: [
      { href: '/betting', label: 'Today\'s Lines' },
      { href: '/betting/props', label: 'Player Props' },
      { href: '/betting/trends', label: 'Betting Trends' },
      { href: '/player-props', label: 'Props Analysis', badge: 'NEW', badgeColor: 'bg-emerald-500' },
    ]
  },
  {
    id: 'analysis',
    number: '04',
    label: 'Analysis',
    description: 'Game previews, matchup analysis, and predictive insights.',
    links: [
      { href: '/analysis', label: 'Totals Analysis' },
      { href: '/analysis/quarters', label: 'Quarter Stats' },
      { href: '/analysis/q1-value', label: 'Q1 Value' },
    ]
  },
]
