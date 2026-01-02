import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Get current season
async function getCurrentSeason(): Promise<string> {
  const result = await query(`
    SELECT season_id
    FROM seasons
    WHERE is_current = true
    LIMIT 1
  `)
  return result.rows[0]?.season_id || '2025-26'
}

// Get team stats (PPG, OppPPG, Pace)
async function getTeamStats() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH team_avgs AS (
      SELECT
        t.team_id,
        t.abbreviation,
        t.full_name,
        COUNT(DISTINCT tgs.game_id) as games,
        ROUND(AVG(tgs.points), 1) as ppg,
        ROUND(AVG(tgs.pace), 1) as pace
      FROM team_game_stats tgs
      JOIN teams t ON tgs.team_id = t.team_id
      JOIN games g ON tgs.game_id = g.game_id
      WHERE g.season = $1
      GROUP BY t.team_id, t.abbreviation, t.full_name
    ),
    opp_avgs AS (
      SELECT
        t.team_id,
        ROUND(AVG(opp.points), 1) as opp_ppg
      FROM team_game_stats tgs
      JOIN games g ON tgs.game_id = g.game_id
      JOIN teams t ON tgs.team_id = t.team_id
      JOIN team_game_stats opp ON opp.game_id = tgs.game_id AND opp.team_id != tgs.team_id
      WHERE g.season = $1
      GROUP BY t.team_id
    )
    SELECT
      ta.team_id,
      ta.abbreviation,
      ta.full_name,
      ta.games,
      ta.ppg,
      ta.pace,
      oa.opp_ppg
    FROM team_avgs ta
    JOIN opp_avgs oa ON ta.team_id = oa.team_id
  `, [currentSeason])

  return result.rows
}

// Get tonight's games with totals lines from betting_events/markets/odds tables
// Uses the main market line (closest to 1.90/1.90 odds) - same logic as ML model
async function getTonightTotals() {
  const result = await query(`
    WITH all_lines AS (
      SELECT
        be.game_id,
        bm.market_id,
        SUBSTRING(bm.market_name FROM 'Game Total ([0-9.]+)')::NUMERIC as line,
        MAX(CASE WHEN bo.selection LIKE 'Over%' THEN bo.odds_decimal END) as over_odds,
        MAX(CASE WHEN bo.selection LIKE 'Under%' THEN bo.odds_decimal END) as under_odds
      FROM betting_events be
      JOIN betting_markets bm ON be.event_id = bm.event_id
      JOIN betting_odds bo ON bm.market_id = bo.market_id
      JOIN games g ON be.game_id = g.game_id
      WHERE g.game_date = CURRENT_DATE
        AND bm.market_name LIKE '%Game Total%'
      GROUP BY be.game_id, bm.market_id, bm.market_name
    ),
    ranked_lines AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY game_id
          ORDER BY ABS(over_odds - 1.90) + ABS(under_odds - 1.90)
        ) as rn
      FROM all_lines
      WHERE over_odds IS NOT NULL AND under_odds IS NOT NULL
    ),
    main_lines AS (
      SELECT game_id, line, over_odds, under_odds
      FROM ranked_lines
      WHERE rn = 1
    )
    SELECT
      g.game_id,
      g.game_date,
      g.home_team_id,
      g.away_team_id,
      ht.abbreviation as home_abbr,
      ht.full_name as home_team,
      at.abbreviation as away_abbr,
      at.full_name as away_team,
      ml.line,
      ml.over_odds,
      ml.under_odds,
      'Pinnacle' as bookmaker
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN main_lines ml ON ml.game_id = g.game_id
    WHERE g.game_date = CURRENT_DATE
    ORDER BY g.game_date
  `)

  return result.rows
}

// Get historical totals results for a team
async function getTeamTotalsHistory(teamId: number, limit: number = 10) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date,
      CASE WHEN g.home_team_id = $1 THEN 'home' ELSE 'away' END as location,
      opp.abbreviation as opponent,
      tgs.points as team_points,
      opp_stats.points as opp_points,
      tgs.points + opp_stats.points as total,
      tgs.pace
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    JOIN teams opp ON (
      CASE WHEN g.home_team_id = $1 THEN g.away_team_id ELSE g.home_team_id END = opp.team_id
    )
    JOIN team_game_stats opp_stats ON opp_stats.game_id = g.game_id AND opp_stats.team_id = opp.team_id
    WHERE tgs.team_id = $1
      AND g.season = $2
      AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT $3
  `, [teamId, currentSeason, limit])

  return result.rows
}

