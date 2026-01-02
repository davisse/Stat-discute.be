import { NextRequest, NextResponse } from 'next/server'
import { searchPlayers } from '@/lib/queries'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q')

  if (!q || q.length < 2) {
    return NextResponse.json({ players: [] })
  }

  try {
    const players = await searchPlayers(q, 8)
    return NextResponse.json({ players })
  } catch (error) {
    console.error('Player search error:', error)
    return NextResponse.json(
      { error: 'Failed to search players' },
      { status: 500 }
    )
  }
}