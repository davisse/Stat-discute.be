import { NextRequest, NextResponse } from 'next/server'
import { getAllTeamsQ1Stats, getAllTeams1HStats } from '@/lib/queries'

/**
 * GET /api/analysis/quarters
 *
 * Returns quarter/half statistics for all teams.
 * Query params:
 *   - type: 'q1' | '1h' (default: 'q1')
 *   - location: 'HOME' | 'AWAY' | 'ALL' (default: 'ALL')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'q1'
    const location = (searchParams.get('location') || 'ALL').toUpperCase()

    // Validate location
    if (!['HOME', 'AWAY', 'ALL'].includes(location)) {
      return NextResponse.json(
        { error: 'Invalid location. Must be HOME, AWAY, or ALL.' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['q1', '1h'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be q1 or 1h.' },
        { status: 400 }
      )
    }

    let stats
    if (type === 'q1') {
      stats = await getAllTeamsQ1Stats()
    } else {
      stats = await getAllTeams1HStats()
    }

    return NextResponse.json({
      type,
      location,
      count: stats.length,
      data: stats
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching quarter stats:', error)
    return NextResponse.json(
      {
        error: 'Internal server error while fetching quarter stats.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