// Main API handler
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    // Action: Get team totals history
    if (action === 'team-history') {
      const teamId = searchParams.get('teamId')
      if (!teamId) {
        return NextResponse.json({ error: 'teamId required' }, { status: 400 })
      }
      const history = await getTeamTotalsHistory(parseInt(teamId))
      return NextResponse.json({ history })
    }

    // Default: Full totals analysis for tonight
    const [games, teamStats] = await Promise.all([
      getTonightTotals(),
      getTeamStats()
    ])

    if (games.length === 0) {
      return NextResponse.json({
        games: [],
        message: 'No games scheduled for today'
      })
    }

    // Create team stats lookup
    const statsLookup: Record<number, any> = {}
    for (const team of teamStats) {
      statsLookup[team.team_id] = team
    }

    // Calculate projections and edges
    const analysis = games.map(game => {
      const homeStats = statsLookup[game.home_team_id]
      const awayStats = statsLookup[game.away_team_id]

      if (!homeStats || !awayStats) return null

      const homePpg = parseFloat(homeStats.ppg)
      const homeOppPpg = parseFloat(homeStats.opp_ppg)
      const awayPpg = parseFloat(awayStats.ppg)
      const awayOppPpg = parseFloat(awayStats.opp_ppg)
      const line = game.line ? parseFloat(game.line) : null
      const overOdds = game.over_odds ? parseFloat(game.over_odds) : null
      const underOdds = game.under_odds ? parseFloat(game.under_odds) : null

      // Projection: Average of both teams' offensive and defensive tendencies
      const projected = (homePpg + awayPpg + homeOppPpg + awayOppPpg) / 2
      const edge = line ? projected - line : null
      const avgPace = (parseFloat(homeStats.pace) + parseFloat(awayStats.pace)) / 2

      // Determine verdict
      let verdict = 'NEUTRAL'
      if (edge !== null) {
        if (edge >= 7) verdict = 'STRONG_OVER'
        else if (edge >= 3) verdict = 'LEAN_OVER'
        else if (edge <= -7) verdict = 'STRONG_UNDER'
        else if (edge <= -3) verdict = 'LEAN_UNDER'
      }

      return {
        game_id: game.game_id,
        game_date: game.game_date,
        home_team_id: game.home_team_id,
        home_abbr: game.home_abbr,
        home_team: game.home_team,
        away_team_id: game.away_team_id,
        away_abbr: game.away_abbr,
        away_team: game.away_team,
        // Home team stats
        home_ppg: homePpg,
        home_opp_ppg: homeOppPpg,
        home_pace: parseFloat(homeStats.pace),
        home_games: parseInt(homeStats.games),
        // Away team stats
        away_ppg: awayPpg,
        away_opp_ppg: awayOppPpg,
        away_pace: parseFloat(awayStats.pace),
        away_games: parseInt(awayStats.games),
        // Totals analysis
        line,
        over_odds: overOdds,
        under_odds: underOdds,
        projected: parseFloat(projected.toFixed(1)),
        edge: edge !== null ? parseFloat(edge.toFixed(1)) : null,
        avg_pace: parseFloat(avgPace.toFixed(1)),
        verdict,
        bookmaker: game.bookmaker
      }
    }).filter(Boolean)

    // Sort by absolute edge value
    analysis.sort((a, b) => Math.abs(b!.edge || 0) - Math.abs(a!.edge || 0))

    return NextResponse.json({
      games: analysis,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Totals analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch totals analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
