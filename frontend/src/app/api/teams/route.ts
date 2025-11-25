import { NextResponse } from 'next/server'
import { getTeamStandings } from '@/lib/queries'

export async function GET() {
  try {
    const teams = await getTeamStandings()
    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams data' },
      { status: 500 }
    )
  }
}
