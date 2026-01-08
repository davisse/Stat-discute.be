import { NextResponse } from 'next/server'
import { getTeamShotDistribution } from '@/lib/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId: teamIdStr } = await params
    const teamId = parseInt(teamIdStr)

    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 })
    }

    const data = await getTeamShotDistribution(teamId)

    if (!data) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching shot distribution:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
