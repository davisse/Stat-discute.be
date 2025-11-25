import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('gameId')
  const eventId = searchParams.get('eventId')

  try {
    // If we have an eventId, use that (from betting data)
    // Otherwise try to map from gameId
    let playerPropsQuery: string
    let params: any[]

    if (eventId) {
      // Direct query using eventId from betting system
      playerPropsQuery = `
        SELECT DISTINCT ON (m.market_name)
          m.market_name,
          CASE
            WHEN m.market_name LIKE '%(Points)%' THEN 'Points'
            WHEN m.market_name LIKE '%(Rebounds)%' THEN 'Rebounds'
            WHEN m.market_name LIKE '%(Assists)%' THEN 'Assists'
            WHEN m.market_name LIKE '%(3 Point FG)%' THEN '3-Pointers'
            WHEN m.market_name LIKE '%(Pts+Rebs+Asts)%' THEN 'PRA'
            WHEN m.market_name LIKE '%(Steals)%' THEN 'Steals'
            WHEN m.market_name LIKE '%(Blocks)%' THEN 'Blocks'
            ELSE 'Other'
          END as market,
          -- Extract player name from market_name (text before the parenthesis)
          TRIM(SUBSTRING(m.market_name FROM '^[^(]+')) as playerName,
          o.handicap as line,
          MAX(CASE WHEN o.selection = 'Over' THEN o.odds_decimal END) as overOdds,
          MAX(CASE WHEN o.selection = 'Under' THEN o.odds_decimal END) as underOdds
        FROM betting_markets m
        JOIN betting_odds o ON m.market_id = o.market_id
        WHERE m.event_id = $1
          AND m.market_type = 'player_prop'
        GROUP BY m.market_name, o.handicap
        ORDER BY m.market_name, o.handicap DESC
      `
      params = [eventId]
    } else if (gameId) {
      // Try to find player props by game_id
      playerPropsQuery = `
        SELECT DISTINCT ON (m.market_name)
          m.market_name,
          CASE
            WHEN m.market_name LIKE '%(Points)%' THEN 'Points'
            WHEN m.market_name LIKE '%(Rebounds)%' THEN 'Rebounds'
            WHEN m.market_name LIKE '%(Assists)%' THEN 'Assists'
            WHEN m.market_name LIKE '%(3 Point FG)%' THEN '3-Pointers'
            WHEN m.market_name LIKE '%(Pts+Rebs+Asts)%' THEN 'PRA'
            WHEN m.market_name LIKE '%(Steals)%' THEN 'Steals'
            WHEN m.market_name LIKE '%(Blocks)%' THEN 'Blocks'
            ELSE 'Other'
          END as market,
          TRIM(SUBSTRING(m.market_name FROM '^[^(]+')) as playerName,
          o.handicap as line,
          MAX(CASE WHEN o.selection = 'Over' THEN o.odds_decimal END) as overOdds,
          MAX(CASE WHEN o.selection = 'Under' THEN o.odds_decimal END) as underOdds
        FROM betting_events e
        JOIN betting_markets m ON e.event_id = m.event_id
        JOIN betting_odds o ON m.market_id = o.market_id
        WHERE e.game_id = $1
          AND m.market_type = 'player_prop'
        GROUP BY m.market_name, o.handicap
        ORDER BY m.market_name, o.handicap DESC
      `
      params = [gameId]
    } else {
      // Return empty array if no identifiers provided
      return NextResponse.json({ playerProps: [] })
    }

    const result = await query(playerPropsQuery, params)

    // Transform the data to match the frontend interface
    const playerProps = result.rows.map((row: any) => ({
      playerId: row.playername?.replace(/\s+/g, '_').toLowerCase() || '', // Generate a simple ID
      playerName: row.playername || '',
      market: row.market || '',
      line: parseFloat(row.line) || 0,
      overOdds: row.overodds ? row.overodds.toString() : '0',
      underOdds: row.underodds ? row.underodds.toString() : '0'
    }))

    return NextResponse.json({
      playerProps,
      count: playerProps.length,
      eventId: eventId || null,
      gameId: gameId || null
    })

  } catch (error) {
    console.error('Failed to fetch player props:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player props', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}