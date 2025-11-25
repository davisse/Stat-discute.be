import { NextRequest } from 'next/server'
import { getOddsHistory } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const marketId = searchParams.get('marketId')
    const hours = searchParams.get('hours') || '24'

    if (!marketId) {
      return Response.json(
        { error: 'marketId parameter is required' },
        { status: 400 }
      )
    }

    const history = await getOddsHistory(
      parseInt(marketId),
      parseInt(hours)
    )

    return Response.json({ history })
  } catch (error: any) {
    console.error('Error fetching odds history:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
