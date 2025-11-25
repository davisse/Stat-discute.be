import { NextRequest, NextResponse } from 'next/server'
import { getTeamDetailedStats } from '@/lib/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params

    // Validate teamId is a valid number
    const teamIdNum = parseInt(teamId, 10)
    if (isNaN(teamIdNum) || teamIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid team ID. Must be a positive integer.' },
        { status: 400 }
      )
    }

    // Fetch team detailed stats
    const stats = await getTeamDetailedStats(teamIdNum)

    // Handle team not found
    if (!stats) {
      return NextResponse.json(
        { error: `Team with ID ${teamIdNum} not found or has no stats for current season.` },
        { status: 404 }
      )
    }

    // Return successful response
    return NextResponse.json(stats, { status: 200 })

  } catch (error) {
    console.error('Error fetching team detailed stats:', error)

    // Return server error
    return NextResponse.json(
      {
        error: 'Internal server error while fetching team stats.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
