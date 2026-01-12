export const dynamic = 'force-dynamic'

import { query } from '@/lib/db'
import { getCurrentSeason, getPlayerStatsWithRankings, getPlayerGamelogs, getTeammatesWhenPlayerAbsent } from '@/lib/queries'
import { AppLayout } from '@/components/layout'
import { PlayerPresenceCalendar, PlayerGamelogsTable, type GameDay, type GamelogEntry } from '@/components/player'
import AdvancedStatsRadar from '@/components/player/AdvancedStatsRadar'
import { PropPerformanceBarChart, AbsenceCascadeView } from '@/components/player-props'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ playerId: string }>
}

// Fetch all player data in parallel
async function getPlayerData(playerId: number) {
  const currentSeason = await getCurrentSeason()

  const [
    playerInfoResult,
    seasonStatsResult,
    recentGamesResult,
    advancedStatsResult,
    positionRankingResult,
    teammatesResult,
    playerPropsResult,
    propsAvgResult,
    seasonGamesResult,
    playerStatsWithRankings,
    playerGamelogs,
    teammatesWhenAbsent
  ] = await Promise.all([
    // Player basic info
    query(`
      SELECT
        p.player_id,
        p.full_name,
        p.first_name,
        p.last_name,
        p.position,
        p.jersey_number,
        p.height,
        p.weight,
        t.full_name as team_name,
        t.abbreviation as team_abbreviation
      FROM players p
      LEFT JOIN teams t ON p.current_team_id = t.team_id
      WHERE p.player_id = $1
    `, [playerId]),

    // Season averages
    query(`
      SELECT
        COUNT(pgs.game_id) as games_played,
        ROUND(AVG(pgs.minutes), 1) as minutes_avg,
        ROUND(AVG(pgs.points), 1) as points_avg,
        ROUND(AVG(pgs.rebounds), 1) as rebounds_avg,
        ROUND(AVG(pgs.assists), 1) as assists_avg,
        ROUND(AVG(pgs.steals), 1) as steals_avg,
        ROUND(AVG(pgs.blocks), 1) as blocks_avg,
        ROUND(AVG(pgs.turnovers), 1) as turnovers_avg,
        ROUND(AVG(pgs.fg3_made), 1) as threes_avg,
        ROUND(AVG(pgs.fg_made), 1) as fgm_avg,
        ROUND(AVG(pgs.ft_made), 1) as ftm_avg,
        ROUND(AVG(pgs.fg_pct) * 100, 1) as fg_pct,
        ROUND(AVG(pgs.fg3_pct) * 100, 1) as fg3_pct,
        ROUND(AVG(pgs.ft_pct) * 100, 1) as ft_pct,
        SUM(pgs.fg_made) as total_fg_made,
        SUM(pgs.fg_attempted) as total_fg_attempted,
        SUM(pgs.fg3_made) as total_fg3_made,
        SUM(pgs.fg3_attempted) as total_fg3_attempted,
        SUM(pgs.ft_made) as total_ft_made,
        SUM(pgs.ft_attempted) as total_ft_attempted
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      WHERE pgs.player_id = $1 AND g.season = $2
    `, [playerId, currentSeason]),

    // Recent games (last 20 for bar chart and game log)
    query(`
      SELECT
        g.game_id,
        g.game_date,
        CASE
          WHEN g.home_team_id = pgs.team_id THEN 'vs'
          ELSE '@'
        END as location,
        CASE
          WHEN g.home_team_id = pgs.team_id THEN 'home'
          ELSE 'away'
        END as home_away,
        CASE
          WHEN g.home_team_id = pgs.team_id THEN t_away.abbreviation
          ELSE t_home.abbreviation
        END as opponent,
        CASE
          WHEN g.home_team_id = pgs.team_id THEN t_away.abbreviation
          ELSE t_home.abbreviation
        END as opponent_abbr,
        CASE
          WHEN g.home_team_id = pgs.team_id THEN
            CASE WHEN g.home_team_score > g.away_team_score THEN 'W' ELSE 'L' END
          ELSE
            CASE WHEN g.away_team_score > g.home_team_score THEN 'W' ELSE 'L' END
        END as result,
        CASE
          WHEN g.home_team_id = pgs.team_id THEN
            g.home_team_score || '-' || g.away_team_score
          ELSE
            g.away_team_score || '-' || g.home_team_score
        END as score,
        CASE
          WHEN g.home_team_id = pgs.team_id THEN g.home_team_score
          ELSE g.away_team_score
        END as team_score,
        CASE
          WHEN g.home_team_id = pgs.team_id THEN g.away_team_score
          ELSE g.home_team_score
        END as opponent_score,
        pgs.minutes,
        pgs.points,
        pgs.rebounds,
        pgs.assists,
        pgs.steals,
        pgs.blocks,
        pgs.turnovers,
        pgs.fg_made,
        pgs.fg_attempted,
        pgs.fg3_made,
        pgs.fg3_attempted,
        pgs.ft_made,
        pgs.ft_attempted
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      JOIN teams t_home ON g.home_team_id = t_home.team_id
      JOIN teams t_away ON g.away_team_id = t_away.team_id
      WHERE pgs.player_id = $1 AND g.season = $2
        AND g.game_status = 'Final'
      ORDER BY g.game_date DESC
      LIMIT 20
    `, [playerId, currentSeason]),

    // Advanced stats averages
    query(`
      SELECT
        ROUND(AVG(pas.true_shooting_pct) * 100, 1) as ts_pct,
        ROUND(AVG(pas.effective_fg_pct) * 100, 1) as efg_pct,
        ROUND(AVG(pas.usage_rate), 1) as usage_rate,
        ROUND(AVG(pas.offensive_rating), 1) as off_rating,
        ROUND(AVG(pas.defensive_rating), 1) as def_rating,
        ROUND(AVG(pas.net_rating), 1) as net_rating,
        ROUND(AVG(pas.assist_percentage), 1) as ast_pct,
        ROUND(AVG(pas.rebound_percentage), 1) as reb_pct
      FROM player_advanced_stats pas
      JOIN games g ON pas.game_id = g.game_id
      WHERE pas.player_id = $1 AND g.season = $2
    `, [playerId, currentSeason]),

    // Position ranking (get player's rank among same position)
    query(`
      WITH position_stats AS (
        SELECT
          p.player_id,
          p.full_name,
          p.position,
          ROUND(AVG(pgs.points), 1) as ppg,
          ROUND(AVG(pgs.rebounds), 1) as rpg,
          ROUND(AVG(pgs.assists), 1) as apg,
          ROUND(AVG(pgs.steals), 1) as spg,
          COUNT(pgs.game_id) as games
        FROM players p
        JOIN player_game_stats pgs ON p.player_id = pgs.player_id
        JOIN games g ON pgs.game_id = g.game_id
        WHERE g.season = $2
          AND p.position = (SELECT position FROM players WHERE player_id = $1)
        GROUP BY p.player_id, p.full_name, p.position
        HAVING COUNT(pgs.game_id) >= 5
      ),
      ranked AS (
        SELECT
          player_id,
          full_name,
          position,
          ppg,
          rpg,
          apg,
          spg,
          games,
          RANK() OVER (ORDER BY ppg DESC) as ppg_rank,
          RANK() OVER (ORDER BY rpg DESC) as rpg_rank,
          RANK() OVER (ORDER BY apg DESC) as apg_rank,
          RANK() OVER (ORDER BY spg DESC) as spg_rank,
          COUNT(*) OVER () as total_players
        FROM position_stats
      )
      SELECT * FROM ranked WHERE player_id = $1
    `, [playerId, currentSeason]),

    // Teammates (same team, excluding current player)
    query(`
      SELECT
        p.player_id,
        p.full_name,
        p.jersey_number,
        ROUND(AVG(pgs.points), 1) as ppg
      FROM players p
      JOIN player_game_stats pgs ON p.player_id = pgs.player_id
      JOIN games g ON pgs.game_id = g.game_id
      WHERE p.current_team_id = (SELECT current_team_id FROM players WHERE player_id = $1)
        AND p.player_id != $1
        AND g.season = $2
      GROUP BY p.player_id, p.full_name, p.jersey_number
      HAVING COUNT(pgs.game_id) >= 3
      ORDER BY AVG(pgs.points) DESC
      LIMIT 5
    `, [playerId, currentSeason]),

    // Latest player props (betting lines)
    query(`
      SELECT DISTINCT ON (prop_type)
        prop_type,
        line,
        over_odds_decimal,
        under_odds_decimal,
        bookmaker,
        recorded_at
      FROM player_props
      WHERE player_id = $1 AND is_available = true
      ORDER BY prop_type, recorded_at DESC
    `, [playerId]),

    // Props hit rate (last 10 games)
    query(`
      WITH recent_games AS (
        SELECT
          pgs.game_id,
          pgs.points,
          pgs.rebounds,
          pgs.assists,
          pgs.fg3_made,
          pgs.points + pgs.rebounds + pgs.assists as pra
        FROM player_game_stats pgs
        JOIN games g ON pgs.game_id = g.game_id
        WHERE pgs.player_id = $1 AND g.season = $2 AND g.game_status = 'Final'
        ORDER BY g.game_date DESC
        LIMIT 10
      )
      SELECT
        'points' as prop_type,
        ROUND(AVG(points), 1) as avg_value,
        COUNT(*) as games
      FROM recent_games
      UNION ALL
      SELECT
        'rebounds' as prop_type,
        ROUND(AVG(rebounds), 1) as avg_value,
        COUNT(*) as games
      FROM recent_games
      UNION ALL
      SELECT
        'assists' as prop_type,
        ROUND(AVG(assists), 1) as avg_value,
        COUNT(*) as games
      FROM recent_games
      UNION ALL
      SELECT
        'pra' as prop_type,
        ROUND(AVG(pra), 1) as avg_value,
        COUNT(*) as games
      FROM recent_games
      UNION ALL
      SELECT
        '3pm' as prop_type,
        ROUND(AVG(fg3_made), 1) as avg_value,
        COUNT(*) as games
      FROM recent_games
    `, [playerId, currentSeason]),

    // All team games for the season (for calendar)
    // Get team from player's most recent game stats (since current_team_id may be NULL)
    query(`
      WITH player_team AS (
        SELECT pgs.team_id
        FROM player_game_stats pgs
        JOIN games g ON pgs.game_id = g.game_id
        WHERE pgs.player_id = $1 AND g.season = $2
        ORDER BY g.game_date DESC
        LIMIT 1
      )
      SELECT
        g.game_id,
        g.game_date,
        CASE WHEN pgs.player_id IS NOT NULL THEN true ELSE false END as played,
        pgs.points,
        CASE
          WHEN g.home_team_id = pt.team_id THEN
            CASE WHEN g.home_team_score > g.away_team_score THEN 'W' ELSE 'L' END
          ELSE
            CASE WHEN g.away_team_score > g.home_team_score THEN 'W' ELSE 'L' END
        END as result,
        CASE
          WHEN g.home_team_id = pt.team_id THEN t_away.abbreviation
          ELSE t_home.abbreviation
        END as opponent
      FROM games g
      CROSS JOIN player_team pt
      JOIN teams t_home ON g.home_team_id = t_home.team_id
      JOIN teams t_away ON g.away_team_id = t_away.team_id
      LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id AND pgs.player_id = $1
      WHERE (g.home_team_id = pt.team_id OR g.away_team_id = pt.team_id)
        AND g.season = $2
        AND g.game_status = 'Final'
      ORDER BY g.game_date ASC
    `, [playerId, currentSeason]),

    // Player stats with league-wide rankings (for bento grid)
    getPlayerStatsWithRankings(playerId),

    // Player gamelogs (for detailed game log table)
    getPlayerGamelogs(playerId),

    // Teammate performance splits when this player is absent
    getTeammatesWhenPlayerAbsent(playerId, 3)
  ])

  return {
    playerInfo: playerInfoResult.rows[0],
    seasonStats: seasonStatsResult.rows[0],
    recentGames: recentGamesResult.rows,
    advancedStats: advancedStatsResult.rows[0],
    positionRanking: positionRankingResult.rows[0],
    teammates: teammatesResult.rows,
    playerProps: playerPropsResult.rows,
    propsAvg: propsAvgResult.rows,
    seasonGames: seasonGamesResult.rows as GameDay[],
    playerStatsWithRankings,
    playerGamelogs: playerGamelogs as GamelogEntry[],
    teammatesWhenAbsent,
    currentSeason
  }
}

