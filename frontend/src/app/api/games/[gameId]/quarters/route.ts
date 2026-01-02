import { NextRequest, NextResponse } from 'next/server'
import { getGameQuarterScores } from '@/lib/queries'

/**
 * GET /api/games/[gameId]/quarters
 *
 * Returns quarter-by-quarter scores for a specific game.
 * Includes Q1-Q4 scores, overtime periods if any, and game advanced stats.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params

    // Validate gameId format (should be like 0022400001)
    if (!gameId || !/^\d{10}$/.test(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID. Must be a 10-digit string.' },
        { status: 400 }
      )
    }

    const quarterScores = await getGameQuarterScores(gameId)

    if (!quarterScores) {
      return NextResponse.json(
        { error: `Quarter scores not found for game ${gameId}.` },
        { status: 404 }
      )
    }

    return NextResponse.json(quarterScores, { status: 200 })

  } catch (error) {
    console.error('Error fetching game quarter scores:', error)
    return NextResponse.json(
      {
        error: 'Internal server error while fetching quarter scores.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
