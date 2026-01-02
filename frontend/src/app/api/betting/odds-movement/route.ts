import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/betting/odds-movement
 *
 * Returns full time-series data for odds movement visualization
 * - Moneyline history over time
 * - Spread line movement
 * - Total line movement
 * - Summary metrics for each game
 */
export async function GET() {
  try {
    // Get all games for today with betting data
    const gamesResult = await query(`
      SELECT DISTINCT
        g.game_id,
        g.game_date,
        g.game_status,
        t1.abbreviation as away,
        t2.abbreviation as home,
        t1.full_name as away_name,
        t2.full_name as home_name
      FROM games g
      JOIN teams t1 ON g.away_team_id = t1.team_id
      JOIN teams t2 ON g.home_team_id = t2.team_id
      JOIN betting_events be ON g.game_id = be.game_id
      WHERE g.game_date >= CURRENT_DATE
        AND g.game_date <= CURRENT_DATE + 1
      ORDER BY g.game_date, g.game_id
    `)

    if (gamesResult.rows.length === 0) {
      return NextResponse.json({
        games: [],
        fetchedAt: new Date().toISOString(),
        message: 'No games with betting data found for today'
      })
    }

    // Get moneyline time series for all games
    const mlResult = await query(`
      SELECT
        g.game_id,
        t1.full_name as away_name,
        t2.full_name as home_name,
        bo.selection,
        bo.odds_decimal,
        bo.recorded_at
      FROM betting_events be
      JOIN games g ON be.game_id = g.game_id
      JOIN teams t1 ON g.away_team_id = t1.team_id
      JOIN teams t2 ON g.home_team_id = t2.team_id
      JOIN betting_markets bm ON be.event_id = bm.event_id
      JOIN betting_odds bo ON bm.market_id = bo.market_id
      WHERE g.game_date >= CURRENT_DATE
        AND g.game_date <= CURRENT_DATE + 1
        AND bm.market_name = 'Game Moneyline'
      ORDER BY g.game_id, bo.recorded_at
    `)

    // Get spread time series (main line only - closest to pick'em)
    const spreadResult = await query(`
      WITH spread_data AS (
        SELECT
          g.game_id,
          t1.abbreviation as away,
          t2.abbreviation as home,
          bo.selection,
          bo.odds_decimal,
          bo.handicap,
          bo.recorded_at,
          ABS(bo.handicap) as abs_handicap
        FROM betting_events be
        JOIN games g ON be.game_id = g.game_id
        JOIN teams t1 ON g.away_team_id = t1.team_id
        JOIN teams t2 ON g.home_team_id = t2.team_id
        JOIN betting_markets bm ON be.event_id = bm.event_id
        JOIN betting_odds bo ON bm.market_id = bo.market_id
        WHERE g.game_date >= CURRENT_DATE
          AND g.game_date <= CURRENT_DATE + 1
          AND bm.market_type = 'spread'
          AND bm.market_name LIKE 'Game Spread%'
      ),
      main_line AS (
        SELECT *,
          ROW_NUMBER() OVER (
            PARTITION BY game_id, recorded_at
            ORDER BY ABS(1.91 - odds_decimal) + ABS(1.91 - odds_decimal)
          ) as line_rank
        FROM spread_data
      )
      SELECT game_id, away, home, selection, odds_decimal, handicap, recorded_at
      FROM main_line
      WHERE line_rank <= 2
      ORDER BY game_id, recorded_at
    `)

    // Get totals time series (main line only)
    const totalsResult = await query(`
      WITH totals_data AS (
        SELECT
          g.game_id,
          CAST(SUBSTRING(bm.market_name FROM 'Game Game Total ([0-9.]+)') AS NUMERIC) as total_line,
          bo.selection,
          bo.odds_decimal,
          bo.recorded_at
        FROM betting_events be
        JOIN games g ON be.game_id = g.game_id
        JOIN betting_markets bm ON be.event_id = bm.event_id
        JOIN betting_odds bo ON bm.market_id = bo.market_id
        WHERE g.game_date >= CURRENT_DATE
          AND g.game_date <= CURRENT_DATE + 1
          AND bm.market_name LIKE 'Game Game Total%'
          AND (bo.selection LIKE 'Over%' OR bo.selection LIKE 'Under%')
      ),
      pivoted AS (
        SELECT
          game_id,
          total_line,
          recorded_at,
          MAX(CASE WHEN selection LIKE 'Over%' THEN odds_decimal END) as over_odds,
          MAX(CASE WHEN selection LIKE 'Under%' THEN odds_decimal END) as under_odds
        FROM totals_data
        GROUP BY game_id, total_line, recorded_at
      ),
      main_line AS (
        SELECT *,
          ABS(COALESCE(over_odds, 1.91) - COALESCE(under_odds, 1.91)) as juice_diff,
          ROW_NUMBER() OVER (
            PARTITION BY game_id, recorded_at
            ORDER BY ABS(COALESCE(over_odds, 1.91) - COALESCE(under_odds, 1.91))
          ) as line_rank
        FROM pivoted
        WHERE over_odds IS NOT NULL AND under_odds IS NOT NULL
      )
      SELECT game_id, total_line, over_odds, under_odds, recorded_at
      FROM main_line
      WHERE line_rank = 1
      ORDER BY game_id, recorded_at
    `)

    // Process data by game
    const gameMap = new Map<string, any>()

    // Initialize games
    for (const game of gamesResult.rows) {
      gameMap.set(game.game_id, {
        gameId: game.game_id,
        matchup: `${game.away} @ ${game.home}`,
        awayTeam: game.away,
        homeTeam: game.home,
        awayName: game.away_name,
        homeName: game.home_name,
        gameDate: game.game_date,
        gameStatus: game.game_status,
        moneyline: [] as { timestamp: string; time: string; away: number; home: number }[],
        spread: [] as { timestamp: string; time: string; line: number; favorite: string; awayOdds: number; homeOdds: number }[],
        total: [] as { timestamp: string; time: string; line: number; overOdds: number; underOdds: number }[],
        summary: {
          mlOpen: { away: 0, home: 0 },
          mlCurrent: { away: 0, home: 0 },
          mlMovement: { away: 0, home: 0 },
          spreadOpen: 0,
          spreadCurrent: 0,
          spreadMovement: 0,
          totalOpen: 0,
          totalCurrent: 0,
          totalMovement: 0,
          dataPoints: 0
        }
      })
    }

    // Process moneyline data
    const mlByGameTime = new Map<string, { away: number | null; home: number | null }>()

    for (const row of mlResult.rows) {
      const game = gameMap.get(row.game_id)
      if (!game) continue

      const key = `${row.game_id}-${row.recorded_at.toISOString()}`
      if (!mlByGameTime.has(key)) {
        mlByGameTime.set(key, { away: null, home: null })
      }

      const mlData = mlByGameTime.get(key)!
      const isAway = row.selection === row.away_name
      const odds = parseFloat(row.odds_decimal)

      if (isAway) {
        mlData.away = odds
      } else {
        mlData.home = odds
      }

      // If we have both sides, add to game data
      if (mlData.away !== null && mlData.home !== null) {
        const time = new Date(row.recorded_at).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        game.moneyline.push({
          timestamp: row.recorded_at.toISOString(),
          time,
          away: mlData.away,
          home: mlData.home
        })
      }
    }

    // Process spread data
    for (const row of spreadResult.rows) {
      const game = gameMap.get(row.game_id)
      if (!game) continue

      // Find existing entry for this timestamp or create new
      const timestamp = row.recorded_at.toISOString()
      let spreadEntry = game.spread.find((s: any) => s.timestamp === timestamp)

      if (!spreadEntry) {
        const time = new Date(row.recorded_at).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        spreadEntry = {
          timestamp,
          time,
          line: Math.abs(parseFloat(row.handicap)),
          favorite: parseFloat(row.handicap) < 0 ? row.selection : (row.selection === game.awayTeam ? game.homeTeam : game.awayTeam),
          awayOdds: 0,
          homeOdds: 0
        }
        game.spread.push(spreadEntry)
      }

      const isAway = row.selection === game.awayTeam
      const odds = parseFloat(row.odds_decimal)

      if (isAway) {
        spreadEntry.awayOdds = odds
      } else {
        spreadEntry.homeOdds = odds
      }
    }

    // Process totals data
    for (const row of totalsResult.rows) {
      const game = gameMap.get(row.game_id)
      if (!game) continue

      const time = new Date(row.recorded_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })

      game.total.push({
        timestamp: row.recorded_at.toISOString(),
        time,
        line: parseFloat(row.total_line),
        overOdds: parseFloat(row.over_odds),
        underOdds: parseFloat(row.under_odds)
      })
    }

    // Calculate summaries for each game
    for (const game of gameMap.values()) {
      // ML summary
      if (game.moneyline.length > 0) {
        const first = game.moneyline[0]
        const last = game.moneyline[game.moneyline.length - 1]
        game.summary.mlOpen = { away: first.away, home: first.home }
        game.summary.mlCurrent = { away: last.away, home: last.home }
        game.summary.mlMovement = {
          away: parseFloat((last.away - first.away).toFixed(3)),
          home: parseFloat((last.home - first.home).toFixed(3))
        }
      }

      // Spread summary
      if (game.spread.length > 0) {
        const first = game.spread[0]
        const last = game.spread[game.spread.length - 1]
        game.summary.spreadOpen = first.line
        game.summary.spreadCurrent = last.line
        game.summary.spreadMovement = parseFloat((last.line - first.line).toFixed(1))
      }

      // Total summary
      if (game.total.length > 0) {
        const first = game.total[0]
        const last = game.total[game.total.length - 1]
        game.summary.totalOpen = first.line
        game.summary.totalCurrent = last.line
        game.summary.totalMovement = parseFloat((last.line - first.line).toFixed(1))
      }

      game.summary.dataPoints = Math.max(
        game.moneyline.length,
        game.spread.length,
        game.total.length
      )
    }

    // Sort games by matchup
    const games = Array.from(gameMap.values())
      .filter(g => g.summary.dataPoints > 0)
      .sort((a, b) => a.matchup.localeCompare(b.matchup))

    // Calculate overall insights
    const insights = {
      totalGames: games.length,
      totalDataPoints: games.reduce((sum, g) => sum + g.summary.dataPoints, 0),
      biggestMLMovers: games
        .flatMap(g => [
          { game: g.matchup, team: g.awayTeam, movement: g.summary.mlMovement.away },
          { game: g.matchup, team: g.homeTeam, movement: g.summary.mlMovement.home }
        ])
        .filter(m => Math.abs(m.movement) > 0.05)
        .sort((a, b) => Math.abs(b.movement) - Math.abs(a.movement))
        .slice(0, 5),
      biggestTotalMovers: games
        .filter(g => Math.abs(g.summary.totalMovement) > 0)
        .map(g => ({ game: g.matchup, movement: g.summary.totalMovement }))
        .sort((a, b) => Math.abs(b.movement) - Math.abs(a.movement))
        .slice(0, 5),
      overallTotalTrend: games.reduce((sum, g) => sum + g.summary.totalMovement, 0)
    }

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      games,
      insights
    })

  } catch (error) {
    console.error('Error fetching odds movement data:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch odds movement data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
