import { NextRequest, NextResponse } from 'next/server'
import { getDefensiveSystemAnalysis } from '@/lib/queries'

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

    // Fetch defensive system analysis (combined DvP + Shot Zones)
    const analysis = await getDefensiveSystemAnalysis(teamIdNum)

    // Handle team not found
    if (!analysis) {
      return NextResponse.json(
        { error: `Team with ID ${teamIdNum} not found or has insufficient data for defensive analysis.` },
        { status: 404 }
      )
    }

    // Return successful response
    return NextResponse.json(analysis, { status: 200 })

  } catch (error) {
    console.error('Error fetching defensive system analysis:', error)

    // Return server error
    return NextResponse.json(
      {
        error: 'Internal server error while fetching defensive system analysis.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
