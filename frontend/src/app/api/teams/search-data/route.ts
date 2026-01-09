import { NextResponse } from 'next/server'
import { getTeamsForSearch } from '@/lib/queries'

export async function GET() {
  try {
    const data = await getTeamsForSearch()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching teams for search:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
