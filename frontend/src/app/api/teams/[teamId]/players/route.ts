import { NextResponse } from 'next/server'
import { getTeamPlayers } from '@/lib/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const teamIdNum = parseInt(teamId, 10)

    if (isNaN(teamIdNum)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      )
    }

    const players = await getTeamPlayers(teamIdNum)

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Error fetching team players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team players' },
      { status: 500 }
    )
  }
}
