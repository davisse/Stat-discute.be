import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q')

  console.log('Search query received:', q)

  if (!q || q.length < 2) {
    return NextResponse.json({ players: [] })
  }

  try {
    // First, let's try a simpler query to make sure it works
    const testResult = await query(
      `SELECT COUNT(*) as count FROM players WHERE LOWER(full_name) LIKE LOWER($1)`,
      [`%${q}%`]
    )
    console.log('Test query result:', testResult.rows[0])

    // Search for players in the 2024-25 season
    // Note: team_id is in player_game_stats, not players table
    const result = await query(`
      WITH player_teams AS (
        SELECT DISTINCT ON (pgs.player_id)
          pgs.player_id,
          pgs.team_id,
          t.abbreviation as team_abbr,
          t.full_name as team_name
        FROM player_game_stats pgs
        JOIN teams t ON pgs.team_id = t.team_id
        JOIN games g ON pgs.game_id = g.game_id
        WHERE g.season = '2024-25'
        ORDER BY pgs.player_id, g.game_date DESC
      )
      SELECT
        p.player_id,
        p.first_name,
        p.last_name,
        p.full_name,
        COALESCE(pt.team_abbr, 'FA') as team_abbr,
        COALESCE(pt.team_name, 'Free Agent') as team_name,
        COUNT(DISTINCT pgs.game_id) as games_played,
        ROUND(AVG(pgs.points)::numeric, 1)::text as avg_points,
        ROUND(AVG(pgs.rebounds)::numeric, 1)::text as avg_rebounds,
        ROUND(AVG(pgs.assists)::numeric, 1)::text as avg_assists
      FROM players p
      LEFT JOIN player_game_stats pgs ON p.player_id = pgs.player_id
      LEFT JOIN games g ON pgs.game_id = g.game_id AND g.season = '2024-25'
      LEFT JOIN player_teams pt ON p.player_id = pt.player_id
      WHERE
        (LOWER(p.full_name) LIKE LOWER($1)
         OR LOWER(p.first_name) LIKE LOWER($1)
         OR LOWER(p.last_name) LIKE LOWER($1))
        AND p.is_active = true
      GROUP BY
        p.player_id,
        p.first_name,
        p.last_name,
        p.full_name,
        pt.team_abbr,
        pt.team_name
      HAVING COUNT(DISTINCT pgs.game_id) > 0 OR p.is_active = true
      ORDER BY
        COUNT(DISTINCT pgs.game_id) DESC NULLS LAST,
        p.full_name ASC
      LIMIT 10
    `, [`%${q}%`])

    console.log('Search results count:', result.rows.length)
    if (result.rows.length > 0) {
      console.log('First result:', result.rows[0])
    }

    return NextResponse.json({
      players: result.rows.map(player => ({
        ...player,
        avg_points: player.avg_points ? parseFloat(player.avg_points) : null,
        avg_rebounds: player.avg_rebounds ? parseFloat(player.avg_rebounds) : null,
        avg_assists: player.avg_assists ? parseFloat(player.avg_assists) : null,
      }))
    })
  } catch (error) {
    console.error('Player search error details:', error)
    return NextResponse.json(
      {
        error: 'Failed to search players',
        details: error instanceof Error ? error.message : 'Unknown error',
        query: q
      },
      { status: 500 }
    )
  }
}