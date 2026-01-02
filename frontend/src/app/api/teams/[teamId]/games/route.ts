import { NextRequest, NextResponse } from 'next/server'
import { getTeamGameHistory } from '@/lib/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const teamIdNum = parseInt(teamId, 10)

    if (isNaN(teamIdNum)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 })
    }

    const games = await getTeamGameHistory(teamIdNum)
    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching team games:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
