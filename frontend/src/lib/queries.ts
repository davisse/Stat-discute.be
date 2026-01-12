/**
 * Database Query Functions
 *
 * All database queries with season filtering and proper TypeScript types.
 * Every query joining games table MUST filter by current season.
 */

import { query } from '@/lib/db'
import type { TeamSearchResult, PlayerSearchResult, GameSearchResult } from '@/types/search'

// ============================================
// TYPES
// ============================================

export interface Game {
  game_id: string
  game_date: string
  home_team: string
  away_team: string
  home_abbreviation: string
  away_abbreviation: string
  home_score: number
  away_score: number
  game_status: string
  season: string
}

export interface TeamLineupSnapshot {
  team: string
  lineup_status: 'confirmed' | 'expected'
  pg_name: string | null
  pg_status: string | null
  sg_name: string | null
  sg_status: string | null
  sf_name: string | null
  sf_status: string | null
  pf_name: string | null
  pf_status: string | null
  c_name: string | null
  c_status: string | null
}

export interface GameWithLineups {
  game_time: string
  home_team: string
  away_team: string
  home_record: string
  away_record: string
  home_ml: number | null
  away_ml: number | null
  spread_team: string | null
  spread_value: number | null
  over_under: number | null
  home_lineup: TeamLineupSnapshot
  away_lineup: TeamLineupSnapshot
  referees: string[]
  scraped_at: string
}

export interface InjuryReport {
  team: string
  opponent: string
  game_time: string
  player_name: string
  position: string
  status: string
}

export interface Q1TeamStats {
  team_id: number
  abbreviation: string
  team_abbreviation: string
  team_name: string
  games_played: number
  avg_q1_score: number
  avg_q1_allowed: number
  q1_diff: number
  // Additional metrics for leaderboard
  q1_avg_scored: number
  q1_avg_allowed: number
  q1_margin: number
  q1_win_pct: number
}

export interface Q1LeaderboardData {
  best_q1_offense: Q1TeamStats[]
  best_q1_defense: Q1TeamStats[]
  best_q1_margin: Q1TeamStats[]
  best_q1_win_pct: Q1TeamStats[]
}

export interface Q1TodayGame {
  game_id: string
  home_abbr: string
  away_abbr: string
  home_q1_avg: number
  home_q1_allowed: number
  home_q1_win_pct: number
  away_q1_avg: number
  away_q1_allowed: number
  away_q1_win_pct: number
  home_games_played: number
  away_games_played: number
  projected_home_q1: number
  projected_away_q1: number
  home_model_win_prob: number
  away_model_win_prob: number
}

export interface PlayerImpactGame {
  game_id: string
  game_date: string
  opponent: string
  location: 'HOME' | 'AWAY'
  player_played: boolean
  team_points: number
  opponent_points: number
  total: number
}

export interface TeamDefenseMetrics {
  team_id: number
  team_abbreviation: string
  games_analyzed: number
  avg_points_allowed: number
  avg_total: number
}

export interface TeamOption {
  team_id: number
  abbreviation: string
  full_name: string
}

export interface TeamDefenseGame {
  game_id: string
  game_date: string
  opponent: string
  location: 'HOME' | 'AWAY'
  points_allowed: number
  team_points: number
  total: number
}

export interface TeamPlayer {
  player_id: number
  full_name: string
  position: string
  games_played: number
}

export interface PlayerAdvancedSeasonStats {
  player_id: number
  full_name: string
  team_abbreviation: string
  games_played: number
  games: number
  position?: string
  starter_pct: number
  ppg: number
  avg_usage: number
  avg_ts: number
  avg_efg: number
}

export interface TeammateAbsenceImpact {
  player_id: number
  player_name: string
  absent_teammate_id: number
  absent_teammate_name: string
  games_without: number
  games_with: number
  pts_without: number
  pts_with: number
  pts_diff: number
  usage_without: number
  usage_with: number
  usage_diff: number
}

export interface TeammatePerformanceSplit {
  player_id: number
  player_name: string
  teammate_id: number
  teammate_name: string
  position: string | null
  with_games: number
  without_games: number
  // Points
  with_pts: number
  without_pts: number
  pts_boost: number
  // Rebounds
  with_reb: number
  without_reb: number
  reb_boost: number
  // Assists
  with_ast: number
  without_ast: number
  ast_boost: number
  // Blocks
  with_blk: number
  without_blk: number
  blk_boost: number
  // Steals
  with_stl: number
  without_stl: number
  stl_boost: number
  // 3PM
  with_3pm: number
  without_3pm: number
  three_pm_boost: number
  // FG
  with_fgm: number
  with_fga: number
  without_fgm: number
  without_fga: number
  starter_pct: number  // % of games started when absent player was out
}

export interface ImpactfulAbsence {
  absent_player_id: number
  absent_player_name: string
  games_missed: number
  team_pts_diff: number
  beneficiaries: TeammatePerformanceSplit[]
}

/**
 * Opponent vulnerability by position when a player is absent
 * Measures how opponent positions score better/worse without the player
 */
export interface OpponentVulnerabilityByPosition {
  position: string
  games_with: number
  games_without: number
  // Points
  pts_with: number
  pts_without: number
  pts_boost: number
  // FGA
  fga_with: number
  fga_without: number
  fga_boost: number
  // FG%
  fgpct_with: number
  fgpct_without: number
  fgpct_boost: number
}

export interface BettingValueAnalysis {
  analysis_id: number
  game_id: string
  game_date: string
  home_team: string
  away_team: string
  home_team_score: number | null
  away_team_score: number | null
  game_status: string
  recommendation: string
  confidence: number
  confidence_level: string
  factors: Record<string, unknown>
  result: string | null
  created_at: string
  // Value scoring fields
  total_value_score: number
  value_tier: string | null
  positional_matchup_score: number | null
  betting_trend_score: number | null
  advanced_stats_score: number | null
  // Recommendation fields
  recommended_bet_type: string
  recommended_side: 'home' | 'away'
}

export interface TeamSplitsWithPlayer {
  with_player_games: number
  without_player_games: number
  with_player_ppg: number
  without_player_ppg: number
  with_player_total: number
  without_player_total: number
}

export interface PlayerSplitsWithTeammate {
  with_teammate_games: number
  without_teammate_games: number
  with_teammate_pts: number
  without_teammate_pts: number
  with_teammate_usage: number
  without_teammate_usage: number
}

export interface OddsDataPoint {
  timestamp: string
  odds: number
  market_id: number
}

export interface BettingEvent {
  event_id: number
  game_id: string
  home_team: string
  away_team: string
  game_time: string
  status: string
}

export interface Market {
  market_id: number
  event_id: number
  market_type: string
  period: string
  selection: string
  line: number | null
}

export interface CurrentOdds {
  market_id: number
  odds: number
  timestamp: string
}

export interface DefensiveStatsByPosition {
  team_id: number
  team_abbreviation: string
  team_full_name: string
  position: string
  points_allowed_per_game: number
  points_allowed_rank: number
  fg_pct_allowed: number
  rebounds_allowed_per_game: number
  assists_allowed_per_game: number
}

export interface DvPHeatmapCell {
  team_id: number
  team_abbreviation: string
  position: string
  points_allowed_per_game: number
  points_allowed_rank: number
  fg_pct_allowed: number
  league_avg: number
  diff_from_avg: number
}

export interface DvPHeatmapData {
  cells: DvPHeatmapCell[]
  league_averages: { position: string; avg_points: number }[]
  positions: string[]
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Get the current season from the database
 */
export async function getCurrentSeason(): Promise<string> {
  const result = await query(
    `SELECT season_id FROM seasons WHERE is_current = true LIMIT 1`
  )
  return result.rows[0]?.season_id || '2025-26'
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      (SELECT COUNT(*) FROM games WHERE season = $1) as total_games,
      (SELECT COUNT(*) FROM games WHERE season = $1 AND game_status = 'Final') as completed_games,
      (SELECT COUNT(*) FROM player_game_stats pgs JOIN games g ON pgs.game_id = g.game_id WHERE g.season = $1) as total_player_stats,
      (SELECT COUNT(DISTINCT player_id) FROM player_game_stats pgs JOIN games g ON pgs.game_id = g.game_id WHERE g.season = $1) as unique_players,
      (SELECT COUNT(*) FROM teams) as total_teams
  `, [currentSeason])

  return result.rows[0]
}

/**
 * Get games with statistics for admin view
 */
export async function getGamesWithStats(limit = 20, offset = 0) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      g.game_status,
      ht.abbreviation as home_abbreviation,
      at.abbreviation as away_abbreviation,
      ht.full_name as home_team,
      at.full_name as away_team,
      g.home_team_score,
      g.away_team_score,
      (SELECT COUNT(*) FROM player_game_stats WHERE game_id = g.game_id) as player_stats_count
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE g.season = $1
    ORDER BY g.game_date DESC
    LIMIT $2 OFFSET $3
  `, [currentSeason, limit, offset])

  return result.rows
}

/**
 * Get top players by points
 */
export async function getTopPlayers(limit = 10) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      p.player_id,
      p.full_name,
      t.abbreviation as team_abbreviation,
      COUNT(pgs.game_id) as games_played,
      ROUND(AVG(pgs.points), 1) as ppg,
      ROUND(AVG(pgs.rebounds), 1) as rpg,
      ROUND(AVG(pgs.assists), 1) as apg
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams t ON pgs.team_id = t.team_id
    WHERE g.season = $1
    GROUP BY p.player_id, p.full_name, t.abbreviation
    HAVING COUNT(pgs.game_id) >= 5
    ORDER BY AVG(pgs.points) DESC
    LIMIT $2
  `, [currentSeason, limit])

  return result.rows
}

/**
 * Get team standings
 */
export async function getTeamStandings() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      t.team_id,
      t.abbreviation,
      t.full_name,
      ts.conference,
      COALESCE(ts.wins, 0) as wins,
      COALESCE(ts.losses, 0) as losses,
      CASE WHEN COALESCE(ts.wins, 0) + COALESCE(ts.losses, 0) > 0
        THEN ROUND(COALESCE(ts.wins, 0)::numeric / (COALESCE(ts.wins, 0) + COALESCE(ts.losses, 0)), 3)
        ELSE 0
      END as win_pct,
      COALESCE(ts.home_wins, 0) as home_wins,
      COALESCE(ts.home_losses, 0) as home_losses,
      COALESCE(ts.away_wins, 0) as away_wins,
      COALESCE(ts.away_losses, 0) as away_losses,
      COALESCE(ts.streak, '') as streak,
      COALESCE(ts.last_10, '') as last_10
    FROM teams t
    LEFT JOIN team_standings ts ON t.team_id = ts.team_id AND ts.season_id = $1
    ORDER BY COALESCE(ts.wins, 0) DESC, t.full_name
  `, [currentSeason])

  return result.rows
}

/**
 * Get sync logs
 */
export async function getSyncLogs(limit = 20) {
  const result = await query(`
    SELECT
      log_id,
      sync_type,
      status,
      records_processed,
      error_message,
      started_at,
      completed_at
    FROM sync_logs
    ORDER BY started_at DESC
    LIMIT $1
  `, [limit])

  return result.rows
}

/**
 * Insert a sync log entry
 */
export async function insertSyncLog(
  syncType: string,
  status: string,
  recordsProcessed: number,
  errorMessage?: string
) {
  const result = await query(`
    INSERT INTO sync_logs (sync_type, status, records_processed, error_message, started_at, completed_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING log_id
  `, [syncType, status, recordsProcessed, errorMessage || null])

  return result.rows[0]
}

/**
 * Search players by name
 */
export async function searchPlayers(searchQuery: string, limit = 10) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      p.player_id,
      p.first_name,
      p.last_name,
      p.full_name,
      p.position,
      p.jersey_number,
      t.abbreviation as team_abbreviation,
      t.full_name as team_name,
      COALESCE(stats.games_played, 0) as games_played,
      COALESCE(stats.points_avg, 0) as points_avg,
      COALESCE(stats.rebounds_avg, 0) as rebounds_avg,
      COALESCE(stats.assists_avg, 0) as assists_avg
    FROM players p
    LEFT JOIN teams t ON p.current_team_id = t.team_id
    LEFT JOIN LATERAL (
      SELECT
        COUNT(pgs.game_id)::int as games_played,
        ROUND(AVG(pgs.points), 1)::numeric as points_avg,
        ROUND(AVG(pgs.rebounds), 1)::numeric as rebounds_avg,
        ROUND(AVG(pgs.assists), 1)::numeric as assists_avg
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id AND g.season = $2
      WHERE pgs.player_id = p.player_id
    ) stats ON true
    WHERE p.full_name ILIKE $1
    ORDER BY stats.games_played DESC NULLS LAST, p.full_name
    LIMIT $3
  `, [`%${searchQuery}%`, currentSeason, limit])

  return result.rows
}

/**
 * Get team detailed stats
 */
export async function getTeamDetailedStats(teamId: number) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH team_games AS (
      SELECT
        g.game_id,
        g.game_date,
        CASE WHEN g.home_team_id = $1 THEN g.home_team_score ELSE g.away_team_score END as team_score,
        CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
        (g.home_team_score + g.away_team_score) as total,
        tgs.pace,
        tgs.offensive_rating,
        tgs.defensive_rating,
        ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as rn
      FROM games g
      JOIN team_game_stats tgs ON g.game_id = tgs.game_id AND tgs.team_id = $1
      WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
        AND g.season = $2
        AND g.game_status = 'Final'
    )
    SELECT
      t.team_id,
      t.abbreviation,
      t.full_name,
      ts.conference,
      COALESCE(ts.conference_rank, 15) as conference_rank,
      COALESCE(ts.wins, 0) as wins,
      COALESCE(ts.losses, 0) as losses,
      COALESCE(ts.streak, '-') as streak,
      (SELECT COUNT(*) FROM team_games) as games_played,
      ROUND((SELECT AVG(team_score) FROM team_games), 1) as ppg,
      ROUND((SELECT AVG(opp_score) FROM team_games), 1) as opp_ppg,
      ROUND((SELECT AVG(pace) FROM team_games), 1) as pace,
      ROUND((SELECT AVG(offensive_rating) FROM team_games), 1) as ortg,
      ROUND((SELECT AVG(defensive_rating) FROM team_games), 1) as drtg,
      ROUND((SELECT AVG(total) FROM team_games), 1) as avg_total,
      ROUND((SELECT STDDEV(total) FROM team_games), 1) as stddev_total,
      (SELECT MIN(total) FROM team_games) as min_total,
      (SELECT MAX(total) FROM team_games) as max_total,
      ROUND((SELECT AVG(team_score) FROM team_games WHERE rn <= 3), 1) as l3_ppg,
      ROUND((SELECT AVG(total) FROM team_games WHERE rn <= 3), 1) as l3_total,
      ROUND((SELECT AVG(team_score) FROM team_games WHERE rn <= 5), 1) as l5_ppg,
      ROUND((SELECT AVG(total) FROM team_games WHERE rn <= 5), 1) as l5_total,
      ROUND((SELECT AVG(team_score) FROM team_games WHERE rn <= 10), 1) as l10_ppg,
      ROUND((SELECT AVG(total) FROM team_games WHERE rn <= 10), 1) as l10_total,
      ROUND((SELECT COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM team_games), 0) FROM team_games WHERE total > 220.5), 1) as over_rate
    FROM teams t
    LEFT JOIN team_standings ts ON t.team_id = ts.team_id AND ts.season_id = $2
    WHERE t.team_id = $1
    GROUP BY t.team_id, t.abbreviation, t.full_name, ts.conference, ts.conference_rank, ts.wins, ts.losses, ts.streak
  `, [teamId, currentSeason])

  return result.rows[0] || null
}

/**
 * Get team game history for season calendar
 * Returns all season games (completed and upcoming)
 */
export async function getTeamGameHistory(teamId: number) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      g.game_status,
      CASE WHEN g.home_team_id = $1 THEN at.abbreviation ELSE ht.abbreviation END as opponent,
      (g.home_team_id = $1) as is_home,
      CASE WHEN g.home_team_id = $1 THEN g.home_team_score ELSE g.away_team_score END as team_pts,
      CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END as opp_pts,
      CASE
        WHEN g.game_status = 'Scheduled' THEN 'Scheduled'
        WHEN g.home_team_id = $1 AND g.home_team_score > g.away_team_score THEN 'W'
        WHEN g.away_team_id = $1 AND g.away_team_score > g.home_team_score THEN 'W'
        ELSE 'L'
      END as result,
      CASE
        WHEN g.game_status = 'Final' THEN
          (CASE WHEN g.home_team_id = $1 THEN g.home_team_score ELSE g.away_team_score END) -
          (CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END)
        ELSE NULL
      END as point_diff
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
      AND g.season = $2
    ORDER BY g.game_date ASC
  `, [teamId, currentSeason])

  return result.rows
}

/**
 * Get all teams ranking with advanced stats for quadrant scenarios
 */
export async function getAllTeamsRanking() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH game_totals AS (
      SELECT
        t.team_id,
        g.game_id,
        CASE WHEN g.home_team_id = t.team_id THEN g.home_team_score ELSE g.away_team_score END as team_score,
        CASE WHEN g.home_team_id = t.team_id THEN g.away_team_score ELSE g.home_team_score END as opp_score,
        (CASE WHEN g.home_team_id = t.team_id THEN g.home_team_score ELSE g.away_team_score END +
         CASE WHEN g.home_team_id = t.team_id THEN g.away_team_score ELSE g.home_team_score END) as total_pts
      FROM teams t
      JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
        AND g.season = $1 AND g.game_status = 'Final'
    )
    SELECT
      t.team_id,
      t.abbreviation,
      t.full_name,
      ts.conference,
      COALESCE(ts.wins, 0) as wins,
      COALESCE(ts.losses, 0) as losses,
      ROUND(AVG(gt.team_score), 1) as ppg,
      ROUND(AVG(gt.opp_score), 1) as opp_ppg,
      ROUND(AVG(tgs.pace), 1) as pace,
      ROUND(AVG(tgs.offensive_rating), 1) as ortg,
      ROUND(AVG(tgs.defensive_rating), 1) as drtg,
      ROUND(AVG(tgs.offensive_rating) - AVG(tgs.defensive_rating), 1) as net_rtg,
      ROUND(AVG(gt.total_pts), 1) as total_avg,
      ROUND(STDDEV(gt.total_pts), 1) as std_dev
    FROM teams t
    LEFT JOIN team_standings ts ON t.team_id = ts.team_id AND ts.season_id = $1
    LEFT JOIN game_totals gt ON t.team_id = gt.team_id
    LEFT JOIN team_game_stats tgs ON t.team_id = tgs.team_id
      AND tgs.game_id IN (SELECT game_id FROM games WHERE season = $1 AND game_status = 'Final')
    GROUP BY t.team_id, t.abbreviation, t.full_name, ts.conference, ts.wins, ts.losses
    ORDER BY COALESCE(ts.wins, 0) DESC
  `, [currentSeason])

  return result.rows
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      (SELECT COUNT(*) FROM games WHERE season = $1) as games_count,
      (SELECT COUNT(*) FROM player_game_stats pgs JOIN games g ON pgs.game_id = g.game_id WHERE g.season = $1) as player_stats_count,
      (SELECT COUNT(*) FROM teams) as teams_count,
      (SELECT COUNT(DISTINCT player_id) FROM player_game_stats pgs JOIN games g ON pgs.game_id = g.game_id WHERE g.season = $1) as players_count
  `, [currentSeason])

  return result.rows[0]
}

/**
 * Get players with stats
 */
export async function getPlayersWithStats(limit = 50) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      p.player_id,
      p.full_name,
      t.abbreviation as team_abbreviation,
      COUNT(pgs.game_id) as games_played,
      ROUND(AVG(pgs.points), 1) as ppg,
      ROUND(AVG(pgs.rebounds), 1) as rpg,
      ROUND(AVG(pgs.assists), 1) as apg,
      ROUND(AVG(pgs.minutes), 1) as mpg
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams t ON pgs.team_id = t.team_id
    WHERE g.season = $1
    GROUP BY p.player_id, p.full_name, t.abbreviation
    HAVING COUNT(pgs.game_id) >= 3
    ORDER BY AVG(pgs.points) DESC
    LIMIT $2
  `, [currentSeason, limit])

  return result.rows
}

