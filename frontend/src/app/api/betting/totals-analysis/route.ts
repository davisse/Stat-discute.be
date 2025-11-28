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

// Get tonight's games with totals lines
async function getTonightTotals() {
  const result = await query(`
    SELECT DISTINCT ON (g.game_id)
      g.game_id,
      g.game_date,
      g.home_team_id,
      g.away_team_id,
      ht.abbreviation as home_abbr,
      ht.full_name as home_team,
      at.abbreviation as away_abbr,
      at.full_name as away_team,
      bl.total as line,
      bl.over_odds,
      bl.under_odds,
      bl.bookmaker
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN betting_lines bl ON bl.game_id = g.game_id AND bl.total IS NOT NULL
    WHERE g.game_date = CURRENT_DATE
    ORDER BY g.game_id, bl.recorded_at DESC
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
        over_odds: game.over_odds,
        under_odds: game.under_odds,
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
