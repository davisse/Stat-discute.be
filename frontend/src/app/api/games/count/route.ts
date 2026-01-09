import { NextRequest, NextResponse } from 'next/server'
import { getGamesCountByDateRange } from '@/lib/queries'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Both start and end date parameters are required' },
      { status: 400 }
    )
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return NextResponse.json(
      { error: 'Invalid date format. Use YYYY-MM-DD' },
      { status: 400 }
    )
  }

  try {
    const counts = await getGamesCountByDateRange(startDate, endDate)
    return NextResponse.json(counts)
  } catch (error) {
    console.error('Error fetching games count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games count' },
      { status: 500 }
    )
  }
}
