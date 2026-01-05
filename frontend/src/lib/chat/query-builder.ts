/**
 * Query Builder
 *
 * Builds and executes SQL queries from structured intent
 * Uses templates for safe, parameterized queries
 */

import { query } from '@/lib/db'
import { getCurrentSeason } from '@/lib/queries'
import type { QueryIntent } from './intent-parser'

// ============================================
// TYPES
// ============================================

export interface QueryResult {
  success: boolean
  data: Record<string, unknown>[]
  template: string
  error?: string
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'table' | 'pie' | 'none'
  xAxis?: string
  yAxis?: string
  title?: string
  xLabel?: string
  yLabel?: string
  colors?: string[]
  stacked?: boolean
}

// ============================================
// QUERY TEMPLATES
// ============================================

const QUERY_TEMPLATES = {
  // Player stats queries
  player_scoring: `
    SELECT
      g.game_date,
      CONCAT(ht.abbreviation, ' vs ', at.abbreviation) as matchup,
      pgs.points,
      pgs.fg_made,
      pgs.fg_attempted,
      pgs.three_pt_made,
      pgs.three_pt_attempted,
      pgs.ft_made,
      pgs.ft_attempted,
      pgs.minutes
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    JOIN players p ON pgs.player_id = p.player_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE LOWER(p.full_name) LIKE $1
      AND g.season = $2
    ORDER BY g.game_date DESC
    LIMIT $3
  `,

  player_rebounds: `
    SELECT
      g.game_date,
      CONCAT(ht.abbreviation, ' vs ', at.abbreviation) as matchup,
      pgs.rebounds_off as offensive_rebounds,
      pgs.rebounds_def as defensive_rebounds,
      (pgs.rebounds_off + pgs.rebounds_def) as total_rebounds,
      pgs.minutes
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    JOIN players p ON pgs.player_id = p.player_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE LOWER(p.full_name) LIKE $1
      AND g.season = $2
    ORDER BY g.game_date DESC
    LIMIT $3
  `,

  player_assists: `
    SELECT
      g.game_date,
      CONCAT(ht.abbreviation, ' vs ', at.abbreviation) as matchup,
      pgs.assists,
      pgs.turnovers,
      pgs.minutes
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    JOIN players p ON pgs.player_id = p.player_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE LOWER(p.full_name) LIKE $1
      AND g.season = $2
    ORDER BY g.game_date DESC
    LIMIT $3
  `,

  player_general: `
    SELECT
      g.game_date,
      CONCAT(ht.abbreviation, ' vs ', at.abbreviation) as matchup,
      pgs.points,
      (pgs.rebounds_off + pgs.rebounds_def) as rebounds,
      pgs.assists,
      pgs.steals,
      pgs.blocks,
      pgs.turnovers,
      pgs.minutes
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    JOIN players p ON pgs.player_id = p.player_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE LOWER(p.full_name) LIKE $1
      AND g.season = $2
    ORDER BY g.game_date DESC
    LIMIT $3
  `,

  // Team queries
  team_standings: `
    SELECT
      t.abbreviation,
      t.name as team_name,
      ts.wins,
      ts.losses,
      ts.win_pct,
      ts.conference_rank,
      ts.division_rank,
      ts.home_record,
      ts.away_record,
      ts.streak
    FROM team_standings ts
    JOIN teams t ON ts.team_id = t.team_id
    WHERE ts.season = $1
    ORDER BY ts.conference_rank
  `,

  team_stats: `
    SELECT
      g.game_date,
      CASE
        WHEN g.home_team_id = t.team_id THEN at.abbreviation
        ELSE ht.abbreviation
      END as opponent,
      tgs.points,
      tgs.rebounds,
      tgs.assists,
      tgs.steals,
      tgs.blocks,
      tgs.turnovers,
      CASE
        WHEN g.home_team_id = t.team_id AND g.home_score > g.away_score THEN 'W'
        WHEN g.away_team_id = t.team_id AND g.away_score > g.home_score THEN 'W'
        ELSE 'L'
      END as result
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    JOIN teams t ON tgs.team_id = t.team_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE LOWER(t.name) LIKE $1 OR LOWER(t.abbreviation) LIKE $1
      AND g.season = $2
    ORDER BY g.game_date DESC
    LIMIT $3
  `,

  // League leaders
  league_leaders: `
    SELECT
      p.full_name,
      t.abbreviation as team,
      COUNT(pgs.game_id) as games,
      ROUND(AVG(pgs.points)::numeric, 1) as ppg,
      ROUND(AVG(pgs.rebounds_off + pgs.rebounds_def)::numeric, 1) as rpg,
      ROUND(AVG(pgs.assists)::numeric, 1) as apg
    FROM player_game_stats pgs
    JOIN players p ON pgs.player_id = p.player_id
    JOIN teams t ON pgs.team_id = t.team_id
    JOIN games g ON pgs.game_id = g.game_id
    WHERE g.season = $1
    GROUP BY p.player_id, p.full_name, t.abbreviation
    HAVING COUNT(pgs.game_id) >= 10
    ORDER BY AVG(pgs.points) DESC
    LIMIT $2
  `,

  // Betting queries
  team_betting: `
    SELECT
      t.abbreviation,
      t.name as team_name,
      COUNT(*) as games,
      SUM(CASE WHEN ap.covered = true THEN 1 ELSE 0 END) as ats_wins,
      SUM(CASE WHEN ap.covered = false THEN 1 ELSE 0 END) as ats_losses,
      ROUND(100.0 * SUM(CASE WHEN ap.covered = true THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) as ats_pct,
      SUM(CASE WHEN ap.over_hit = true THEN 1 ELSE 0 END) as over_hits,
      SUM(CASE WHEN ap.over_hit = false THEN 1 ELSE 0 END) as under_hits
    FROM ats_performance ap
    JOIN teams t ON ap.team_id = t.team_id
    JOIN games g ON ap.game_id = g.game_id
    WHERE (LOWER(t.name) LIKE $1 OR LOWER(t.abbreviation) LIKE $1)
      AND g.season = $2
    GROUP BY t.team_id, t.abbreviation, t.name
  `,
} as const

