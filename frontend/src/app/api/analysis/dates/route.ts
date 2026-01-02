import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT DISTINCT TO_CHAR(g.game_date, 'YYYY-MM-DD') as game_date
      FROM betting_lines bl
      JOIN games g ON bl.game_id = g.game_id
      ORDER BY game_date DESC
      LIMIT 30
    `)

    const dates = result.rows.map(row => row.game_date)

    return NextResponse.json({ dates })
  } catch (error) {
    console.error('Error fetching dates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dates' },
      { status: 500 }
    )
  }
}