/**
 * Get top performers
 */
export async function getTopPerformers(limit = 10) {
  return getTopPlayers(limit)
}

/**
 * Get recent games
 */
export async function getRecentGames(limit = 10): Promise<Game[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      ht.full_name as home_team,
      at.full_name as away_team,
      ht.abbreviation as home_abbreviation,
      at.abbreviation as away_abbreviation,
      g.home_team_score as home_score,
      g.away_team_score as away_score,
      g.game_status,
      g.season
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE g.season = $1 AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT $2
  `, [currentSeason, limit])

  return result.rows as Game[]
}

/**
 * Get today's games
 */
export async function getTodayGames(): Promise<Game[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      ht.full_name as home_team,
      at.full_name as away_team,
      ht.abbreviation as home_abbreviation,
      at.abbreviation as away_abbreviation,
      g.home_team_score as home_score,
      g.away_team_score as away_score,
      g.game_status,
      g.season
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE g.season = $1 AND DATE(g.game_date) = CURRENT_DATE
    ORDER BY g.game_date
  `, [currentSeason])

  return result.rows as Game[]
}

/**
 * Get upcoming games
 */
export async function getUpcomingGames(limit = 15): Promise<Game[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      ht.full_name as home_team,
      at.full_name as away_team,
      ht.abbreviation as home_abbreviation,
      at.abbreviation as away_abbreviation,
      g.home_team_score as home_score,
      g.away_team_score as away_score,
      g.game_status,
      g.season
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE g.season = $1
      AND DATE(g.game_date) > CURRENT_DATE
      AND g.game_status != 'Final'
    ORDER BY g.game_date
    LIMIT $2
  `, [currentSeason, limit])

  return result.rows as Game[]
}

// ============================================
// BETTING FUNCTIONS
// ============================================

/**
 * Get current odds for a market
 */
export async function getCurrentOdds(marketId: number): Promise<CurrentOdds | null> {
  const result = await query(`
    SELECT
      market_id,
      odds,
      recorded_at as timestamp
    FROM betting_odds
    WHERE market_id = $1
    ORDER BY recorded_at DESC
    LIMIT 1
  `, [marketId])

  return (result.rows[0] as CurrentOdds | undefined) || null
}

/**
 * Get odds history for a market
 */
export async function getOddsHistory(marketId: number, hours = 24): Promise<OddsDataPoint[]> {
  const result = await query(`
    SELECT
      recorded_at as timestamp,
      odds,
      market_id
    FROM betting_odds
    WHERE market_id = $1
      AND recorded_at > NOW() - INTERVAL '${hours} hours'
    ORDER BY recorded_at ASC
  `, [marketId])

  return result.rows as OddsDataPoint[]
}

/**
 * Get markets by event with optional market type filter
 */
export async function getMarketsByEvent(eventId: number, marketType?: string): Promise<Market[]> {
  const params = marketType ? [eventId, marketType] : [eventId]
  const marketTypeFilter = marketType ? ' AND market_type = $2' : ''

  const result = await query(`
    SELECT
      market_id,
      event_id,
      market_type,
      period,
      selection,
      line
    FROM betting_markets
    WHERE event_id = $1${marketTypeFilter}
    ORDER BY market_type, period
  `, params)

  return result.rows as Market[]
}

/**
 * Get betting value recommendations
 */
export async function getBettingValueRecommendations(days = 7, minConfidence = 0): Promise<BettingValueAnalysis[]> {
  const result = await query(`
    SELECT
      bva.analysis_id,
      bva.game_id,
      g.game_date,
      ht.abbreviation as home_team,
      at.abbreviation as away_team,
      g.home_team_score,
      g.away_team_score,
      g.game_status,
      bva.recommendation,
      bva.confidence,
      CASE
        WHEN bva.confidence >= 0.8 THEN 'high'
        WHEN bva.confidence >= 0.6 THEN 'medium'
        ELSE 'low'
      END as confidence_level,
      bva.factors,
      bva.result,
      bva.created_at,
      COALESCE(bva.total_value_score, bva.confidence * 100) as total_value_score,
      bva.value_tier,
      bva.positional_matchup_score,
      bva.betting_trend_score,
      bva.advanced_stats_score,
      COALESCE(bva.recommended_bet_type, 'spread') as recommended_bet_type,
      COALESCE(bva.recommended_side, 'home') as recommended_side
    FROM betting_value_analysis bva
    JOIN games g ON bva.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE bva.created_at > NOW() - INTERVAL '${days} days'
      AND bva.confidence >= $1
    ORDER BY bva.confidence DESC, bva.created_at DESC
  `, [minConfidence])

  return result.rows as BettingValueAnalysis[]
}

/**
 * Get player props stats for betting analysis
 */
export async function getPlayerPropsStats(playerId: number, games = 10) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      pgs.game_id,
      g.game_date,
      pgs.points,
      pgs.rebounds,
      pgs.assists,
      pgs.fg3_made,
      pgs.minutes,
      CASE WHEN g.home_team_id = pgs.team_id THEN 'HOME' ELSE 'AWAY' END as location
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    WHERE pgs.player_id = $1 AND g.season = $2
    ORDER BY g.game_date DESC
    LIMIT $3
  `, [playerId, currentSeason, games])

  return result.rows
}

/**
 * Get player props stats by names for betting analysis
 * Returns aggregated stats for multiple players with season, last 5, and home/away splits
 */
export async function getPlayerPropsStatsByNames(playerNames: string[], season?: string) {
  const currentSeason = season || await getCurrentSeason()

  if (playerNames.length === 0) return []

  // Create placeholders for player names
  const placeholders = playerNames.map((_, i) => `$${i + 2}`).join(', ')

  const result = await query(`
    WITH player_games AS (
      SELECT
        p.player_id,
        p.full_name,
        t.abbreviation as team,
        pgs.game_id,
        g.game_date,
        pgs.points,
        pgs.rebounds,
        pgs.assists,
        pgs.fg3_made,
        pgs.points + pgs.rebounds + pgs.assists as pra,
        CASE WHEN g.home_team_id = pgs.team_id THEN 'HOME' ELSE 'AWAY' END as location,
        ROW_NUMBER() OVER (PARTITION BY p.player_id ORDER BY g.game_date DESC) as game_num
      FROM players p
      JOIN player_game_stats pgs ON p.player_id = pgs.player_id
      JOIN games g ON pgs.game_id = g.game_id
      JOIN teams t ON pgs.team_id = t.team_id
      WHERE p.full_name IN (${placeholders})
        AND g.season = $1
        AND g.game_status = 'Final'
    )
    SELECT
      player_id,
      full_name,
      team,
      COUNT(*) as games_played,
      -- Season averages
      ROUND(AVG(points), 1) as season_ppg,
      ROUND(AVG(rebounds), 1) as season_rpg,
      ROUND(AVG(assists), 1) as season_apg,
      ROUND(AVG(fg3_made), 1) as season_three_pg,
      ROUND(AVG(pra), 1) as season_pra,
      -- Last 5 games
      ROUND(AVG(CASE WHEN game_num <= 5 THEN points END), 1) as last_5_ppg,
      ROUND(AVG(CASE WHEN game_num <= 5 THEN rebounds END), 1) as last_5_rpg,
      ROUND(AVG(CASE WHEN game_num <= 5 THEN assists END), 1) as last_5_apg,
      ROUND(AVG(CASE WHEN game_num <= 5 THEN fg3_made END), 1) as last_5_three_pg,
      ROUND(AVG(CASE WHEN game_num <= 5 THEN pra END), 1) as last_5_pra,
      -- Home stats
      ROUND(AVG(CASE WHEN location = 'HOME' THEN points END), 1) as home_ppg,
      ROUND(AVG(CASE WHEN location = 'HOME' THEN rebounds END), 1) as home_rpg,
      ROUND(AVG(CASE WHEN location = 'HOME' THEN assists END), 1) as home_apg,
      ROUND(AVG(CASE WHEN location = 'HOME' THEN fg3_made END), 1) as home_three_pg,
      ROUND(AVG(CASE WHEN location = 'HOME' THEN pra END), 1) as home_pra,
      -- Away stats
      ROUND(AVG(CASE WHEN location = 'AWAY' THEN points END), 1) as away_ppg,
      ROUND(AVG(CASE WHEN location = 'AWAY' THEN rebounds END), 1) as away_rpg,
      ROUND(AVG(CASE WHEN location = 'AWAY' THEN assists END), 1) as away_apg,
      ROUND(AVG(CASE WHEN location = 'AWAY' THEN fg3_made END), 1) as away_three_pg,
      ROUND(AVG(CASE WHEN location = 'AWAY' THEN pra END), 1) as away_pra
    FROM player_games
    GROUP BY player_id, full_name, team
  `, [currentSeason, ...playerNames])

  return result.rows.map(row => ({
    player_id: row.player_id,
    full_name: row.full_name,
    team: row.team,
    gp: row.games_played || '0',
    // Season averages
    season_ppg: row.season_ppg,
    season_rpg: row.season_rpg,
    season_apg: row.season_apg,
    season_three_pg: row.season_three_pg,
    season_pra: row.season_pra,
    // Last 5 games
    last_5_ppg: row.last_5_ppg,
    last_5_rpg: row.last_5_rpg,
    last_5_apg: row.last_5_apg,
    last_5_three_pg: row.last_5_three_pg,
    last_5_pra: row.last_5_pra,
    // Home stats
    home_ppg: row.home_ppg,
    home_rpg: row.home_rpg,
    home_apg: row.home_apg,
    home_three_pg: row.home_three_pg,
    home_pra: row.home_pra,
    // Away stats
    away_ppg: row.away_ppg,
    away_rpg: row.away_rpg,
    away_apg: row.away_apg,
    away_three_pg: row.away_three_pg,
    away_pra: row.away_pra,
  }))
}

/**
 * Get team defensive stats by abbreviation with location filter
 */
export async function getTeamDefensiveStats(teamAbbreviation: string, location: 'HOME' | 'AWAY', season?: string) {
  const currentSeason = season || await getCurrentSeason()

  const result = await query(`
    SELECT
      t.team_id,
      t.abbreviation,
      COUNT(g.game_id) as games_played,
      ROUND(AVG(
        CASE
          WHEN $2 = 'HOME' AND g.home_team_id = t.team_id THEN g.away_team_score
          WHEN $2 = 'AWAY' AND g.away_team_id = t.team_id THEN g.home_team_score
          ELSE NULL
        END
      ), 1) as avg_points_allowed,
      ROUND(AVG(
        CASE
          WHEN $2 = 'HOME' AND g.home_team_id = t.team_id THEN g.away_team_score
          WHEN $2 = 'AWAY' AND g.away_team_id = t.team_id THEN g.home_team_score
          ELSE NULL
        END
      ), 1) as def_rating_vs_avg
    FROM teams t
    JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
    WHERE t.abbreviation = $1 AND g.season = $3 AND g.game_status = 'Final'
    GROUP BY t.team_id, t.abbreviation
  `, [teamAbbreviation, location, currentSeason])

  return result.rows[0] || null
}

/**
 * Get team offensive splits by location
 */
export async function getTeamOffensiveSplits(teamAbbreviation: string, location: 'HOME' | 'AWAY', season?: string) {
  const currentSeason = season || await getCurrentSeason()

  const result = await query(`
    SELECT
      t.team_id,
      t.abbreviation,
      COUNT(g.game_id) as games_played,
      ROUND(AVG(
        CASE
          WHEN $2 = 'HOME' AND g.home_team_id = t.team_id THEN g.home_team_score
          WHEN $2 = 'AWAY' AND g.away_team_id = t.team_id THEN g.away_team_score
          ELSE NULL
        END
      ), 1) as avg_points_scored,
      ROUND(AVG(
        CASE
          WHEN $2 = 'HOME' AND g.home_team_id = t.team_id THEN g.home_team_score
          WHEN $2 = 'AWAY' AND g.away_team_id = t.team_id THEN g.away_team_score
          ELSE NULL
        END
      ) - (SELECT AVG(home_team_score + away_team_score) / 2 FROM games WHERE season = $3 AND game_status = 'Final'), 1) as off_rating_vs_avg
    FROM teams t
    JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
    WHERE t.abbreviation = $1
      AND g.season = $3
      AND g.game_status = 'Final'
      AND (
        ($2 = 'HOME' AND g.home_team_id = t.team_id) OR
        ($2 = 'AWAY' AND g.away_team_id = t.team_id)
      )
    GROUP BY t.team_id, t.abbreviation
  `, [teamAbbreviation, location, currentSeason])

  return result.rows[0] || null
}

/**
 * Get league averages
 */
export async function getLeagueAverages() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      ROUND(AVG(home_team_score + away_team_score), 1) as avg_total,
      ROUND(AVG(home_team_score), 1) as avg_home_score,
      ROUND(AVG(away_team_score), 1) as avg_away_score,
      COUNT(*) as games_analyzed
    FROM games
    WHERE season = $1 AND game_status = 'Final'
  `, [currentSeason])

  return result.rows[0]
}

/**
 * Get player vs opponent history
 */
export async function getPlayerVsOpponent(playerName: string, opponentAbbreviation: string, season?: string) {
  const currentSeason = season || await getCurrentSeason()

  const result = await query(`
    SELECT
      p.full_name,
      COUNT(pgs.game_id) as games,
      ROUND(AVG(pgs.points), 1) as ppg,
      ROUND(AVG(pgs.rebounds), 1) as rpg,
      ROUND(AVG(pgs.assists), 1) as apg,
      ROUND(AVG(pgs.fg3_made), 1) as three_pg,
      ROUND(AVG(pgs.points + pgs.rebounds + pgs.assists), 1) as pra
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams opp ON (g.home_team_id = opp.team_id OR g.away_team_id = opp.team_id)
    WHERE p.full_name = $1
      AND opp.abbreviation = $2
      AND opp.team_id != pgs.team_id
      AND g.season = $3
      AND g.game_status = 'Final'
    GROUP BY p.full_name
  `, [playerName, opponentAbbreviation, currentSeason])

  return result.rows
}

// ============================================
// QUARTER/HALF ANALYSIS FUNCTIONS
// ============================================

/**
 * Get Q1 value analysis
 */
export async function getQ1ValueAnalysis() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      t.team_id,
      t.abbreviation,
      t.full_name,
      COUNT(gqs.game_id) as games_played,
      ROUND(AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.home_q1 ELSE gqs.away_q1 END), 1) as avg_q1_score,
      ROUND(AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.away_q1 ELSE gqs.home_q1 END), 1) as avg_q1_allowed
    FROM teams t
    JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
    LEFT JOIN game_quarter_scores gqs ON g.game_id = gqs.game_id
    WHERE g.season = $1 AND g.game_status = 'Final'
    GROUP BY t.team_id, t.abbreviation, t.full_name
    HAVING COUNT(gqs.game_id) >= 3
    ORDER BY AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.home_q1 ELSE gqs.away_q1 END) DESC
  `, [currentSeason])

  return result.rows
}

/**
 * Get Q1 leaderboard with sorted categories
 */
export async function getQ1Leaderboard(limit = 10): Promise<Q1LeaderboardData> {
  const allStats = await getQ1TeamStats()

  return {
    // Best offense: highest Q1 scoring
    best_q1_offense: [...allStats]
      .sort((a, b) => b.q1_avg_scored - a.q1_avg_scored)
      .slice(0, limit),

    // Best defense: lowest Q1 allowed (ascending sort)
    best_q1_defense: [...allStats]
      .sort((a, b) => a.q1_avg_allowed - b.q1_avg_allowed)
      .slice(0, limit),

    // Best margin: highest Q1 differential
    best_q1_margin: [...allStats]
      .sort((a, b) => b.q1_margin - a.q1_margin)
      .slice(0, limit),

    // Best win %: highest Q1 win percentage
    best_q1_win_pct: [...allStats]
      .sort((a, b) => b.q1_win_pct - a.q1_win_pct)
      .slice(0, limit)
  }
}

/**
 * Get Q1 team stats with all metrics for leaderboards
 */
export async function getQ1TeamStats(): Promise<Q1TeamStats[]> {
  const currentSeason = await getCurrentSeason()

  // Extended query to include Q1 win percentage
  const result = await query(`
    SELECT
      t.team_id,
      t.abbreviation,
      t.full_name,
      COUNT(gqs.game_id) as games_played,
      ROUND(AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.home_q1 ELSE gqs.away_q1 END), 1) as avg_q1_score,
      ROUND(AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.away_q1 ELSE gqs.home_q1 END), 1) as avg_q1_allowed,
      COALESCE(SUM(CASE
        WHEN g.home_team_id = t.team_id AND gqs.home_q1 > gqs.away_q1 THEN 1
        WHEN g.away_team_id = t.team_id AND gqs.away_q1 > gqs.home_q1 THEN 1
        ELSE 0
      END)::FLOAT / NULLIF(COUNT(gqs.game_id), 0), 0) as q1_win_pct
    FROM teams t
    JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
    LEFT JOIN game_quarter_scores gqs ON g.game_id = gqs.game_id
    WHERE g.season = $1 AND g.game_status = 'Final'
    GROUP BY t.team_id, t.abbreviation, t.full_name
    HAVING COUNT(gqs.game_id) >= 3
    ORDER BY t.abbreviation
  `, [currentSeason])

  return result.rows.map((row: Record<string, unknown>) => {
    const avgScored = parseFloat(String(row.avg_q1_score)) || 0
    const avgAllowed = parseFloat(String(row.avg_q1_allowed)) || 0
    const margin = avgScored - avgAllowed

    return {
      team_id: row.team_id as number,
      abbreviation: row.abbreviation as string,
      team_abbreviation: row.abbreviation as string,
      team_name: row.full_name as string,
      games_played: row.games_played as number,
      avg_q1_score: avgScored,
      avg_q1_allowed: avgAllowed,
      q1_diff: margin,
      // Additional metrics for leaderboard
      q1_avg_scored: avgScored,
      q1_avg_allowed: avgAllowed,
      q1_margin: margin,
      q1_win_pct: parseFloat(String(row.q1_win_pct)) || 0
    }
  })
}

