import { NextResponse } from 'next/server'
import { getPlayersWithStats, getTopPerformers } from '@/lib/queries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const top = searchParams.get('top')

    if (top === 'true') {
      const performers = await getTopPerformers()
      return NextResponse.json(performers)
    }

    const players = await getPlayersWithStats()
    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players data' },
      { status: 500 }
    )
  }
}
