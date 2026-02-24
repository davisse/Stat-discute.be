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
    id: 'players',
    number: '01',
    label: 'Joueurs',
    description: 'Statistiques détaillées des joueurs, moyennes et métriques avancées.',
    links: [
      { href: '/players', label: 'Tous les Joueurs' },
    ]
  },
  {
    id: 'teams',
    number: '02',
    label: 'Équipes',
    description: 'Statistiques d\'équipes, classements et performances des franchises NBA.',
    links: [
      { href: '/teams', label: 'Toutes les Équipes' },
      { href: '/games', label: 'Calendrier des Matchs' },
    ]
  },
  {
    id: 'betting',
    number: '03',
    label: 'Paris',
    description: 'Analyse des paris, suivi des cotes et opportunités de value.',
    links: [
      { href: '/betting/totals', label: 'Analyse des Totaux' },
      { href: '/betting/value-finder', label: 'Détecteur de Value' },
      { href: '/ou-investigation', label: 'Investigation O/U', badge: 'NEW', badgeColor: 'bg-emerald-500' },
      { href: '/props-lab', label: 'Labo des Props', badge: 'NEW', badgeColor: 'bg-purple-500' },
      { href: '/player-props', label: 'Props Joueurs' },
    ]
  },
  {
    id: 'analysis',
    number: '04',
    label: 'Analyses',
    description: 'Previews de matchs, analyses de confrontations et insights prédictifs.',
    links: [
      { href: '/analysis/q1-value', label: 'Value Q1' },
      { href: '/rag-demo', label: 'Agent IA', badge: 'NEW', badgeColor: 'bg-amber-500' },
    ]
  },
]
