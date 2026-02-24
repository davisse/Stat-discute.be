// ============================================================================
// Data Constants for Home Page Components
// ============================================================================

import type { CardData, StickyTitleItem, SectionColors, SectionData } from './types'

export const sectionColors: Record<'equipes' | 'joueurs' | 'betting' | 'analyse', SectionColors> = {
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
  },
  analyse: {
    badge: 'bg-purple-500/20 text-purple-400',
    hover: 'hover:border-purple-500/50'
  }
} as const

export const navigationCards: CardData[] = [
  // ============================================================================
  // Section 1 - ÉQUIPES (4 cards)
  // ============================================================================
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
  {
    id: 'team-defense',
    section: 'equipes',
    number: '01',
    category: 'ÉQUIPES',
    href: '/team-defense',
    title: 'Team Defense',
    features: ['DvP matchups', 'Defensive analysis', 'Position defense']
  },
  {
    id: 'lineups',
    section: 'equipes',
    number: '01',
    category: 'ÉQUIPES',
    href: '/lineups',
    title: 'Starting Lineups',
    features: ['Starting 5', 'Lineup stats', 'Rotations']
  },

  // ============================================================================
  // Section 2 - JOUEURS (2 cards)
  // ============================================================================
  {
    id: 'players',
    section: 'joueurs',
    number: '02',
    category: 'JOUEURS',
    href: '/players',
    title: 'Recherche Joueur',
    features: ['Autocomplete', 'Stats avancées', 'Player detail']
  },
  {
    id: 'advanced-stats',
    section: 'joueurs',
    number: '02',
    category: 'JOUEURS',
    href: '/advanced-stats',
    title: 'Advanced Stats',
    features: ['TS%', 'eFG%', 'Usage rate', 'PER']
  },

  // ============================================================================
  // Section 3 - BETTING (10 cards)
  // ============================================================================
  {
    id: 'betting-dashboard',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting',
    title: 'Betting Dashboard',
    features: ['Overview', 'Best bets', 'Value plays']
  },
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
    id: 'odds-terminal',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/odds-terminal',
    title: 'Odds Terminal',
    features: ['Live odds', 'Pinnacle lines', 'Terminal interface']
  },
  {
    id: 'odds-tracker',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/odds-tracker',
    title: 'Odds Tracker',
    features: ['Live monitoring', 'Line alerts', 'Odds comparison']
  },
  {
    id: 'odds-movement',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/odds-movement',
    title: 'Odds Movement',
    features: ['Line movements', 'Market trends', 'Sharp action']
  },
  {
    id: 'odds-evolution',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/odds-evolution',
    title: 'Odds Evolution',
    features: ['Historical odds', 'Line history', 'Market evolution']
  },
  {
    id: 'line-history',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/line-history',
    title: 'Line History',
    features: ['Betting lines', 'Historical data', 'Line changes']
  },
  {
    id: 'my-bets',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/my-bets',
    title: 'My Bets',
    features: ['Bet tracker', 'Win/loss record', 'ROI analysis']
  },

  // Props subsection within Betting
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
  },
  {
    id: 'props-tonight',
    section: 'betting',
    number: '03',
    category: 'PROPS',
    href: '/player-props/tonight',
    title: "Tonight's Props",
    features: ["Today's lines", 'Best props', 'Value plays']
  },

  // ============================================================================
  // Section 4 - ANALYSE (7 cards)
  // ============================================================================
  {
    id: 'analysis-hub',
    section: 'analyse',
    number: '04',
    category: 'ANALYSE',
    href: '/analysis',
    title: 'Analysis Hub',
    features: ['Game analysis', 'Statistical insights', 'Trends']
  },
  {
    id: 'q1-analysis',
    section: 'analyse',
    number: '04',
    category: 'ANALYSE',
    href: '/analysis/q1-value',
    title: 'Analyse Q1',
    features: ['Q1 patterns', 'First quarter', 'Early trends']
  },
  {
    id: 'quarters',
    section: 'analyse',
    number: '04',
    category: 'ANALYSE',
    href: '/analysis/quarters',
    title: 'Quarters Analysis',
    features: ['By quarter', 'Period breakdown', 'Quarter trends']
  },
  {
    id: 'dispersion',
    section: 'analyse',
    number: '04',
    category: 'ANALYSE',
    href: '/analysis/dispersion',
    title: 'Dispersion',
    features: ['Score variance', 'Consistency', 'Volatility']
  },
  {
    id: 'pace-analysis',
    section: 'analyse',
    number: '04',
    category: 'ANALYSE',
    href: '/pace-analysis',
    title: 'Pace Analysis',
    features: ['Tempo', 'Possessions', 'Pace metrics']
  },
  {
    id: 'matchups',
    section: 'analyse',
    number: '04',
    category: 'ANALYSE',
    href: '/matchups',
    title: 'Matchups',
    features: ['Head-to-head', 'H2H stats', 'Team vs team']
  },
  {
    id: 'ml-analysis',
    section: 'analyse',
    number: '04',
    category: 'ANALYSE',
    href: '/ml-analysis',
    title: 'ML Predictions',
    features: ['Machine learning', 'AI predictions', 'Models']
  },
  {
    id: 'rag-agent',
    section: 'analyse',
    number: '04',
    category: 'ANALYSE',
    href: '/rag-demo',
    title: 'Agent IA',
    features: ['Q&A NBA', 'Analyses RAG', 'Sources vectorielles'],
    badge: 'NEW',
    badgeColor: 'bg-amber-500'
  }
]

export const stickyNavItems: StickyTitleItem[] = [
  { id: 'equipes', number: '01', title: 'ÉQUIPES' },
  { id: 'joueurs', number: '02', title: 'JOUEURS' },
  { id: 'betting', number: '03', title: 'BETTING' },
  { id: 'analyse', number: '04', title: 'ANALYSE' },
]

export const sectionData: Record<'equipes' | 'joueurs' | 'betting' | 'analyse', SectionData> = {
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
    subtitle: 'Intelligence betting, odds tracking et player props',
    accentColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
  },
  analyse: {
    number: '04',
    title: 'ANALYSE',
    subtitle: 'Analyses avancées, quarters, dispersion et ML predictions',
    accentColor: 'text-purple-500',
    borderColor: 'border-purple-500/30',
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
