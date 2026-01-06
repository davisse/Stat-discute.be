import { NextResponse } from 'next/server'
import { getDefenseVsPositionHeatmap } from '@/lib/queries'

export async function GET() {
  try {
    const dvpData = await getDefenseVsPositionHeatmap()
    return NextResponse.json(dvpData)
  } catch (error) {
    console.error('Error fetching DvP data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Defense vs Position data' },
      { status: 500 }
    )
  }
}
