/**
 * Utility functions and component definitions for /analyse page
 */

import { ComponentDefinition, WidgetType } from './types'

/**
 * Component catalog - Liste des widgets disponibles dans la palette
 * Phase 1 MVP: 3 widgets de base (player-stats, comparison, notes)
 * Phase 3: 9 widgets complets
 */
export const AVAILABLE_COMPONENTS: ComponentDefinition[] = [
  {
    type: 'player-stats',
    name: 'Stats Joueur',
    description: 'Statistiques clés d\'un joueur (PPG, RPG, APG)',
    icon: '📊',
    defaultSize: '1x1',
    availableSizes: ['1x1', '2x1'],
  },
  {
    type: 'comparison',
    name: 'Comparaison',
    description: 'Comparer deux joueurs side-by-side',
    icon: '⚖️',
    defaultSize: '2x1',
    availableSizes: ['2x1', '2x2'],
  },
  {
    type: 'notes',
    name: 'Notes libres',
    description: 'Zone de texte éditable pour notes',
    icon: '📝',
    defaultSize: '3x1',
    availableSizes: ['2x1', '3x1', '2x2'],
  },
  // Phase 3: Uncomment below for advanced widgets
  /*
  {
    type: 'chart',
    name: 'Graphique',
    description: 'Performance sur une période (recharts)',
    icon: '📈',
    defaultSize: '2x2',
    availableSizes: ['2x2', '3x2'],
  },
  {
    type: 'standings',
    name: 'Classement',
    description: 'Standings d\'une conférence',
    icon: '🏆',
    defaultSize: '1x2',
    availableSizes: ['1x2', '2x2'],
  },
  {
    type: 'head-to-head',
    name: 'Head to Head',
    description: 'Historique des matchs entre 2 équipes',
    icon: '🔄',
    defaultSize: '2x2',
    availableSizes: ['2x2', '3x1'],
  },
  {
    type: 'four-factors',
    name: 'Four Factors',
    description: 'Four Factors de Dean Oliver',
    icon: '⚡',
    defaultSize: '2x1',
    availableSizes: ['2x1', '2x2'],
  },
  {
    type: 'prediction',
    name: 'Prédiction',
    description: 'Prédiction ML pour un match',
    icon: '🎯',
    defaultSize: '1x1',
    availableSizes: ['1x1', '2x1'],
  },
  {
    type: 'advanced-stats',
    name: 'Advanced Stats',
    description: 'Métriques avancées (eFG%, TS%, Usage%)',
    icon: '💎',
    defaultSize: '2x2',
    availableSizes: ['2x2', '3x2'],
  },
  */
]

/**
 * Generate unique widget ID
 */
export function generateWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get component definition by type
 */
export function getComponentDefinition(type: WidgetType): ComponentDefinition | undefined {
  return AVAILABLE_COMPONENTS.find((comp) => comp.type === type)
}

/**
 * localStorage keys
 */
export const STORAGE_KEYS = {
  ANALYSIS: 'stat-discute-analysis',
} as const

/**
 * Save analysis to localStorage
 */
export function saveAnalysisToStorage(analysis: {
  title: string
  widgets: any[]
}): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(analysis))
  } catch (error) {
    console.error('Failed to save analysis to localStorage:', error)
  }
}

/**
 * Load analysis from localStorage
 */
export function loadAnalysisFromStorage(): {
  title: string
  widgets: any[]
} | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ANALYSIS)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load analysis from localStorage:', error)
    return null
  }
}

/**
 * Clear analysis from localStorage
 */
export function clearAnalysisFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS)
  } catch (error) {
    console.error('Failed to clear analysis from localStorage:', error)
  }
}
