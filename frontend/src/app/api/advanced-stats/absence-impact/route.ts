import { NextRequest, NextResponse } from 'next/server'
import { getTeamAbsenceImpact } from '@/lib/queries'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const team = searchParams.get('team')

  if (!team) {
    return NextResponse.json({ error: 'Team parameter is required' }, { status: 400 })
  }

  try {
    const data = await getTeamAbsenceImpact(team)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching absence impact data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