/**
 * Get today's games with Q1 matchup analysis
 */
export async function getQ1TodayGames(): Promise<Q1TodayGame[]> {
  const currentSeason = await getCurrentSeason()
  const today = new Date().toISOString().split('T')[0]

  // Get today's scheduled games with team Q1 stats
  const result = await query(`
    WITH team_q1_stats AS (
      SELECT
        t.team_id,
        t.abbreviation,
        COUNT(gqs.game_id) as games_played,
        COALESCE(AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.home_q1 ELSE gqs.away_q1 END), 0) as q1_avg,
        COALESCE(AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.away_q1 ELSE gqs.home_q1 END), 0) as q1_allowed,
        COALESCE(SUM(CASE
          WHEN g.home_team_id = t.team_id AND gqs.home_q1 > gqs.away_q1 THEN 1
          WHEN g.away_team_id = t.team_id AND gqs.away_q1 > gqs.home_q1 THEN 1
          ELSE 0
        END)::FLOAT / NULLIF(COUNT(gqs.game_id), 0), 0) as q1_win_pct
      FROM teams t
      JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
      LEFT JOIN game_quarter_scores gqs ON g.game_id = gqs.game_id
      WHERE g.season = $1 AND g.game_status = 'Final'
      GROUP BY t.team_id, t.abbreviation
    )
    SELECT
      g.game_id,
      ht.abbreviation as home_abbr,
      at.abbreviation as away_abbr,
      COALESCE(hts.q1_avg, 0) as home_q1_avg,
      COALESCE(hts.q1_allowed, 0) as home_q1_allowed,
      COALESCE(hts.q1_win_pct, 0) as home_q1_win_pct,
      COALESCE(hts.games_played, 0) as home_games_played,
      COALESCE(ats.q1_avg, 0) as away_q1_avg,
      COALESCE(ats.q1_allowed, 0) as away_q1_allowed,
      COALESCE(ats.q1_win_pct, 0) as away_q1_win_pct,
      COALESCE(ats.games_played, 0) as away_games_played
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN team_q1_stats hts ON ht.team_id = hts.team_id
    LEFT JOIN team_q1_stats ats ON at.team_id = ats.team_id
    WHERE g.season = $1 AND DATE(g.game_date) = $2
    ORDER BY g.game_date
  `, [currentSeason, today])

  return result.rows.map((row: Record<string, unknown>) => {
    const homeQ1Avg = parseFloat(String(row.home_q1_avg)) || 0
    const homeQ1Allowed = parseFloat(String(row.home_q1_allowed)) || 0
    const awayQ1Avg = parseFloat(String(row.away_q1_avg)) || 0
    const awayQ1Allowed = parseFloat(String(row.away_q1_allowed)) || 0

    // Simple projection: average of offense vs opposing defense
    const projectedHomeQ1 = (homeQ1Avg + awayQ1Allowed) / 2
    const projectedAwayQ1 = (awayQ1Avg + homeQ1Allowed) / 2

    // Simple model win probability based on projected margin
    const projectedMargin = projectedHomeQ1 - projectedAwayQ1
    const homeWinProb = Math.min(0.95, Math.max(0.05, 0.5 + projectedMargin * 0.05))

    return {
      game_id: String(row.game_id),
      home_abbr: String(row.home_abbr),
      away_abbr: String(row.away_abbr),
      home_q1_avg: homeQ1Avg,
      home_q1_allowed: homeQ1Allowed,
      home_q1_win_pct: parseFloat(String(row.home_q1_win_pct)) || 0,
      away_q1_avg: awayQ1Avg,
      away_q1_allowed: awayQ1Allowed,
      away_q1_win_pct: parseFloat(String(row.away_q1_win_pct)) || 0,
      home_games_played: parseInt(String(row.home_games_played)) || 0,
      away_games_played: parseInt(String(row.away_games_played)) || 0,
      projected_home_q1: projectedHomeQ1,
      projected_away_q1: projectedAwayQ1,
      home_model_win_prob: homeWinProb,
      away_model_win_prob: 1 - homeWinProb
    }
  })
}

/**
 * Get team quarter trends
 */
export async function getTeamQuarterTrends(teamAbbr: string) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      'Q1' as quarter,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.home_q1 ELSE gqs.away_q1 END), 1) as avg_score,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.away_q1 ELSE gqs.home_q1 END), 1) as avg_allowed
    FROM game_quarter_scores gqs
    JOIN games g ON gqs.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE (ht.abbreviation = $1 OR at.abbreviation = $1) AND g.season = $2
    UNION ALL
    SELECT
      'Q2' as quarter,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.home_q2 ELSE gqs.away_q2 END), 1) as avg_score,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.away_q2 ELSE gqs.home_q2 END), 1) as avg_allowed
    FROM game_quarter_scores gqs
    JOIN games g ON gqs.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE (ht.abbreviation = $1 OR at.abbreviation = $1) AND g.season = $2
    UNION ALL
    SELECT
      'Q3' as quarter,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.home_q3 ELSE gqs.away_q3 END), 1) as avg_score,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.away_q3 ELSE gqs.home_q3 END), 1) as avg_allowed
    FROM game_quarter_scores gqs
    JOIN games g ON gqs.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE (ht.abbreviation = $1 OR at.abbreviation = $1) AND g.season = $2
    UNION ALL
    SELECT
      'Q4' as quarter,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.home_q4 ELSE gqs.away_q4 END), 1) as avg_score,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.away_q4 ELSE gqs.home_q4 END), 1) as avg_allowed
    FROM game_quarter_scores gqs
    JOIN games g ON gqs.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE (ht.abbreviation = $1 OR at.abbreviation = $1) AND g.season = $2
  `, [teamAbbr, currentSeason])

  return result.rows
}

/**
 * Get team half trends
 */
export async function getTeamHalfTrends(teamAbbr: string) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      '1H' as half,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.home_q1 + gqs.home_q2 ELSE gqs.away_q1 + gqs.away_q2 END), 1) as avg_score,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.away_q1 + gqs.away_q2 ELSE gqs.home_q1 + gqs.home_q2 END), 1) as avg_allowed
    FROM game_quarter_scores gqs
    JOIN games g ON gqs.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE (ht.abbreviation = $1 OR at.abbreviation = $1) AND g.season = $2
    UNION ALL
    SELECT
      '2H' as half,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.home_q3 + gqs.home_q4 ELSE gqs.away_q3 + gqs.away_q4 END), 1) as avg_score,
      ROUND(AVG(CASE WHEN ht.abbreviation = $1 THEN gqs.away_q3 + gqs.away_q4 ELSE gqs.home_q3 + gqs.home_q4 END), 1) as avg_allowed
    FROM game_quarter_scores gqs
    JOIN games g ON gqs.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE (ht.abbreviation = $1 OR at.abbreviation = $1) AND g.season = $2
  `, [teamAbbr, currentSeason])

  return result.rows
}

/**
 * Get game quarter scores
 */
export async function getGameQuarterScores(gameId: string) {
  const result = await query(`
    SELECT
      gqs.*,
      ht.abbreviation as home_abbr,
      at.abbreviation as away_abbr
    FROM game_quarter_scores gqs
    JOIN games g ON gqs.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE gqs.game_id = $1
  `, [gameId])

  return result.rows[0] || null
}

/**
 * Get all teams Q1 stats
 */
export async function getAllTeamsQ1Stats() {
  return getQ1TeamStats()
}

/**
 * Get all teams 1H stats
 */
export async function getAllTeams1HStats() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      t.team_id,
      t.abbreviation,
      t.full_name,
      COUNT(gqs.game_id) as games_played,
      ROUND(AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.home_q1 + gqs.home_q2 ELSE gqs.away_q1 + gqs.away_q2 END), 1) as avg_1h_score,
      ROUND(AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.away_q1 + gqs.away_q2 ELSE gqs.home_q1 + gqs.home_q2 END), 1) as avg_1h_allowed
    FROM teams t
    JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
    LEFT JOIN game_quarter_scores gqs ON g.game_id = gqs.game_id
    WHERE g.season = $1 AND g.game_status = 'Final'
    GROUP BY t.team_id, t.abbreviation, t.full_name
    HAVING COUNT(gqs.game_id) >= 3
    ORDER BY AVG(CASE WHEN g.home_team_id = t.team_id THEN gqs.home_q1 + gqs.home_q2 ELSE gqs.away_q1 + gqs.away_q2 END) DESC
  `, [currentSeason])

  return result.rows
}

// ============================================
// TEAM DEFENSE FUNCTIONS
// ============================================

/**
 * Get team defensive performance
 */
export async function getTeamDefensivePerformance(
  teamId: number,
  filters: { location?: 'HOME' | 'AWAY'; limit?: number } = {}
): Promise<TeamDefenseGame[]> {
  const currentSeason = await getCurrentSeason()
  const { location, limit = 20 } = filters

  let whereClause = '(g.home_team_id = $1 OR g.away_team_id = $1) AND g.season = $2 AND g.game_status = \'Final\''
  if (location === 'HOME') {
    whereClause = 'g.home_team_id = $1 AND g.season = $2 AND g.game_status = \'Final\''
  } else if (location === 'AWAY') {
    whereClause = 'g.away_team_id = $1 AND g.season = $2 AND g.game_status = \'Final\''
  }

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      CASE WHEN g.home_team_id = $1 THEN at.abbreviation ELSE ht.abbreviation END as opponent,
      CASE WHEN g.home_team_id = $1 THEN 'HOME' ELSE 'AWAY' END as location,
      CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END as points_allowed,
      CASE WHEN g.home_team_id = $1 THEN g.home_team_score ELSE g.away_team_score END as team_points,
      g.home_team_score + g.away_team_score as total
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE ${whereClause}
    ORDER BY g.game_date DESC
    LIMIT $3
  `, [teamId, currentSeason, limit])

  return result.rows as TeamDefenseGame[]
}

/**
 * Get all teams
 */
export async function getAllTeams(): Promise<TeamOption[]> {
  const result = await query(`
    SELECT team_id, abbreviation, full_name
    FROM teams
    ORDER BY full_name
  `)

  return result.rows as TeamOption[]
}

/**
 * Get team players
 */
export async function getTeamPlayers(teamId: number): Promise<TeamPlayer[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      p.player_id,
      p.full_name,
      p.position,
      COUNT(pgs.game_id) as games_played
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    JOIN games g ON pgs.game_id = g.game_id
    WHERE pgs.team_id = $1 AND g.season = $2
    GROUP BY p.player_id, p.full_name, p.position
    HAVING COUNT(pgs.game_id) >= 3
    ORDER BY COUNT(pgs.game_id) DESC
  `, [teamId, currentSeason])

  return result.rows as TeamPlayer[]
}

/**
 * Get team defensive performance by player
 */
export async function getTeamDefensivePerformanceByPlayer(
  teamId: number,
  playerId: number,
  filters: { location?: 'HOME' | 'AWAY'; limit?: number } = {}
): Promise<PlayerImpactGame[]> {
  const currentSeason = await getCurrentSeason()
  const { location, limit = 20 } = filters

  let locationFilter = ''
  if (location === 'HOME') {
    locationFilter = 'AND g.home_team_id = $1'
  } else if (location === 'AWAY') {
    locationFilter = 'AND g.away_team_id = $1'
  }

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      CASE WHEN g.home_team_id = $1 THEN at.abbreviation ELSE ht.abbreviation END as opponent,
      CASE WHEN g.home_team_id = $1 THEN 'HOME' ELSE 'AWAY' END as location,
      EXISTS(SELECT 1 FROM player_game_stats WHERE game_id = g.game_id AND player_id = $2) as player_played,
      CASE WHEN g.home_team_id = $1 THEN g.home_team_score ELSE g.away_team_score END as team_points,
      CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END as opponent_points,
      g.home_team_score + g.away_team_score as total
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
      AND g.season = $3
      AND g.game_status = 'Final'
      ${locationFilter}
    ORDER BY g.game_date DESC
    LIMIT $4
  `, [teamId, playerId, currentSeason, limit])

  return result.rows as PlayerImpactGame[]
}

// ============================================
// ADVANCED STATS FUNCTIONS
// ============================================

/**
 * Get team-wide absence impact by team abbreviation
 * Used by the API route for AbsenceImpactSection component
 */
export async function getTeamAbsenceImpact(
  teamAbbr: string,
  minGames = 2
): Promise<TeammateAbsenceImpact[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH team_players AS (
      SELECT DISTINCT p.player_id, p.full_name, t.team_id
      FROM players p
      JOIN player_game_stats pgs ON p.player_id = pgs.player_id
      JOIN games g ON pgs.game_id = g.game_id
      JOIN teams t ON pgs.team_id = t.team_id
      WHERE t.abbreviation = $1 AND g.season = $2 AND pgs.minutes > 10
    ),
    player_game_data AS (
      SELECT
        pgs.player_id,
        pgs.game_id,
        pgs.points,
        pgs.minutes,
        CASE WHEN pgs.minutes > 0 AND (
          SELECT SUM(fg_attempted + 0.44 * ft_attempted + turnovers)
          FROM player_game_stats pgs2
          JOIN games g2 ON pgs2.game_id = g2.game_id
          WHERE pgs2.game_id = pgs.game_id AND pgs2.team_id = tp.team_id AND pgs2.minutes > 0
        ) > 0 THEN
          (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers) /
          (SELECT SUM(fg_attempted + 0.44 * ft_attempted + turnovers)
           FROM player_game_stats pgs2
           JOIN games g2 ON pgs2.game_id = g2.game_id
           WHERE pgs2.game_id = pgs.game_id AND pgs2.team_id = tp.team_id AND pgs2.minutes > 0)
        ELSE 0 END as usage_pct
      FROM team_players tp
      JOIN player_game_stats pgs ON tp.player_id = pgs.player_id AND pgs.team_id = tp.team_id
      JOIN games g ON pgs.game_id = g.game_id
      WHERE g.season = $2
    ),
    teammate_presence AS (
      SELECT
        tp.player_id,
        tp.full_name as player_name,
        tp2.player_id as teammate_id,
        tp2.full_name as teammate_name,
        g.game_id,
        EXISTS (
          SELECT 1 FROM player_game_stats pgs
          WHERE pgs.player_id = tp2.player_id AND pgs.game_id = g.game_id AND pgs.minutes > 0
        ) as teammate_played
      FROM team_players tp
      CROSS JOIN team_players tp2
      JOIN player_game_stats pgs ON tp.player_id = pgs.player_id
      JOIN games g ON pgs.game_id = g.game_id
      WHERE tp.player_id != tp2.player_id AND g.season = $2
    )
    SELECT
      tpr.player_id,
      tpr.player_name,
      tpr.teammate_id as absent_teammate_id,
      tpr.teammate_name as absent_teammate_name,
      COUNT(CASE WHEN tpr.teammate_played THEN 1 END) as games_with,
      COUNT(CASE WHEN NOT tpr.teammate_played THEN 1 END) as games_without,
      ROUND(AVG(CASE WHEN tpr.teammate_played THEN pgd.usage_pct END) * 100, 1) as usage_with,
      ROUND(AVG(CASE WHEN NOT tpr.teammate_played THEN pgd.usage_pct END) * 100, 1) as usage_without,
      ROUND((AVG(CASE WHEN NOT tpr.teammate_played THEN pgd.usage_pct END) -
             AVG(CASE WHEN tpr.teammate_played THEN pgd.usage_pct END)) * 100, 1) as usage_diff,
      ROUND(AVG(CASE WHEN tpr.teammate_played THEN pgd.points END), 1) as pts_with,
      ROUND(AVG(CASE WHEN NOT tpr.teammate_played THEN pgd.points END), 1) as pts_without,
      ROUND(AVG(CASE WHEN NOT tpr.teammate_played THEN pgd.points END) -
            AVG(CASE WHEN tpr.teammate_played THEN pgd.points END), 1) as pts_diff
    FROM teammate_presence tpr
    JOIN player_game_data pgd ON tpr.player_id = pgd.player_id AND tpr.game_id = pgd.game_id
    GROUP BY tpr.player_id, tpr.player_name, tpr.teammate_id, tpr.teammate_name
    HAVING COUNT(CASE WHEN NOT tpr.teammate_played THEN 1 END) >= $3
    ORDER BY ABS(usage_diff) DESC NULLS LAST
    LIMIT 50
  `, [teamAbbr, currentSeason, minGames])

  return result.rows.map((row: Record<string, unknown>) => ({
    player_id: row.player_id as number,
    player_name: row.player_name as string,
    absent_teammate_id: row.absent_teammate_id as number,
    absent_teammate_name: row.absent_teammate_name as string,
    games_with: parseInt(String(row.games_with)) || 0,
    games_without: parseInt(String(row.games_without)) || 0,
    usage_with: parseFloat(String(row.usage_with)) || 0,
    usage_without: parseFloat(String(row.usage_without)) || 0,
    usage_diff: parseFloat(String(row.usage_diff)) || 0,
    pts_with: parseFloat(String(row.pts_with)) || 0,
    pts_without: parseFloat(String(row.pts_without)) || 0,
    pts_diff: parseFloat(String(row.pts_diff)) || 0
  }))
}

/**
 * Get teammate absence impact for a specific player
 */
export async function getTeammateAbsenceImpact(
  teamId: number,
  playerId: number,
  minGames = 3
): Promise<TeammateAbsenceImpact[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH player_games AS (
      SELECT g.game_id, pgs.points, pgs.minutes,
             CASE WHEN pgs.minutes > 0 THEN
               (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers) /
               (SELECT SUM(fg_attempted + 0.44 * ft_attempted + turnovers)
                FROM player_game_stats pgs2
                WHERE pgs2.game_id = g.game_id AND pgs2.team_id = $1 AND pgs2.minutes > 0)
             ELSE 0 END as usage_pct
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      WHERE pgs.player_id = $2 AND pgs.team_id = $1 AND g.season = $3
    ),
    teammate_games AS (
      SELECT
        p.player_id as teammate_id,
        p.full_name as teammate_name,
        g.game_id,
        pgs.minutes > 0 as played
      FROM players p
      JOIN player_game_stats pgs ON p.player_id = pgs.player_id
      JOIN games g ON pgs.game_id = g.game_id
      WHERE pgs.team_id = $1 AND g.season = $3 AND p.player_id != $2
    )
    SELECT
      $2::bigint as player_id,
      (SELECT full_name FROM players WHERE player_id = $2) as player_name,
      tg.teammate_id as absent_teammate_id,
      tg.teammate_name as absent_teammate_name,
      COUNT(CASE WHEN NOT tg.played THEN 1 END) as games_without,
      COUNT(CASE WHEN tg.played THEN 1 END) as games_with,
      ROUND(AVG(CASE WHEN NOT tg.played THEN pg.points END), 1) as pts_without,
      ROUND(AVG(CASE WHEN tg.played THEN pg.points END), 1) as pts_with,
      ROUND(AVG(CASE WHEN NOT tg.played THEN pg.points END) - AVG(CASE WHEN tg.played THEN pg.points END), 1) as pts_diff,
      ROUND(AVG(CASE WHEN NOT tg.played THEN pg.usage_pct END) * 100, 1) as usage_without,
      ROUND(AVG(CASE WHEN tg.played THEN pg.usage_pct END) * 100, 1) as usage_with,
      ROUND((AVG(CASE WHEN NOT tg.played THEN pg.usage_pct END) - AVG(CASE WHEN tg.played THEN pg.usage_pct END)) * 100, 1) as usage_diff
    FROM teammate_games tg
    JOIN player_games pg ON tg.game_id = pg.game_id
    GROUP BY tg.teammate_id, tg.teammate_name
    HAVING COUNT(CASE WHEN NOT tg.played THEN 1 END) >= $4
    ORDER BY pts_diff DESC NULLS LAST
  `, [teamId, playerId, currentSeason, minGames])

  return result.rows as TeammateAbsenceImpact[]
}

