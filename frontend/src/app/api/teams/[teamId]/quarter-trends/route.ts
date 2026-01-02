import { NextRequest, NextResponse } from 'next/server'
import { getTeamQuarterTrends, getTeamHalfTrends } from '@/lib/queries'
import { query } from '@/lib/db'

/**
 * GET /api/teams/[teamId]/quarter-trends
 *
 * Returns quarter and half trends for a specific team.
 * Query params:
 *   - type: 'quarters' | 'halves' | 'all' (default: 'all')
 *   - location: 'HOME' | 'AWAY' | 'ALL' (default: 'ALL') [not currently used by queries]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const location = (searchParams.get('location') || 'ALL').toUpperCase()

    // Validate teamId
    const teamIdNum = parseInt(teamId, 10)
    if (isNaN(teamIdNum) || teamIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid team ID. Must be a positive integer.' },
        { status: 400 }
      )
    }

    // Validate location
    if (!['HOME', 'AWAY', 'ALL'].includes(location)) {
      return NextResponse.json(
        { error: 'Invalid location. Must be HOME, AWAY, or ALL.' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['quarters', 'halves', 'all'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be quarters, halves, or all.' },
        { status: 400 }
      )
    }

    // Look up team abbreviation from ID
    const teamResult = await query(
      'SELECT abbreviation FROM teams WHERE team_id = $1',
      [teamIdNum]
    )

    if (teamResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Team with ID ${teamIdNum} not found.` },
        { status: 404 }
      )
    }

    const teamAbbr = teamResult.rows[0].abbreviation

    const response: {
      teamId: number
      teamAbbr: string
      location: string
      quarterTrends?: Awaited<ReturnType<typeof getTeamQuarterTrends>>
      halfTrends?: Awaited<ReturnType<typeof getTeamHalfTrends>>
    } = {
      teamId: teamIdNum,
      teamAbbr,
      location
    }

    if (type === 'quarters' || type === 'all') {
      response.quarterTrends = await getTeamQuarterTrends(teamAbbr)
    }

    if (type === 'halves' || type === 'all') {
      response.halfTrends = await getTeamHalfTrends(teamAbbr)
    }

    // Check if team has any data
    if (
      (!response.quarterTrends || response.quarterTrends.length === 0) &&
      (!response.halfTrends || response.halfTrends.length === 0)
    ) {
      return NextResponse.json(
        { error: `No quarter/half trends found for team ${teamAbbr}.` },
        { status: 404 }
      )
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error fetching team quarter trends:', error)
    return NextResponse.json(
      {
        error: 'Internal server error while fetching quarter trends.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
