import { NextRequest } from 'next/server'
import { getCurrentOdds } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const marketId = searchParams.get('marketId')

    if (!marketId) {
      return Response.json(
        { error: 'marketId parameter is required' },
        { status: 400 }
      )
    }

    const odds = await getCurrentOdds(parseInt(marketId))

    return Response.json({ odds })
  } catch (error: any) {
    console.error('Error fetching current odds:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
