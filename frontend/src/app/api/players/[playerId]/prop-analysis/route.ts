import { NextResponse } from 'next/server'
import { getPlayerPropAnalysis } from '@/lib/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params
    const playerIdNum = parseInt(playerId, 10)

    if (isNaN(playerIdNum)) {
      return NextResponse.json(
        { error: 'Invalid player ID' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const propType = searchParams.get('propType')
    const lineStr = searchParams.get('line')

    if (!propType || !lineStr) {
      return NextResponse.json(
        { error: 'Missing propType or line parameter' },
        { status: 400 }
      )
    }

    const line = parseFloat(lineStr)
    if (isNaN(line)) {
      return NextResponse.json(
        { error: 'Invalid line value' },
        { status: 400 }
      )
    }

    const analysis = await getPlayerPropAnalysis(playerIdNum, propType, line)

    if (!analysis) {
      return NextResponse.json(
        { error: 'No data found for this player' },
        { status: 404 }
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error fetching prop analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
