/**
 * NBA Team Colors Map
 * 30 official NBA team color sets for Stadium Spotlight hero component
 */

export interface TeamColorSet {
  primary: string   // Main team color (hex)
  secondary: string // Accent color (hex)
}

export const NBA_TEAM_COLORS: Record<string, TeamColorSet> = {
  // Atlantic Division
  BOS: { primary: '#007A33', secondary: '#BA9653' },
  BKN: { primary: '#000000', secondary: '#FFFFFF' },
  NYK: { primary: '#006BB6', secondary: '#F58426' },
  PHI: { primary: '#006BB6', secondary: '#ED174C' },
  TOR: { primary: '#CE1141', secondary: '#000000' },

  // Central Division
  CHI: { primary: '#CE1141', secondary: '#000000' },
  CLE: { primary: '#860038', secondary: '#FDBB30' },
  DET: { primary: '#C8102E', secondary: '#1D42BA' },
  IND: { primary: '#002D62', secondary: '#FDBB30' },
  MIL: { primary: '#00471B', secondary: '#EEE1C6' },

  // Southeast Division
  ATL: { primary: '#E03A3E', secondary: '#C1D32F' },
  CHA: { primary: '#1D1160', secondary: '#00788C' },
  MIA: { primary: '#98002E', secondary: '#F9A01B' },
  ORL: { primary: '#0077C0', secondary: '#000000' },
  WAS: { primary: '#002B5C', secondary: '#E31837' },

  // Northwest Division
  DEN: { primary: '#0E2240', secondary: '#FEC524' },
  MIN: { primary: '#0C2340', secondary: '#236192' },
  OKC: { primary: '#007AC1', secondary: '#EF3B24' },
  POR: { primary: '#E03A3E', secondary: '#000000' },
  UTA: { primary: '#002B5C', secondary: '#00471B' },

  // Pacific Division
  GSW: { primary: '#1D428A', secondary: '#FFC72C' },
  LAC: { primary: '#C8102E', secondary: '#1D428A' },
  LAL: { primary: '#552583', secondary: '#FDB927' },
  PHX: { primary: '#1D1160', secondary: '#E56020' },
  SAC: { primary: '#5A2D81', secondary: '#63727A' },

  // Southwest Division
  DAL: { primary: '#00538C', secondary: '#002B5E' },
  HOU: { primary: '#CE1141', secondary: '#000000' },
  MEM: { primary: '#5D76A9', secondary: '#12173F' },
  NOP: { primary: '#0C2340', secondary: '#C8102E' },
  SAS: { primary: '#C4CED4', secondary: '#000000' },
}

/**
 * Get team colors by abbreviation
 * Returns fallback white/gray if team not found
 */
export function getTeamColors(abbreviation: string): TeamColorSet {
  return NBA_TEAM_COLORS[abbreviation] ?? { primary: '#FFFFFF', secondary: '#888888' }
}

/**
 * Convert hex color to rgba string
 * @param hex - Hex color code (e.g., '#007A33')
 * @param alpha - Opacity value 0-1
 */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
