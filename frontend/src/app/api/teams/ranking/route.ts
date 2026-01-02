import { NextResponse } from 'next/server'
import { getAllTeamsRanking } from '@/lib/queries'

export async function GET() {
  try {
    const data = await getAllTeamsRanking()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching team ranking:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