/**
 * Get usage leaders
 */
export async function getUsageLeaders(minGames = 5, limit = 30): Promise<PlayerAdvancedSeasonStats[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      p.player_id,
      p.full_name,
      t.abbreviation as team_abbreviation,
      COUNT(pgs.game_id) as games_played,
      ROUND(AVG(pgs.points), 1) as ppg,
      ROUND(AVG(
        CASE WHEN (SELECT SUM(fg_attempted + 0.44 * ft_attempted + turnovers)
                   FROM player_game_stats pgs2
                   WHERE pgs2.game_id = pgs.game_id AND pgs2.team_id = pgs.team_id AND pgs2.minutes > 0) > 0
        THEN (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers) /
             (SELECT SUM(fg_attempted + 0.44 * ft_attempted + turnovers)
              FROM player_game_stats pgs2
              WHERE pgs2.game_id = pgs.game_id AND pgs2.team_id = pgs.team_id AND pgs2.minutes > 0) * 100
        ELSE 0 END
      ), 1) as avg_usage,
      ROUND(AVG(
        CASE WHEN (pgs.fg_attempted + 0.44 * pgs.ft_attempted) > 0
        THEN pgs.points / (2 * (pgs.fg_attempted + 0.44 * pgs.ft_attempted))
        ELSE 0 END
      ), 3) as avg_ts,
      ROUND(AVG(
        CASE WHEN pgs.fg_attempted > 0
        THEN (pgs.fg_made + 0.5 * pgs.fg3_made) / pgs.fg_attempted
        ELSE 0 END
      ), 3) as avg_efg
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams t ON pgs.team_id = t.team_id
    WHERE g.season = $1 AND pgs.minutes > 0
    GROUP BY p.player_id, p.full_name, t.abbreviation
    HAVING COUNT(pgs.game_id) >= $2
    ORDER BY avg_usage DESC
    LIMIT $3
  `, [currentSeason, minGames, limit])

  return result.rows as PlayerAdvancedSeasonStats[]
}

/**
 * Get efficiency leaders
 */
export async function getEfficiencyLeaders(minGames = 5, limit = 30): Promise<PlayerAdvancedSeasonStats[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      p.player_id,
      p.full_name,
      t.abbreviation as team_abbreviation,
      COUNT(pgs.game_id) as games_played,
      ROUND(AVG(pgs.points), 1) as ppg,
      ROUND(AVG(
        CASE WHEN (SELECT SUM(fg_attempted + 0.44 * ft_attempted + turnovers)
                   FROM player_game_stats pgs2
                   WHERE pgs2.game_id = pgs.game_id AND pgs2.team_id = pgs.team_id AND pgs2.minutes > 0) > 0
        THEN (pgs.fg_attempted + 0.44 * pgs.ft_attempted + pgs.turnovers) /
             (SELECT SUM(fg_attempted + 0.44 * ft_attempted + turnovers)
              FROM player_game_stats pgs2
              WHERE pgs2.game_id = pgs.game_id AND pgs2.team_id = pgs.team_id AND pgs2.minutes > 0) * 100
        ELSE 0 END
      ), 1) as avg_usage,
      ROUND(AVG(
        CASE WHEN (pgs.fg_attempted + 0.44 * pgs.ft_attempted) > 0
        THEN pgs.points / (2 * (pgs.fg_attempted + 0.44 * pgs.ft_attempted))
        ELSE 0 END
      ), 3) as avg_ts,
      ROUND(AVG(
        CASE WHEN pgs.fg_attempted > 0
        THEN (pgs.fg_made + 0.5 * pgs.fg3_made) / pgs.fg_attempted
        ELSE 0 END
      ), 3) as avg_efg
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams t ON pgs.team_id = t.team_id
    WHERE g.season = $1 AND pgs.minutes > 0
    GROUP BY p.player_id, p.full_name, t.abbreviation
    HAVING COUNT(pgs.game_id) >= $2
    ORDER BY avg_ts DESC
    LIMIT $3
  `, [currentSeason, minGames, limit])

  return result.rows as PlayerAdvancedSeasonStats[]
}

/**
 * Get best defenses against position
 */
export async function getBestDefensesAgainstPosition(position: string, limit = 5): Promise<DefensiveStatsByPosition[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      t.team_id,
      t.abbreviation as team_abbreviation,
      t.full_name as team_full_name,
      $1 as position,
      ROUND(AVG(pgs.points), 1) as points_allowed_per_game,
      RANK() OVER (ORDER BY AVG(pgs.points) ASC) as points_allowed_rank,
      ROUND(AVG(CASE WHEN pgs.fg_attempted > 0 THEN pgs.fg_made::numeric / pgs.fg_attempted * 100 ELSE 0 END), 1) as fg_pct_allowed,
      ROUND(AVG(pgs.rebounds), 1) as rebounds_allowed_per_game,
      ROUND(AVG(pgs.assists), 1) as assists_allowed_per_game
    FROM player_game_stats pgs
    JOIN players p ON pgs.player_id = p.player_id
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams t ON (CASE WHEN g.home_team_id = pgs.team_id THEN g.away_team_id ELSE g.home_team_id END) = t.team_id
    WHERE p.position = $1 AND g.season = $2 AND g.game_status = 'Final'
    GROUP BY t.team_id, t.abbreviation, t.full_name
    ORDER BY points_allowed_per_game ASC
    LIMIT $3
  `, [position, currentSeason, limit])

  return result.rows as DefensiveStatsByPosition[]
}

/**
 * Get worst defenses against position
 */
export async function getWorstDefensesAgainstPosition(position: string, limit = 5): Promise<DefensiveStatsByPosition[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      t.team_id,
      t.abbreviation as team_abbreviation,
      t.full_name as team_full_name,
      $1 as position,
      ROUND(AVG(pgs.points), 1) as points_allowed_per_game,
      RANK() OVER (ORDER BY AVG(pgs.points) DESC) as points_allowed_rank,
      ROUND(AVG(CASE WHEN pgs.fg_attempted > 0 THEN pgs.fg_made::numeric / pgs.fg_attempted * 100 ELSE 0 END), 1) as fg_pct_allowed,
      ROUND(AVG(pgs.rebounds), 1) as rebounds_allowed_per_game,
      ROUND(AVG(pgs.assists), 1) as assists_allowed_per_game
    FROM player_game_stats pgs
    JOIN players p ON pgs.player_id = p.player_id
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams t ON (CASE WHEN g.home_team_id = pgs.team_id THEN g.away_team_id ELSE g.home_team_id END) = t.team_id
    WHERE p.position = $1 AND g.season = $2 AND g.game_status = 'Final'
    GROUP BY t.team_id, t.abbreviation, t.full_name
    ORDER BY points_allowed_per_game DESC
    LIMIT $3
  `, [position, currentSeason, limit])

  return result.rows as DefensiveStatsByPosition[]
}

// ============================================
// PACE ANALYSIS FUNCTIONS
// ============================================

/**
 * Get team pace rankings
 */
export interface PaceRanking {
  team_id: number | string
  team: string
  pace: number | string
  ppg: number | string
  opp_ppg: number | string
  l3_ppg: number | string
  l10_ppg: number | string
  avg_total: number | string
  l3_total: number | string
  l10_total: number | string
  off_rtg: number | string
  games: number | string
}

export async function getTeamPaceRankings(): Promise<PaceRanking[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH team_games AS (
      SELECT
        t.team_id,
        t.abbreviation as team,
        g.game_id,
        g.game_date,
        CASE WHEN g.home_team_id = t.team_id THEN g.home_team_score ELSE g.away_team_score END as team_score,
        CASE WHEN g.home_team_id = t.team_id THEN g.away_team_score ELSE g.home_team_score END as opp_score,
        g.home_team_score + g.away_team_score as total,
        CASE WHEN g.home_team_id = t.team_id THEN tgs_home.possessions ELSE tgs_away.possessions END as possessions,
        ROW_NUMBER() OVER (PARTITION BY t.team_id ORDER BY g.game_date DESC) as game_num
      FROM teams t
      JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
      LEFT JOIN team_game_stats tgs_home ON g.game_id = tgs_home.game_id AND g.home_team_id = tgs_home.team_id
      LEFT JOIN team_game_stats tgs_away ON g.game_id = tgs_away.game_id AND g.away_team_id = tgs_away.team_id
      WHERE g.season = $1 AND g.game_status = 'Final'
    )
    SELECT
      team_id,
      team,
      COUNT(*) as games,
      ROUND(AVG(possessions), 1) as pace,
      ROUND(AVG(team_score), 1) as ppg,
      ROUND(AVG(opp_score), 1) as opp_ppg,
      ROUND(AVG(CASE WHEN game_num <= 3 THEN team_score END), 1) as l3_ppg,
      ROUND(AVG(CASE WHEN game_num <= 10 THEN team_score END), 1) as l10_ppg,
      ROUND(AVG(total), 1) as avg_total,
      ROUND(AVG(CASE WHEN game_num <= 3 THEN total END), 1) as l3_total,
      ROUND(AVG(CASE WHEN game_num <= 10 THEN total END), 1) as l10_total,
      ROUND(AVG(team_score) / NULLIF(AVG(possessions), 0) * 100, 1) as off_rtg
    FROM team_games
    GROUP BY team_id, team
    ORDER BY pace DESC NULLS LAST
  `, [currentSeason])

  return result.rows as PaceRanking[]
}

/**
 * Get pace correlations
 */
export async function getPaceCorrelations() {
  // Return placeholder correlations - would need actual calculation
  return {
    pace_vs_ppg: 0.45,
    pace_vs_total: 0.62,
    ortg_vs_total: 0.78,
    pace_x_ortg_vs_total: 0.95
  }
}

/**
 * Get matchup type stats
 */
export interface MatchupTypeStats {
  matchup_type: string
  games: number | string
  avg_total: number | string
  min_total: number | string
  max_total: number | string
  stddev: number | string
}

export async function getMatchupTypeStats(): Promise<MatchupTypeStats[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      CASE
        WHEN ht_pace.pace > 100 AND at_pace.pace > 100 THEN 'FAST vs FAST'
        WHEN ht_pace.pace < 98 AND at_pace.pace < 98 THEN 'SLOW vs SLOW'
        ELSE 'MISMATCH'
      END as matchup_type,
      COUNT(g.game_id) as games,
      ROUND(AVG(g.home_team_score + g.away_team_score), 1) as avg_total,
      MIN(g.home_team_score + g.away_team_score) as min_total,
      MAX(g.home_team_score + g.away_team_score) as max_total,
      ROUND(STDDEV(g.home_team_score + g.away_team_score), 1) as stddev
    FROM games g
    JOIN (
      SELECT team_id, AVG(possessions) as pace
      FROM team_game_stats tgs
      JOIN games g ON tgs.game_id = g.game_id
      WHERE g.season = $1
      GROUP BY team_id
    ) ht_pace ON g.home_team_id = ht_pace.team_id
    JOIN (
      SELECT team_id, AVG(possessions) as pace
      FROM team_game_stats tgs
      JOIN games g ON tgs.game_id = g.game_id
      WHERE g.season = $1
      GROUP BY team_id
    ) at_pace ON g.away_team_id = at_pace.team_id
    WHERE g.season = $1 AND g.game_status = 'Final'
    GROUP BY matchup_type
    ORDER BY avg_total DESC
  `, [currentSeason])

  return result.rows as MatchupTypeStats[]
}

/**
 * Get pace scoring scatter data
 */
export async function getPaceScoringScatterData() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      ht.abbreviation as home_team,
      at.abbreviation as away_team,
      COALESCE(tgs_home.possessions, 0) + COALESCE(tgs_away.possessions, 0) as combined_pace,
      g.home_team_score + g.away_team_score as total
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN team_game_stats tgs_home ON g.game_id = tgs_home.game_id AND g.home_team_id = tgs_home.team_id
    LEFT JOIN team_game_stats tgs_away ON g.game_id = tgs_away.game_id AND g.away_team_id = tgs_away.team_id
    WHERE g.season = $1 AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT 100
  `, [currentSeason])

  return result.rows
}

/**
 * Get teams list for dropdowns
 */
export async function getTeamsList(): Promise<TeamOption[]> {
  return getAllTeams()
}

// ============================================
// LINEUPS FUNCTIONS
// ============================================

/**
 * Get today's lineups
 */
export async function getTodayLineups(): Promise<GameWithLineups[]> {
  // This would typically query a lineups table populated by a scraper
  // For now, return empty array as placeholder
  return []
}

/**
 * Get today's injury report
 */
export async function getTodayInjuryReport(): Promise<InjuryReport[]> {
  // This would typically query an injury report table
  // For now, return empty array as placeholder
  return []
}

// ============================================
// PLAYER DETAIL FUNCTIONS
// ============================================

/**
 * Get player stats with league-wide rankings
 */
export async function getPlayerStatsWithRankings(playerId: number) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH player_stats AS (
      SELECT
        p.player_id,
        p.full_name,
        p.position,
        t.abbreviation as team_abbreviation,
        t.full_name as team_name,
        COUNT(pgs.game_id) as games_played,
        ROUND(AVG(pgs.points), 1) as ppg,
        ROUND(AVG(pgs.rebounds), 1) as rpg,
        ROUND(AVG(pgs.assists), 1) as apg,
        ROUND(AVG(pgs.steals), 1) as spg,
        ROUND(AVG(pgs.blocks), 1) as bpg,
        ROUND(AVG(pgs.minutes), 1) as mpg,
        ROUND(AVG(CASE WHEN pgs.fg_attempted > 0 THEN pgs.fg_made::numeric / pgs.fg_attempted * 100 ELSE 0 END), 1) as fg_pct,
        ROUND(AVG(CASE WHEN pgs.fg3_attempted > 0 THEN pgs.fg3_made::numeric / pgs.fg3_attempted * 100 ELSE 0 END), 1) as fg3_pct,
        ROUND(AVG(CASE WHEN pgs.ft_attempted > 0 THEN pgs.ft_made::numeric / pgs.ft_attempted * 100 ELSE 0 END), 1) as ft_pct
      FROM players p
      JOIN player_game_stats pgs ON p.player_id = pgs.player_id
      JOIN games g ON pgs.game_id = g.game_id
      JOIN teams t ON pgs.team_id = t.team_id
      WHERE g.season = $2
      GROUP BY p.player_id, p.full_name, p.position, t.abbreviation, t.full_name
      HAVING COUNT(pgs.game_id) >= 5
    ),
    ranked_stats AS (
      SELECT
        *,
        RANK() OVER (ORDER BY ppg DESC) as ppg_rank,
        RANK() OVER (ORDER BY rpg DESC) as rpg_rank,
        RANK() OVER (ORDER BY apg DESC) as apg_rank,
        RANK() OVER (ORDER BY spg DESC) as spg_rank,
        RANK() OVER (ORDER BY bpg DESC) as bpg_rank,
        RANK() OVER (ORDER BY mpg DESC) as mpg_rank,
        RANK() OVER (ORDER BY fg_pct DESC) as fg_pct_rank,
        RANK() OVER (ORDER BY fg3_pct DESC) as fg3_pct_rank,
        RANK() OVER (ORDER BY ft_pct DESC) as ft_pct_rank
      FROM player_stats
    )
    SELECT * FROM ranked_stats WHERE player_id = $1
  `, [playerId, currentSeason])

  const row = result.rows[0]
  if (!row) return null

  // Parse numeric values to JavaScript numbers
  return {
    player_id: row.player_id,
    full_name: row.full_name,
    position: row.position,
    team_abbreviation: row.team_abbreviation,
    team_name: row.team_name,
    games_played: parseInt(row.games_played) || 0,
    ppg: parseFloat(row.ppg) || 0,
    rpg: parseFloat(row.rpg) || 0,
    apg: parseFloat(row.apg) || 0,
    spg: parseFloat(row.spg) || 0,
    bpg: parseFloat(row.bpg) || 0,
    mpg: parseFloat(row.mpg) || 0,
    fg_pct: parseFloat(row.fg_pct) || 0,
    fg3_pct: parseFloat(row.fg3_pct) || 0,
    ft_pct: parseFloat(row.ft_pct) || 0,
    ppg_rank: parseInt(row.ppg_rank) || 0,
    rpg_rank: parseInt(row.rpg_rank) || 0,
    apg_rank: parseInt(row.apg_rank) || 0,
    spg_rank: parseInt(row.spg_rank) || 0,
    bpg_rank: parseInt(row.bpg_rank) || 0,
    mpg_rank: parseInt(row.mpg_rank) || 0,
    fg_pct_rank: parseInt(row.fg_pct_rank) || 0,
    fg3_pct_rank: parseInt(row.fg3_pct_rank) || 0,
    ft_pct_rank: parseInt(row.ft_pct_rank) || 0,
  }
}

/**
 * Get player game logs
 */
