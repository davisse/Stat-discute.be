import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export interface TeamDispersionData {
  abbreviation: string
  games: number
  meanTotal: number
  totalStd: number
  minTotal: number
  maxTotal: number
  range: number
  avgTeamPts: number
  teamStd: number
  avgOppPts: number
  oppStd: number
  ptDiff: number
  q1: number
  median: number
  q3: number
  iqr: number
  volatilityClass: 'high' | 'medium' | 'low'
  gameDetails: GameDetail[]
}

export interface GameDetail {
  gameId: string
  gameDate: string
  opponent: string
  isHome: boolean
  teamPts: number
  oppPts: number
  total: number
  result: 'W' | 'L'
}

export async function GET() {
  try {
    // Get all teams dispersion summary
    const summaryResult = await query(`
      SELECT
        t.abbreviation,
        COUNT(*) as games,
        ROUND(AVG(total)::numeric, 1) as mean_total,
        ROUND(STDDEV(total)::numeric, 1) as total_std,
        MIN(total) as min_total,
        MAX(total) as max_total,
        MAX(total) - MIN(total) as range,
        ROUND(AVG(team_pts)::numeric, 1) as avg_team_pts,
        ROUND(STDDEV(team_pts)::numeric, 1) as team_std,
        ROUND(AVG(opp_pts)::numeric, 1) as avg_opp_pts,
        ROUND(STDDEV(opp_pts)::numeric, 1) as opp_std,
        ROUND(AVG(team_pts)::numeric - AVG(opp_pts)::numeric, 1) as pt_diff,
        ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total)::numeric, 1) as q1,
        ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total)::numeric, 1) as median,
        ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total)::numeric, 1) as q3
      FROM (
        SELECT
          t.team_id,
          t.abbreviation,
          g.home_team_score + g.away_team_score as total,
          CASE WHEN g.home_team_id = t.team_id THEN g.home_team_score ELSE g.away_team_score END as team_pts,
          CASE WHEN g.home_team_id = t.team_id THEN g.away_team_score ELSE g.home_team_score END as opp_pts
        FROM games g
        JOIN teams t ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
        WHERE g.season = '2025-26' AND g.game_status = 'Final'
      ) subq
      JOIN teams t ON subq.team_id = t.team_id
      GROUP BY t.abbreviation
      ORDER BY total_std DESC
    `)

    // Get game-by-game details for each team
    const detailsResult = await query(`
      SELECT
        t.abbreviation,
        g.game_id,
        g.game_date,
        CASE WHEN g.home_team_id = t.team_id THEN opp.abbreviation ELSE opp.abbreviation END as opponent,
        CASE WHEN g.home_team_id = t.team_id THEN true ELSE false END as is_home,
        CASE WHEN g.home_team_id = t.team_id THEN g.home_team_score ELSE g.away_team_score END as team_pts,
        CASE WHEN g.home_team_id = t.team_id THEN g.away_team_score ELSE g.home_team_score END as opp_pts,
        g.home_team_score + g.away_team_score as total,
        CASE
          WHEN g.home_team_id = t.team_id AND g.home_team_score > g.away_team_score THEN 'W'
          WHEN g.away_team_id = t.team_id AND g.away_team_score > g.home_team_score THEN 'W'
          ELSE 'L'
        END as result
      FROM games g
      JOIN teams t ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
      JOIN teams opp ON (
        CASE
          WHEN g.home_team_id = t.team_id THEN g.away_team_id = opp.team_id
          ELSE g.home_team_id = opp.team_id
        END
      )
      WHERE g.season = '2025-26' AND g.game_status = 'Final'
      ORDER BY t.abbreviation, g.game_date DESC
    `)

    // Group game details by team
    const gamesByTeam: Record<string, GameDetail[]> = {}
    for (const row of detailsResult.rows) {
      const abbr = row.abbreviation
      if (!gamesByTeam[abbr]) {
        gamesByTeam[abbr] = []
      }
      gamesByTeam[abbr].push({
        gameId: row.game_id,
        gameDate: row.game_date,
        opponent: row.opponent,
        isHome: row.is_home,
        teamPts: parseInt(row.team_pts),
        oppPts: parseInt(row.opp_pts),
        total: parseInt(row.total),
        result: row.result as 'W' | 'L'
      })
    }

    // Build response with volatility classification
    const teams: TeamDispersionData[] = summaryResult.rows.map(row => {
      const totalStd = parseFloat(row.total_std) || 0
      const q1 = parseFloat(row.q1) || 0
      const q3 = parseFloat(row.q3) || 0

      let volatilityClass: 'high' | 'medium' | 'low'
      if (totalStd > 20) {
        volatilityClass = 'high'
      } else if (totalStd >= 17) {
        volatilityClass = 'medium'
      } else {
        volatilityClass = 'low'
      }

      return {
        abbreviation: row.abbreviation,
        games: parseInt(row.games),
        meanTotal: parseFloat(row.mean_total) || 0,
        totalStd,
        minTotal: parseInt(row.min_total),
        maxTotal: parseInt(row.max_total),
        range: parseInt(row.range),
        avgTeamPts: parseFloat(row.avg_team_pts) || 0,
        teamStd: parseFloat(row.team_std) || 0,
        avgOppPts: parseFloat(row.avg_opp_pts) || 0,
        oppStd: parseFloat(row.opp_std) || 0,
        ptDiff: parseFloat(row.pt_diff) || 0,
        q1,
        median: parseFloat(row.median) || 0,
        q3,
        iqr: q3 - q1,
        volatilityClass,
        gameDetails: gamesByTeam[row.abbreviation] || []
      }
    })

    return NextResponse.json({
      success: true,
      season: '2025-26',
      teams,
      stats: {
        highVolatility: teams.filter(t => t.volatilityClass === 'high').length,
        mediumVolatility: teams.filter(t => t.volatilityClass === 'medium').length,
        lowVolatility: teams.filter(t => t.volatilityClass === 'low').length,
        avgStd: (teams.reduce((sum, t) => sum + t.totalStd, 0) / teams.length).toFixed(1),
        avgRange: Math.round(teams.reduce((sum, t) => sum + t.range, 0) / teams.length)
      }
    })
  } catch (error) {
    console.error('Error fetching team dispersion data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team dispersion data' },
      { status: 500 }
    )
  }
}
