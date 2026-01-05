import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCurrentSeason } from '@/lib/queries'

interface TeamData {
  teamId: number
  abbreviation: string
  name: string
  ppg: number
  fgPct: number
  threePct: number
  pace: number
  teamTotal: number | null
  teamTotalOverOdds: number | null
  teamTotalUnderOdds: number | null
  scoringHistory: Array<{
    opponent: string
    points: number
    gameDate: string
  }>
  teamTotalHistory: Array<{
    opponent: string
    total: number
  }>
  pointsAllowed: number
  pointsAllowedLast5: Array<{
    opponent: string
    pointsAllowed: number
    gameDate: string
  }>
  offensiveRank: number
  defensiveRank: number
}

interface BettingData {
  total: number | null
  overOdds: number
  underOdds: number
  spread: number
  awayML: number
  homeML: number
}

interface H2HData {
  games: Array<{
    date: string
    totalPoints: number
    awayPoints: number
    homePoints: number
  }>
  avgTotal: number
  overCount: number
  underCount: number
}

interface TrendData {
  overCount: number
  underCount: number
  recentResults: Array<{
    type: 'over' | 'under'
    diff: number
  }>
}

interface MLPredictionData {
  prediction: 'OVER' | 'UNDER' | null
  confidence: number
  logisticProb: number
  xgboostProb: number
  expectedValue: number
  line: number
}

interface RestData {
  awayRestDays: number
  homeRestDays: number
  awayLastGame: string | null
  homeLastGame: string | null
  restAdvantage: 'away' | 'home' | 'even'
  isBackToBack: { away: boolean; home: boolean }
}

interface StorytellingData {
  gameId: string
  gameDate: string
  awayTeam: TeamData
  homeTeam: TeamData
  betting: BettingData
  h2h: H2HData
  trend: TrendData
  projectedPace: number
  projectedTotal: number
  mlPrediction?: MLPredictionData
  rest: RestData
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const currentSeason = await getCurrentSeason()

    // Get game info
    const gameResult = await query(
      `SELECT
        g.game_id,
        g.game_date,
        g.home_team_id,
        g.away_team_id,
        home.abbreviation as home_abbr,
        home.full_name as home_name,
        away.abbreviation as away_abbr,
        away.full_name as away_name,
        g.home_team_score,
        g.away_team_score
      FROM games g
      JOIN teams home ON g.home_team_id = home.team_id
      JOIN teams away ON g.away_team_id = away.team_id
      WHERE g.game_id = $1`,
      [gameId]
    )

    if (gameResult.rows.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const game = gameResult.rows[0]

    // Get team stats for both teams
    const awayTeamData = await getTeamData(game.away_team_id, game.away_abbr, game.away_name, currentSeason, gameId)
    const homeTeamData = await getTeamData(game.home_team_id, game.home_abbr, game.home_name, currentSeason, gameId)

    // Get betting lines
    const bettingData = await getBettingData(gameId)

    // Get H2H data
    const h2hData = await getH2HData(game.away_team_id, game.home_team_id, currentSeason, gameId)

    // Get trend data (recent over/under performance combined)
    const trendData = await getTrendData(game.away_team_id, game.home_team_id, currentSeason, gameId)

    // Calculate projected pace and total
    const projectedPace = (awayTeamData.pace + homeTeamData.pace) / 2
    const projectedTotal = awayTeamData.ppg + homeTeamData.ppg

    // Fetch ML predictions
    const mlPrediction = await getMLPrediction(gameId, request.url)

    // Get rest day analysis
    const restData = await getRestData(game.away_team_id, game.home_team_id, game.game_date)

    const data: StorytellingData = {
      gameId,
      gameDate: game.game_date,
      awayTeam: awayTeamData,
      homeTeam: homeTeamData,
      betting: bettingData,
      h2h: h2hData,
      trend: trendData,
      projectedPace: parseFloat(projectedPace.toFixed(1)),
      projectedTotal: parseFloat(projectedTotal.toFixed(1)),
      mlPrediction,
      rest: restData,
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching storytelling data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storytelling data' },
      { status: 500 }
    )
  }
}

