import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Get current season
async function getCurrentSeason(): Promise<string> {
  const result = await query(`
    SELECT season_id
    FROM seasons
    WHERE is_current = true
    LIMIT 1
  `)
  return result.rows[0]?.season_id || '2025-26'
}

// Get today's games with team info
async function getTodaysGames() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT DISTINCT ON (g.game_id)
      g.game_id,
      g.game_date,
      ht.team_id as home_team_id,
      ht.abbreviation as home_abbr,
      ht.full_name as home_team,
      at.team_id as away_team_id,
      at.abbreviation as away_abbr,
      at.full_name as away_team,
      be.event_id
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    LEFT JOIN betting_events be ON be.game_id = g.game_id
    WHERE g.game_date = CURRENT_DATE
      AND g.season = $1
    ORDER BY g.game_id, g.game_date
  `, [currentSeason])

  return result.rows
}

// Get position defense rankings (starter PPG allowed)
async function getPositionDefenseRankings() {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH starter_points AS (
      SELECT
        g.game_id,
        g.game_date,
        CASE WHEN g.home_team_id = pgs.team_id THEN g.away_team_id ELSE g.home_team_id END as defending_team_id,
        p.position,
        pgs.points,
        ROW_NUMBER() OVER (
          PARTITION BY g.game_id,
          CASE WHEN g.home_team_id = pgs.team_id THEN g.away_team_id ELSE g.home_team_id END,
          p.position
          ORDER BY pgs.points DESC
        ) as rn
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      JOIN players p ON pgs.player_id = p.player_id
      WHERE g.season = $1
        AND pgs.points > 0
    )
    SELECT
      t.team_id,
      t.abbreviation as team_abbr,
      sp.position,
      COUNT(*) as games,
      ROUND(AVG(sp.points), 1) as starter_ppg_allowed,
      RANK() OVER (PARTITION BY sp.position ORDER BY AVG(sp.points) DESC) as rank_worst
    FROM starter_points sp
    JOIN teams t ON sp.defending_team_id = t.team_id
    WHERE sp.rn = 1
    GROUP BY t.team_id, t.abbreviation, sp.position
    HAVING COUNT(*) >= 5
    ORDER BY sp.position, starter_ppg_allowed DESC
  `, [currentSeason])

  return result.rows
}

// Get player season averages for props analysis (starters only, with props available)
async function getPlayerSeasonAverages(teamIds: number[], gameIds: string[]) {
  const currentSeason = await getCurrentSeason()

  if (teamIds.length === 0 || gameIds.length === 0) return []

  const result = await query(`
    WITH player_stats AS (
      SELECT
        p.player_id,
        p.full_name as player_name,
        p.position,
        t.team_id,
        t.abbreviation as team_abbr,
        COUNT(DISTINCT pgs.game_id) as games_played,
        COUNT(DISTINCT CASE WHEN pgs.is_starter THEN pgs.game_id END) as games_started,
        ROUND(AVG(pgs.points), 1) as ppg,
        ROUND(AVG(pgs.rebounds), 1) as rpg,
        ROUND(AVG(pgs.assists), 1) as apg,
        ROUND(AVG(pgs.fg3_made), 1) as threes_pg,
        ROUND(AVG(pgs.steals), 1) as spg,
        ROUND(AVG(pgs.blocks), 1) as bpg,
        ROUND(AVG(pgs.points + pgs.rebounds + pgs.assists), 1) as pra_pg,
        ROUND(AVG(pgs.minutes), 1) as mpg
      FROM players p
      JOIN player_game_stats pgs ON p.player_id = pgs.player_id
      JOIN games g ON pgs.game_id = g.game_id
      JOIN teams t ON pgs.team_id = t.team_id
      WHERE g.season = $1
        AND t.team_id = ANY($2)
      GROUP BY p.player_id, p.full_name, p.position, t.team_id, t.abbreviation
      HAVING COUNT(DISTINCT pgs.game_id) >= 3
    ),
    player_props_today AS (
      SELECT DISTINCT
        pp.player_name,
        pp.game_id,
        jsonb_agg(jsonb_build_object(
          'prop_type', pp.prop_type,
          'line', pp.line,
          'over_odds', pp.over_odds_decimal,
          'under_odds', pp.under_odds_decimal,
          'bookmaker', pp.bookmaker
        )) as props
      FROM player_props pp
      WHERE pp.game_id = ANY($3)
        AND pp.is_available = true
      GROUP BY pp.player_name, pp.game_id
    )
    SELECT
      ps.*,
      ROUND(ps.games_started::numeric / ps.games_played * 100, 0) as starter_rate,
      ppt.props,
      ppt.game_id as prop_game_id
    FROM player_stats ps
    JOIN player_props_today ppt ON LOWER(ps.player_name) = LOWER(ppt.player_name)
    WHERE ps.games_started::numeric / ps.games_played >= 0.5
    ORDER BY ps.ppg DESC
  `, [currentSeason, teamIds, gameIds])

  return result.rows
}

