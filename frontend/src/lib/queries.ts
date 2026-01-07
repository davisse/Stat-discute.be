/**
 * Database Query Functions
 *
 * All database queries with season filtering and proper TypeScript types.
 * Every query joining games table MUST filter by current season.
 */

import { query } from '@/lib/db'

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
  with_games: number
  without_games: number
  with_pts: number
  without_pts: number
  pts_boost: number
}

export interface ImpactfulAbsence {
  absent_player_id: number
  absent_player_name: string
  games_missed: number
  team_pts_diff: number
  beneficiaries: TeammatePerformanceSplit[]
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