export default async function PlayerDetailPage({ params }: PageProps) {
  const { playerId } = await params
  const playerIdNum = parseInt(playerId, 10)

  if (isNaN(playerIdNum)) {
    notFound()
  }

  const data = await getPlayerData(playerIdNum)

  if (!data.playerInfo) {
    notFound()
  }

  const { playerInfo, seasonStats, recentGames, advancedStats, positionRanking, teammates, playerProps, propsAvg, seasonGames, playerStatsWithRankings, playerGamelogs, teammatesWhenAbsent, currentSeason } = data

  // Calculate last 10 games stats for trend
  const last10Stats = recentGames.length > 0 ? {
    ppg: (recentGames.reduce((sum, g) => sum + g.points, 0) / recentGames.length).toFixed(1),
    wins: recentGames.filter(g => g.result === 'W').length,
    losses: recentGames.filter(g => g.result === 'L').length,
    highGame: Math.max(...recentGames.map(g => g.points)),
    lowGame: Math.min(...recentGames.map(g => g.points))
  } : null

  // Parse numeric values with fallbacks
  const stats = {
    games: parseInt(seasonStats?.games_played) || 0,
    minutes: parseFloat(seasonStats?.minutes_avg) || 0,
    ppg: parseFloat(seasonStats?.points_avg) || 0,
    rpg: parseFloat(seasonStats?.rebounds_avg) || 0,
    apg: parseFloat(seasonStats?.assists_avg) || 0,
    spg: parseFloat(seasonStats?.steals_avg) || 0,
    bpg: parseFloat(seasonStats?.blocks_avg) || 0,
    tpg: parseFloat(seasonStats?.turnovers_avg) || 0,
    fgPct: parseFloat(seasonStats?.fg_pct) || 0,
    fg3Pct: parseFloat(seasonStats?.fg3_pct) || 0,
    ftPct: parseFloat(seasonStats?.ft_pct) || 0
  }

  const advanced = {
    tsPct: parseFloat(advancedStats?.ts_pct) || 0,
    efgPct: parseFloat(advancedStats?.efg_pct) || 0,
    usage: parseFloat(advancedStats?.usage_rate) || 0,
    offRtg: parseFloat(advancedStats?.off_rating) || 0,
    defRtg: parseFloat(advancedStats?.def_rating) || 0,
    netRtg: parseFloat(advancedStats?.net_rating) || 0
  }

  const ranking = positionRanking ? {
    position: positionRanking.position,
    ppgRank: parseInt(positionRanking.ppg_rank) || 0,
    rpgRank: parseInt(positionRanking.rpg_rank) || 0,
    apgRank: parseInt(positionRanking.apg_rank) || 0,
    spgRank: parseInt(positionRanking.spg_rank) || 0,
    total: parseInt(positionRanking.total_players) || 0
  } : null

  // Split name for hero display
  const nameParts = playerInfo.full_name.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

  return (
    <AppLayout>
      {/* STICKY PLAYER HEADER - Always visible when scrolling */}
      {/* top-[64px] for mobile (logo only), lg:top-[128px] for desktop (logo + nav) */}
      <div className="sticky top-[64px] lg:top-[128px] z-40 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
              {playerInfo.full_name}
            </h2>
            <div className="hidden sm:flex items-center gap-2 text-zinc-500 text-sm">
              {playerInfo.jersey_number && (
                <span className="font-mono">#{playerInfo.jersey_number}</span>
              )}
              {playerInfo.position && (
                <>
                  <span className="text-zinc-700">•</span>
                  <span>{playerInfo.position}</span>
                </>
              )}
              <span className="text-zinc-700">•</span>
              <span>{playerInfo.team_abbreviation}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-mono font-bold text-white">{stats.ppg.toFixed(1)}</span>
            <span className="text-zinc-500">PPG</span>
          </div>
        </div>
      </div>

      {/* SECTION 01: HERO */}
      <section className="pt-8 pb-16 px-4 sm:px-8 lg:px-12">
        <div className="w-full">
          {/* Section identifier */}
          <div className="mb-8 flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-500 tracking-widest font-mono">01</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Hero Typography with Inline Stats (Desktop) */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Name */}
            <div className="flex-shrink-0">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tighter text-white leading-[0.85]">
                {firstName}
              </h1>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tighter text-zinc-600 leading-[0.85]">
                {lastName}
              </h1>
            </div>

            {/* Inline Stats - Desktop Only */}
            {playerStatsWithRankings && (
              <div className="hidden lg:flex items-end gap-8 xl:gap-12 pb-2">
                {/* PTS */}
                <div className="text-center">
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight">
                    {playerStatsWithRankings.ppg.toFixed(1)}
                  </div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">PTS</div>
                  <div className="text-sm text-emerald-400 font-mono font-semibold">#{playerStatsWithRankings.ppg_rank}</div>
                </div>
                {/* REB */}
                <div className="text-center">
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight">
                    {playerStatsWithRankings.rpg.toFixed(1)}
                  </div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">REB</div>
                  <div className="text-sm text-emerald-400 font-mono font-semibold">#{playerStatsWithRankings.rpg_rank}</div>
                </div>
                {/* AST */}
                <div className="text-center">
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight">
                    {playerStatsWithRankings.apg.toFixed(1)}
                  </div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">AST</div>
                  <div className="text-sm text-emerald-400 font-mono font-semibold">#{playerStatsWithRankings.apg_rank}</div>
                </div>
                {/* STL */}
                <div className="text-center">
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight">
                    {playerStatsWithRankings.spg.toFixed(1)}
                  </div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">STL</div>
                  <div className="text-sm text-emerald-400 font-mono font-semibold">#{playerStatsWithRankings.spg_rank}</div>
                </div>
                {/* BLK */}
                <div className="text-center">
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight">
                    {playerStatsWithRankings.bpg.toFixed(1)}
                  </div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">BLK</div>
                  <div className="text-sm text-emerald-400 font-mono font-semibold">#{playerStatsWithRankings.bpg_rank}</div>
                </div>
                {/* FG% */}
                {playerStatsWithRankings.fg_pct !== null && (
                  <div className="text-center">
                    <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight">
                      {playerStatsWithRankings.fg_pct.toFixed(0)}%
                    </div>
                    <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">FG</div>
                    <div className="text-sm text-emerald-400 font-mono font-semibold">#{playerStatsWithRankings.fg_pct_rank}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Player Meta */}
          <div className="flex items-center gap-3 text-zinc-400">
            {playerInfo.jersey_number && (
              <span className="text-xl font-mono font-bold">#{playerInfo.jersey_number}</span>
            )}
            {playerInfo.position && (
              <>
                <span className="text-zinc-600">|</span>
                <span className="text-lg">{playerInfo.position}</span>
              </>
            )}
            <span className="text-zinc-600">|</span>
            <span className="text-lg font-medium">{playerInfo.team_name || playerInfo.team_abbreviation}</span>
          </div>

          {/* Mobile Stats Grid - Below meta on mobile/tablet */}
          {playerStatsWithRankings && (
            <div className="lg:hidden mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* PTS */}
              <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xl font-bold text-white font-mono">{playerStatsWithRankings.ppg.toFixed(1)}</div>
                  <div className="text-xs text-zinc-500 uppercase">PTS</div>
                </div>
                <div className="text-sm text-emerald-400 font-mono">#{playerStatsWithRankings.ppg_rank}</div>
              </div>
              {/* REB */}
              <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xl font-bold text-white font-mono">{playerStatsWithRankings.rpg.toFixed(1)}</div>
                  <div className="text-xs text-zinc-500 uppercase">REB</div>
                </div>
                <div className="text-sm text-emerald-400 font-mono">#{playerStatsWithRankings.rpg_rank}</div>
              </div>
              {/* AST */}
              <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xl font-bold text-white font-mono">{playerStatsWithRankings.apg.toFixed(1)}</div>
                  <div className="text-xs text-zinc-500 uppercase">AST</div>
                </div>
                <div className="text-sm text-emerald-400 font-mono">#{playerStatsWithRankings.apg_rank}</div>
              </div>
              {/* STL */}
              <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xl font-bold text-white font-mono">{playerStatsWithRankings.spg.toFixed(1)}</div>
                  <div className="text-xs text-zinc-500 uppercase">STL</div>
                </div>
                <div className="text-sm text-emerald-400 font-mono">#{playerStatsWithRankings.spg_rank}</div>
              </div>
              {/* BLK */}
              <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xl font-bold text-white font-mono">{playerStatsWithRankings.bpg.toFixed(1)}</div>
                  <div className="text-xs text-zinc-500 uppercase">BLK</div>
                </div>
                <div className="text-sm text-emerald-400 font-mono">#{playerStatsWithRankings.bpg_rank}</div>
              </div>
              {/* FG% */}
              {playerStatsWithRankings.fg_pct !== null && (
                <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-4 py-3">
                  <div>
                    <div className="text-xl font-bold text-white font-mono">{playerStatsWithRankings.fg_pct.toFixed(0)}%</div>
                    <div className="text-xs text-zinc-500 uppercase">FG</div>
                  </div>
                  <div className="text-sm text-emerald-400 font-mono">#{playerStatsWithRankings.fg_pct_rank}</div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* SECTION 01.5: GAME PRESENCE + BAR CHART - Side by side on desktop */}
      {(seasonGames.length > 0 || (recentGames.length > 0 && seasonStats)) && (
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Game Presence Calendar */}
            {seasonGames.length > 0 && (
              <div className="w-full">
                <PlayerPresenceCalendar
                  games={seasonGames}
                  seasonStart={`${currentSeason.split('-')[0]}-10-22`}
                  seasonEnd={`20${currentSeason.split('-')[1]}-04-13`}
                  fullSize={true}
                />
              </div>
            )}

            {/* Prop Performance Bar Chart */}
            {recentGames.length > 0 && seasonStats && (
              <div className="w-full lg:col-span-2">
                <PropPerformanceBarChart
                  games={recentGames.map(g => ({
                    game_id: g.game_id,
                    game_date: g.game_date,
                    points: g.points,
                    rebounds: g.rebounds,
                    assists: g.assists,
                    steals: g.steals,
                    blocks: g.blocks,
                    turnovers: g.turnovers,
                    fg_made: g.fg_made,
                    fg_attempted: g.fg_attempted,
                    fg3_made: g.fg3_made,
                    fg3_attempted: g.fg3_attempted,
                    ft_made: g.ft_made,
                    ft_attempted: g.ft_attempted,
                    minutes: g.minutes,
                    opponent: g.opponent,
                    opponent_abbr: g.opponent_abbr,
                    home_away: g.home_away as 'home' | 'away',
                    result: g.result as 'W' | 'L',
                    team_score: g.team_score,
                    opponent_score: g.opponent_score
                  }))}
                  playerAvg={{
                    points_avg: parseFloat(seasonStats.points_avg) || 0,
                    rebounds_avg: parseFloat(seasonStats.rebounds_avg) || 0,
                    assists_avg: parseFloat(seasonStats.assists_avg) || 0,
                    steals_avg: parseFloat(seasonStats.steals_avg) || 0,
                    blocks_avg: parseFloat(seasonStats.blocks_avg) || 0,
                    turnovers_avg: parseFloat(seasonStats.turnovers_avg) || 0,
                    threes_avg: parseFloat(seasonStats.threes_avg) || 0,
                    fgm_avg: parseFloat(seasonStats.fgm_avg) || 0,
                    ftm_avg: parseFloat(seasonStats.ftm_avg) || 0,
                    minutes_avg: parseFloat(seasonStats.minutes_avg) || 0
                  }}
                  playerTeam={playerInfo.team_abbreviation || 'N/A'}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 05: GAME LOG TABLE */}
      {playerGamelogs && playerGamelogs.length > 0 && (
        <section className="py-20 px-4 sm:px-8 lg:px-12">
          <div className="w-full">
            {/* Section identifier */}
            <div className="mb-8 flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-500 tracking-widest font-mono">05</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <PlayerGamelogsTable
              gamelogs={playerGamelogs}
              season={currentSeason}
            />
          </div>
        </section>
      )}

      {/* SECTION 05.5: ABSENCE IMPACT (Teammate Performance When This Player Is Out) */}
      {teammatesWhenAbsent && teammatesWhenAbsent.length > 0 && seasonGames && (
        <section className="py-20 px-4 sm:px-8 lg:px-12">
          <div className="w-full">
            {/* Section identifier */}
            <div className="mb-8 flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-500 tracking-widest font-mono">05.5</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="text-2xl md:text-4xl font-black text-white uppercase" style={{ letterSpacing: '-0.05em' }}>
                Absence
              </h2>
              <span className="text-2xl md:text-4xl font-light text-zinc-600 uppercase" style={{ letterSpacing: '-0.05em' }}>
                Impact
              </span>
            </div>

            <AbsenceCascadeView
              absentPlayer={{
                playerId: playerIdNum,
                playerName: playerInfo.full_name,
                teamId: parseInt(playerInfo.team_id) || 0,
                teamAbbr: playerInfo.team_abbreviation || 'N/A',
                gamesPlayed: seasonGames.filter(g => g.played).length,
                gamesMissed: seasonGames.filter(g => !g.played).length
              }}
              teammates={teammatesWhenAbsent}
            />
          </div>
        </section>
      )}

      {/* SECTION 06: PROPS ANALYSIS */}
      {playerProps && playerProps.length > 0 && (
        <section className="py-20 px-4 sm:px-8 lg:px-12">
          <div className="w-full">
            {/* Section identifier */}
            <div className="mb-8 flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-500 tracking-widest font-mono">06</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="text-2xl md:text-4xl font-black text-white uppercase" style={{ letterSpacing: '-0.05em' }}>
                Props
              </h2>
              <span className="text-2xl md:text-4xl font-light text-zinc-600 uppercase" style={{ letterSpacing: '-0.05em' }}>
                Analysis
              </span>
            </div>

            {/* Props Table */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Prop</th>
                      <th className="text-center py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Line</th>
                      <th className="text-center py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">L10 Avg</th>
                      <th className="text-center py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider min-w-[120px]">Hit Rate</th>
                      <th className="text-center py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Over</th>
                      <th className="text-center py-4 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Under</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerProps.map((prop) => {
                      const propAvg = propsAvg.find(p => p.prop_type === prop.prop_type)
                      const avgValue = propAvg ? parseFloat(propAvg.avg_value) : 0
                      const line = parseFloat(prop.line)
                      const isOver = avgValue > line
                      const diff = avgValue - line

                      // Calculate hit rate from recent games
                      const propKey = prop.prop_type === '3pm' ? 'fg3_made' :
                                     prop.prop_type === 'pra' ? null : prop.prop_type
                      let hitRate = 0
                      let gamesOver = 0
                      if (propKey && recentGames.length > 0) {
                        const last10 = recentGames.slice(0, 10)
                        if (propKey === 'pra') {
                          gamesOver = last10.filter(g => (g.points + g.rebounds + g.assists) > line).length
                        } else {
                          gamesOver = last10.filter(g => g[propKey as keyof typeof g] > line).length
                        }
                        hitRate = (gamesOver / last10.length) * 100
                      } else if (prop.prop_type === 'pra' && recentGames.length > 0) {
                        const last10 = recentGames.slice(0, 10)
                        gamesOver = last10.filter(g => (g.points + g.rebounds + g.assists) > line).length
                        hitRate = (gamesOver / last10.length) * 100
                      }

                      const propLabel: Record<string, string> = {
                        'points': 'Points',
                        'rebounds': 'Rebounds',
                        'assists': 'Assists',
                        'pra': 'Pts + Reb + Ast',
                        '3pm': '3-Pointers'
                      }

                      return (
                        <tr key={prop.prop_type} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          <td className="py-4 px-4 text-white font-medium">
                            {propLabel[prop.prop_type] || prop.prop_type}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-white font-mono font-bold">{line.toFixed(1)}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`font-mono font-bold ${isOver ? 'text-emerald-400' : 'text-red-400'}`}>
                              {avgValue.toFixed(1)}
                            </span>
                            <span className={`text-xs ml-1 ${isOver ? 'text-emerald-400' : 'text-red-400'}`}>
                              ({diff > 0 ? '+' : ''}{diff.toFixed(1)})
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${hitRate >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                  style={{ width: `${hitRate}%` }}
                                />
                              </div>
                              <span className={`text-xs font-mono font-semibold w-10 text-right ${hitRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {hitRate.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-mono text-zinc-300">{parseFloat(prop.over_odds_decimal).toFixed(2)}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-mono text-zinc-300">{parseFloat(prop.under_odds_decimal).toFixed(2)}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* Legend */}
              <div className="px-4 py-3 border-t border-zinc-800 flex items-center gap-6 text-xs text-zinc-500">
                <span>L10 = Last 10 games average</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Over line
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Under line
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 07: RECENT FORM (L10) */}
      {last10Stats && (
        <section className="py-20 px-4 sm:px-8 lg:px-12">
          <div className="w-full">
            {/* Section identifier */}
            <div className="mb-8 flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-500 tracking-widest font-mono">07</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="text-2xl md:text-4xl font-black text-white uppercase" style={{ letterSpacing: '-0.05em' }}>
                Recent
              </h2>
              <span className="text-2xl md:text-4xl font-light text-zinc-600 uppercase" style={{ letterSpacing: '-0.05em' }}>
                Form
              </span>
            </div>

            {/* L10 Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* L10 PPG */}
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">L10 PPG</div>
                <div className="text-4xl font-black text-white font-mono">{last10Stats.ppg}</div>
                <div className="mt-2 text-sm">
                  {parseFloat(last10Stats.ppg) >= stats.ppg ? (
                    <span className="text-emerald-400">
                      +{(parseFloat(last10Stats.ppg) - stats.ppg).toFixed(1)} vs Season
                    </span>
                  ) : (
                    <span className="text-red-400">
                      {(parseFloat(last10Stats.ppg) - stats.ppg).toFixed(1)} vs Season
                    </span>
                  )}
                </div>
              </div>

              {/* Record */}
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">L10 Record</div>
                <div className="text-4xl font-black font-mono">
                  <span className="text-emerald-400">{last10Stats.wins}</span>
                  <span className="text-zinc-600">-</span>
                  <span className="text-red-400">{last10Stats.losses}</span>
                </div>
                <div className="mt-2 text-sm text-zinc-500">
                  {((last10Stats.wins / (last10Stats.wins + last10Stats.losses)) * 100).toFixed(0)}% Win Rate
                </div>
              </div>

              {/* High Game */}
              <div className="bg-zinc-900/50 rounded-xl border border-emerald-900/50 p-6">
                <div className="text-xs text-emerald-400 uppercase tracking-wider mb-2">High Game</div>
                <div className="text-4xl font-black text-emerald-400 font-mono">{last10Stats.highGame}</div>
                <div className="mt-2 text-sm text-zinc-500">
                  Best in L10
                </div>
              </div>

              {/* Low Game */}
              <div className="bg-zinc-900/50 rounded-xl border border-red-900/50 p-6">
                <div className="text-xs text-red-400 uppercase tracking-wider mb-2">Low Game</div>
                <div className="text-4xl font-black text-red-400 font-mono">{last10Stats.lowGame}</div>
                <div className="mt-2 text-sm text-zinc-500">
                  Worst in L10
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 08: ADVANCED ANALYTICS */}
      {advancedStats && (advanced.tsPct > 0 || advanced.efgPct > 0) && (
        <section className="py-20 px-4 sm:px-8 lg:px-12">
          <div className="w-full">
            {/* Section identifier */}
            <div className="mb-8 flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-500 tracking-widest font-mono">08</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <AdvancedStatsRadar
              tsPct={advanced.tsPct}
              efgPct={advanced.efgPct}
              usage={advanced.usage}
              offRtg={advanced.offRtg}
              defRtg={advanced.defRtg}
              netRtg={advanced.netRtg}
            />
          </div>
        </section>
      )}

    </AppLayout>
  )
}