// Get player game log
async function getPlayerGameLog(playerId: number, limit: number = 15) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      pgs.game_id,
      g.game_date,
      pgs.points,
      pgs.rebounds,
      pgs.assists,
      pgs.fg3_made,
      pgs.steals,
      pgs.blocks,
      pgs.minutes,
      opp.abbreviation as opponent_abbr,
      CASE WHEN g.home_team_id = pgs.team_id THEN 'home' ELSE 'away' END as location,
      CASE
        WHEN g.home_team_id = pgs.team_id AND g.home_team_score > g.away_team_score THEN 'W'
        WHEN g.away_team_id = pgs.team_id AND g.away_team_score > g.home_team_score THEN 'W'
        ELSE 'L'
      END as result
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    JOIN teams opp ON (
      CASE WHEN g.home_team_id = pgs.team_id THEN g.away_team_id ELSE g.home_team_id END = opp.team_id
    )
    WHERE pgs.player_id = $1
      AND g.season = $2
    ORDER BY g.game_date DESC
    LIMIT $3
  `, [playerId, currentSeason, limit])

  return result.rows
}

// Get defense game log for a specific position and team
// Returns the TOP STARTER at that position per game (highest scoring starter)
async function getDefenseGameLog(teamAbbr: string, position: string, limit: number = 10) {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH starter_points AS (
      SELECT
        g.game_id,
        g.game_date,
        t.abbreviation as defending_team_abbr,
        opp.abbreviation as opponent_abbr,
        p.full_name as scorer_name,
        pgs.points,
        pgs.is_starter,
        ROW_NUMBER() OVER (
          PARTITION BY g.game_id, t.team_id
          ORDER BY pgs.points DESC
        ) as rn
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      JOIN players p ON pgs.player_id = p.player_id
      JOIN teams t ON (
        CASE WHEN g.home_team_id = pgs.team_id THEN g.away_team_id ELSE g.home_team_id END = t.team_id
      )
      JOIN teams opp ON pgs.team_id = opp.team_id
      WHERE g.season = $1
        AND t.abbreviation = $2
        AND p.position = $3
        AND pgs.points > 0
        AND pgs.is_starter = true
    )
    SELECT
      game_id,
      game_date,
      defending_team_abbr,
      opponent_abbr,
      scorer_name,
      points
    FROM starter_points
    WHERE rn = 1
    ORDER BY game_date DESC
    LIMIT $4
  `, [currentSeason, teamAbbr, position, limit])

  return result.rows
}