async function getTeamData(
  teamId: number,
  abbreviation: string,
  name: string,
  season: string,
  excludeGameId: string
): Promise<TeamData> {
  // Get team season averages - using correct column names from team_game_stats schema
  const statsResult = await query(
    `SELECT
      COALESCE(AVG(tgs.points), 0) as ppg,
      COALESCE(AVG(tgs.field_goal_pct * 100), 0) as fg_pct,
      COALESCE(AVG(tgs.three_point_pct * 100), 0) as three_pct,
      COALESCE(AVG(tgs.pace), 100) as pace,
      COUNT(*) as games_played
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    WHERE tgs.team_id = $1
      AND g.season = $2
      AND g.game_id != $3
      AND g.game_status = 'Final'`,
    [teamId, season, excludeGameId]
  )

  const stats = statsResult.rows[0]
  // Use pace directly from the query (already calculated per game)
  const pace = stats.games_played > 0 ? parseFloat(parseFloat(stats.pace).toFixed(1)) : 100

  // Get scoring history with opponents (last 18 games)
  const scoringResult = await query(
    `SELECT
      tgs.points,
      g.game_date,
      CASE
        WHEN g.home_team_id = $1 THEN away.abbreviation
        ELSE home.abbreviation
      END as opponent
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    JOIN teams home ON g.home_team_id = home.team_id
    JOIN teams away ON g.away_team_id = away.team_id
    WHERE tgs.team_id = $1
      AND g.season = $2
      AND g.game_id != $3
      AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT 18`,
    [teamId, season, excludeGameId]
  )

  // Get points allowed (defensive stats)
  const defenseResult = await query(
    `SELECT
      opp_tgs.points as points_allowed,
      g.game_date,
      CASE
        WHEN g.home_team_id = $1 THEN away.abbreviation
        ELSE home.abbreviation
      END as opponent
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    JOIN team_game_stats opp_tgs ON opp_tgs.game_id = g.game_id AND opp_tgs.team_id != $1
    JOIN teams home ON g.home_team_id = home.team_id
    JOIN teams away ON g.away_team_id = away.team_id
    WHERE tgs.team_id = $1
      AND g.season = $2
      AND g.game_id != $3
      AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT 5`,
    [teamId, season, excludeGameId]
  )

  const pointsAllowed = defenseResult.rows.length > 0
    ? Number(defenseResult.rows.reduce((sum, r) => sum + parseFloat(r.points_allowed || '0'), 0)) / defenseResult.rows.length
    : 0

  // Team total history not available in current schema
  const teamTotalHistoryResult = { rows: [] as Array<{ opponent: string; total: number }> }

  // Get offensive and defensive rankings
  const rankResult = await query(
    `WITH team_stats AS (
      SELECT
        tgs.team_id,
        AVG(tgs.points) as ppg,
        AVG(opp_tgs.points) as opp_ppg
      FROM team_game_stats tgs
      JOIN games g ON tgs.game_id = g.game_id
      JOIN team_game_stats opp_tgs ON opp_tgs.game_id = g.game_id AND opp_tgs.team_id != tgs.team_id
      WHERE g.season = $1 AND g.game_status = 'Final'
      GROUP BY tgs.team_id
    ),
    ranked AS (
      SELECT
        team_id,
        RANK() OVER (ORDER BY ppg DESC) as off_rank,
        RANK() OVER (ORDER BY opp_ppg ASC) as def_rank
      FROM team_stats
    )
    SELECT off_rank, def_rank FROM ranked WHERE team_id = $2`,
    [season, teamId]
  )

  return {
    teamId,
    abbreviation,
    name,
    ppg: parseFloat(parseFloat(stats.ppg).toFixed(1)),
    fgPct: parseFloat(parseFloat(stats.fg_pct).toFixed(1)),
    threePct: parseFloat(parseFloat(stats.three_pct).toFixed(1)),
    pace,
    teamTotal: null,
    teamTotalOverOdds: null,
    teamTotalUnderOdds: null,
    scoringHistory: (scoringResult.rows as Array<{ opponent: string; points: number; game_date: string }>).map((r) => ({
      opponent: r.opponent,
      points: r.points,
      gameDate: r.game_date,
    })),
    teamTotalHistory: teamTotalHistoryResult.rows.map((r) => ({
      opponent: r.opponent,
      total: r.total,
    })),
    pointsAllowed: parseFloat(pointsAllowed.toFixed(1)),
    pointsAllowedLast5: (defenseResult.rows as Array<{ opponent: string; points_allowed: number; game_date: string }>).map((r) => ({
      opponent: r.opponent,
      pointsAllowed: r.points_allowed,
      gameDate: r.game_date,
    })),
    offensiveRank: rankResult.rows[0]?.off_rank || 15,
    defensiveRank: rankResult.rows[0]?.def_rank || 15,
  }
}

