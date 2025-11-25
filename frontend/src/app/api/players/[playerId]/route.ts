import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Helper to get current season
async function getCurrentSeason(): Promise<string> {
  const result = await query(`
    SELECT season_id
    FROM seasons
    WHERE is_current = true
    LIMIT 1
  `)
  return result.rows[0]?.season_id || '2025-26'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params
    const currentSeason = await getCurrentSeason()

    console.log('Fetching player data for:', playerId, 'Season:', currentSeason)

    // Get basic player info with season averages
    const playerInfoResult = await query(`
      SELECT
        p.player_id,
        p.first_name,
        p.last_name,
        p.full_name,
        NULL as position,
        NULL as jersey_number,
        NULL as height,
        NULL as weight,
        p.is_active,
        COUNT(DISTINCT pgs.game_id) as games_played,
        ROUND(AVG(pgs.minutes)::numeric, 1)::text as minutes_avg,
        ROUND(AVG(pgs.points)::numeric, 1)::text as points_avg,
        ROUND(AVG(pgs.rebounds)::numeric, 1)::text as rebounds_avg,
        ROUND(AVG(pgs.assists)::numeric, 1)::text as assists_avg,
        ROUND(AVG(pgs.steals)::numeric, 1)::text as steals_avg,
        ROUND(AVG(pgs.blocks)::numeric, 1)::text as blocks_avg,
        ROUND(AVG(pgs.turnovers)::numeric, 1)::text as turnovers_avg,
        ROUND(AVG(pgs.fg_made)::numeric, 1)::text as fgm_avg,
        ROUND(AVG(pgs.fg_attempted)::numeric, 1)::text as fga_avg,
        ROUND(AVG(pgs.fg3_made)::numeric, 1)::text as threes_avg,
        ROUND(AVG(pgs.fg3_attempted)::numeric, 1)::text as threes_attempted_avg,
        ROUND(AVG(pgs.ft_made)::numeric, 1)::text as ftm_avg,
        ROUND(AVG(pgs.ft_attempted)::numeric, 1)::text as fta_avg,
        ROUND((AVG(pgs.fg_made) / NULLIF(AVG(pgs.fg_attempted), 0) * 100)::numeric, 1)::text as fg_pct,
        ROUND((AVG(pgs.fg3_made) / NULLIF(AVG(pgs.fg3_attempted), 0) * 100)::numeric, 1)::text as three_pct,
        ROUND((AVG(pgs.ft_made) / NULLIF(AVG(pgs.ft_attempted), 0) * 100)::numeric, 1)::text as ft_pct
      FROM players p
      LEFT JOIN player_game_stats pgs ON p.player_id = pgs.player_id
      LEFT JOIN games g ON pgs.game_id = g.game_id AND g.season = $2
      WHERE p.player_id = $1
      GROUP BY p.player_id, p.first_name, p.last_name, p.full_name, p.is_active
    `, [playerId, currentSeason])

    if (playerInfoResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    const playerInfo = playerInfoResult.rows[0]

    // Get team info from most recent game
    const teamInfoResult = await query(`
      SELECT t.abbreviation as team_abbr, t.full_name as team_name
      FROM player_game_stats pgs
      JOIN teams t ON pgs.team_id = t.team_id
      JOIN games g ON pgs.game_id = g.game_id
      WHERE pgs.player_id = $1 AND g.season = $2
      ORDER BY g.game_date DESC
      LIMIT 1
    `, [playerId, currentSeason])

    // Add team info to player info
    if (teamInfoResult.rows.length > 0) {
      playerInfo.team_abbr = teamInfoResult.rows[0].team_abbr
      playerInfo.team_name = teamInfoResult.rows[0].team_name
    } else {
      playerInfo.team_abbr = null
      playerInfo.team_name = null
    }

    // Get next game for player's team
    const nextGameResult = await query(`
      SELECT
        g.game_id,
        g.game_date,
        NULL as game_time,
        NULL as venue,
        ht.team_id as home_team_id,
        ht.full_name as home_team,
        ht.abbreviation as home_abbr,
        at.team_id as away_team_id,
        at.full_name as away_team,
        at.abbreviation as away_abbr,
        CASE
          WHEN ht.abbreviation = $1 THEN 'home'
          WHEN at.abbreviation = $1 THEN 'away'
          ELSE null
        END as player_location
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.team_id
      JOIN teams at ON g.away_team_id = at.team_id
      WHERE
        g.season = $2
        AND g.game_status = 'Scheduled'
        AND (ht.abbreviation = $1 OR at.abbreviation = $1)
        AND g.game_date >= CURRENT_DATE
      ORDER BY g.game_date ASC
      LIMIT 1
    `, [playerInfo.team_abbr, currentSeason])

    const nextGame = nextGameResult.rows[0] || null

    // Get last 10 games performance
    const recentGamesResult = await query(`
      SELECT
        g.game_id,
        g.game_date,
        ht.abbreviation as home_team,
        at.abbreviation as away_team,
        g.home_team_score,
        g.away_team_score,
        CASE
          WHEN pgs.team_id = g.home_team_id THEN 'home'
          ELSE 'away'
        END as home_away,
        CASE
          WHEN pgs.team_id = g.home_team_id THEN at.abbreviation
          ELSE ht.abbreviation
        END as opponent_abbr,
        CASE
          WHEN pgs.team_id = g.home_team_id THEN g.away_team_score
          ELSE g.home_team_score
        END as opponent_score,
        CASE
          WHEN pgs.team_id = g.home_team_id THEN g.home_team_score
          ELSE g.away_team_score
        END as team_score,
        CASE
          WHEN (pgs.team_id = g.home_team_id AND g.home_team_score > g.away_team_score)
            OR (pgs.team_id = g.away_team_id AND g.away_team_score > g.home_team_score)
          THEN 'W'
          ELSE 'L'
        END as result,
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
      JOIN teams ht ON g.home_team_id = ht.team_id
      JOIN teams at ON g.away_team_id = at.team_id
      WHERE
        pgs.player_id = $1
        AND g.season = $2
        AND g.game_status = 'Final'
      ORDER BY g.game_date DESC
      LIMIT 10
    `, [playerId, currentSeason])

    const recentGames = recentGamesResult.rows

    // Get home/away splits
    const splitsResult = await query(`
      SELECT
        CASE WHEN pgs.team_id = g.home_team_id THEN 'home' ELSE 'away' END as location,
        COUNT(DISTINCT g.game_id) as games,
        ROUND(AVG(pgs.points)::numeric, 1)::text as points_avg,
        ROUND(AVG(pgs.rebounds)::numeric, 1)::text as rebounds_avg,
        ROUND(AVG(pgs.assists)::numeric, 1)::text as assists_avg,
        ROUND(AVG(pgs.minutes)::numeric, 1)::text as minutes_avg,
        ROUND((AVG(pgs.fg_made) / NULLIF(AVG(pgs.fg_attempted), 0) * 100)::numeric, 1)::text as fg_pct
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      WHERE
        pgs.player_id = $1
        AND g.season = $2
        AND g.game_status = 'Final'
      GROUP BY CASE WHEN pgs.team_id = g.home_team_id THEN 'home' ELSE 'away' END
    `, [playerId, currentSeason])

    const splits = {
      home: splitsResult.rows.find(r => r.location === 'home') || null,
      away: splitsResult.rows.find(r => r.location === 'away') || null
    }

    // Parse numeric strings to floats for averages
    const parseNumericFields = (obj: any) => {
      const fields = [
        'minutes_avg', 'points_avg', 'rebounds_avg', 'assists_avg',
        'steals_avg', 'blocks_avg', 'turnovers_avg',
        'fgm_avg', 'fga_avg', 'threes_avg', 'threes_attempted_avg',
        'ftm_avg', 'fta_avg', 'fg_pct', 'three_pct', 'ft_pct'
      ]
      const parsed = { ...obj }
      fields.forEach(field => {
        if (parsed[field]) {
          parsed[field] = parseFloat(parsed[field])
        }
      })
      return parsed
    }

    const response = {
      player: parseNumericFields(playerInfo),
      nextGame,
      recentGames,
      splits: {
        home: splits.home ? parseNumericFields(splits.home) : null,
        away: splits.away ? parseNumericFields(splits.away) : null
      },
      season: currentSeason
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Player detail fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch player data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
