import { NextRequest } from 'next/server'
import { getMarketsByEvent } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const marketType = searchParams.get('marketType') || 'all'

    if (!eventId) {
      return Response.json(
        { error: 'eventId parameter is required' },
        { status: 400 }
      )
    }

    const markets = await getMarketsByEvent(
      parseInt(eventId, 10),
      marketType === 'all' ? undefined : marketType
    )

    return Response.json({ markets })
  } catch (error: any) {
    console.error('Error fetching markets:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