export async function getPlayerGamelogs(playerId: number, limit = 20) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      CASE WHEN g.home_team_id = pgs.team_id THEN at.abbreviation ELSE ht.abbreviation END as opponent,
      CASE WHEN g.home_team_id = pgs.team_id THEN true ELSE false END as is_home,
      true as played,
      pgs.minutes,
      pgs.points,
      pgs.rebounds,
      pgs.assists,
      pgs.steals,
      pgs.blocks,
      pgs.turnovers,
      pgs.fg_made,
      pgs.fg_attempted,
      pgs.fg3_made as three_made,
      pgs.fg3_attempted as three_attempted,
      pgs.ft_made,
      pgs.ft_attempted,
      CASE
        WHEN g.home_team_id = pgs.team_id AND g.home_team_score > g.away_team_score THEN 'W'
        WHEN g.away_team_id = pgs.team_id AND g.away_team_score > g.home_team_score THEN 'W'
        ELSE 'L'
      END as result,
      CASE WHEN g.home_team_id = pgs.team_id THEN g.home_team_score ELSE g.away_team_score END as team_score,
      CASE WHEN g.home_team_id = pgs.team_id THEN g.away_team_score ELSE g.home_team_score END as opponent_score
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE pgs.player_id = $1 AND g.season = $2
    ORDER BY g.game_date DESC
    LIMIT $3
  `, [playerId, currentSeason, limit])

  return result.rows
}

// ============================================
// DEFENSE VS POSITION (DvP) FUNCTIONS
// ============================================

/**
 * Get Defense vs Position heatmap data
 * Returns all teams x all positions matrix with rankings and league averages
 * Reads from pre-calculated defensive_stats_by_position table (populated by ETL)
 */
export async function getDefenseVsPositionHeatmap(): Promise<DvPHeatmapData> {
  const currentSeason = await getCurrentSeason()
  const positions = ['PG', 'SG', 'SF', 'PF', 'C']

  // Get league averages by position from pre-calculated table
  const leagueAvgResult = await query(`
    SELECT
      opponent_position as position,
      ROUND(AVG(points_allowed_per_game), 2) as avg_points
    FROM defensive_stats_by_position
    WHERE season = $1
      AND opponent_position IN ('PG', 'SG', 'SF', 'PF', 'C')
    GROUP BY opponent_position
    ORDER BY opponent_position
  `, [currentSeason])

  const leagueAvgMap = new Map(
    leagueAvgResult.rows.map(r => [r.position, parseFloat(r.avg_points)])
  )

  // Get all teams x positions defensive stats from pre-calculated table
  const result = await query(`
    SELECT
      ds.team_id,
      t.abbreviation as team_abbreviation,
      ds.opponent_position as position,
      ds.points_allowed_per_game,
      ds.points_allowed_rank,
      ds.fg_pct_allowed,
      ds.games_played
    FROM defensive_stats_by_position ds
    JOIN teams t ON ds.team_id = t.team_id
    WHERE ds.season = $1
      AND ds.opponent_position IN ('PG', 'SG', 'SF', 'PF', 'C')
    ORDER BY t.abbreviation, ds.opponent_position
  `, [currentSeason])

  const cells: DvPHeatmapCell[] = result.rows.map(row => ({
    team_id: parseInt(row.team_id),
    team_abbreviation: row.team_abbreviation,
    position: row.position,
    points_allowed_per_game: parseFloat(row.points_allowed_per_game),
    points_allowed_rank: parseInt(row.points_allowed_rank),
    fg_pct_allowed: parseFloat(row.fg_pct_allowed || '0'),
    league_avg: leagueAvgMap.get(row.position) || 0,
    diff_from_avg: parseFloat(row.points_allowed_per_game) - (leagueAvgMap.get(row.position) || 0)
  }))

  return {
    cells,
    league_averages: leagueAvgResult.rows.map(r => ({
      position: r.position,
      avg_points: parseFloat(r.avg_points)
    })),
    positions
  }
}

// ============================================
// Team Analysis Queries
// ============================================

export interface TeamAnalysis {
  analysis_data: Record<string, unknown>
  analysis_html: string
  generated_at: string
  games_included: number
}

/**
 * Get team analysis for a specific team
 * Returns the most recent French narrative analysis
 */
export async function getTeamAnalysis(teamId: number): Promise<TeamAnalysis | null> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      analysis_data,
      analysis_html,
      generated_at,
      games_included
    FROM team_analysis
    WHERE team_id = $1 AND season = $2
    ORDER BY generated_at DESC
    LIMIT 1
  `, [teamId, currentSeason])

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  return {
    analysis_data: row.analysis_data,
    analysis_html: row.analysis_html,
    generated_at: row.generated_at,
    games_included: parseInt(row.games_included)
  }
}

// ============================================
// SHOT DISTRIBUTION PROFILE
// ============================================

export interface ShotDistributionPosition {
  position: string
  fga: number
  fgm: number
  fgPct: number
  fgaPct: number
  leagueAvgPct: number
  deviation: number
}

export interface ShotDistributionData {
  teamId: number
  teamAbbreviation: string
  gamesPlayed: number
  profile: 'GUARDS-KILLER' | 'FORWARDS-FOCUSED' | 'CENTER-FOCUSED' | 'BALANCED'
  positions: ShotDistributionPosition[]
  insights: {
    forcesTo: { position: string; deviation: number }[]
    blocksFrom: { position: string; deviation: number }[]
    bettingTip: string
  }
}

/**
 * Get shot distribution profile for a specific team
 * Shows how the defense forces opponents to redistribute their shots by position
 */
export async function getTeamShotDistribution(teamId: number): Promise<ShotDistributionData | null> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH team_position_shots AS (
      SELECT
        t.team_id,
        t.abbreviation,
        p.position,
        SUM(pgs.fg_attempted) as fga,
        SUM(pgs.fg_made) as fgm,
        COUNT(DISTINCT g.game_id) as games
      FROM teams t
      JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
      JOIN player_game_stats pgs ON g.game_id = pgs.game_id AND pgs.team_id != t.team_id
      JOIN players p ON pgs.player_id = p.player_id
      WHERE g.season = $1 AND g.game_status = 'Final'
        AND p.position IN ('PG', 'SG', 'SF', 'PF', 'C')
        AND t.team_id = $2
      GROUP BY t.team_id, t.abbreviation, p.position
    ),
    team_totals AS (
      SELECT team_id, SUM(fga) as total_fga, MAX(games) as games_played
      FROM team_position_shots
      GROUP BY team_id
    ),
    league_position_totals AS (
      SELECT
        p.position,
        SUM(pgs.fg_attempted) as total_fga
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      JOIN players p ON pgs.player_id = p.player_id
      WHERE g.season = $1 AND g.game_status = 'Final'
        AND p.position IN ('PG', 'SG', 'SF', 'PF', 'C')
      GROUP BY p.position
    ),
    league_total AS (
      SELECT SUM(total_fga) as grand_total FROM league_position_totals
    ),
    league_avg AS (
      SELECT
        lpt.position,
        ROUND(lpt.total_fga::numeric / lt.grand_total * 100, 1) as avg_pct
      FROM league_position_totals lpt
      CROSS JOIN league_total lt
    )
    SELECT
      tps.team_id,
      tps.abbreviation,
      tt.games_played,
      tps.position,
      tps.fga,
      tps.fgm,
      ROUND(tps.fgm::numeric / NULLIF(tps.fga, 0) * 100, 1) as fg_pct,
      ROUND(tps.fga::numeric / tt.total_fga * 100, 1) as fga_pct,
      COALESCE(la.avg_pct, 20.0) as league_avg_pct,
      ROUND(tps.fga::numeric / tt.total_fga * 100 - COALESCE(la.avg_pct, 20.0), 1) as deviation
    FROM team_position_shots tps
    JOIN team_totals tt ON tps.team_id = tt.team_id
    LEFT JOIN league_avg la ON tps.position = la.position
    ORDER BY
      CASE tps.position
        WHEN 'PG' THEN 1
        WHEN 'SG' THEN 2
        WHEN 'SF' THEN 3
        WHEN 'PF' THEN 4
        WHEN 'C' THEN 5
      END
  `, [currentSeason, teamId])

  if (result.rows.length === 0) return null

  const positions: ShotDistributionPosition[] = result.rows.map(row => ({
    position: row.position,
    fga: parseInt(row.fga),
    fgm: parseInt(row.fgm),
    fgPct: parseFloat(row.fg_pct) || 0,
    fgaPct: parseFloat(row.fga_pct) || 0,
    leagueAvgPct: parseFloat(row.league_avg_pct) || 20,
    deviation: parseFloat(row.deviation) || 0
  }))

  // Determine profile
  const profile = determineDefensiveProfile(positions)

  // Generate insights
  const insights = generateDefensiveInsights(positions, result.rows[0].abbreviation)

  return {
    teamId: parseInt(result.rows[0].team_id),
    teamAbbreviation: result.rows[0].abbreviation,
    gamesPlayed: parseInt(result.rows[0].games_played),
    profile,
    positions,
    insights
  }
}

function determineDefensiveProfile(positions: ShotDistributionPosition[]): 'GUARDS-KILLER' | 'FORWARDS-FOCUSED' | 'CENTER-FOCUSED' | 'BALANCED' {
  const guards = positions.filter(p => ['PG', 'SG'].includes(p.position))
  const forwards = positions.filter(p => ['SF', 'PF'].includes(p.position))
  const center = positions.find(p => p.position === 'C')

  const maxGuardDev = Math.max(...guards.map(p => Math.abs(p.deviation)), 0)
  const maxForwardDev = Math.max(...forwards.map(p => Math.abs(p.deviation)), 0)
  const centerDev = Math.abs(center?.deviation || 0)

  if (maxGuardDev >= 2.5 && maxGuardDev > maxForwardDev && maxGuardDev > centerDev) {
    return 'GUARDS-KILLER'
  }
  if (maxForwardDev >= 2.5 && maxForwardDev > maxGuardDev && maxForwardDev > centerDev) {
    return 'FORWARDS-FOCUSED'
  }
  if (centerDev >= 2.5 && centerDev > maxGuardDev && centerDev > maxForwardDev) {
    return 'CENTER-FOCUSED'
  }
  return 'BALANCED'
}

function generateDefensiveInsights(positions: ShotDistributionPosition[], abbr: string) {
  const forcesTo = positions
    .filter(p => p.deviation >= 2)
    .sort((a, b) => b.deviation - a.deviation)
    .map(p => ({ position: p.position, deviation: p.deviation }))

  const blocksFrom = positions
    .filter(p => p.deviation <= -2)
    .sort((a, b) => a.deviation - b.deviation)
    .map(p => ({ position: p.position, deviation: p.deviation }))

  // Generate betting tip
  let bettingTip = ''
  if (forcesTo.length > 0) {
    const forcedPositions = forcesTo.map(p => p.position).join(' et ')
    bettingTip = `Miser sur les ${forcedPositions} contre ${abbr}. `
  }
  if (blocksFrom.length > 0) {
    const blockedPositions = blocksFrom.map(p => p.position).join('/')
    bettingTip += `Éviter les ${blockedPositions} (volume limité).`
  }
  if (!bettingTip) {
    bettingTip = `Défense équilibrée, pas de matchup évident à exploiter.`
  }

  return { forcesTo, blocksFrom, bettingTip }
}

// ==========================================
// TEAM SHOT ZONES (Offense + Defense by Zone)
// ==========================================

export interface ZoneStats {
  fgm: number
  fga: number
  fgPct: number
  freq: number
}

export interface TeamShotZoneData {
  teamId: number
  teamName: string
  zoneType: 'offense' | 'defense'
  restrictedArea: ZoneStats
  paintNonRA: ZoneStats
  midRange: ZoneStats
  corner3: ZoneStats
  aboveBreak3: ZoneStats
  totalFgm: number
  totalFga: number
  totalFgPct: number
  profile: string
  strengths: string[] | null
  weaknesses: string[] | null
}

export interface LeagueZoneAverages {
  restrictedArea: { fgPct: number; freq: number }
  paintNonRA: { fgPct: number; freq: number }
  midRange: { fgPct: number; freq: number }
  corner3: { fgPct: number; freq: number }
  aboveBreak3: { fgPct: number; freq: number }
}

export interface TeamShotZonesResponse {
  teamId: number
  teamAbbreviation: string
  offense: TeamShotZoneData | null
  defense: TeamShotZoneData | null
  leagueAvgOffense: LeagueZoneAverages | null
  leagueAvgDefense: LeagueZoneAverages | null
  matchupInsights: {
    offenseProfile: string
    defenseProfile: string
    strengths: string[]
    weaknesses: string[]
    bettingTip: string
  }
}

/**
 * Get team shot zone data (both offensive and defensive profiles)
 * Shows shot distribution by zone: Restricted Area, Paint, Mid-Range, Corner 3, Above Break 3
 */
export async function getTeamShotZones(teamId: number): Promise<TeamShotZonesResponse | null> {
  const currentSeason = await getCurrentSeason()

  // Get team abbreviation
  const teamResult = await query(`
    SELECT team_id, abbreviation FROM teams WHERE team_id = $1
  `, [teamId])

  if (teamResult.rows.length === 0) return null

  const teamAbbreviation = teamResult.rows[0].abbreviation

  // Get shot zone data for both offense and defense
  const zonesResult = await query(`
    SELECT
      sz.team_id,
      t.full_name as team_name,
      sz.zone_type,
      sz.ra_fgm, sz.ra_fga, sz.ra_fg_pct, sz.ra_freq,
      sz.paint_fgm, sz.paint_fga, sz.paint_fg_pct, sz.paint_freq,
      sz.mid_fgm, sz.mid_fga, sz.mid_fg_pct, sz.mid_freq,
      sz.corner3_fgm, sz.corner3_fga, sz.corner3_fg_pct, sz.corner3_freq,
      sz.ab3_fgm, sz.ab3_fga, sz.ab3_fg_pct, sz.ab3_freq,
      sz.total_fgm, sz.total_fga, sz.total_fg_pct,
      sz.profile,
      sz.strengths,
      sz.weaknesses
    FROM team_shooting_zones sz
    JOIN teams t ON sz.team_id = t.team_id
    WHERE sz.team_id = $1 AND sz.season = $2
    ORDER BY sz.zone_type
  `, [teamId, currentSeason])

  if (zonesResult.rows.length === 0) return null

  // Get league averages
  const avgResult = await query(`
    SELECT
      zone_type,
      ra_fg_pct, ra_freq,
      paint_fg_pct, paint_freq,
      mid_fg_pct, mid_freq,
      corner3_fg_pct, corner3_freq,
      ab3_fg_pct, ab3_freq
    FROM league_zone_averages
    WHERE season = $1
  `, [currentSeason])

  // Parse team zone data
  let offense: TeamShotZoneData | null = null
  let defense: TeamShotZoneData | null = null

  for (const row of zonesResult.rows) {
    const zoneData: TeamShotZoneData = {
      teamId: parseInt(row.team_id),
      teamName: row.team_name,
      zoneType: row.zone_type,
      restrictedArea: {
        fgm: parseInt(row.ra_fgm),
        fga: parseInt(row.ra_fga),
        fgPct: parseFloat(row.ra_fg_pct) || 0,
        freq: parseFloat(row.ra_freq) || 0
      },
      paintNonRA: {
        fgm: parseInt(row.paint_fgm),
        fga: parseInt(row.paint_fga),
        fgPct: parseFloat(row.paint_fg_pct) || 0,
        freq: parseFloat(row.paint_freq) || 0
      },
      midRange: {
        fgm: parseInt(row.mid_fgm),
        fga: parseInt(row.mid_fga),
        fgPct: parseFloat(row.mid_fg_pct) || 0,
        freq: parseFloat(row.mid_freq) || 0
      },
      corner3: {
        fgm: parseInt(row.corner3_fgm),
        fga: parseInt(row.corner3_fga),
        fgPct: parseFloat(row.corner3_fg_pct) || 0,
        freq: parseFloat(row.corner3_freq) || 0
      },
      aboveBreak3: {
        fgm: parseInt(row.ab3_fgm),
        fga: parseInt(row.ab3_fga),
        fgPct: parseFloat(row.ab3_fg_pct) || 0,
        freq: parseFloat(row.ab3_freq) || 0
      },
      totalFgm: parseInt(row.total_fgm),
      totalFga: parseInt(row.total_fga),
      totalFgPct: parseFloat(row.total_fg_pct) || 0,
      profile: row.profile,
      strengths: row.strengths,
      weaknesses: row.weaknesses
    }

    if (row.zone_type === 'offense') {
      offense = zoneData
    } else {
      defense = zoneData
    }
  }

  // Parse league averages
  let leagueAvgOffense: LeagueZoneAverages | null = null
  let leagueAvgDefense: LeagueZoneAverages | null = null

  for (const row of avgResult.rows) {
    const avgData: LeagueZoneAverages = {
      restrictedArea: { fgPct: parseFloat(row.ra_fg_pct) || 0, freq: parseFloat(row.ra_freq) || 0 },
      paintNonRA: { fgPct: parseFloat(row.paint_fg_pct) || 0, freq: parseFloat(row.paint_freq) || 0 },
      midRange: { fgPct: parseFloat(row.mid_fg_pct) || 0, freq: parseFloat(row.mid_freq) || 0 },
      corner3: { fgPct: parseFloat(row.corner3_fg_pct) || 0, freq: parseFloat(row.corner3_freq) || 0 },
      aboveBreak3: { fgPct: parseFloat(row.ab3_fg_pct) || 0, freq: parseFloat(row.ab3_freq) || 0 }
    }

    if (row.zone_type === 'offense') {
      leagueAvgOffense = avgData
    } else {
      leagueAvgDefense = avgData
    }
  }

  // Generate matchup insights
  const matchupInsights = generateZoneMatchupInsights(offense, defense, teamAbbreviation)

  return {
    teamId,
    teamAbbreviation,
    offense,
    defense,
    leagueAvgOffense,
    leagueAvgDefense,
    matchupInsights
  }
}

function generateZoneMatchupInsights(
  offense: TeamShotZoneData | null,
  defense: TeamShotZoneData | null,
  abbr: string
) {
  const offenseProfile = offense?.profile || 'unknown'
  const defenseProfile = defense?.profile || 'unknown'

  const strengths = defense?.strengths || []
  const weaknesses = defense?.weaknesses || []

  let bettingTip = ''

  // Generate betting tips based on profiles
  if (defenseProfile === 'paint_protector') {
    bettingTip = `${abbr} protège bien le cercle. Chercher UNDER contre équipes paint-heavy.`
  } else if (defenseProfile === 'rim_weak') {
    bettingTip = `${abbr} vulnérable au cercle (${defense?.restrictedArea.fgPct.toFixed(1)}% RA). OVER contre paint-heavy.`
  } else if (defenseProfile === 'perimeter_defender') {
    bettingTip = `${abbr} limite le 3PT. UNDER contre équipes three-heavy.`
  } else if (defenseProfile === 'perimeter_weak') {
    bettingTip = `${abbr} expose aux 3PT. OVER contre équipes three-heavy.`
  } else {
    bettingTip = `Défense équilibrée, analyser le profil offensif adverse.`
  }

  // Add offensive insight
  if (offenseProfile === 'paint_heavy') {
    bettingTip += ` Offense paint-heavy (${((offense?.restrictedArea.freq || 0) * 100).toFixed(0)}% RA).`
  } else if (offenseProfile === 'three_heavy') {
    const threePct = ((offense?.corner3.freq || 0) + (offense?.aboveBreak3.freq || 0)) * 100
    bettingTip += ` Offense 3PT-heavy (${threePct.toFixed(0)}% 3PT).`
  }

  return {
    offenseProfile,
    defenseProfile,
    strengths,
    weaknesses,
    bettingTip
  }
}

// ==========================================
// DEFENSIVE SYSTEM ANALYSIS (DvP + Shot Zones Combined)
// ==========================================

export interface DvPPositionData {
  position: string
  pointsAllowed: number
  leagueAvg: number
  diff: number
  rank: number
  tier: 'elite' | 'good' | 'average' | 'below' | 'weak'
}

export interface DefensiveZoneData {
  zone: string
  zoneFr: string
  fgPctAllowed: number
  leagueAvg: number
  diff: number
  isWeakness: boolean
  isStrength: boolean
}

export interface DefensiveSystemInsight {
  type: 'strength' | 'weakness' | 'paradox' | 'info'
  title: string
  description: string
  positions?: string[]
  zones?: string[]
}

export interface DefensiveSystemAnalysisData {
  teamId: number
  teamAbbreviation: string
  dvpByPosition: DvPPositionData[]
  shotZoneDefense: DefensiveZoneData[]
  insights: DefensiveSystemInsight[]
  bettingRecommendations: {
    vsGuardDriven: 'over' | 'under' | 'neutral'
    vsPaintHeavy: 'over' | 'under' | 'neutral'
    vsThreeHeavy: 'over' | 'under' | 'neutral'
    summary: string
  }
  systemProfile: {
    rimProtection: 'elite' | 'good' | 'average' | 'weak'
    perimeterDefense: 'elite' | 'good' | 'average' | 'weak'
    postDefense: 'elite' | 'good' | 'average' | 'weak'
    guardContainment: 'elite' | 'good' | 'average' | 'weak'
  }
}

/**
 * Get comprehensive defensive system analysis combining DvP and Shot Zone data
 * Reveals the relationship between position-based and zone-based defense
 */
export async function getDefensiveSystemAnalysis(teamId: number): Promise<DefensiveSystemAnalysisData | null> {
  const currentSeason = await getCurrentSeason()

  // Get team abbreviation
  const teamResult = await query(`
    SELECT team_id, abbreviation FROM teams WHERE team_id = $1
  `, [teamId])

  if (teamResult.rows.length === 0) return null
  const teamAbbreviation = teamResult.rows[0].abbreviation

  // Get DvP data with league averages
  const dvpResult = await query(`
    WITH league_avg AS (
      SELECT
        opponent_position,
        AVG(points_allowed_per_game) as avg_pts
      FROM defensive_stats_by_position
      WHERE season = $2
      GROUP BY opponent_position
    )
    SELECT
      ds.opponent_position as position,
      ds.points_allowed_per_game,
      ds.points_allowed_rank,
      la.avg_pts as league_avg
    FROM defensive_stats_by_position ds
    JOIN league_avg la ON ds.opponent_position = la.opponent_position
    WHERE ds.team_id = $1 AND ds.season = $2
    ORDER BY ds.opponent_position
  `, [teamId, currentSeason])

  // Get Shot Zone defensive data with league averages
  const zoneResult = await query(`
    SELECT
      sz.ra_fg_pct, sz.paint_fg_pct, sz.mid_fg_pct, sz.corner3_fg_pct, sz.ab3_fg_pct,
      sz.strengths, sz.weaknesses,
      la.ra_fg_pct as la_ra, la.paint_fg_pct as la_paint,
      la.mid_fg_pct as la_mid, la.corner3_fg_pct as la_corner3, la.ab3_fg_pct as la_ab3
    FROM team_shooting_zones sz
    JOIN league_zone_averages la ON sz.season = la.season AND la.zone_type = 'defense'
    WHERE sz.team_id = $1 AND sz.season = $2 AND sz.zone_type = 'defense'
  `, [teamId, currentSeason])

  if (dvpResult.rows.length === 0 || zoneResult.rows.length === 0) {
    return null
  }

  // Transform DvP data
  const dvpByPosition: DvPPositionData[] = dvpResult.rows.map(row => {
    const diff = parseFloat(row.points_allowed_per_game) - parseFloat(row.league_avg)
    const rank = parseInt(row.points_allowed_rank)
    let tier: DvPPositionData['tier'] = 'average'
    if (rank <= 6) tier = 'elite'
    else if (rank <= 12) tier = 'good'
    else if (rank <= 18) tier = 'average'
    else if (rank <= 24) tier = 'below'
    else tier = 'weak'

    return {
      position: row.position,
      pointsAllowed: parseFloat(row.points_allowed_per_game),
      leagueAvg: parseFloat(row.league_avg),
      diff: diff,
      rank: rank,
      tier: tier
    }
  })

  // Transform Shot Zone data
  const zoneRow = zoneResult.rows[0]
  const strengths = zoneRow.strengths || []
  const weaknesses = zoneRow.weaknesses || []

  const shotZoneDefense: DefensiveZoneData[] = [
    {
      zone: 'ra',
      zoneFr: 'Restricted Area',
      fgPctAllowed: parseFloat(zoneRow.ra_fg_pct) || 0,
      leagueAvg: parseFloat(zoneRow.la_ra) || 0,
      diff: ((parseFloat(zoneRow.ra_fg_pct) || 0) - (parseFloat(zoneRow.la_ra) || 0)) * 100,
      isWeakness: weaknesses.includes('ra'),
      isStrength: strengths.includes('ra')
    },
    {
      zone: 'paint',
      zoneFr: 'Paint (Non-RA)',
      fgPctAllowed: parseFloat(zoneRow.paint_fg_pct) || 0,
      leagueAvg: parseFloat(zoneRow.la_paint) || 0,
      diff: ((parseFloat(zoneRow.paint_fg_pct) || 0) - (parseFloat(zoneRow.la_paint) || 0)) * 100,
      isWeakness: weaknesses.includes('paint'),
      isStrength: strengths.includes('paint')
    },
    {
      zone: 'mid',
      zoneFr: 'Mid-Range',
      fgPctAllowed: parseFloat(zoneRow.mid_fg_pct) || 0,
      leagueAvg: parseFloat(zoneRow.la_mid) || 0,
      diff: ((parseFloat(zoneRow.mid_fg_pct) || 0) - (parseFloat(zoneRow.la_mid) || 0)) * 100,
      isWeakness: weaknesses.includes('mid'),
      isStrength: strengths.includes('mid')
    },
    {
      zone: 'corner3',
      zoneFr: 'Corner 3',
      fgPctAllowed: parseFloat(zoneRow.corner3_fg_pct) || 0,
      leagueAvg: parseFloat(zoneRow.la_corner3) || 0,
      diff: ((parseFloat(zoneRow.corner3_fg_pct) || 0) - (parseFloat(zoneRow.la_corner3) || 0)) * 100,
      isWeakness: weaknesses.includes('corner3'),
      isStrength: strengths.includes('corner3')
    },
    {
      zone: 'ab3',
      zoneFr: 'Above Break 3',
      fgPctAllowed: parseFloat(zoneRow.ab3_fg_pct) || 0,
      leagueAvg: parseFloat(zoneRow.la_ab3) || 0,
      diff: ((parseFloat(zoneRow.ab3_fg_pct) || 0) - (parseFloat(zoneRow.la_ab3) || 0)) * 100,
      isWeakness: weaknesses.includes('ab3'),
      isStrength: strengths.includes('ab3')
    }
  ]

  // Generate insights
  const insights: DefensiveSystemInsight[] = []

  // Find position-based patterns
  const pgData = dvpByPosition.find(d => d.position === 'PG')
  const sgData = dvpByPosition.find(d => d.position === 'SG')
  const sfData = dvpByPosition.find(d => d.position === 'SF')
  const pfData = dvpByPosition.find(d => d.position === 'PF')
  const cData = dvpByPosition.find(d => d.position === 'C')
  const raZone = shotZoneDefense.find(z => z.zone === 'ra')

  // Check for the "paradox" - good vs C but weak at rim
  if (cData && cData.tier === 'elite' && raZone && raZone.isWeakness) {
    insights.push({
      type: 'paradox',
      title: 'Paradoxe Défensif',
      description: `Excellence vs pivots (${cData.pointsAllowed.toFixed(1)} PPG, rank #${cData.rank}) mais faiblesse au cercle (${(raZone.fgPctAllowed * 100).toFixed(1)}% RA). Les guards qui pénètrent sont le problème, pas les pivots.`,
      positions: ['C'],
      zones: ['ra']
    })
  }

  // Check guard containment
  const guardAvgRank = ((pgData?.rank || 15) + (sgData?.rank || 15)) / 2
  if (guardAvgRank >= 24) {
    insights.push({
      type: 'weakness',
      title: 'Défense Périmétrique Poreuse',
      description: `Les guards adverses dominent: PG rank #${pgData?.rank}, SG rank #${sgData?.rank}. Ils pénètrent facilement vers le cercle.`,
      positions: ['PG', 'SG']
    })
  } else if (guardAvgRank <= 8) {
    insights.push({
      type: 'strength',
      title: 'Confinement des Guards',
      description: `Excellente défense sur les guards: PG rank #${pgData?.rank}, SG rank #${sgData?.rank}. Limite la pénétration.`,
      positions: ['PG', 'SG']
    })
  }

  // Check post defense
  if (cData && pfData && cData.tier === 'elite' && (pfData.tier === 'elite' || pfData.tier === 'good')) {
    insights.push({
      type: 'strength',
      title: 'Protection du Poste',
      description: `Les intérieurs adverses ont du mal: C ${cData.pointsAllowed.toFixed(1)} PPG (#${cData.rank}), PF ${pfData.pointsAllowed.toFixed(1)} PPG (#${pfData.rank}).`,
      positions: ['C', 'PF']
    })
  }

  // Check rim protection strength
  if (raZone && raZone.isStrength) {
    insights.push({
      type: 'strength',
      title: 'Protection du Cercle',
      description: `Force la difficulté au cercle: ${(raZone.fgPctAllowed * 100).toFixed(1)}% RA (${raZone.diff.toFixed(1)}% sous la moyenne).`,
      zones: ['ra']
    })
  }

  // Generate betting recommendations
  const bettingRecommendations = {
    vsGuardDriven: 'neutral' as 'over' | 'under' | 'neutral',
    vsPaintHeavy: 'neutral' as 'over' | 'under' | 'neutral',
    vsThreeHeavy: 'neutral' as 'over' | 'under' | 'neutral',
    summary: ''
  }

  // vs Guard-driven teams
  if (raZone?.isWeakness && guardAvgRank >= 20) {
    bettingRecommendations.vsGuardDriven = 'over'
  } else if (raZone?.isStrength && guardAvgRank <= 10) {
    bettingRecommendations.vsGuardDriven = 'under'
  }

  // vs Paint-heavy teams
  if (cData && cData.tier === 'elite' && !raZone?.isWeakness) {
    bettingRecommendations.vsPaintHeavy = 'under'
  } else if (raZone?.isWeakness) {
    bettingRecommendations.vsPaintHeavy = 'over'
  }

  // vs Three-heavy teams
  const threeZones = shotZoneDefense.filter(z => z.zone === 'corner3' || z.zone === 'ab3')
  const hasThreeWeakness = threeZones.some(z => z.isWeakness)
  const hasThreeStrength = threeZones.some(z => z.isStrength)
  if (hasThreeWeakness) {
    bettingRecommendations.vsThreeHeavy = 'over'
  } else if (hasThreeStrength) {
    bettingRecommendations.vsThreeHeavy = 'under'
  }

  // Generate summary
  const summaryParts: string[] = []
  if (bettingRecommendations.vsGuardDriven === 'over') {
    summaryParts.push('OVER vs équipes guard-driven (Ja, SGA, Fox)')
  }
  if (bettingRecommendations.vsPaintHeavy === 'under') {
    summaryParts.push('UNDER vs équipes paint-heavy')
  } else if (bettingRecommendations.vsPaintHeavy === 'over') {
    summaryParts.push('OVER vs équipes paint-heavy')
  }
  if (bettingRecommendations.vsThreeHeavy === 'over') {
    summaryParts.push('OVER vs équipes three-heavy')
  } else if (bettingRecommendations.vsThreeHeavy === 'under') {
    summaryParts.push('UNDER vs équipes three-heavy')
  }
  bettingRecommendations.summary = summaryParts.join(' • ') || 'Analyser le profil offensif adverse au cas par cas'

  // Calculate system profile
  const systemProfile = {
    rimProtection: raZone?.isStrength ? 'elite' as const : raZone?.isWeakness ? 'weak' as const : 'average' as const,
    perimeterDefense: hasThreeStrength ? 'elite' as const : hasThreeWeakness ? 'weak' as const : 'average' as const,
    postDefense: (cData?.tier === 'elite' ? 'elite' : cData?.tier === 'weak' ? 'weak' : 'average') as 'elite' | 'good' | 'average' | 'weak',
    guardContainment: guardAvgRank <= 8 ? 'elite' as const : guardAvgRank >= 24 ? 'weak' as const : 'average' as const
  }

  return {
    teamId,
    teamAbbreviation,
    dvpByPosition,
    shotZoneDefense,
    insights,
    bettingRecommendations,
    systemProfile
  }
}

