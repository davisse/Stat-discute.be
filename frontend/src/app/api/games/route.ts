import { NextRequest, NextResponse } from 'next/server'
import { getRecentGames, getGamesByDate } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '20')

    // If date is specified, get games for that date
    if (date) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(date)) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        )
      }

      const games = await getGamesByDate(date)
      return NextResponse.json(games)
    }

    // Otherwise, get recent games with limit
    const games = await getRecentGames(limit)
    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching games:', error)
    // Return detailed error in development, generic in production
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch games data', details: errorMessage },
      { status: 500 }
    )
  }
}
