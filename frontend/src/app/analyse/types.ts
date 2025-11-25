/**
 * Type definitions for /analyse page - Bento Grid Analysis Builder
 *
 * Design System: STAT-DISCUTE monochrome strict (black/white/gray)
 * Grid System: 12 columns with 6 responsive widget sizes
 */

export type WidgetType =
  | 'player-stats'
  | 'comparison'
  | 'chart'
  | 'standings'
  | 'head-to-head'
  | 'four-factors'
  | 'prediction'
  | 'notes'
  | 'advanced-stats'

export type WidgetSize =
  | '1x1'  // Small: 4 cols x 1 row (min-height: 200px)
  | '2x1'  // Medium: 6 cols x 1 row (min-height: 200px)
  | '2x2'  // Large: 6 cols x 2 rows (min-height: 400px)
  | '3x1'  // Wide: 9 cols x 1 row (min-height: 200px)
  | '1x2'  // Tall: 4 cols x 2 rows (min-height: 400px)
  | '3x2'  // XLarge: 9 cols x 2 rows (min-height: 400px)

export interface Widget {
  id: string                    // Unique identifier (UUID)
  type: WidgetType             // Type de widget
  size: WidgetSize             // Taille dans le grid
  config: WidgetConfig         // Configuration spécifique
  data?: any                   // Data fetched from DB (Phase 2)
}

export interface WidgetConfig {
  // Common config
  title?: string

  // Player-specific
  playerId?: number
  playerIds?: number[]          // For comparison widgets

  // Team-specific
  teamId?: number
  teamIds?: number[]

  // Game-specific
  gameId?: string

  // Period selection
  period?: 'season' | 'last10' | 'last30'

  // Stats selection
  stats?: string[]

  // Chart-specific
  metric?: string
  chartType?: 'line' | 'bar'

  // Notes-specific
  content?: string              // For notes widget
}

export interface AnalysisState {
  title: string                         // Titre de l'analyse (editable)
  widgets: Widget[]                     // Liste des widgets
  isModalOpen: boolean                  // ComponentPalette modal open?
  editingWidgetId: string | null        // Widget en cours de config
}

export interface ComponentDefinition {
  type: WidgetType
  name: string
  description: string
  icon: string                          // Emoji icon
  defaultSize: WidgetSize
  availableSizes: WidgetSize[]
}

// Widget size to CSS Grid class mapping
export const widgetSizeClasses: Record<WidgetSize, string> = {
  '1x1': 'col-span-4 row-span-1 min-h-[200px]',
  '2x1': 'col-span-6 row-span-1 min-h-[200px]',
  '2x2': 'col-span-6 row-span-2 min-h-[400px]',
  '3x1': 'col-span-9 row-span-1 min-h-[200px]',
  '1x2': 'col-span-4 row-span-2 min-h-[400px]',
  '3x2': 'col-span-9 row-span-2 min-h-[400px]',
}

// Responsive adjustments for widget sizes
export const widgetSizeResponsiveClasses: Record<WidgetSize, string> = {
  '1x1': 'lg:col-span-4 md:col-span-6 col-span-4',
  '2x1': 'lg:col-span-6 md:col-span-6 col-span-4',
  '2x2': 'lg:col-span-6 md:col-span-6 col-span-4',
  '3x1': 'lg:col-span-9 md:col-span-6 col-span-4',
  '1x2': 'lg:col-span-4 md:col-span-6 col-span-4',
  '3x2': 'lg:col-span-9 md:col-span-6 col-span-4',
}
