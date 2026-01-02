import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Team colors
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

function getVerdict(gap: number): { verdict: string; confidence: number } {
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params

  try {
    // Get game info with betting line
    const gameResult = await query(`
      SELECT
        bl.game_id,
        TO_CHAR(g.game_date, 'YYYY-MM-DD') as game_date,
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
      WHERE bl.game_id = $1
    `, [gameId])

    if (gameResult.rows.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const game = gameResult.rows[0]
    const line = parseFloat(game.total)

    // Get team averages
    const teamStatsResult = await query(`
      SELECT
        tgs.team_id,
        t.abbreviation,
        AVG(tgs.points) as avg_points
      FROM team_game_stats tgs
      JOIN games g ON tgs.game_id = g.game_id
      JOIN teams t ON tgs.team_id = t.team_id
      WHERE g.season = '2025-26'
        AND tgs.team_id IN ($1, $2)
      GROUP BY tgs.team_id, t.abbreviation
    `, [game.home_id, game.away_id])

    const teamAvgMap = new Map<string, number>()
    teamStatsResult.rows.forEach(row => {
      teamAvgMap.set(row.team_id.toString(), parseFloat(row.avg_points))
    })

    const homeAvg = teamAvgMap.get(game.home_id.toString()) || 110
    const awayAvg = teamAvgMap.get(game.away_id.toString()) || 110

    // Get recent games for both teams
    const homeRecentResult = await query(`
      SELECT tgs.points, g.game_date
      FROM team_game_stats tgs
      JOIN games g ON tgs.game_id = g.game_id
      WHERE tgs.team_id = $1 AND g.season = '2025-26'
      ORDER BY g.game_date DESC
      LIMIT 10
    `, [game.home_id])

    const awayRecentResult = await query(`
      SELECT tgs.points, g.game_date
      FROM team_game_stats tgs
      JOIN games g ON tgs.game_id = g.game_id
      WHERE tgs.team_id = $1 AND g.season = '2025-26'
      ORDER BY g.game_date DESC
      LIMIT 10
    `, [game.away_id])

    // Get historical line stats
    const lineStatsResult = await query(`
      SELECT
        MIN(total) as min_line,
        MAX(total) as max_line,
        AVG(total) as avg_line,
        COUNT(DISTINCT game_id) as total_games
      FROM betting_lines
    `)
    const lineStats = lineStatsResult.rows[0]
    const avgLine = parseFloat(lineStats.avg_line)
    const totalGames = parseInt(lineStats.total_games)

    // Get line rank
    const lineRankResult = await query(`
      SELECT COUNT(DISTINCT game_id) + 1 as rank
      FROM betting_lines
      WHERE total > $1
    `, [line])
    const lineRank = parseInt(lineRankResult.rows[0].rank)

    // Get line distribution
    const distributionResult = await query(`
      SELECT
        CASE
          WHEN total < 225 THEN '< 225'
          WHEN total >= 225 AND total < 230 THEN '225-229'
          WHEN total >= 230 AND total < 235 THEN '230-234'
          WHEN total >= 235 AND total < 240 THEN '235-239'
          ELSE '240+'
        END as range,
        COUNT(DISTINCT game_id) as count
      FROM betting_lines
      GROUP BY range
      ORDER BY range
    `)

    const lineRange = line >= 240 ? '240+' :
      line >= 235 ? '235-239' :
        line >= 230 ? '230-234' :
          line >= 225 ? '225-229' : '< 225'

    const lineDistribution = distributionResult.rows.map(row => ({
      range: row.range,
      count: parseInt(row.count),
      isHighlighted: row.range === lineRange,
    }))

    // Get high totals history (lines >= 235)
    const highTotalsResult = await query(`
      SELECT
        TO_CHAR(g.game_date, 'Mon DD') as game_date,
        at.abbreviation || ' @ ' || ht.abbreviation as game,
        bl.total as line,
        COALESCE(g.home_team_score, 0) + COALESCE(g.away_team_score, 0) as actual,
        g.home_team_score,
        g.away_team_score
      FROM betting_lines bl
      JOIN games g ON bl.game_id = g.game_id
      JOIN teams ht ON g.home_team_id = ht.team_id
      JOIN teams at ON g.away_team_id = at.team_id
      WHERE bl.total >= 235
        AND g.home_team_score IS NOT NULL
      ORDER BY g.game_date DESC
      LIMIT 10
    `)

    const highTotalsHistory = highTotalsResult.rows.map(row => {
      const actual = parseInt(row.home_team_score) + parseInt(row.away_team_score)
      const line = parseFloat(row.line)
      const margin = actual - line
      return {
        date: row.game_date,
        game: row.game,
        line,
        actual,
        result: actual < line ? 'UNDER' : 'OVER',
        margin: Math.round(margin * 10) / 10,
      }
    })

    // Calculate gaps
    const impliedHome = line / 2
    const impliedAway = line / 2
    const homeGap = homeAvg - impliedHome
    const awayGap = awayAvg - impliedAway
    const combinedAvg = homeAvg + awayAvg
    const gap = line - combinedAvg
    const { verdict, confidence } = getVerdict(gap)

    const response = {
      gameId: game.game_id,
      gameDate: game.game_date,
      away: {
        abbr: game.away_abbr,
        name: game.away_name,
        color: TEAM_COLORS[game.away_abbr] || '#666',
        avgPoints: awayAvg,
        impliedTotal: impliedAway,
        gap: awayGap,
        recentGames: awayRecentResult.rows.reverse().map((r, idx) => ({
          game: `G${idx + 1}`,
          points: parseInt(r.points),
        })),
      },
      home: {
        abbr: game.home_abbr,
        name: game.home_name,
        color: TEAM_COLORS[game.home_abbr] || '#666',
        avgPoints: homeAvg,
        impliedTotal: impliedHome,
        gap: homeGap,
        recentGames: homeRecentResult.rows.reverse().map((r, idx) => ({
          game: `G${idx + 1}`,
          points: parseInt(r.points),
        })),
      },
      line,
      overOdds: game.over_odds,
      underOdds: game.under_odds,
      avgLine,
      lineRank,
      totalGames,
      combinedAvg,
      gap,
      verdict,
      confidence,
      highTotalsHistory,
      lineDistribution,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching game analysis:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: 'Failed to fetch analysis', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