// ============================================
// GAMES PAGE REDESIGN - QUERIES
// ============================================

export interface GameWithOdds {
  game_id: string
  game_date: string
  game_time: string | null
  home_team_id: number
  away_team_id: number
  home_team_abbr: string
  away_team_abbr: string
  home_team_name: string
  away_team_name: string
  home_score: number | null
  away_score: number | null
  status: 'Scheduled' | 'In Progress' | 'Final'
  // Team records
  home_wins: number
  home_losses: number
  away_wins: number
  away_losses: number
  // Odds (nullable if not available)
  spread_home: number | null
  total: number | null
}

export interface GameDetail extends GameWithOdds {
  venue: string | null
  attendance: number | null
}

export interface DateGameCount {
  date: string
  count: number
}

/**
 * Get a single game by ID with odds
 */
export async function getGameById(gameId: string): Promise<GameDetail | null> {
  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      -- Convert UTC game_time to CET (UTC+1), format as HH:MM
      CASE
        WHEN g.game_time IS NOT NULL THEN TO_CHAR((g.game_time + INTERVAL '1 hour'), 'HH24:MI')
        ELSE g.game_time_et
      END as game_time,
      g.home_team_id,
      g.away_team_id,
      ht.abbreviation as home_team_abbr,
      at.abbreviation as away_team_abbr,
      ht.full_name as home_team_name,
      at.full_name as away_team_name,
      g.home_team_score as home_score,
      g.away_team_score as away_score,
      g.game_status as status,
      COALESCE(hts.wins, 0) as home_wins,
      COALESCE(hts.losses, 0) as home_losses,
      COALESCE(ats.wins, 0) as away_wins,
      COALESCE(ats.losses, 0) as away_losses,
      NULL::numeric as spread_home,
      NULL::numeric as total,
      g.arena as venue,
      NULL::integer as attendance
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN team_standings hts ON g.home_team_id = hts.team_id AND hts.season_id = g.season
    LEFT JOIN team_standings ats ON g.away_team_id = ats.team_id AND ats.season_id = g.season
    WHERE g.game_id = $1
  `, [gameId])

  return (result.rows[0] as GameDetail | undefined) || null
}

/**
 * Get games for a specific date with odds
 */
export async function getGamesByDate(date: string): Promise<GameWithOdds[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      TO_CHAR(g.game_date, 'YYYY-MM-DD') as game_date,
      -- Convert UTC game_time to CET (UTC+1), format as HH:MM
      CASE
        WHEN g.game_time IS NOT NULL THEN TO_CHAR((g.game_time + INTERVAL '1 hour'), 'HH24:MI')
        ELSE g.game_time_et
      END as game_time,
      g.home_team_id,
      g.away_team_id,
      ht.abbreviation as home_team_abbr,
      at.abbreviation as away_team_abbr,
      ht.full_name as home_team_name,
      at.full_name as away_team_name,
      g.home_team_score as home_score,
      g.away_team_score as away_score,
      g.game_status as status,
      COALESCE(hts.wins, 0) as home_wins,
      COALESCE(hts.losses, 0) as home_losses,
      COALESCE(ats.wins, 0) as away_wins,
      COALESCE(ats.losses, 0) as away_losses,
      NULL::numeric as spread_home,
      NULL::numeric as total
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN team_standings hts ON g.home_team_id = hts.team_id AND hts.season_id = $1
    LEFT JOIN team_standings ats ON g.away_team_id = ats.team_id AND ats.season_id = $1
    WHERE g.season = $1 AND g.game_date = $2::date
    ORDER BY g.game_time ASC NULLS LAST, g.game_id ASC
  `, [currentSeason, date])

  return result.rows as GameWithOdds[]
}

/**
 * Get game counts for a date range (for date picker)
 */
export async function getGamesCountByDateRange(startDate: string, endDate: string): Promise<DateGameCount[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      DATE(game_date)::text as date,
      COUNT(*)::integer as count
    FROM games
    WHERE season = $1
      AND DATE(game_date) BETWEEN $2::date AND $3::date
    GROUP BY DATE(game_date)
    ORDER BY DATE(game_date)
  `, [currentSeason, startDate, endDate])

  return result.rows as DateGameCount[]
}

/**
 * Get yesterday's games (for "Hier" section)
 */
export async function getYesterdayGames(): Promise<GameWithOdds[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      TO_CHAR(g.game_date, 'YYYY-MM-DD') as game_date,
      TO_CHAR(g.game_time, 'HH24:MI') as game_time,
      g.home_team_id,
      g.away_team_id,
      ht.abbreviation as home_team_abbr,
      at.abbreviation as away_team_abbr,
      ht.full_name as home_team_name,
      at.full_name as away_team_name,
      g.home_team_score as home_score,
      g.away_team_score as away_score,
      g.game_status as status,
      COALESCE(hts.wins, 0) as home_wins,
      COALESCE(hts.losses, 0) as home_losses,
      COALESCE(ats.wins, 0) as away_wins,
      COALESCE(ats.losses, 0) as away_losses,
      NULL::numeric as spread_home,
      NULL::numeric as total
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN team_standings hts ON g.home_team_id = hts.team_id
    LEFT JOIN team_standings ats ON g.away_team_id = ats.team_id
    WHERE g.season = $1 AND DATE(g.game_date) = CURRENT_DATE - INTERVAL '1 day'
    ORDER BY g.game_date ASC
  `, [currentSeason])

  return result.rows as GameWithOdds[]
}

/**
 * Get today's games with odds (for "Ce soir" section)
 */
