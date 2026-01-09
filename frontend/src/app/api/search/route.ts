import { NextResponse } from 'next/server'
import { searchPlayersQuick, searchGames } from '@/lib/queries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ players: [], games: [] })
    }

    // Run both searches in parallel
    const [players, games] = await Promise.all([
      searchPlayersQuick(query),
      searchGames(query)
    ])

    return NextResponse.json({ players, games })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
