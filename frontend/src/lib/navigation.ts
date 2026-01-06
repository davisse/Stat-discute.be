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
      { href: '/teams', label: 'All Teams' },
      { href: '/games', label: 'Games Schedule' },
    ]
  },
  {
    id: 'players',
    number: '02',
    label: 'Players',
    description: 'Deep dive into player statistics, averages, and advanced metrics.',
    links: [
      { href: '/players', label: 'All Players' },
    ]
  },
  {
    id: 'betting',
    number: '03',
    label: 'Betting',
    description: 'Betting analytics, odds tracking, and value opportunities.',
    links: [
      { href: '/betting/totals', label: 'Totals Analysis' },
      { href: '/betting/value-finder', label: 'Value Finder' },
    ]
  },
  {
    id: 'analysis',
    number: '04',
    label: 'Analysis',
    description: 'Game previews, matchup analysis, and predictive insights.',
    links: [
      { href: '/analysis/q1-value', label: 'Q1 Value' },
    ]
  },
]
