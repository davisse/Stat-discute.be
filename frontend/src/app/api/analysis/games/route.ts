import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface GameAnalysis {
  gameId: string
  gameDate: string
  home: { abbr: string; name: string; avgPoints: number }
  away: { abbr: string; name: string; avgPoints: number }
  line: number
  overOdds: number
  underOdds: number
  combinedAvg: number
  gap: number
  verdict: 'STRONG UNDER' | 'LEAN UNDER' | 'NEUTRAL' | 'LEAN OVER' | 'STRONG OVER'
  confidence: number
}

function getVerdict(gap: number): { verdict: GameAnalysis['verdict']; confidence: number } {
  // Gap = Line - Combined Average
  // Positive gap = line is ABOVE average = expect UNDER
  // Negative gap = line is BELOW average = expect OVER
  if (gap >= 15) return { verdict: 'STRONG UNDER', confidence: 5 }
  if (gap >= 8) return { verdict: 'LEAN UNDER', confidence: 4 }
  if (gap >= 3) return { verdict: 'LEAN UNDER', confidence: 3 }
  if (gap <= -15) return { verdict: 'STRONG OVER', confidence: 5 }
  if (gap <= -8) return { verdict: 'LEAN OVER', confidence: 4 }
  if (gap <= -3) return { verdict: 'LEAN OVER', confidence: 3 }
  return { verdict: 'NEUTRAL', confidence: 2 }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json(
      { error: 'Date parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Get games with betting lines for the date
    const gamesResult = await query(`
      SELECT
        bl.game_id,
        g.game_date,
        ht.abbreviation as home_abbr,
        ht.full_name as home_name,
        ht.team_id as home_id,
        at.abbreviation as away_abbr,
        at.full_name as away_name,
        at.team_id as away_id,
        bl.total,
        bl.over_odds,
        bl.under_odds
      FROM betting_lines bl
      JOIN games g ON bl.game_id = g.game_id
      JOIN teams ht ON g.home_team_id = ht.team_id
      JOIN teams at ON g.away_team_id = at.team_id
      WHERE g.game_date = $1
      ORDER BY bl.total DESC
    `, [date])

    if (gamesResult.rows.length === 0) {
      return NextResponse.json({ games: [] })
    }

    // Get team IDs
    const teamIds = new Set<string>()
    gamesResult.rows.forEach(row => {
      teamIds.add(row.home_id.toString())
      teamIds.add(row.away_id.toString())
    })

    // Get team averages
    const teamStatsResult = await query(`
      SELECT
        tgs.team_id,
        t.abbreviation,
        AVG(tgs.points) as avg_points,
        COUNT(*) as games
      FROM team_game_stats tgs
      JOIN games g ON tgs.game_id = g.game_id
      JOIN teams t ON tgs.team_id = t.team_id
      WHERE g.season = '2025-26'
        AND tgs.team_id = ANY($1::bigint[])
      GROUP BY tgs.team_id, t.abbreviation
    `, [Array.from(teamIds)])

    // Create a map of team averages
    const teamAvgMap = new Map<string, number>()
    teamStatsResult.rows.forEach(row => {
      teamAvgMap.set(row.team_id.toString(), parseFloat(row.avg_points))
    })

    // Build game analysis
    const games: GameAnalysis[] = gamesResult.rows.map(row => {
      const homeAvg = teamAvgMap.get(row.home_id.toString()) || 110
      const awayAvg = teamAvgMap.get(row.away_id.toString()) || 110
      const combinedAvg = homeAvg + awayAvg
      const line = parseFloat(row.total)
      const gap = line - combinedAvg
      const { verdict, confidence } = getVerdict(gap)

      return {
        gameId: row.game_id,
        gameDate: row.game_date.toISOString().split('T')[0],
        home: {
          abbr: row.home_abbr,
          name: row.home_name,
          avgPoints: homeAvg,
        },
        away: {
          abbr: row.away_abbr,
          name: row.away_name,
          avgPoints: awayAvg,
        },
        line,
        overOdds: row.over_odds,
        underOdds: row.under_odds,
        combinedAvg,
        gap,
        verdict,
        confidence,
      }
    })

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
