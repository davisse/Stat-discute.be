import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentSeason } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    // Get betting statistics
    if (action === 'stats') {
      const result = await query('SELECT * FROM user_bet_stats')
      return NextResponse.json(result.rows[0] || {
        total_bets: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        pending: 0,
        win_percentage: 0,
        total_profit_loss: 0,
        total_winnings: 0,
        total_losses: 0,
        avg_profit_loss: 0,
        roi_per_bet: 0
      })
    }

    // Get recent games without a specific player
    if (action === 'recent-games-without-player') {
      const teamAbbr = searchParams.get('teamAbbr')
      const playerId = searchParams.get('playerId')
      const limit = parseInt(searchParams.get('limit') || '6')
      const location = searchParams.get('location') // HOME or AWAY

      if (!teamAbbr || !playerId) {
        return NextResponse.json(
          { error: 'teamAbbr and playerId are required' },
          { status: 400 }
        )
      }

      const currentSeason = await getCurrentSeason()

      // Build query with optional location filter
      let locationFilter = ''
      const params: any[] = [currentSeason, teamAbbr, playerId, limit]

      if (location) {
        if (location === 'HOME') {
          locationFilter = 'AND home.abbreviation = $2'
        } else if (location === 'AWAY') {
          locationFilter = 'AND away.abbreviation = $2'
        }
      }

      const result = await query(`
        SELECT
          g.game_date,
          home.abbreviation as home_team_abbr,
          away.abbreviation as away_team_abbr,
          g.home_team_score,
          g.away_team_score,
          (g.home_team_score + g.away_team_score) as combined_total
        FROM games g
        JOIN teams home ON g.home_team_id = home.team_id
        JOIN teams away ON g.away_team_id = away.team_id
        WHERE g.season = $1
          AND (home.abbreviation = $2 OR away.abbreviation = $2)
          ${locationFilter}
          AND NOT EXISTS (
            SELECT 1 FROM player_game_stats pgs
            WHERE pgs.game_id = g.game_id
            AND pgs.player_id = $3
          )
          AND g.home_team_score IS NOT NULL
          AND g.away_team_score IS NOT NULL
        ORDER BY g.game_date DESC
        LIMIT $4
      `, params)

      return NextResponse.json(result.rows)
    }

    // Get head-to-head games between two teams
    if (action === 'head-to-head') {
      const team1 = searchParams.get('team1')
      const team2 = searchParams.get('team2')
      const limit = parseInt(searchParams.get('limit') || '4')

      if (!team1 || !team2) {
        return NextResponse.json(
          { error: 'team1 and team2 are required' },
          { status: 400 }
        )
      }

      const currentSeason = await getCurrentSeason()

      const result = await query(`
        SELECT
          g.game_date,
          home.abbreviation as home_team_abbr,
          away.abbreviation as away_team_abbr,
          g.home_team_score,
          g.away_team_score,
          (g.home_team_score + g.away_team_score) as combined_total
        FROM games g
        JOIN teams home ON g.home_team_id = home.team_id
        JOIN teams away ON g.away_team_id = away.team_id
        WHERE g.season IN (
          SELECT season_id FROM seasons
          WHERE season_id <= $1
          ORDER BY season_id DESC
          LIMIT 2
        )
          AND (
            (home.abbreviation = $2 AND away.abbreviation = $3)
            OR (home.abbreviation = $3 AND away.abbreviation = $2)
          )
          AND g.home_team_score IS NOT NULL
          AND g.away_team_score IS NOT NULL
        ORDER BY g.game_date DESC
        LIMIT $4
      `, [currentSeason, team1, team2, limit])

      return NextResponse.json(result.rows)
    }

    // Get all bets with game details
    const betsResult = await query(`
      SELECT * FROM user_bets_with_game_details
      ORDER BY bet_date DESC
      LIMIT 100
    `)

    return NextResponse.json(betsResult.rows)
  } catch (error) {
    console.error('Error fetching bets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bet_date,
      game_id,
      home_team_abbr,
      away_team_abbr,
      game_datetime,
      bet_type,
      bet_selection,
      line_value,
      odds_decimal,
      odds_american,
      stake_units = 1.00,
      confidence_rating,
      notes,
      key_factors
    } = body

    // Insert new bet
    const result = await query(`
      INSERT INTO user_bets (
        bet_date,
        game_id,
        home_team_abbr,
        away_team_abbr,
        game_datetime,
        bet_type,
        bet_selection,
        line_value,
        odds_decimal,
        odds_american,
        stake_units,
        result,
        confidence_rating,
        notes,
        key_factors
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12, $13, $14)
      RETURNING *
    `, [
      bet_date,
      game_id,
      home_team_abbr,
      away_team_abbr,
      game_datetime,
      bet_type,
      bet_selection,
      line_value,
      odds_decimal,
      odds_american,
      stake_units,
      confidence_rating,
      notes,
      key_factors
    ])

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating bet:', error)
    return NextResponse.json(
      { error: 'Failed to create bet' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { bet_id, result, actual_total } = body

    // Calculate profit/loss based on result
    let profit_loss = null
    if (result === 'win') {
      const betResult = await query(
        'SELECT odds_decimal, stake_units FROM user_bets WHERE bet_id = $1',
        [bet_id]
      )
      const bet = betResult.rows[0]
      profit_loss = (bet.odds_decimal - 1) * bet.stake_units
    } else if (result === 'loss') {
      const betResult = await query(
        'SELECT stake_units FROM user_bets WHERE bet_id = $1',
        [bet_id]
      )
      const bet = betResult.rows[0]
      profit_loss = -bet.stake_units
    } else if (result === 'push') {
      profit_loss = 0
    }

    // Update bet result
    const updateResult = await query(`
      UPDATE user_bets
      SET result = $1,
          actual_total = $2,
          profit_loss = $3
      WHERE bet_id = $4
      RETURNING *
    `, [result, actual_total, profit_loss, bet_id])

    return NextResponse.json(updateResult.rows[0])
  } catch (error) {
    console.error('Error updating bet:', error)
    return NextResponse.json(
      { error: 'Failed to update bet' },
      { status: 500 }
    )
  }
}
