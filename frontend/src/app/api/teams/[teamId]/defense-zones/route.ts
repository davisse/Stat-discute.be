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
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)
    const gameLimit = searchParams.get('games') || '10'
    const location = searchParams.get('location') || 'all'

    const currentSeason = await getCurrentSeason()

    console.log('Fetching defense zones for team:', teamId, 'Season:', currentSeason)

    // Build location filter
    let locationFilter = ''
    if (location === 'home') {
      locationFilter = 'AND g.home_team_id = $1'
    } else if (location === 'away') {
      locationFilter = 'AND g.away_team_id = $1'
    }

    // Get opponent stats when playing against this team
    // We calculate opponent's performance (defensive perspective)
    const statsQuery = `
      WITH opponent_stats AS (
        SELECT
          g.game_id,
          g.game_date,
          CASE
            WHEN g.home_team_id = $1 THEN g.away_team_id
            ELSE g.home_team_id
          END as opponent_team_id,
          tgs.field_goals_made,
          tgs.field_goals_attempted,
          tgs.three_pointers_made,
          tgs.three_pointers_attempted,
          tgs.points
        FROM games g
        JOIN team_game_stats tgs ON g.game_id = tgs.game_id
        WHERE g.season = $2
          AND (g.home_team_id = $1 OR g.away_team_id = $1)
          AND tgs.team_id != $1  -- Get opponent's stats
          AND g.game_status = 'Final'
          ${locationFilter}
        ORDER BY g.game_date DESC
        ${gameLimit !== 'all' ? `LIMIT $3` : ''}
      )
      SELECT
        COUNT(*) as games_analyzed,
        SUM(field_goals_made) as total_fgm,
        SUM(field_goals_attempted) as total_fga,
        SUM(three_pointers_made) as total_3pm,
        SUM(three_pointers_attempted) as total_3pa,
        SUM(points) as total_points,
        ROUND((SUM(field_goals_made)::numeric / NULLIF(SUM(field_goals_attempted), 0) * 100)::numeric, 1) as overall_fg_pct,
        ROUND((SUM(three_pointers_made)::numeric / NULLIF(SUM(three_pointers_attempted), 0) * 100)::numeric, 1) as three_point_pct
      FROM opponent_stats
    `

    const queryParams = gameLimit !== 'all'
      ? [teamId, currentSeason, parseInt(gameLimit)]
      : [teamId, currentSeason]

    const result = await query(statsQuery, queryParams)

    if (result.rows.length === 0 || result.rows[0].games_analyzed === '0') {
      return NextResponse.json({
        error: 'No defensive data available',
        teamId,
        season: currentSeason
      }, { status: 404 })
    }

    const stats = result.rows[0]

    // Parse numeric values
    const totalFGM = parseInt(stats.total_fgm)
    const totalFGA = parseInt(stats.total_fga)
    const total3PM = parseInt(stats.total_3pm)
    const total3PA = parseInt(stats.total_3pa)
    const totalPoints = parseInt(stats.total_points)
    const overallFgPct = parseFloat(stats.overall_fg_pct)
    const threePointPct = parseFloat(stats.three_point_pct)
    const gamesAnalyzed = parseInt(stats.games_analyzed)

    // Calculate 2-point stats (inside the arc)
    const total2PM = totalFGM - total3PM
    const total2PA = totalFGA - total3PA
    const twoPointPct = total2PA > 0 ? (total2PM / total2PA) * 100 : 0

    // League averages (2024-25 NBA season approximations)
    const leagueAvg = {
      restrictedArea: 64.5,  // Very high efficiency close to basket
      paint: 46.8,           // Non-restricted area paint
      midRange: 41.2,        // 2-point shots outside paint
      corner3: 38.5,         // Corner 3-pointers
      aboveBreak3: 36.2      // Above-the-break 3-pointers
    }

    // Estimate zone distribution based on NBA average shot distribution
    // This is a simplified model using available aggregated data
    const estimatedZones = {
      restrictedArea: {
        // ~25% of FGA, highest efficiency zone
        fga: Math.round(totalFGA * 0.25),
        fgm: Math.round(total2PM * 0.40), // 40% of 2P makes come from restricted area
        fg_pct: twoPointPct * 1.15, // RA is typically 15% higher than overall 2P%
        points: Math.round(total2PM * 0.40 * 2),
        ppp: (total2PM * 0.40 * 2) / Math.max(1, totalFGA * 0.25),
        leagueAvg: leagueAvg.restrictedArea,
        defenseRating: leagueAvg.restrictedArea - (twoPointPct * 1.15)
      },
      paint: {
        // ~20% of FGA, paint excluding RA
        fga: Math.round(totalFGA * 0.20),
        fgm: Math.round(total2PM * 0.30), // 30% of 2P makes from paint
        fg_pct: twoPointPct * 1.05, // Slightly above average 2P%
        points: Math.round(total2PM * 0.30 * 2),
        ppp: (total2PM * 0.30 * 2) / Math.max(1, totalFGA * 0.20),
        leagueAvg: leagueAvg.paint,
        defenseRating: leagueAvg.paint - (twoPointPct * 1.05)
      },
      midRange: {
        // ~20% of FGA, least efficient zone
        fga: Math.round(totalFGA * 0.20),
        fgm: Math.round(total2PM * 0.30), // Remaining 30% of 2P makes
        fg_pct: twoPointPct * 0.85, // Mid-range is typically 15% below overall 2P%
        points: Math.round(total2PM * 0.30 * 2),
        ppp: (total2PM * 0.30 * 2) / Math.max(1, totalFGA * 0.20),
        leagueAvg: leagueAvg.midRange,
        defenseRating: leagueAvg.midRange - (twoPointPct * 0.85)
      },
      leftCorner3: {
        // ~5% of FGA, highest 3P% zone
        fga: Math.round(total3PA * 0.15), // 15% of all 3PA
        fgm: Math.round(total3PM * 0.18), // Slightly higher make rate
        fg_pct: threePointPct * 1.08, // Corner 3s are ~8% better
        points: Math.round(total3PM * 0.18 * 3),
        ppp: (total3PM * 0.18 * 3) / Math.max(1, total3PA * 0.15),
        leagueAvg: leagueAvg.corner3,
        defenseRating: leagueAvg.corner3 - (threePointPct * 1.08)
      },
      rightCorner3: {
        // ~5% of FGA
        fga: Math.round(total3PA * 0.15),
        fgm: Math.round(total3PM * 0.17),
        fg_pct: threePointPct * 1.06,
        points: Math.round(total3PM * 0.17 * 3),
        ppp: (total3PM * 0.17 * 3) / Math.max(1, total3PA * 0.15),
        leagueAvg: leagueAvg.corner3,
        defenseRating: leagueAvg.corner3 - (threePointPct * 1.06)
      },
      aboveBreak3: {
        // ~25% of FGA, most 3PA come from here
        fga: Math.round(total3PA * 0.70), // 70% of all 3PA
        fgm: Math.round(total3PM * 0.65), // Remaining 3PM
        fg_pct: threePointPct * 0.97, // Slightly below average 3P%
        points: Math.round(total3PM * 0.65 * 3),
        ppp: (total3PM * 0.65 * 3) / Math.max(1, total3PA * 0.70),
        leagueAvg: leagueAvg.aboveBreak3,
        defenseRating: leagueAvg.aboveBreak3 - (threePointPct * 0.97)
      }
    }

    // Get team info
    const teamInfoResult = await query(`
      SELECT team_id, abbreviation, full_name
      FROM teams
      WHERE team_id = $1
    `, [teamId])

    const teamInfo = teamInfoResult.rows[0] || {
      team_id: teamId,
      abbreviation: 'UNK',
      full_name: 'Unknown Team'
    }

    const response = {
      team: teamInfo,
      zoneStats: estimatedZones,
      gamesAnalyzed,
      overall: {
        fg_pct: overallFgPct,
        three_point_pct: threePointPct,
        two_point_pct: parseFloat(twoPointPct.toFixed(1)),
        total_fgm: totalFGM,
        total_fga: totalFGA,
        total_points: totalPoints
      },
      season: currentSeason,
      filters: {
        games: gameLimit,
        location
      },
      note: 'Zone stats are estimated from aggregated data. Detailed shot tracking data not available.'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Defense zones fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch defense zone data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