type TemplateKey = keyof typeof QUERY_TEMPLATES

// ============================================
// QUERY BUILDER
// ============================================

/**
 * Build and execute a query from structured intent
 */
export async function buildAndExecuteQuery(
  intent: QueryIntent
): Promise<QueryResult> {
  try {
    const currentSeason = await getCurrentSeason()
    const template = selectTemplate(intent)

    if (!template) {
      return {
        success: false,
        data: [],
        template: 'none',
        error: 'No matching query template for this intent',
      }
    }

    const { sql, params } = buildQueryParams(template, intent, currentSeason)

    const result = await query(sql, params)

    return {
      success: true,
      data: result.rows,
      template,
    }
  } catch (error) {
    console.error('Query execution error:', error)
    return {
      success: false,
      data: [],
      template: 'error',
      error: error instanceof Error ? error.message : 'Query execution failed',
    }
  }
}

/**
 * Select the appropriate query template based on intent
 */
function selectTemplate(intent: QueryIntent): TemplateKey | null {
  const { entity_type, stat_category } = intent

  if (entity_type === 'player') {
    switch (stat_category) {
      case 'scoring':
        return 'player_scoring'
      case 'rebounds':
        return 'player_rebounds'
      case 'assists':
        return 'player_assists'
      default:
        return 'player_general'
    }
  }

  if (entity_type === 'team') {
    switch (stat_category) {
      case 'standings':
        return 'team_standings'
      case 'betting':
        return 'team_betting'
      default:
        return 'team_stats'
    }
  }

  if (entity_type === 'league') {
    return 'league_leaders'
  }

  return null
}

/**
 * Build query parameters from intent
 */
