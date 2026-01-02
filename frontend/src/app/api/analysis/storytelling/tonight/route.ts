import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentSeason } from '@/lib/queries'

interface TonightGame {
  gameId: string
  gameDate: string
  gameTime: string
  awayTeam: {
    teamId: number
    abbreviation: string
    name: string
    record: string
    ppg: number
  }
  homeTeam: {
    teamId: number
    abbreviation: string
    name: string
    record: string
    ppg: number
  }
  betting: {
    total: number | null
    spread: number | null
    awayML: number | null
    homeML: number | null
  }
  status: string
}

export async function GET() {
  try {
    const currentSeason = await getCurrentSeason()

    // Get today's date in ET timezone (NBA games are scheduled in ET)
    const now = new Date()
    const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const today = etDate.toISOString().split('T')[0]

    // Get tonight's games
    const gamesResult = await query(
      `SELECT
        g.game_id,
        g.game_date,
        g.game_status,
        g.home_team_id,
        g.away_team_id,
        home.abbreviation as home_abbr,
        home.full_name as home_name,
        away.abbreviation as away_abbr,
        away.full_name as away_name
      FROM games g
      JOIN teams home ON g.home_team_id = home.team_id
      JOIN teams away ON g.away_team_id = away.team_id
      WHERE g.season = $1
        AND DATE(g.game_date) = $2
      ORDER BY g.game_id ASC`,
      [currentSeason, today]
    )

    // For each game, get team stats and betting lines
    const games: TonightGame[] = await Promise.all(
      gamesResult.rows.map(async (game) => {
        // Get team records and PPG
        const [awayStats, homeStats, bettingData] = await Promise.all([
          getTeamStats(game.away_team_id, currentSeason, game.game_id),
          getTeamStats(game.home_team_id, currentSeason, game.game_id),
          getBettingLines(game.game_id),
        ])

        return {
          gameId: game.game_id,
          gameDate: game.game_date,
          gameTime: '19:00', // Default time since game_time column doesn't exist
          status: game.game_status,
          awayTeam: {
            teamId: game.away_team_id,
            abbreviation: game.away_abbr,
            name: game.away_name,
            record: awayStats.record,
            ppg: awayStats.ppg,
          },
          homeTeam: {
            teamId: game.home_team_id,
            abbreviation: game.home_abbr,
            name: game.home_name,
            record: homeStats.record,
            ppg: homeStats.ppg,
          },
          betting: bettingData,
        }
      })
    )

    return NextResponse.json({
      date: today,
      games,
      count: games.length,
    })
  } catch (error) {
    console.error('Error fetching tonight games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tonight games' },
      { status: 500 }
    )
  }
}

async function getTeamStats(
  teamId: number,
  season: string,
  excludeGameId: string
): Promise<{ record: string; ppg: number }> {
  // Get team record
  const recordResult = await query(
    `SELECT
      COUNT(*) FILTER (WHERE
        (g.home_team_id = $1 AND g.home_team_score > g.away_team_score) OR
        (g.away_team_id = $1 AND g.away_team_score > g.home_team_score)
      ) as wins,
      COUNT(*) FILTER (WHERE
        (g.home_team_id = $1 AND g.home_team_score < g.away_team_score) OR
        (g.away_team_id = $1 AND g.away_team_score < g.home_team_score)
      ) as losses
    FROM games g
    WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
      AND g.season = $2
      AND g.game_id != $3
      AND g.game_status = 'Final'`,
    [teamId, season, excludeGameId]
  )

  // Get PPG
  const ppgResult = await query(
    `SELECT COALESCE(AVG(tgs.points), 0) as ppg
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    WHERE tgs.team_id = $1
      AND g.season = $2
      AND g.game_id != $3
      AND g.game_status = 'Final'`,
    [teamId, season, excludeGameId]
  )

  const wins = recordResult.rows[0]?.wins || 0
  const losses = recordResult.rows[0]?.losses || 0
  const ppg = parseFloat(ppgResult.rows[0]?.ppg || 0)

  return {
    record: `${wins}-${losses}`,
    ppg: parseFloat(ppg.toFixed(1)),
  }
}

async function getBettingLines(gameId: string): Promise<{
  total: number | null
  spread: number | null
  awayML: number | null
  homeML: number | null
}> {
  // Query betting_lines table with correct schema
  const result = await query(
    `SELECT
      bl.total,
      bl.spread,
      bl.home_moneyline,
      bl.away_moneyline
    FROM betting_lines bl
    WHERE bl.game_id = $1
    ORDER BY bl.recorded_at DESC
    LIMIT 1`,
    [gameId]
  )

  if (result.rows.length === 0) {
    return { total: null, spread: null, awayML: null, homeML: null }
  }

  const row = result.rows[0]

  // Convert American odds to decimal odds if needed
  const convertToDecimal = (americanOdds: number | null): number | null => {
    if (americanOdds === null) return null
    if (americanOdds > 0) {
      return parseFloat((americanOdds / 100 + 1).toFixed(2))
    } else {
      return parseFloat((100 / Math.abs(americanOdds) + 1).toFixed(2))
    }
  }

  return {
    total: row.total ? parseFloat(row.total) : null,
    spread: row.spread ? parseFloat(row.spread) : null,
    awayML: convertToDecimal(row.away_moneyline),
    homeML: convertToDecimal(row.home_moneyline),
  }
}