async function getBettingData(gameId: string): Promise<BettingData> {
  // Query betting_lines table with correct schema
  const result = await query(
    `SELECT
      bl.total,
      bl.spread,
      bl.home_moneyline,
      bl.away_moneyline,
      bl.over_odds,
      bl.under_odds
    FROM betting_lines bl
    WHERE bl.game_id = $1
    ORDER BY bl.recorded_at DESC
    LIMIT 1`,
    [gameId]
  )

  // Default values - use null for total when no betting line exists
  let total: number | null = null
  let overOdds = 1.91, underOdds = 1.91
  let spread = 0, awayML = 1.91, homeML = 1.91

  if (result.rows.length > 0) {
    const row = result.rows[0]

    // Convert American odds to decimal odds
    const convertToDecimal = (americanOdds: number | null): number => {
      if (americanOdds === null) return 1.91
      if (americanOdds > 0) {
        return parseFloat((americanOdds / 100 + 1).toFixed(2))
      } else {
        return parseFloat((100 / Math.abs(americanOdds) + 1).toFixed(2))
      }
    }

    total = row.total ? parseFloat(row.total) : null
    spread = row.spread ? parseFloat(row.spread) : 0
    awayML = convertToDecimal(row.away_moneyline)
    homeML = convertToDecimal(row.home_moneyline)
    overOdds = convertToDecimal(row.over_odds)
    underOdds = convertToDecimal(row.under_odds)
  }

  return { total, overOdds, underOdds, spread, awayML, homeML }
}

async function getH2HData(
  awayTeamId: number,
  homeTeamId: number,
  season: string,
  excludeGameId: string
): Promise<H2HData> {
  // Get last 5 H2H games
  const result = await query(
    `SELECT
      g.game_date,
      g.home_team_score,
      g.away_team_score,
      g.home_team_score + g.away_team_score as total_points
    FROM games g
    WHERE ((g.home_team_id = $1 AND g.away_team_id = $2)
        OR (g.home_team_id = $2 AND g.away_team_id = $1))
      AND g.game_id != $3
      AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT 5`,
    [homeTeamId, awayTeamId, excludeGameId]
  )

  const games = (result.rows as Array<{ game_date: string; home_team_score: number; away_team_score: number; total_points: number }>).map((r) => ({
    date: r.game_date,
    totalPoints: r.total_points,
    awayPoints: r.away_team_score,
    homePoints: r.home_team_score,
  }))

  const avgTotal = games.length > 0
    ? games.reduce((sum, g) => sum + g.totalPoints, 0) / games.length
    : 0

  // Count over/under vs typical line (using 220 as baseline)
  const baseline = 220
  const overCount = games.filter((g) => g.totalPoints > baseline).length
  const underCount = games.length - overCount

  return {
    games,
    avgTotal: parseFloat(avgTotal.toFixed(1)),
    overCount,
    underCount,
  }
}