function buildQueryParams(
  template: TemplateKey,
  intent: QueryIntent,
  currentSeason: string
): { sql: string; params: (string | number)[] } {
  const sql = QUERY_TEMPLATES[template]
  const params: (string | number)[] = []

  // Determine limit based on time period
  const limit = intent.limit || getDefaultLimit(intent.time_period)

  switch (template) {
    case 'player_scoring':
    case 'player_rebounds':
    case 'player_assists':
    case 'player_general':
      params.push(`%${intent.entity_name?.toLowerCase() || ''}%`)
      params.push(currentSeason)
      params.push(limit)
      break

    case 'team_standings':
      params.push(currentSeason)
      break

    case 'team_stats':
    case 'team_betting':
      params.push(`%${intent.entity_name?.toLowerCase() || ''}%`)
      params.push(currentSeason)
      if (template === 'team_stats') {
        params.push(limit)
      }
      break

    case 'league_leaders':
      params.push(currentSeason)
      params.push(limit)
      break
  }

  return { sql, params }
}

/**
 * Get default limit based on time period
 */
function getDefaultLimit(timePeriod?: string): number {
  switch (timePeriod) {
    case 'last_5':
      return 5
    case 'last_10':
      return 10
    case 'today':
      return 1
    default:
      return 20
  }
}

// ============================================
// CHART CONFIGURATION
// ============================================

/**
 * Determine appropriate chart configuration based on intent and data
 */
export function getChartConfig(
  intent: QueryIntent,
  data: Record<string, unknown>[]
): ChartConfig {
  if (!data || data.length === 0) {
    return { type: 'none' }
  }

  const { entity_type, stat_category, stat_name } = intent

  // Player time series data
  if (entity_type === 'player' && data.length > 1) {
    const yAxisField = stat_name || getDefaultStatField(stat_category)
    return {
      type: 'bar',
      xAxis: 'game_date',
      yAxis: yAxisField,
      title: `${intent.entity_name || 'Player'} ${formatStatName(yAxisField)}`,
      xLabel: 'Game Date',
      yLabel: formatStatName(yAxisField),
      colors: ['#0ea5e9'],
    }
  }

  // Standings table
  if (stat_category === 'standings') {
    return { type: 'table', title: 'Team Standings' }
  }

  // League leaders
  if (entity_type === 'league') {
    return {
      type: 'bar',
      xAxis: 'full_name',
      yAxis: 'ppg',
      title: 'League Leaders',
      xLabel: 'Player',
      yLabel: 'Points Per Game',
      colors: ['#8b5cf6'],
    }
  }

  // Default to table
  return { type: 'table' }
}

/**
 * Transform data for chart display
 */
export function transformDataForChart(
  data: Record<string, unknown>[],
  config: ChartConfig
): Record<string, unknown>[] {
  if (config.type === 'none' || config.type === 'table') {
    return data
  }

  // For bar/line charts, ensure data is properly formatted
  return data.map(row => {
    const transformed: Record<string, unknown> = { ...row }

    // Format date fields
    if (transformed.game_date) {
      transformed.game_date = formatDate(transformed.game_date as string)
    }

    // Round numeric values
    for (const [key, value] of Object.entries(transformed)) {
      if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        transformed[key] = parseFloat(parseFloat(value).toFixed(1))
      }
    }

    return transformed
  })
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDefaultStatField(category: string): string {
  switch (category) {
    case 'scoring':
      return 'points'
    case 'rebounds':
      return 'total_rebounds'
    case 'assists':
      return 'assists'
    case 'defense':
      return 'steals'
    default:
      return 'points'
  }
}

function formatStatName(field: string): string {
  const names: Record<string, string> = {
    points: 'Points',
    total_rebounds: 'Rebounds',
    assists: 'Assists',
    steals: 'Steals',
    blocks: 'Blocks',
    turnovers: 'Turnovers',
    fg_made: 'Field Goals Made',
    three_pt_made: '3-Pointers Made',
    ppg: 'PPG',
    rpg: 'RPG',
    apg: 'APG',
  }
  return names[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}
