import { NextResponse } from 'next/server'
import { getDatabaseStats } from '@/lib/queries'

export async function GET() {
  try {
    const stats = await getDatabaseStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database statistics' },
      { status: 500 }
    )
  }
}