export async function getTodayGamesWithOdds(): Promise<GameWithOdds[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      TO_CHAR(g.game_date, 'YYYY-MM-DD') as game_date,
      TO_CHAR(g.game_time, 'HH24:MI') as game_time,
      g.home_team_id,
      g.away_team_id,
      ht.abbreviation as home_team_abbr,
      at.abbreviation as away_team_abbr,
      ht.full_name as home_team_name,
      at.full_name as away_team_name,
      g.home_team_score as home_score,
      g.away_team_score as away_score,
      g.game_status as status,
      COALESCE(hts.wins, 0) as home_wins,
      COALESCE(hts.losses, 0) as home_losses,
      COALESCE(ats.wins, 0) as away_wins,
      COALESCE(ats.losses, 0) as away_losses,
      NULL::numeric as spread_home,
      NULL::numeric as total
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN team_standings hts ON g.home_team_id = hts.team_id
    LEFT JOIN team_standings ats ON g.away_team_id = ats.team_id
    WHERE g.season = $1 AND DATE(g.game_date) = CURRENT_DATE
    ORDER BY g.game_date ASC
  `, [currentSeason])

  return result.rows as GameWithOdds[]
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

/**
 * Get teams formatted for search (cached on client)
 */
export async function getTeamsForSearch(): Promise<TeamSearchResult[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      t.team_id,
      t.abbreviation,
      t.full_name,
      t.city,
      ts.conference,
      COALESCE(ts.wins, 0) as wins,
      COALESCE(ts.losses, 0) as losses,
      COALESCE(ts.conference_rank, 0) as conference_rank
    FROM teams t
    LEFT JOIN team_standings ts ON t.team_id = ts.team_id AND ts.season_id = $1
    ORDER BY t.full_name
  `, [currentSeason])

  return result.rows.map(row => ({
    type: 'team' as const,
    id: row.team_id,
    title: row.full_name,
    subtitle: row.city,
    url: `/teams/${row.team_id}`,
    abbreviation: row.abbreviation,
    record: `${row.wins}-${row.losses}`,
    conferenceRank: row.conference_rank || 0,
    conference: row.conference || 'East'
  }))
}

/**
 * Search players by name for search bar (server-side, ILIKE search)
 */
export async function searchPlayersQuick(searchQuery: string): Promise<PlayerSearchResult[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      p.player_id,
      p.full_name,
      p.position,
      t.abbreviation as team_abbreviation,
      COALESCE(ROUND(AVG(pgs.points)::numeric, 1), 0) as ppg
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams t ON pgs.team_id = t.team_id
    WHERE g.season = $1
      AND p.full_name ILIKE '%' || $2 || '%'
    GROUP BY p.player_id, p.full_name, p.position, t.abbreviation
    HAVING COUNT(pgs.game_id) >= 3
    ORDER BY AVG(pgs.points) DESC NULLS LAST
    LIMIT 10
  `, [currentSeason, searchQuery])

  return result.rows.map(row => ({
    type: 'player' as const,
    id: row.player_id,
    title: row.full_name,
    subtitle: row.position,
    url: `/players/${row.player_id}`,
    teamAbbreviation: row.team_abbreviation,
    ppg: parseFloat(row.ppg) || 0,
    position: row.position
  }))
}

/**
 * Search games by team name or abbreviation (server-side)
 */
export async function searchGames(searchQuery: string): Promise<GameSearchResult[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      TO_CHAR(g.game_date, 'HH24:MI') as game_time,
      TO_CHAR(g.game_date, 'DD/MM') as formatted_date,
      ht.full_name as home_team,
      ht.abbreviation as home_abbr,
      at.full_name as away_team,
      at.abbreviation as away_abbr,
      DATE(g.game_date) = CURRENT_DATE as is_today
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE g.season = $1
      AND g.game_date >= CURRENT_DATE
      AND (
        ht.full_name ILIKE '%' || $2 || '%'
        OR at.full_name ILIKE '%' || $2 || '%'
        OR ht.abbreviation ILIKE '%' || $2 || '%'
        OR at.abbreviation ILIKE '%' || $2 || '%'
      )
    ORDER BY g.game_date ASC
    LIMIT 5
  `, [currentSeason, searchQuery])

  return result.rows.map(row => ({
    type: 'game' as const,
    id: row.game_id,
    title: `${row.away_team} @ ${row.home_team}`,
    subtitle: row.is_today ? 'Aujourd\'hui' : row.formatted_date,
    url: `/games/${row.game_id}`,
    homeTeam: row.home_team,
    homeAbbr: row.home_abbr,
    awayTeam: row.away_team,
    awayAbbr: row.away_abbr,
    gameTime: row.game_time || '',
    gameDate: row.formatted_date,
    isToday: row.is_today
  }))
}

/**
 * Get teammate performance splits when a specific player is absent
 *
 * Returns how teammates perform when a player is OUT vs when they are playing.
 * Useful for prop analysis and cascade effects of star absences.
 *
 * @param playerId - The player whose absence impact we want to measure
 * @param minGames - Minimum games required in each scenario (with/without)
 * @returns Array of TeammatePerformanceSplit showing boost/decline for each teammate
 */
export async function getTeammatesWhenPlayerAbsent(
  playerId: number,
  minGames = 3,
  startersOnly = true
): Promise<TeammatePerformanceSplit[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH player_info AS (
      -- Get the player's team from their most recent game
      SELECT DISTINCT pgs.team_id
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      WHERE pgs.player_id = $1 AND g.season = $2
      ORDER BY pgs.team_id
      LIMIT 1
    ),
    team_games AS (
      -- All team games in the season
      SELECT DISTINCT g.game_id
      FROM games g
      JOIN player_info pi ON (g.home_team_id = pi.team_id OR g.away_team_id = pi.team_id)
      WHERE g.season = $2 AND g.game_status = 'Final'
    ),
    player_presence AS (
      -- Mark which games the player was present (played any minutes)
      SELECT
        tg.game_id,
        CASE WHEN pgs.minutes > 0 THEN true ELSE false END as player_played
      FROM team_games tg
      LEFT JOIN player_game_stats pgs ON tg.game_id = pgs.game_id AND pgs.player_id = $1
    ),
    teammate_stats AS (
      -- Get teammate performance in each game with starter info
      SELECT
        p.player_id as teammate_id,
        p.full_name as teammate_name,
        pgs.game_id,
        pgs.points,
        pgs.rebounds,
        pgs.assists,
        pgs.blocks,
        pgs.steals,
        pgs.fg3_made,
        pgs.fg_made,
        pgs.fg_attempted,
        pgs.is_starter,
        pgs.start_position,
        pp.player_played
      FROM player_game_stats pgs
      JOIN players p ON pgs.player_id = p.player_id
      JOIN player_presence pp ON pgs.game_id = pp.game_id
      JOIN player_info pi ON pgs.team_id = pi.team_id
      WHERE pgs.player_id != $1
        AND pgs.minutes > 0  -- Teammate actually played
    ),
    teammate_positions AS (
      -- Get most common position for each teammate
      SELECT
        teammate_id,
        start_position,
        COUNT(*) as pos_count,
        ROW_NUMBER() OVER (PARTITION BY teammate_id ORDER BY COUNT(*) DESC) as rn
      FROM teammate_stats
      WHERE is_starter = true AND start_position IS NOT NULL
      GROUP BY teammate_id, start_position
    )
    SELECT
      $1::bigint as player_id,
      (SELECT full_name FROM players WHERE player_id = $1) as player_name,
      ts.teammate_id,
      ts.teammate_name,
      tp.start_position as position,
      COUNT(CASE WHEN ts.player_played THEN 1 END)::int as with_games,
      COUNT(CASE WHEN NOT ts.player_played THEN 1 END)::int as without_games,
      -- Points
      ROUND(AVG(CASE WHEN ts.player_played THEN ts.points END), 1) as with_pts,
      ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.points END), 1) as without_pts,
      ROUND(
        AVG(CASE WHEN NOT ts.player_played THEN ts.points END) -
        AVG(CASE WHEN ts.player_played THEN ts.points END), 1
      ) as pts_boost,
      -- Rebounds
      ROUND(AVG(CASE WHEN ts.player_played THEN ts.rebounds END), 1) as with_reb,
      ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.rebounds END), 1) as without_reb,
      ROUND(
        AVG(CASE WHEN NOT ts.player_played THEN ts.rebounds END) -
        AVG(CASE WHEN ts.player_played THEN ts.rebounds END), 1
      ) as reb_boost,
      -- Assists
      ROUND(AVG(CASE WHEN ts.player_played THEN ts.assists END), 1) as with_ast,
      ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.assists END), 1) as without_ast,
      ROUND(
        AVG(CASE WHEN NOT ts.player_played THEN ts.assists END) -
        AVG(CASE WHEN ts.player_played THEN ts.assists END), 1
      ) as ast_boost,
      -- Blocks
      ROUND(AVG(CASE WHEN ts.player_played THEN ts.blocks END), 1) as with_blk,
      ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.blocks END), 1) as without_blk,
      ROUND(
        AVG(CASE WHEN NOT ts.player_played THEN ts.blocks END) -
        AVG(CASE WHEN ts.player_played THEN ts.blocks END), 1
      ) as blk_boost,
      -- Steals
      ROUND(AVG(CASE WHEN ts.player_played THEN ts.steals END), 1) as with_stl,
      ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.steals END), 1) as without_stl,
      ROUND(
        AVG(CASE WHEN NOT ts.player_played THEN ts.steals END) -
        AVG(CASE WHEN ts.player_played THEN ts.steals END), 1
      ) as stl_boost,
      -- 3PM
      ROUND(AVG(CASE WHEN ts.player_played THEN ts.fg3_made END), 1) as with_3pm,
      ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.fg3_made END), 1) as without_3pm,
      ROUND(
        AVG(CASE WHEN NOT ts.player_played THEN ts.fg3_made END) -
        AVG(CASE WHEN ts.player_played THEN ts.fg3_made END), 1
      ) as three_pm_boost,
      -- FG
      ROUND(AVG(CASE WHEN ts.player_played THEN ts.fg_made END), 1) as with_fgm,
      ROUND(AVG(CASE WHEN ts.player_played THEN ts.fg_attempted END), 1) as with_fga,
      ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.fg_made END), 1) as without_fgm,
      ROUND(AVG(CASE WHEN NOT ts.player_played THEN ts.fg_attempted END), 1) as without_fga,
      -- Starter percentage
      ROUND(
        100.0 * COUNT(CASE WHEN NOT ts.player_played AND ts.is_starter THEN 1 END) /
        NULLIF(COUNT(CASE WHEN NOT ts.player_played THEN 1 END), 0)
      )::int as starter_pct
    FROM teammate_stats ts
    LEFT JOIN teammate_positions tp ON ts.teammate_id = tp.teammate_id AND tp.rn = 1
    GROUP BY ts.teammate_id, ts.teammate_name, tp.start_position
    HAVING
      COUNT(CASE WHEN ts.player_played THEN 1 END) >= $3
      AND COUNT(CASE WHEN NOT ts.player_played THEN 1 END) >= $3
      AND (
        NOT $4  -- If startersOnly is false, include everyone
        OR (
          -- Otherwise only include players who started in 40%+ of games when player was out
          100.0 * COUNT(CASE WHEN NOT ts.player_played AND ts.is_starter THEN 1 END) /
          NULLIF(COUNT(CASE WHEN NOT ts.player_played THEN 1 END), 0) >= 40
        )
      )
    ORDER BY pts_boost DESC NULLS LAST
  `, [playerId, currentSeason, minGames, startersOnly])

  return result.rows as TeammatePerformanceSplit[]
}

// ============================================
// O/U INVESTIGATION LAB QUERIES
// ============================================

export interface OUGameData {
  gameId: string
  date: string
  opponent: string
  isHome: boolean
  teamScore: number
  oppScore: number
  total: number
  line: number | null
  isOver: boolean
  pace: number | null
  margin: number
}

export interface TeamOUStats {
  teamId: number
  abbreviation: string
  fullName: string
  gamesPlayed: number
  avgTotal: number
  stddevTotal: number
  minTotal: number
  maxTotal: number
  overRate: number
  avgPointsFor: number
  avgPointsAgainst: number
  pace: number
  l5Total: number
  l10Total: number
  homeAvgTotal: number
  awayAvgTotal: number
  homeOverRate: number
  awayOverRate: number
}

export interface H2HGame {
  gameId: string
  date: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  total: number
  line: number | null
  isOver: boolean
  venue: string
}

/**
 * Get team O/U statistics for O/U Investigation Lab
 */
export async function getTeamOUStats(teamId: number): Promise<TeamOUStats | null> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH team_games AS (
      SELECT
        g.game_id,
        g.game_date,
        (g.home_team_id = $1) as is_home,
        CASE WHEN g.home_team_id = $1 THEN g.home_team_score ELSE g.away_team_score END as team_score,
        CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
        (g.home_team_score + g.away_team_score) as total,
        COALESCE(tgs.pace, 100) as pace,
        ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as rn
      FROM games g
      LEFT JOIN team_game_stats tgs ON g.game_id = tgs.game_id AND tgs.team_id = $1
      WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
        AND g.season = $2
        AND g.game_status = 'Final'
    )
    SELECT
      t.team_id,
      t.abbreviation,
      t.full_name,
      (SELECT COUNT(*) FROM team_games) as games_played,
      ROUND((SELECT AVG(total) FROM team_games), 1) as avg_total,
      ROUND((SELECT STDDEV(total) FROM team_games), 1) as stddev_total,
      (SELECT MIN(total) FROM team_games) as min_total,
      (SELECT MAX(total) FROM team_games) as max_total,
      ROUND((SELECT COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM team_games), 0) FROM team_games WHERE total > 220.5), 1) as over_rate,
      ROUND((SELECT AVG(team_score) FROM team_games), 1) as avg_points_for,
      ROUND((SELECT AVG(opp_score) FROM team_games), 1) as avg_points_against,
      ROUND((SELECT AVG(pace) FROM team_games), 1) as pace,
      ROUND((SELECT AVG(total) FROM team_games WHERE rn <= 5), 1) as l5_total,
      ROUND((SELECT AVG(total) FROM team_games WHERE rn <= 10), 1) as l10_total,
      ROUND((SELECT AVG(total) FROM team_games WHERE is_home), 1) as home_avg_total,
      ROUND((SELECT AVG(total) FROM team_games WHERE NOT is_home), 1) as away_avg_total,
      ROUND((SELECT COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM team_games WHERE is_home), 0) FROM team_games WHERE is_home AND total > 220.5), 1) as home_over_rate,
      ROUND((SELECT COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM team_games WHERE NOT is_home), 0) FROM team_games WHERE NOT is_home AND total > 220.5), 1) as away_over_rate
    FROM teams t
    WHERE t.team_id = $1
  `, [teamId, currentSeason])

  if (!result.rows[0]) return null

  const row = result.rows[0]
  return {
    teamId: row.team_id,
    abbreviation: row.abbreviation,
    fullName: row.full_name,
    gamesPlayed: parseInt(row.games_played) || 0,
    avgTotal: parseFloat(row.avg_total) || 0,
    stddevTotal: parseFloat(row.stddev_total) || 0,
    minTotal: parseInt(row.min_total) || 0,
    maxTotal: parseInt(row.max_total) || 0,
    overRate: parseFloat(row.over_rate) || 0,
    avgPointsFor: parseFloat(row.avg_points_for) || 0,
    avgPointsAgainst: parseFloat(row.avg_points_against) || 0,
    pace: parseFloat(row.pace) || 100,
    l5Total: parseFloat(row.l5_total) || 0,
    l10Total: parseFloat(row.l10_total) || 0,
    homeAvgTotal: parseFloat(row.home_avg_total) || 0,
    awayAvgTotal: parseFloat(row.away_avg_total) || 0,
    homeOverRate: parseFloat(row.home_over_rate) || 0,
    awayOverRate: parseFloat(row.away_over_rate) || 0
  }
}

/**
 * Get team game totals for O/U distribution chart
 */
