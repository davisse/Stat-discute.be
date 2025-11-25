import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import {
  getTeamDefensivePerformance,
  getAllTeams,
  getTeamPlayers,
  getTeamDefensivePerformanceByPlayer
} from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    // Handle teams list request
    if (action === 'teams') {
      const teams = await getAllTeams()
      return NextResponse.json(teams)
    }

    // Handle team players list request
    if (action === 'players') {
      const teamIdParam = searchParams.get('teamId')
      if (!teamIdParam) {
        return NextResponse.json(
          { error: 'teamId parameter is required for players action' },
          { status: 400 }
        )
      }
      const teamId = parseInt(teamIdParam)
      const players = await getTeamPlayers(teamId)
      return NextResponse.json(players)
    }

    // Handle player impact request
    if (action === 'player-impact') {
      const teamIdParam = searchParams.get('teamId')
      const playerIdParam = searchParams.get('playerId')

      if (!teamIdParam || !playerIdParam) {
        return NextResponse.json(
          { error: 'teamId and playerId parameters are required for player-impact action' },
          { status: 400 }
        )
      }

      const teamId = parseInt(teamIdParam)
      const playerId = parseInt(playerIdParam)
      const location = searchParams.get('location') as 'HOME' | 'AWAY' | null
      const limitParam = searchParams.get('limit')
      const limit = limitParam ? parseInt(limitParam) : undefined

      const filters = {
        ...(location && { location }),
        ...(limit && { limit })
      }

      const games = await getTeamDefensivePerformanceByPlayer(teamId, playerId, filters)
      return NextResponse.json(games)
    }

    // Handle defensive performance request (default)
    const teamIdParam = searchParams.get('teamId')

    if (!teamIdParam) {
      return NextResponse.json(
        { error: 'teamId parameter is required' },
        { status: 400 }
      )
    }

    const teamId = parseInt(teamIdParam)
    const location = searchParams.get('location') as 'HOME' | 'AWAY' | null
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : undefined

    const filters = {
      ...(location && { location }),
      ...(limit && { limit })
    }

    const data = await getTeamDefensivePerformance(teamId, filters)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in team defense API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team defensive performance' },
      { status: 500 }
    )
  }
}
