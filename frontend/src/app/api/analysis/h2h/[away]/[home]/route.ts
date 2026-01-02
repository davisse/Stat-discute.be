import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface TeamStats {
  abbr: string
  name: string
  color: string
  seasonAvg: number
  homeAvg: number
  awayAvg: number
  homeGames: number
  awayGames: number
  recentGames: {
    date: string
    location: 'HOME' | 'AWAY'
    opponent: string
    points: number
    oppPoints: number
    total: number
  }[]
}

const TEAM_COLORS: Record<string, string> = {
  ATL: '#E03A3E', BOS: '#007A33', BKN: '#000000', CHA: '#1D1160',
  CHI: '#CE1141', CLE: '#860038', DAL: '#00538C', DEN: '#0E2240',
  DET: '#C8102E', GSW: '#1D428A', HOU: '#CE1141', IND: '#002D62',
  LAC: '#C8102E', LAL: '#552583', MEM: '#5D76A9', MIA: '#98002E',
  MIL: '#00471B', MIN: '#0C2340', NOP: '#0C2340', NYK: '#006BB6',
  OKC: '#007AC1', ORL: '#0077C0', PHI: '#006BB6', PHX: '#1D1160',
  POR: '#E03A3E', SAC: '#5A2D81', SAS: '#C4CED4', TOR: '#CE1141',
  UTA: '#002B5C', WAS: '#002B5C',
}

async function getTeamStats(abbr: string, isHome: boolean): Promise<TeamStats | null> {
  // Get team info
  const teamResult = await query(`
    SELECT team_id, abbreviation, full_name FROM teams WHERE abbreviation = $1
  `, [abbr.toUpperCase()])

  if (teamResult.rows.length === 0) return null

  const team = teamResult.rows[0]

  // Get scoring averages
  const statsResult = await query(`
    SELECT
      ROUND(AVG(tgs.points), 1) as season_avg,
      ROUND(AVG(CASE WHEN g.home_team_id = $1 THEN tgs.points END), 1) as home_avg,
      ROUND(AVG(CASE WHEN g.away_team_id = $1 THEN tgs.points END), 1) as away_avg,
      COUNT(CASE WHEN g.home_team_id = $1 THEN 1 END) as home_games,
      COUNT(CASE WHEN g.away_team_id = $1 THEN 1 END) as away_games
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    WHERE tgs.team_id = $1
      AND g.season = '2025-26'
      AND g.game_status = 'Final'
  `, [team.team_id])

  const stats = statsResult.rows[0]

  // Get recent games
  const recentResult = await query(`
    SELECT
      TO_CHAR(g.game_date, 'Mon DD') as date,
      CASE WHEN g.home_team_id = $1 THEN 'HOME' ELSE 'AWAY' END as location,
      opp.abbreviation as opponent,
      tgs.points,
      CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END as opp_points,
      g.home_team_score + g.away_team_score as total
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    JOIN teams opp ON opp.team_id = CASE
      WHEN g.home_team_id = $1 THEN g.away_team_id
      ELSE g.home_team_id
    END
    WHERE tgs.team_id = $1
      AND g.season = '2025-26'
      AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT 10
  `, [team.team_id])

  return {
    abbr: team.abbreviation,
    name: team.full_name,
    color: TEAM_COLORS[team.abbreviation] || '#666',
    seasonAvg: parseFloat(stats.season_avg) || 0,
    homeAvg: parseFloat(stats.home_avg) || 0,
    awayAvg: parseFloat(stats.away_avg) || 0,
    homeGames: parseInt(stats.home_games) || 0,
    awayGames: parseInt(stats.away_games) || 0,
    recentGames: recentResult.rows.map(row => ({
      date: row.date,
      location: row.location as 'HOME' | 'AWAY',
      opponent: row.opponent,
      points: parseInt(row.points),
      oppPoints: parseInt(row.opp_points),
      total: parseInt(row.total),
    })),
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ away: string; home: string }> }
) {
  const { away, home } = await params

  try {
    // Get team stats
    const [awayTeam, homeTeam] = await Promise.all([
      getTeamStats(away, false),
      getTeamStats(home, true),
    ])

    if (!awayTeam || !homeTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get betting line for the most recent/upcoming game between these teams
    const lineResult = await query(`
      SELECT bl.total, bl.over_odds, bl.under_odds, g.game_id, TO_CHAR(g.game_date, 'YYYY-MM-DD') as game_date
      FROM betting_lines bl
      JOIN games g ON bl.game_id = g.game_id
      JOIN teams ht ON g.home_team_id = ht.team_id
      JOIN teams at ON g.away_team_id = at.team_id
      WHERE ht.abbreviation = $1 AND at.abbreviation = $2
        AND g.season = '2025-26'
      ORDER BY g.game_date DESC
      LIMIT 1
    `, [home.toUpperCase(), away.toUpperCase()])

    const bettingLine = lineResult.rows.length > 0 ? {
      total: parseFloat(lineResult.rows[0].total),
      overOdds: lineResult.rows[0].over_odds,
      underOdds: lineResult.rows[0].under_odds,
      gameId: lineResult.rows[0].game_id,
      gameDate: lineResult.rows[0].game_date,
    } : null

    // Calculate projections
    const seasonProjection = awayTeam.seasonAvg + homeTeam.seasonAvg
    const situationalProjection = awayTeam.awayAvg + homeTeam.homeAvg

    // Calculate verdict if betting line exists
    let verdict = null
    if (bettingLine) {
      const gap = bettingLine.total - situationalProjection
      if (gap >= 15) verdict = { text: 'STRONG UNDER', confidence: 5 }
      else if (gap >= 8) verdict = { text: 'LEAN UNDER', confidence: 4 }
      else if (gap >= 3) verdict = { text: 'LEAN UNDER', confidence: 3 }
      else if (gap <= -15) verdict = { text: 'STRONG OVER', confidence: 5 }
      else if (gap <= -8) verdict = { text: 'LEAN OVER', confidence: 4 }
      else if (gap <= -3) verdict = { text: 'LEAN OVER', confidence: 3 }
      else verdict = { text: 'NEUTRAL', confidence: 2 }
    }

    // Get high total games history (235+)
    const highTotalsResult = await query(`
      SELECT DISTINCT ON (g.game_id)
        TO_CHAR(g.game_date, 'Mon DD') as date,
        at.abbreviation || ' @ ' || ht.abbreviation as matchup,
        bl.total as line,
        g.home_team_score + g.away_team_score as actual,
        CASE WHEN g.home_team_score + g.away_team_score > bl.total THEN 'OVER' ELSE 'UNDER' END as result
      FROM betting_lines bl
      JOIN games g ON bl.game_id = g.game_id
      JOIN teams ht ON g.home_team_id = ht.team_id
      JOIN teams at ON g.away_team_id = at.team_id
      WHERE g.season = '2025-26'
        AND g.game_status = 'Final'
        AND bl.total >= 235
      ORDER BY g.game_id, bl.recorded_at DESC
      LIMIT 10
    `)

    const highTotalsHistory = highTotalsResult.rows.map(row => ({
      date: row.date,
      matchup: row.matchup,
      line: parseFloat(row.line),
      actual: parseInt(row.actual),
      result: row.result,
    }))

    return NextResponse.json({
      away: awayTeam,
      home: homeTeam,
      bettingLine,
      projections: {
        season: seasonProjection,
        situational: situationalProjection,
        gap: bettingLine ? bettingLine.total - situationalProjection : null,
      },
      verdict,
      highTotalsHistory,
    })
  } catch (error) {
    console.error('Error fetching H2H analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
