import { NextResponse } from 'next/server'
import { getTeamStandings } from '@/lib/queries'

export async function GET() {
  try {
    const standings = await getTeamStandings()
    return NextResponse.json(standings)
  } catch (error) {
    console.error('Error fetching standings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}