async function getTrendData(
  awayTeamId: number,
  homeTeamId: number,
  season: string,
  excludeGameId: string
): Promise<TrendData> {
  // Get last 5 games combined from both teams with their totals lines
  const result = await query(
    `SELECT
      g.game_id,
      g.home_team_score + g.away_team_score as total_points,
      COALESCE(bl.total, 220) as line_value
    FROM games g
    LEFT JOIN betting_lines bl ON g.game_id = bl.game_id
    WHERE (g.home_team_id = $1 OR g.away_team_id = $1 OR g.home_team_id = $2 OR g.away_team_id = $2)
      AND g.season = $3
      AND g.game_id != $4
      AND g.game_status = 'Final'
    ORDER BY g.game_date DESC
    LIMIT 5`,
    [awayTeamId, homeTeamId, season, excludeGameId]
  )

  const recentResults = (result.rows as Array<{ total_points: number; line_value: number }>).map((r) => {
    const diff = r.total_points - r.line_value
    return {
      type: diff > 0 ? 'over' : 'under' as 'over' | 'under',
      diff: Math.round(diff),
    }
  })

  const overCount = recentResults.filter((r) => r.type === 'over').length
  const underCount = recentResults.length - overCount

  return {
    overCount,
    underCount,
    recentResults,
  }
}

async function getMLPrediction(
  gameId: string,
  requestUrl: string
): Promise<MLPredictionData | undefined> {
  try {
    // Get base URL from request
    const url = new URL(requestUrl)
    const baseUrl = url.origin

    // Fetch ML predictions from our API
    const response = await fetch(`${baseUrl}/api/ml/predictions`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      return undefined
    }

    const data = await response.json()

    if (data.error || !data.games) {
      return undefined
    }

    // Find prediction for this specific game
    const gamePrediction = data.games.find(
      (g: { gameId: string }) => g.gameId === gameId
    )

    if (!gamePrediction) {
      return undefined
    }

    return {
      prediction: gamePrediction.prediction as 'OVER' | 'UNDER',
      confidence: Math.round(gamePrediction.confidence * 100),
      logisticProb: Math.round(gamePrediction.logisticProb * 100),
      xgboostProb: Math.round(gamePrediction.xgboostProb * 100),
      expectedValue: Math.round(gamePrediction.expectedValue * 100),
      line: gamePrediction.line,
    }
  } catch (error) {
    console.error('Error fetching ML prediction:', error)
    return undefined
  }
}

async function getRestData(
  awayTeamId: number,
  homeTeamId: number,
  gameDate: string
): Promise<RestData> {
  // Get last game for away team before this game date
  const awayLastGameResult = await query(
    `SELECT game_date
     FROM games g
     WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
       AND g.game_date < $2
       AND g.game_status = 'Final'
     ORDER BY g.game_date DESC
     LIMIT 1`,
    [awayTeamId, gameDate]
  )

  // Get last game for home team before this game date
  const homeLastGameResult = await query(
    `SELECT game_date
     FROM games g
     WHERE (g.home_team_id = $1 OR g.away_team_id = $1)
       AND g.game_date < $2
       AND g.game_status = 'Final'
     ORDER BY g.game_date DESC
     LIMIT 1`,
    [homeTeamId, gameDate]
  )

  const awayLastGame = awayLastGameResult.rows[0]?.game_date || null
  const homeLastGame = homeLastGameResult.rows[0]?.game_date || null

  // Calculate rest days
  const calculateRestDays = (lastGame: string | null, currentGame: string): number => {
    if (!lastGame) return 7 // Default to well-rested if no previous game found
    const lastDate = new Date(lastGame)
    const currentDate = new Date(currentGame)
    const diffTime = currentDate.getTime() - lastDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays - 1 // Subtract 1 because we want rest days, not days between games
  }

  const awayRestDays = calculateRestDays(awayLastGame, gameDate)
  const homeRestDays = calculateRestDays(homeLastGame, gameDate)

  // Determine rest advantage
  let restAdvantage: 'away' | 'home' | 'even' = 'even'
  if (awayRestDays > homeRestDays + 1) {
    restAdvantage = 'away'
  } else if (homeRestDays > awayRestDays + 1) {
    restAdvantage = 'home'
  }

  return {
    awayRestDays,
    homeRestDays,
    awayLastGame,
    homeLastGame,
    restAdvantage,
    isBackToBack: {
      away: awayRestDays === 0,
      home: homeRestDays === 0,
    },
  }
}