// Main API handler
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    // Action: Get today's games
    if (action === 'games') {
      const games = await getTodaysGames()
      return NextResponse.json({ games })
    }

    // Action: Get position defense rankings
    if (action === 'defense-rankings') {
      const rankings = await getPositionDefenseRankings()
      return NextResponse.json({ rankings })
    }

    // Action: Get player game log
    if (action === 'player-log') {
      const playerId = searchParams.get('playerId')
      if (!playerId) {
        return NextResponse.json({ error: 'playerId required' }, { status: 400 })
      }
      const gameLog = await getPlayerGameLog(parseInt(playerId))
      return NextResponse.json({ gameLog })
    }

    // Action: Get defense game log
    if (action === 'defense-log') {
      const teamAbbr = searchParams.get('teamAbbr')
      const position = searchParams.get('position')
      if (!teamAbbr || !position) {
        return NextResponse.json({ error: 'teamAbbr and position required' }, { status: 400 })
      }
      const defenseLog = await getDefenseGameLog(teamAbbr, position)
      return NextResponse.json({ defenseLog })
    }

    // Default: Full analysis for today's games
    const games = await getTodaysGames()

    if (games.length === 0) {
      return NextResponse.json({
        games: [],
        players: [],
        defenseRankings: [],
        message: 'No games scheduled for today'
      })
    }

    // Get all team IDs and game IDs from today's games
    const teamIds = games.flatMap(g => [g.home_team_id, g.away_team_id])
    const gameIds = games.map(g => g.game_id)

    // Fetch player averages and defense rankings in parallel
    const [players, defenseRankings] = await Promise.all([
      getPlayerSeasonAverages(teamIds, gameIds),
      getPositionDefenseRankings()
    ])

    // Create defense lookup by team and position
    const defenseLookup: Record<string, Record<string, { starter_ppg_allowed: number; rank_worst: number }>> = {}
    for (const d of defenseRankings) {
      if (!defenseLookup[d.team_abbr]) {
        defenseLookup[d.team_abbr] = {}
      }
      defenseLookup[d.team_abbr][d.position] = {
        starter_ppg_allowed: parseFloat(d.starter_ppg_allowed),
        rank_worst: parseInt(d.rank_worst)
      }
    }

    // Enrich players with edge calculations
    const enrichedPlayers = players.map(player => {
      // Use prop_game_id (from player_props join) or find by team
      const game = games.find(g =>
        g.game_id === player.prop_game_id ||
        g.home_team_id === player.team_id ||
        g.away_team_id === player.team_id
      )

      if (!game) return null

      const opponentAbbr = game.home_team_id === player.team_id ? game.away_abbr : game.home_abbr
      const isHome = game.home_team_id === player.team_id

      // Get defense stats for opponent
      const opponentDefense = defenseLookup[opponentAbbr]?.[player.position]

      const ppg = parseFloat(player.ppg)
      const starterPpgAllowed = opponentDefense?.starter_ppg_allowed || 0
      const defenseRank = opponentDefense?.rank_worst || 0

      // Calculate edge: positive = OVER, negative = UNDER
      const edge = starterPpgAllowed - ppg

      // Parse props data (find points prop line if available)
      // Note: Database has PRA lines mislabeled as "points" - they have higher values
      // The actual points prop is the one with the MINIMUM line value
      const props = player.props || []
      const pointsProps = props.filter((p: any) => p.prop_type === 'points')

      // Find the minimum line (actual points) and relabel higher lines as PRA
      let pointsProp = null
      let minPointsLine = Infinity
      if (pointsProps.length > 0) {
        minPointsLine = Math.min(...pointsProps.map((p: any) => p.line))
        pointsProp = pointsProps.find((p: any) => p.line === minPointsLine)
      }

      // Fix mislabeled props: higher "points" lines are actually PRA
      const correctedProps = props.map((p: any) => {
        if (p.prop_type === 'points' && p.line > minPointsLine) {
          return { ...p, prop_type: 'pra' }
        }
        return p
      })

      return {
        ...player,
        game_id: game.game_id,
        event_id: game.event_id,
        opponent_abbr: opponentAbbr,
        is_home: isHome,
        defense_starter_ppg_allowed: starterPpgAllowed,
        defense_rank: defenseRank,
        edge_points: parseFloat(edge.toFixed(1)),
        edge_verdict: edge >= 5 ? 'STRONG_OVER' : edge >= 2 ? 'LEAN_OVER' : edge <= -5 ? 'STRONG_UNDER' : edge <= -2 ? 'LEAN_UNDER' : 'NEUTRAL',
        // Include props data
        starter_rate: parseInt(player.starter_rate),
        prop_line: pointsProp?.line || null,
        prop_type: pointsProp?.prop_type || null,
        prop_over_odds: pointsProp?.over_odds || null,
        prop_under_odds: pointsProp?.under_odds || null,
        all_props: correctedProps
      }
    }).filter(Boolean)

    // Sort by absolute edge value
    enrichedPlayers.sort((a, b) => Math.abs(b!.edge_points) - Math.abs(a!.edge_points))

    return NextResponse.json({
      games,
      players: enrichedPlayers,
      defenseRankings,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Props analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch props analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
