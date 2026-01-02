import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/betting/odds-terminal
 *
 * Returns consolidated odds data for the terminal display:
 * - All games for date range (with or without betting data)
 * - Moneyline evolution (open vs current)
 * - Totals evolution (line movement)
 * - Player props with movement
 * - Insights and signals
 */
export async function GET() {
  try {
    // FIRST: Get ALL games for the date range (regardless of betting data)
    const allGamesResult = await query(`
      SELECT g.game_id, g.game_date, g.game_status,
             t1.abbreviation as away, t2.abbreviation as home,
             t1.full_name as away_name, t2.full_name as home_name,
             g.away_team_score, g.home_team_score
      FROM games g
      JOIN teams t1 ON g.away_team_id = t1.team_id
      JOIN teams t2 ON g.home_team_id = t2.team_id
      WHERE g.game_date >= CURRENT_DATE - 1
        AND g.game_date <= CURRENT_DATE + 7
      ORDER BY g.game_date, g.game_id
    `)

    // Get moneylines with history (LEFT JOIN approach - only for games with data)
    const moneylinesResult = await query(`
      WITH ml_history AS (
          SELECT g.game_id, g.game_date, t1.full_name as away_name, t2.full_name as home_name,
                 t1.abbreviation as away, t2.abbreviation as home,
                 bo.selection, bo.odds_decimal, bo.recorded_at
          FROM betting_events be
          JOIN games g ON be.game_id = g.game_id
          JOIN teams t1 ON g.away_team_id = t1.team_id
          JOIN teams t2 ON g.home_team_id = t2.team_id
          JOIN betting_markets bm ON be.event_id = bm.event_id
          JOIN betting_odds bo ON bm.market_id = bo.market_id
          WHERE g.game_date >= CURRENT_DATE - 1
            AND bm.market_name = 'Game Moneyline'
      ),
      first_last AS (
          SELECT game_id, game_date, away, home, away_name, home_name, selection,
                 (SELECT odds_decimal FROM ml_history m2
                  WHERE m2.game_id = ml_history.game_id AND m2.selection = ml_history.selection
                  ORDER BY recorded_at ASC LIMIT 1) as open_odds,
                 (SELECT odds_decimal FROM ml_history m2
                  WHERE m2.game_id = ml_history.game_id AND m2.selection = ml_history.selection
                  ORDER BY recorded_at DESC LIMIT 1) as current_odds,
                 COUNT(*) as readings
          FROM ml_history
          GROUP BY game_id, game_date, away, home, away_name, home_name, selection
      )
      SELECT game_id, game_date, away, home, away_name, home_name,
             MAX(CASE WHEN selection = away_name THEN open_odds END) as away_open,
             MAX(CASE WHEN selection = away_name THEN current_odds END) as away_current,
             MAX(CASE WHEN selection = home_name THEN open_odds END) as home_open,
             MAX(CASE WHEN selection = home_name THEN current_odds END) as home_current,
             MAX(readings) as readings
      FROM first_last
      GROUP BY game_id, game_date, away, home, away_name, home_name
      ORDER BY game_date, game_id
    `)

    // Get totals with history
    const totalsResult = await query(`
      WITH totals_history AS (
          SELECT g.game_id, g.game_date, t1.abbreviation as away, t2.abbreviation as home,
                 CAST(SUBSTRING(bm.market_name FROM 'Game Game Total ([0-9.]+)') AS NUMERIC) as total_line,
                 bo.selection, bo.odds_decimal, bo.recorded_at
          FROM betting_events be
          JOIN games g ON be.game_id = g.game_id
          JOIN teams t1 ON g.away_team_id = t1.team_id
          JOIN teams t2 ON g.home_team_id = t2.team_id
          JOIN betting_markets bm ON be.event_id = bm.event_id
          JOIN betting_odds bo ON bm.market_id = bo.market_id
          WHERE g.game_date >= CURRENT_DATE - 1
            AND bm.market_name LIKE 'Game Game Total%'
      ),
      pivoted AS (
          SELECT game_id, game_date, away, home, total_line, recorded_at,
                 MAX(CASE WHEN selection LIKE 'Over%' THEN odds_decimal END) as over_odds,
                 MAX(CASE WHEN selection LIKE 'Under%' THEN odds_decimal END) as under_odds
          FROM totals_history
          GROUP BY game_id, game_date, away, home, total_line, recorded_at
      ),
      main_lines AS (
          SELECT *,
                 ABS(over_odds - under_odds) as juice_diff,
                 ROW_NUMBER() OVER (PARTITION BY game_id, recorded_at ORDER BY ABS(over_odds - under_odds)) as line_rank
          FROM pivoted
          WHERE over_odds IS NOT NULL AND under_odds IS NOT NULL
      )
      SELECT game_id, game_date, away, home,
             (SELECT total_line FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at ASC LIMIT 1) as open_line,
             (SELECT total_line FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at DESC LIMIT 1) as current_line,
             (SELECT over_odds FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at DESC LIMIT 1) as over_odds,
             (SELECT under_odds FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at DESC LIMIT 1) as under_odds
      FROM main_lines
      WHERE line_rank = 1
      GROUP BY game_id, game_date, away, home
      ORDER BY
        (SELECT total_line FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at DESC LIMIT 1) -
        (SELECT total_line FROM main_lines m2 WHERE m2.game_id = main_lines.game_id AND m2.line_rank = 1 ORDER BY recorded_at ASC LIMIT 1)
    `)

    // Get player props with history
    const propsResult = await query(`
      WITH prop_history AS (
          SELECT pp.player_name, pp.prop_type, pp.line, pp.over_odds_decimal, pp.under_odds_decimal,
                 pp.recorded_at, t1.abbreviation as away, t2.abbreviation as home, pp.game_id
          FROM player_props pp
          JOIN games g ON pp.game_id = g.game_id
          JOIN teams t1 ON g.away_team_id = t1.team_id
          JOIN teams t2 ON g.home_team_id = t2.team_id
          WHERE g.game_date >= CURRENT_DATE
      ),
      aggregated AS (
          SELECT player_name, prop_type, away, home, game_id,
                 (SELECT line FROM prop_history p2 WHERE p2.player_name = prop_history.player_name AND p2.prop_type = prop_history.prop_type AND p2.game_id = prop_history.game_id ORDER BY recorded_at ASC LIMIT 1) as open_line,
                 (SELECT line FROM prop_history p2 WHERE p2.player_name = prop_history.player_name AND p2.prop_type = prop_history.prop_type AND p2.game_id = prop_history.game_id ORDER BY recorded_at DESC LIMIT 1) as current_line,
                 (SELECT over_odds_decimal FROM prop_history p2 WHERE p2.player_name = prop_history.player_name AND p2.prop_type = prop_history.prop_type AND p2.game_id = prop_history.game_id ORDER BY recorded_at DESC LIMIT 1) as over_odds,
                 (SELECT under_odds_decimal FROM prop_history p2 WHERE p2.player_name = prop_history.player_name AND p2.prop_type = prop_history.prop_type AND p2.game_id = prop_history.game_id ORDER BY recorded_at DESC LIMIT 1) as under_odds,
                 COUNT(*) as readings
          FROM prop_history
          GROUP BY player_name, prop_type, away, home, game_id
      )
      SELECT player_name, prop_type, away || '@' || home as game,
             open_line, current_line,
             current_line - open_line as movement,
             over_odds, under_odds
      FROM aggregated
      ORDER BY prop_type, current_line DESC, player_name
    `)

    // Get counts
    const countsResult = await query(`
      SELECT
        (SELECT COUNT(DISTINCT be.game_id) FROM betting_events be JOIN games g ON be.game_id = g.game_id WHERE g.game_date >= CURRENT_DATE) as games_count,
        (SELECT COUNT(*) FROM betting_markets bm JOIN betting_events be ON bm.event_id = be.event_id JOIN games g ON be.game_id = g.game_id WHERE g.game_date >= CURRENT_DATE) as markets_count,
        (SELECT COUNT(*) FROM player_props pp JOIN games g ON pp.game_id = g.game_id WHERE g.game_date >= CURRENT_DATE AND pp.recorded_at = (SELECT MAX(pp2.recorded_at) FROM player_props pp2 WHERE pp2.player_name = pp.player_name AND pp2.prop_type = pp.prop_type AND pp2.game_id = pp.game_id)) as props_count
    `)

    // Create lookup maps for betting data by game_id
    const moneylinesByGame = new Map(
      moneylinesResult.rows.map(row => [row.game_id, row])
    )
    const totalsByGame = new Map(
      totalsResult.rows.map(row => [row.game_id, row])
    )

    // Process ALL games with betting data merged in
    const allGames = allGamesResult.rows.map(game => {
      const ml = moneylinesByGame.get(game.game_id)
      const total = totalsByGame.get(game.game_id)

      return {
        gameId: game.game_id,
        game: `${game.away} @ ${game.home}`,
        gameDate: game.game_date,
        gameTime: null,  // Column doesn't exist in games table
        gameStatus: game.game_status,
        awayScore: game.away_team_score,
        homeScore: game.home_team_score,
        awayTeam: {
          abbr: game.away,
          name: game.away_name,
          openOdds: ml ? parseFloat(ml.away_open) || null : null,
          currentOdds: ml ? parseFloat(ml.away_current) || null : null,
          movement: ml ? (parseFloat(ml.away_current) || 0) - (parseFloat(ml.away_open) || 0) : null
        },
        homeTeam: {
          abbr: game.home,
          name: game.home_name,
          openOdds: ml ? parseFloat(ml.home_open) || null : null,
          currentOdds: ml ? parseFloat(ml.home_current) || null : null,
          movement: ml ? (parseFloat(ml.home_current) || 0) - (parseFloat(ml.home_open) || 0) : null
        },
        total: total ? {
          openLine: parseFloat(total.open_line) || null,
          currentLine: parseFloat(total.current_line) || null,
          movement: (parseFloat(total.current_line) || 0) - (parseFloat(total.open_line) || 0),
          overOdds: parseFloat(total.over_odds) || null,
          underOdds: parseFloat(total.under_odds) || null
        } : null,
        hasOdds: !!ml || !!total,
        readings: ml ? parseInt(ml.readings) || 0 : 0
      }
    })

    // Legacy format for backward compatibility
    const moneylines = moneylinesResult.rows.map(row => ({
      gameId: row.game_id,
      game: `${row.away} @ ${row.home}`,
      gameDate: row.game_date,
      awayTeam: {
        abbr: row.away,
        name: row.away_name,
        openOdds: parseFloat(row.away_open) || 0,
        currentOdds: parseFloat(row.away_current) || 0,
        movement: (parseFloat(row.away_current) || 0) - (parseFloat(row.away_open) || 0)
      },
      homeTeam: {
        abbr: row.home,
        name: row.home_name,
        openOdds: parseFloat(row.home_open) || 0,
        currentOdds: parseFloat(row.home_current) || 0,
        movement: (parseFloat(row.home_current) || 0) - (parseFloat(row.home_open) || 0)
      },
      readings: parseInt(row.readings) || 0
    }))

    // Legacy format for totals
    const totals = totalsResult.rows.map(row => ({
      gameId: row.game_id,
      game: `${row.away} @ ${row.home}`,
      gameDate: row.game_date,
      openLine: parseFloat(row.open_line) || 0,
      currentLine: parseFloat(row.current_line) || 0,
      movement: (parseFloat(row.current_line) || 0) - (parseFloat(row.open_line) || 0),
      overOdds: parseFloat(row.over_odds) || 0,
      underOdds: parseFloat(row.under_odds) || 0
    }))

    // Process props
    const playerProps = propsResult.rows.map(row => ({
      playerName: row.player_name,
      game: row.game,
      propType: row.prop_type,
      openLine: parseFloat(row.open_line) || 0,
      currentLine: parseFloat(row.current_line) || 0,
      movement: parseFloat(row.movement) || 0,
      overOdds: parseFloat(row.over_odds) || 0,
      underOdds: parseFloat(row.under_odds) || 0
    }))

    // Calculate insights
    const biggestMLMovers = moneylines
      .flatMap(ml => [
        { team: ml.awayTeam.abbr, movement: ml.awayTeam.movement, direction: ml.awayTeam.movement < 0 ? 'steam' : 'drift' as const },
        { team: ml.homeTeam.abbr, movement: ml.homeTeam.movement, direction: ml.homeTeam.movement < 0 ? 'steam' : 'drift' as const }
      ])
      .filter(m => Math.abs(m.movement) > 0.05)
      .sort((a, b) => Math.abs(b.movement) - Math.abs(a.movement))
      .slice(0, 5)

    const underMoves = totals.filter(t => t.movement < 0).length
    const overMoves = totals.filter(t => t.movement > 0).length
    const totalsTrend = underMoves === totals.length ? 'all_under'
      : overMoves === totals.length ? 'all_over'
      : 'mixed'

    const totalPointsDropped = totals.reduce((sum, t) => sum + t.movement, 0)
    const propsWithMovement = playerProps.filter(p => p.movement !== 0).length

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      // New: all games with merged betting data
      allGames,
      totalGamesCount: allGames.length,
      gamesWithOdds: allGames.filter(g => g.hasOdds).length,
      // Legacy: separate arrays for backward compatibility
      gamesCount: parseInt(countsResult.rows[0]?.games_count) || 0,
      marketsCount: parseInt(countsResult.rows[0]?.markets_count) || 0,
      propsCount: parseInt(countsResult.rows[0]?.props_count) || 0,
      moneylines,
      totals,
      playerProps,
      insights: {
        biggestMLMovers,
        totalsTrend,
        totalPointsDropped: Math.round(totalPointsDropped * 10) / 10,
        propsWithMovement
      }
    })

  } catch (error) {
    console.error('Error fetching odds terminal data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch odds terminal data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
