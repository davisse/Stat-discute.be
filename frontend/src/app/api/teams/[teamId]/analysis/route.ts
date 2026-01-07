import { NextRequest, NextResponse } from 'next/server'
import { getTeamAnalysis } from '@/lib/queries'

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

    // Fetch team analysis
    const analysis = await getTeamAnalysis(teamIdNum)

    // Handle team analysis not found
    if (!analysis) {
      return NextResponse.json(
        { error: `No analysis found for team ${teamIdNum} in current season.` },
        { status: 404 }
      )
    }

    // Return successful response
    return NextResponse.json(analysis, { status: 200 })

  } catch (error) {
    console.error('Error fetching team analysis:', error)

    // Return server error
    return NextResponse.json(
      {
        error: 'Internal server error while fetching team analysis.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
