// ============================================================================
// Data Constants for Home Page Components
// ============================================================================

import type { CardData, StickyTitleItem, SectionColors, SectionData } from './types'

export const sectionColors: Record<'equipes' | 'joueurs' | 'betting', SectionColors> = {
  equipes: {
    badge: 'bg-emerald-500/20 text-emerald-400',
    hover: 'hover:border-emerald-500/50'
  },
  joueurs: {
    badge: 'bg-blue-500/20 text-blue-400',
    hover: 'hover:border-blue-500/50'
  },
  betting: {
    badge: 'bg-amber-500/20 text-amber-400',
    hover: 'hover:border-amber-500/50'
  }
} as const

export const navigationCards: CardData[] = [
  // Column 1 - Équipes
  {
    id: 'teams',
    section: 'equipes',
    number: '01',
    category: 'ÉQUIPES',
    href: '/teams',
    title: 'Équipes',
    features: ['Standings', 'Stats off/def', 'DvP analysis']
  },
  {
    id: 'games',
    section: 'equipes',
    number: '01',
    category: 'ÉQUIPES',
    href: '/games',
    title: 'Matchs du Jour',
    features: ['Schedule', 'Live scores', "Today's games"]
  },
  // Column 2 - Joueurs
  {
    id: 'players',
    section: 'joueurs',
    number: '02',
    category: 'JOUEURS',
    href: '/players',
    title: 'Recherche Joueur',
    features: ['Autocomplete', 'Stats avancées', 'Player detail']
  },
  // Column 3 - Betting & Analyse
  {
    id: 'totals',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/totals',
    title: 'Totals O/U',
    features: ['Over/Under', 'Props analysis', 'Trends'],
    badge: 'MC',
    badgeColor: 'bg-emerald-600'
  },
  {
    id: 'value',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/value-finder',
    title: 'Value Finder',
    features: ['Best odds', 'Upside value', 'Edge finder']
  },
  {
    id: 'analysis',
    section: 'betting',
    number: '03',
    category: 'ANALYSE',
    href: '/analysis/q1-value',
    title: 'Analyse Q1',
    features: ['Q1 patterns', 'Dispersion', 'Pace analysis']
  },
  {
    id: 'ou-investigation',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/ou-investigation',
    title: 'O/U Investigation',
    features: ['Analyse totaux', 'Tendances Over/Under', 'Edge finder'],
    badge: 'NEW',
    badgeColor: 'bg-emerald-500'
  },
  {
    id: 'props-lab',
    section: 'betting',
    number: '03',
    category: 'PROPS',
    href: '/props-lab',
    title: 'Props Lab',
    features: ['Player props', 'Absence cascade', 'Line analysis'],
    badge: 'NEW',
    badgeColor: 'bg-purple-500'
  },
  {
    id: 'player-props',
    section: 'betting',
    number: '03',
    category: 'PROPS',
    href: '/player-props',
    title: 'Player Props',
    features: ['Props individuels', 'Hit rates', 'Historique']
  }
]

export const stickyNavItems: StickyTitleItem[] = [
  { id: 'equipes', number: '01', title: 'ÉQUIPES' },
  { id: 'joueurs', number: '02', title: 'JOUEURS' },
  { id: 'betting', number: '03', title: 'BETTING' },
]

export const sectionData: Record<'equipes' | 'joueurs' | 'betting', SectionData> = {
  equipes: {
    number: '01',
    title: 'ÉQUIPES',
    subtitle: 'Standings, statistiques et performances des 30 franchises NBA',
    accentColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/30',
  },
  joueurs: {
    number: '02',
    title: 'JOUEURS',
    subtitle: 'Statistiques individuelles et métriques avancées',
    accentColor: 'text-blue-500',
    borderColor: 'border-blue-500/30',
  },
  betting: {
    number: '03',
    title: 'BETTING',
    subtitle: 'Intelligence betting, value finder et analyses Q1',
    accentColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
  },
} as const

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

export const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
}