export async function getTeamGameTotals(teamId: number, limit = 15): Promise<OUGameData[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date as date,
      CASE WHEN g.home_team_id = $1 THEN at.abbreviation ELSE ht.abbreviation END as opponent,
      (g.home_team_id = $1) as is_home,
      CASE WHEN g.home_team_id = $1 THEN g.home_team_score ELSE g.away_team_score END as team_score,
      CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
      (g.home_team_score + g.away_team_score) as total,
      COALESCE(tgs.pace, 100) as pace
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN team_game_stats tgs ON g.game_id = tgs.game_id AND tgs.team_id = $1
    WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
      AND g.season = $2
      AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT $3
  `, [teamId, currentSeason, limit])

  return result.rows.map(row => ({
    gameId: row.game_id,
    date: row.date,
    opponent: row.opponent,
    isHome: row.is_home,
    teamScore: parseInt(row.team_score) || 0,
    oppScore: parseInt(row.opp_score) || 0,
    total: parseInt(row.total) || 0,
    line: null, // No betting data for now
    isOver: parseInt(row.total) > 220.5,
    pace: parseFloat(row.pace) || 100,
    margin: parseInt(row.total) - 220.5
  }))
}

/**
 * Get H2H history between two teams
 */
export async function getH2HHistory(team1Id: number, team2Id: number, limit = 10): Promise<H2HGame[]> {
  const result = await query(`
    SELECT
      g.game_id,
      g.game_date as date,
      ht.abbreviation as home_team,
      at.abbreviation as away_team,
      g.home_team_score,
      g.away_team_score,
      (g.home_team_score + g.away_team_score) as total,
      ht.full_name || ' Arena' as venue
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE ((g.home_team_id = $1 AND g.away_team_id = $2)
       OR (g.home_team_id = $2 AND g.away_team_id = $1))
      AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT $3
  `, [team1Id, team2Id, limit])

  return result.rows.map(row => ({
    gameId: row.game_id,
    date: row.date,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeScore: parseInt(row.home_team_score) || 0,
    awayScore: parseInt(row.away_team_score) || 0,
    total: parseInt(row.total) || 0,
    line: null, // No betting data for now
    isOver: parseInt(row.total) > 220.5,
    venue: row.venue || 'Unknown'
  }))
}

/**
 * Get team O/U trends by category (home, away, last5, B2B)
 */
export async function getTeamOUTrends(teamId: number): Promise<{
  home: OUGameData[]
  away: OUGameData[]
  last5: OUGameData[]
  b2b: OUGameData[]
}> {
  const currentSeason = await getCurrentSeason()

  // Get all games with back-to-back detection
  const result = await query(`
    WITH team_games AS (
      SELECT
        g.game_id,
        g.game_date as date,
        CASE WHEN g.home_team_id = $1 THEN at.abbreviation ELSE ht.abbreviation END as opponent,
        (g.home_team_id = $1) as is_home,
        CASE WHEN g.home_team_id = $1 THEN g.home_team_score ELSE g.away_team_score END as team_score,
        CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END as opp_score,
        (g.home_team_score + g.away_team_score) as total,
        COALESCE(tgs.pace, 100) as pace,
        LAG(g.game_date) OVER (ORDER BY g.game_date) as prev_game_date,
        ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as rn
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.team_id
      JOIN teams at ON g.away_team_id = at.team_id
      LEFT JOIN team_game_stats tgs ON g.game_id = tgs.game_id AND tgs.team_id = $1
      WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
        AND g.season = $2
        AND g.game_status = 'Final'
    )
    SELECT
      game_id,
      date,
      opponent,
      is_home,
      team_score,
      opp_score,
      total,
      pace,
      rn,
      (date::date - prev_game_date::date <= 1) as is_b2b
    FROM team_games
    ORDER BY date DESC
    LIMIT 20
  `, [teamId, currentSeason])

  const allGames: OUGameData[] = result.rows.map(row => ({
    gameId: row.game_id,
    date: row.date,
    opponent: row.opponent,
    isHome: row.is_home,
    teamScore: parseInt(row.team_score) || 0,
    oppScore: parseInt(row.opp_score) || 0,
    total: parseInt(row.total) || 0,
    line: 220.5,
    isOver: parseInt(row.total) > 220.5,
    pace: parseFloat(row.pace) || 100,
    margin: parseInt(row.total) - 220.5
  }))

  const b2bGames = result.rows
    .filter(row => row.is_b2b)
    .map(row => ({
      gameId: row.game_id,
      date: row.date,
      opponent: row.opponent,
      isHome: row.is_home,
      teamScore: parseInt(row.team_score) || 0,
      oppScore: parseInt(row.opp_score) || 0,
      total: parseInt(row.total) || 0,
      line: 220.5,
      isOver: parseInt(row.total) > 220.5,
      pace: parseFloat(row.pace) || 100,
      margin: parseInt(row.total) - 220.5
    }))

  return {
    home: allGames.filter(g => g.isHome).slice(0, 8),
    away: allGames.filter(g => !g.isHome).slice(0, 7),
    last5: allGames.slice(0, 5),
    b2b: b2bGames.slice(0, 4)
  }
}

/**
 * Get team ID by abbreviation
 */
export async function getTeamIdByAbbreviation(abbreviation: string): Promise<number | null> {
  const result = await query(`
    SELECT team_id FROM teams WHERE abbreviation = $1
  `, [abbreviation.toUpperCase()])

  return result.rows[0]?.team_id || null
}

// ============================================
// INJURY REPORTS
// ============================================

export interface TeamInjuryReport {
  playerName: string
  position: string | null
  status: 'OUT' | 'GTD' | 'DOUBTFUL' | 'PROBABLE' | 'UNKNOWN'
  injuryType: string | null
  updateDate: string | null
}

/**
 * Get injury reports for specific teams (today's data)
 */
export async function getTeamInjuries(teamAbbreviations: string[]): Promise<Record<string, TeamInjuryReport[]>> {
  const result = await query(`
    SELECT
      ir.team_abbr,
      ir.player_name,
      ir.injury_type,
      ir.status,
      ir.update_date
    FROM injury_reports ir
    WHERE ir.team_abbr = ANY($1)
      AND ir.report_date = CURRENT_DATE
    ORDER BY
      ir.team_abbr,
      CASE ir.status
        WHEN 'OUT' THEN 1
        WHEN 'DOUBTFUL' THEN 2
        WHEN 'GTD' THEN 3
        WHEN 'PROBABLE' THEN 4
        ELSE 5
      END,
      ir.player_name
  `, [teamAbbreviations.map(a => a.toUpperCase())])

  // Group by team
  const injuries: Record<string, TeamInjuryReport[]> = {}

  for (const abbr of teamAbbreviations) {
    injuries[abbr.toUpperCase()] = []
  }

  for (const row of result.rows) {
    const teamAbbr = row.team_abbr as string
    if (!injuries[teamAbbr]) {
      injuries[teamAbbr] = []
    }
    injuries[teamAbbr].push({
      playerName: row.player_name,
      position: null, // Position not in injury_reports table yet
      status: row.status as TeamInjuryReport['status'],
      injuryType: row.injury_type,
      updateDate: row.update_date
    })
  }

  return injuries
}

/**
 * Get H2H games between two teams for current season
 */
export async function getH2HGames(team1Abbr: string, team2Abbr: string): Promise<{
  date: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  total: number
}[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_date::text as date,
      ht.abbreviation as home_team,
      at.abbreviation as away_team,
      g.home_team_score,
      g.away_team_score,
      (g.home_team_score + g.away_team_score) as total
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE g.season = $1
      AND g.game_status = 'Final'
      AND (
        (ht.abbreviation = $2 AND at.abbreviation = $3)
        OR (ht.abbreviation = $3 AND at.abbreviation = $2)
      )
    ORDER BY g.game_date DESC
  `, [currentSeason, team1Abbr.toUpperCase(), team2Abbr.toUpperCase()])

  return result.rows.map(row => ({
    date: row.date,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeScore: parseInt(row.home_team_score) || 0,
    awayScore: parseInt(row.away_team_score) || 0,
    total: parseInt(row.total) || 0
  }))
}

/**
 * Projected lineup player
 */
export interface ProjectedPlayer {
  name: string
  position: string | null
  status: 'CONFIRMED' | 'PROBABLE' | 'GTD' | 'DOUBTFUL' | 'OUT'
  injury: string | null
}

/**
 * Projected lineup for a team in a game
 */
export interface ProjectedLineup {
  abbreviation: string
  gameTime: string | null
  starters: ProjectedPlayer[]
  injuries: ProjectedPlayer[]
  scrapedAt: string
}

/**
 * Get projected lineups for a game between two teams (today's data)
 */
export async function getProjectedLineups(
  awayTeamAbbr: string,
  homeTeamAbbr: string
): Promise<{
  away: ProjectedLineup | null
  home: ProjectedLineup | null
} | null> {
  const result = await query(`
    SELECT
      away_team,
      home_team,
      game_time,
      away_lineup,
      home_lineup,
      away_injuries,
      home_injuries,
      scraped_at
    FROM projected_lineups
    WHERE game_date = CURRENT_DATE
      AND away_team = $1
      AND home_team = $2
    ORDER BY scraped_at DESC
    LIMIT 1
  `, [awayTeamAbbr.toUpperCase(), homeTeamAbbr.toUpperCase()])

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]

  // Parse JSONB lineup arrays
  const awayLineup = (row.away_lineup || []) as ProjectedPlayer[]
  const homeLineup = (row.home_lineup || []) as ProjectedPlayer[]
  const awayInjuries = (row.away_injuries || []) as ProjectedPlayer[]
  const homeInjuries = (row.home_injuries || []) as ProjectedPlayer[]

  return {
    away: {
      abbreviation: row.away_team,
      gameTime: row.game_time,
      starters: awayLineup.map(p => ({
        name: p.name,
        position: p.position,
        status: (p.status || 'CONFIRMED') as ProjectedPlayer['status'],
        injury: p.injury || null
      })),
      injuries: awayInjuries.map(p => ({
        name: p.name,
        position: p.position,
        status: (p.status || 'OUT') as ProjectedPlayer['status'],
        injury: p.injury || null
      })),
      scrapedAt: row.scraped_at
    },
    home: {
      abbreviation: row.home_team,
      gameTime: row.game_time,
      starters: homeLineup.map(p => ({
        name: p.name,
        position: p.position,
        status: (p.status || 'CONFIRMED') as ProjectedPlayer['status'],
        injury: p.injury || null
      })),
      injuries: homeInjuries.map(p => ({
        name: p.name,
        position: p.position,
        status: (p.status || 'OUT') as ProjectedPlayer['status'],
        injury: p.injury || null
      })),
      scrapedAt: row.scraped_at
    }
  }
}

/**
 * Get the current O/U line for a matchup between two teams
 * Returns the most recent total line from betting_lines for today's or upcoming game
 */
export async function getMatchupOULine(
  awayAbbr: string,
  homeAbbr: string
): Promise<{ total: number; overOdds: number | null; underOdds: number | null; bookmaker: string } | null> {
  const result = await query(`
    SELECT
      bl.total,
      bl.over_odds,
      bl.under_odds,
      bl.bookmaker
    FROM betting_lines bl
    JOIN games g ON bl.game_id = g.game_id
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE ht.abbreviation = $1
      AND at.abbreviation = $2
      AND g.game_date >= CURRENT_DATE
      AND bl.total IS NOT NULL
    ORDER BY bl.recorded_at DESC
    LIMIT 1
  `, [homeAbbr.toUpperCase(), awayAbbr.toUpperCase()])

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  return {
    total: parseFloat(row.total),
    overOdds: row.over_odds ? parseInt(row.over_odds) : null,
    underOdds: row.under_odds ? parseInt(row.under_odds) : null,
    bookmaker: row.bookmaker
  }
}

/**
 * Get comprehensive player prop analysis for a specific stat
 * Returns game-by-game data, averages, and hit rates
 */
export interface PlayerPropGame {
  gameId: string
  gameDate: string
  opponent: string
  isHome: boolean
  minutes: number
  value: number
  isOver: boolean
}

export interface PlayerPropAnalysis {
  playerId: number
  playerName: string
  gamesPlayed: number
  games: PlayerPropGame[]
  seasonAvg: number
  last5Avg: number
  last10Avg: number
  homeAvg: number
  awayAvg: number
  hitRate: number
  last5HitRate: number
  last10HitRate: number
  homeHitRate: number
  awayHitRate: number
  streak: number // positive = over streak, negative = under streak
  maxValue: number
  minValue: number
}

export async function getPlayerPropAnalysis(
  playerId: number,
  propType: string,
  line: number,
  gamesLimit = 20
): Promise<PlayerPropAnalysis | null> {
  const currentSeason = await getCurrentSeason()

  // Map prop type to SQL column expression
  const propColumnMap: Record<string, string> = {
    'pts': 'pgs.points',
    'reb': 'pgs.rebounds',
    'ast': 'pgs.assists',
    '3pm': 'pgs.fg3_made',
    'stl': 'pgs.steals',
    'blk': 'pgs.blocks',
    'to': 'pgs.turnovers',
    'pts_reb': 'pgs.points + pgs.rebounds',
    'pts_ast': 'pgs.points + pgs.assists',
    'pts_reb_ast': 'pgs.points + pgs.rebounds + pgs.assists',
    'reb_ast': 'pgs.rebounds + pgs.assists',
  }

  const propColumn = propColumnMap[propType]
  if (!propColumn) {
    return null
  }

  const result = await query(`
    WITH player_games AS (
      SELECT
        pgs.game_id,
        g.game_date,
        CASE
          WHEN g.home_team_id = pgs.team_id THEN opp.abbreviation
          ELSE home.abbreviation
        END as opponent,
        g.home_team_id = pgs.team_id as is_home,
        pgs.minutes,
        (${propColumn})::int as value,
        ROW_NUMBER() OVER (ORDER BY g.game_date DESC) as game_num
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      JOIN teams home ON g.home_team_id = home.team_id
      JOIN teams opp ON g.away_team_id = opp.team_id
      WHERE pgs.player_id = $1
        AND g.season = $2
        AND g.game_status = 'Final'
        AND pgs.minutes > 0
      ORDER BY g.game_date DESC
      LIMIT $3
    ),
    player_info AS (
      SELECT full_name FROM players WHERE player_id = $1
    )
    SELECT
      $1::bigint as player_id,
      (SELECT full_name FROM player_info) as player_name,
      COUNT(*) as games_played,
      json_agg(
        json_build_object(
          'gameId', game_id,
          'gameDate', game_date,
          'opponent', opponent,
          'isHome', is_home,
          'minutes', minutes,
          'value', value,
          'isOver', value > $4::numeric
        ) ORDER BY game_date DESC
      ) as games,
      ROUND(AVG(value), 1) as season_avg,
      ROUND(AVG(CASE WHEN game_num <= 5 THEN value END), 1) as last_5_avg,
      ROUND(AVG(CASE WHEN game_num <= 10 THEN value END), 1) as last_10_avg,
      ROUND(AVG(CASE WHEN is_home THEN value END), 1) as home_avg,
      ROUND(AVG(CASE WHEN NOT is_home THEN value END), 1) as away_avg,
      ROUND(100.0 * COUNT(CASE WHEN value > $4::numeric THEN 1 END) / COUNT(*), 1) as hit_rate,
      ROUND(100.0 * COUNT(CASE WHEN game_num <= 5 AND value > $4::numeric THEN 1 END) / NULLIF(COUNT(CASE WHEN game_num <= 5 THEN 1 END), 0), 1) as last_5_hit_rate,
      ROUND(100.0 * COUNT(CASE WHEN game_num <= 10 AND value > $4::numeric THEN 1 END) / NULLIF(COUNT(CASE WHEN game_num <= 10 THEN 1 END), 0), 1) as last_10_hit_rate,
      ROUND(100.0 * COUNT(CASE WHEN is_home AND value > $4::numeric THEN 1 END) / NULLIF(COUNT(CASE WHEN is_home THEN 1 END), 0), 1) as home_hit_rate,
      ROUND(100.0 * COUNT(CASE WHEN NOT is_home AND value > $4::numeric THEN 1 END) / NULLIF(COUNT(CASE WHEN NOT is_home THEN 1 END), 0), 1) as away_hit_rate,
      MAX(value) as max_value,
      MIN(value) as min_value
    FROM player_games
  `, [playerId, currentSeason, gamesLimit, line])

  if (result.rows.length === 0 || result.rows[0].games_played === 0) {
    return null
  }

  const row = result.rows[0]
  const games = row.games as PlayerPropGame[]

  // Calculate streak
  let streak = 0
  if (games.length > 0) {
    const firstIsOver = games[0].isOver
    for (const game of games) {
      if (game.isOver === firstIsOver) {
        streak += firstIsOver ? 1 : -1
      } else {
        break
      }
    }
  }

  return {
    playerId: parseInt(row.player_id),
    playerName: row.player_name,
    gamesPlayed: parseInt(row.games_played),
    games,
    seasonAvg: parseFloat(row.season_avg) || 0,
    last5Avg: parseFloat(row.last_5_avg) || 0,
    last10Avg: parseFloat(row.last_10_avg) || 0,
    homeAvg: parseFloat(row.home_avg) || 0,
    awayAvg: parseFloat(row.away_avg) || 0,
    hitRate: parseFloat(row.hit_rate) || 0,
    last5HitRate: parseFloat(row.last_5_hit_rate) || 0,
    last10HitRate: parseFloat(row.last_10_hit_rate) || 0,
    homeHitRate: parseFloat(row.home_hit_rate) || 0,
    awayHitRate: parseFloat(row.away_hit_rate) || 0,
    streak,
    maxValue: parseInt(row.max_value) || 0,
    minValue: parseInt(row.min_value) || 0,
  }
}

// ============================================
// OPPONENT VULNERABILITY ANALYSIS
// ============================================

/**
 * Analyze how opponent positions perform when a player is absent
 * Shows which opponent positions benefit from the player's absence
 *
 * @param playerId - The player whose absence we analyze
 * @param minGames - Minimum games threshold (default: 3)
 * @returns Array of OpponentVulnerabilityByPosition with performance splits
 */
export async function getOpponentVulnerabilityWhenPlayerAbsent(
  playerId: number,
  minGames = 3
): Promise<OpponentVulnerabilityByPosition[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH player_team AS (
      -- Get the player's team from their most recent game
      SELECT DISTINCT pgs.team_id
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      WHERE pgs.player_id = $1 AND g.season = $2
      ORDER BY pgs.team_id
      LIMIT 1
    ),
    player_games AS (
      -- Identify games where player was present or absent
      SELECT
        g.game_id,
        CASE WHEN pgs.minutes > 0 THEN true ELSE false END as player_played,
        -- Get opponent team
        CASE
          WHEN g.home_team_id = pt.team_id THEN g.away_team_id
          ELSE g.home_team_id
        END as opponent_team_id
      FROM games g
      CROSS JOIN player_team pt
      LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id AND pgs.player_id = $1
      WHERE g.season = $2
        AND g.game_status = 'Final'
        AND (g.home_team_id = pt.team_id OR g.away_team_id = pt.team_id)
    ),
    opponent_player_stats AS (
      -- Get opponent player performance in each game
      SELECT
        pg.player_played,
        COALESCE(p.position, 'Unknown') as position,
        ops.points,
        ops.fg_made,
        ops.fg_attempted,
        ops.minutes
      FROM player_games pg
      JOIN player_game_stats ops ON pg.game_id = ops.game_id
        AND ops.team_id = pg.opponent_team_id
      JOIN players p ON ops.player_id = p.player_id
      WHERE ops.minutes >= 15  -- Only players with significant minutes
    )
    SELECT
      position,
      -- Game counts
      COUNT(DISTINCT CASE WHEN player_played THEN points END) as games_with,
      COUNT(DISTINCT CASE WHEN NOT player_played THEN points END) as games_without,
      -- Points
      ROUND(AVG(CASE WHEN player_played THEN points END)::numeric, 1) as pts_with,
      ROUND(AVG(CASE WHEN NOT player_played THEN points END)::numeric, 1) as pts_without,
      -- FGA
      ROUND(AVG(CASE WHEN player_played THEN fg_attempted END)::numeric, 1) as fga_with,
      ROUND(AVG(CASE WHEN NOT player_played THEN fg_attempted END)::numeric, 1) as fga_without,
      -- FG%
      ROUND(100.0 * SUM(CASE WHEN player_played THEN fg_made END) /
            NULLIF(SUM(CASE WHEN player_played THEN fg_attempted END), 0), 1) as fgpct_with,
      ROUND(100.0 * SUM(CASE WHEN NOT player_played THEN fg_made END) /
            NULLIF(SUM(CASE WHEN NOT player_played THEN fg_attempted END), 0), 1) as fgpct_without
    FROM opponent_player_stats
    GROUP BY position
    HAVING
      COUNT(CASE WHEN player_played THEN 1 END) >= $3
      AND COUNT(CASE WHEN NOT player_played THEN 1 END) >= $3
    ORDER BY
      (AVG(CASE WHEN NOT player_played THEN points END) -
       AVG(CASE WHEN player_played THEN points END)) DESC
  `, [playerId, currentSeason, minGames])

  return result.rows.map(row => ({
    position: row.position,
    games_with: parseInt(row.games_with) || 0,
    games_without: parseInt(row.games_without) || 0,
    pts_with: parseFloat(row.pts_with) || 0,
    pts_without: parseFloat(row.pts_without) || 0,
    pts_boost: parseFloat(row.pts_without) - parseFloat(row.pts_with) || 0,
    fga_with: parseFloat(row.fga_with) || 0,
    fga_without: parseFloat(row.fga_without) || 0,
    fga_boost: parseFloat(row.fga_without) - parseFloat(row.fga_with) || 0,
    fgpct_with: parseFloat(row.fgpct_with) || 0,
    fgpct_without: parseFloat(row.fgpct_without) || 0,
    fgpct_boost: parseFloat(row.fgpct_without) - parseFloat(row.fgpct_with) || 0,
  }))
}
