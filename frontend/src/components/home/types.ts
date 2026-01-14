// ============================================================================
// Types for Home Page Components
// ============================================================================

export interface NavLinkProps {
  href: string
  label: string
  badge?: string
  badgeColor?: string
}

export interface CardData {
  id: string
  section: 'equipes' | 'joueurs' | 'betting'
  number: string
  category: string
  href: string
  title: string
  features: string[]
  badge?: string
  badgeColor?: string
}

export interface StickyTitleItem {
  id: string
  number: string
  title: string
}

export interface SectionColors {
  badge: string
  hover: string
}

export interface SectionData {
  number: string
  title: string
  subtitle: string
  accentColor: string
  borderColor: string
}
