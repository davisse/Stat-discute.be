import { NextRequest, NextResponse } from 'next/server'
import {
  getPlayerPropsStats,
  getTeamDefensiveStats,
  getTeamOffensiveSplits,
  getLeagueAverages,
  getPlayerVsOpponent,
  getCurrentSeason,
} from '@/lib/queries'

// Types matching the queries.ts interfaces
interface PlayerProp {
  player_name: string
  team: string
  stat_type: 'Points' | 'Rebounds' | 'Assists' | '3 Point FG' | 'Pts+Rebs+Asts'
  line: number
  over_odds: number
  under_odds: number
}

interface GameContext {
  home_team: string
  away_team: string
  player_props: PlayerProp[]
}

interface AnalysisResult {
  player_name: string
  team: string
  stat_type: string
  line: number
  over_odds: number
  under_odds: number

  // Averages
  season_avg: number
  home_avg: number | null
  away_avg: number | null
  last_5_avg: number | null
  vs_opponent_avg: number | null
  games_played: number

  // Projections
  weighted_projection: number
  defensive_adjustment: number
  final_projection: number

  // Value Analysis
  value_pct: number
  edge_vs_line: number
  implied_probability: number

  // Recommendation
  recommendation: 'STRONG OVER' | 'LEAN OVER' | 'NEUTRAL' | 'LEAN UNDER' | 'STRONG UNDER'
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'

  // Breakdown
  breakdown: {
    weighted_components: {
      season: { value: number; weight: number; contribution: number }
      location: { value: number | null; weight: number; contribution: number }
      last_5: { value: number | null; weight: number; contribution: number }
      h2h: { value: number | null; weight: number; contribution: number }
    }
    defensive_context: {
      opponent_defense: string
      league_avg: number
      opponent_allows: number
      defense_rating: string
      adjustment_factor: number
    }
    team_offensive_context?: {
      team_location_avg: number
      league_avg: number
      split_rating: string
      adjustment_factor: number
    }
  }
}

/**
 * Calculate weighted projection from player statistics
 * Weights: 35% season, 25% location, 25% last 5, 15% H2H
 */
function calculateWeightedProjection(
  seasonAvg: number,
  locationAvg: number | null,
  last5Avg: number | null,
  h2hAvg: number | null
): { projection: number; breakdown: any } {
  const weights = {
    season: 0.35,
    location: 0.25,
    last_5: 0.25,
    h2h: 0.15,
  }

  let totalWeight = weights.season
  let weightedSum = seasonAvg * weights.season

  const breakdown = {
    season: { value: seasonAvg, weight: weights.season, contribution: seasonAvg * weights.season },
    location: { value: locationAvg, weight: 0, contribution: 0 },
    last_5: { value: last5Avg, weight: 0, contribution: 0 },
    h2h: { value: h2hAvg, weight: 0, contribution: 0 },
  }

  if (locationAvg !== null) {
    weightedSum += locationAvg * weights.location
    totalWeight += weights.location
    breakdown.location = { value: locationAvg, weight: weights.location, contribution: locationAvg * weights.location }
  }

  if (last5Avg !== null) {
    weightedSum += last5Avg * weights.last_5
    totalWeight += weights.last_5
    breakdown.last_5 = { value: last5Avg, weight: weights.last_5, contribution: last5Avg * weights.last_5 }
  }

  if (h2hAvg !== null) {
    weightedSum += h2hAvg * weights.h2h
    totalWeight += weights.h2h
    breakdown.h2h = { value: h2hAvg, weight: weights.h2h, contribution: h2hAvg * weights.h2h }
  }

  const projection = totalWeight > 0 ? weightedSum / totalWeight : seasonAvg

  return { projection, breakdown }
}

/**
 * Calculate defensive adjustment factor based on opponent defense
 */
function calculateDefensiveAdjustment(
  statType: string,
  opponentDefense: any,
  leagueAvg: any,
  teamOffense: any | null
): { factor: number; context: any } {
  let leagueAvgValue = 0
  let opponentAllows = 0
  let teamLocationValue = 0

  // Map stat type to appropriate defensive metric
  switch (statType) {
    case 'Points':
    case 'Pts+Rebs+Asts':
      leagueAvgValue = leagueAvg.ppg
      opponentAllows = opponentDefense.ppg_allowed
      teamLocationValue = teamOffense?.ppg || 0
      break
    case '3 Point FG':
      leagueAvgValue = leagueAvg.three_pm
      opponentAllows = opponentDefense.three_pm_allowed
      teamLocationValue = teamOffense?.three_pm || 0
      break
    case 'Assists':
      leagueAvgValue = leagueAvg.apg
      opponentAllows = opponentDefense.apg_allowed
      teamLocationValue = teamOffense?.apg || 0
      break
    case 'Rebounds':
      leagueAvgValue = leagueAvg.rpg
      opponentAllows = opponentDefense.rpg_allowed
      teamLocationValue = teamOffense?.rpg || 0
      break
    default:
      return { factor: 1.0, context: {} }
  }

  // Calculate how much better/worse opponent defense is vs league
  const defenseVsLeague = (opponentAllows - leagueAvgValue) / leagueAvgValue

  // Calculate team's offensive performance at this location vs league
  const teamOffenseVsLeague = teamLocationValue > 0 ? (teamLocationValue - leagueAvgValue) / leagueAvgValue : 0

  // Combine defensive and offensive factors
  // Negative defenseVsLeague = good defense (allows less than league)
  // Negative teamOffenseVsLeague = poor offense (scores less than league)
  let adjustmentFactor = 1.0

  // Apply defensive adjustment (stronger weight)
  adjustmentFactor += defenseVsLeague * 0.6

  // Apply team offensive context (weaker weight)
  if (teamOffense) {
    adjustmentFactor += teamOffenseVsLeague * 0.4
  }

  // Clamp adjustment factor between 0.7 and 1.3 (max ±30% adjustment)
  adjustmentFactor = Math.max(0.7, Math.min(1.3, adjustmentFactor))

  const defenseRating =
    defenseVsLeague < -0.05
      ? 'ELITE (Top 10)'
      : defenseVsLeague < 0
      ? 'ABOVE AVERAGE'
      : defenseVsLeague < 0.05
      ? 'AVERAGE'
      : 'BELOW AVERAGE'

  const splitRating = teamOffense
    ? teamOffenseVsLeague < -0.05
      ? 'POOR'
      : teamOffenseVsLeague < 0
      ? 'BELOW AVERAGE'
      : teamOffenseVsLeague < 0.05
      ? 'AVERAGE'
      : 'STRONG'
    : 'N/A'

  return {
    factor: adjustmentFactor,
    context: {
      opponent_defense: opponentDefense.team_abbreviation,
      league_avg: leagueAvgValue,
      opponent_allows: opponentAllows,
      defense_rating: defenseRating,
      adjustment_factor: adjustmentFactor,
      team_offensive_context: teamOffense
        ? {
            team_location_avg: teamLocationValue,
            league_avg: leagueAvgValue,
            split_rating: splitRating,
            adjustment_factor: teamOffenseVsLeague,
          }
        : undefined,
    },
  }
}

/**
 * Generate recommendation based on value percentage and confidence
 */
function generateRecommendation(
  valuePct: number,
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
): 'STRONG OVER' | 'LEAN OVER' | 'NEUTRAL' | 'LEAN UNDER' | 'STRONG UNDER' {
  if (valuePct >= 15 && confidence === 'HIGH') return 'STRONG OVER'
  if (valuePct >= 10 && confidence === 'HIGH') return 'LEAN OVER'
  if (valuePct >= 5) return 'LEAN OVER'
  if (valuePct <= -15 && confidence === 'HIGH') return 'STRONG UNDER'
  if (valuePct <= -10 && confidence === 'HIGH') return 'LEAN UNDER'
  if (valuePct <= -5) return 'LEAN UNDER'
  return 'NEUTRAL'
}

/**
 * Calculate confidence level based on data availability and consistency
 */
function calculateConfidence(
  gamesPlayed: number,
  hasLocationData: boolean,
  hasLast5Data: boolean,
  hasH2HData: boolean,
  variability: number
): 'HIGH' | 'MEDIUM' | 'LOW' {
  let score = 0

  // Games played factor (max 40 points)
  if (gamesPlayed >= 10) score += 40
  else if (gamesPlayed >= 5) score += 25
  else score += 10

  // Data availability (max 30 points)
  if (hasLocationData) score += 10
  if (hasLast5Data) score += 10
  if (hasH2HData) score += 10

  // Consistency factor (max 30 points) - inverse of variability
  if (variability < 0.15) score += 30 // Very consistent
  else if (variability < 0.25) score += 20 // Moderately consistent
  else if (variability < 0.35) score += 10 // Somewhat consistent

  if (score >= 70) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

export async function POST(request: NextRequest) {
  try {
    const body: GameContext = await request.json()
    const { home_team, away_team, player_props } = body

    if (!player_props || player_props.length === 0) {
      return NextResponse.json({ error: 'No player props provided' }, { status: 400 })
    }

    const currentSeason = await getCurrentSeason()

    // Extract unique player names
    const playerNames = [...new Set(player_props.map((p) => p.player_name))]

    // Fetch all player statistics
    const playerStats = await getPlayerPropsStats(playerNames, currentSeason)

    // Fetch league averages
    const leagueAvg = await getLeagueAverages(currentSeason)

    // Process each prop
    const analyses: AnalysisResult[] = []

    for (const prop of player_props) {
      // Find player stats
      const stats = playerStats.find((s) => s.full_name === prop.player_name)
      if (!stats) {
        console.warn(`No stats found for player: ${prop.player_name}`)
        continue
      }

      // Determine if player is home or away
      const isHome = stats.team === home_team
      const location: 'HOME' | 'AWAY' = isHome ? 'HOME' : 'AWAY'
      const opponent = isHome ? away_team : home_team

      // Get appropriate location average
      const locationAvg = isHome ? stats.home_ppg : stats.away_ppg

      // Get stat-specific averages
      let seasonAvg = 0
      let last5Avg = null
      let locAvg = null

      switch (prop.stat_type) {
        case 'Points':
          seasonAvg = parseFloat(stats.season_ppg)
          last5Avg = stats.last_5_ppg ? parseFloat(stats.last_5_ppg) : null
          locAvg = isHome ? (stats.home_ppg ? parseFloat(stats.home_ppg) : null) : stats.away_ppg ? parseFloat(stats.away_ppg) : null
          break
        case 'Rebounds':
          seasonAvg = parseFloat(stats.season_rpg)
          last5Avg = stats.last_5_rpg ? parseFloat(stats.last_5_rpg) : null
          locAvg = isHome ? (stats.home_rpg ? parseFloat(stats.home_rpg) : null) : stats.away_rpg ? parseFloat(stats.away_rpg) : null
          break
        case 'Assists':
          seasonAvg = parseFloat(stats.season_apg)
          last5Avg = stats.last_5_apg ? parseFloat(stats.last_5_apg) : null
          locAvg = isHome ? (stats.home_apg ? parseFloat(stats.home_apg) : null) : stats.away_apg ? parseFloat(stats.away_apg) : null
          break
        case '3 Point FG':
          seasonAvg = parseFloat(stats.season_three_pg)
          last5Avg = stats.last_5_three_pg ? parseFloat(stats.last_5_three_pg) : null
          locAvg = isHome
            ? stats.home_three_pg
              ? parseFloat(stats.home_three_pg)
              : null
            : stats.away_three_pg
            ? parseFloat(stats.away_three_pg)
            : null
          break
        case 'Pts+Rebs+Asts':
          seasonAvg = parseFloat(stats.season_pra)
          last5Avg = stats.last_5_pra ? parseFloat(stats.last_5_pra) : null
          locAvg = isHome ? (stats.home_pra ? parseFloat(stats.home_pra) : null) : stats.away_pra ? parseFloat(stats.away_pra) : null
          break
      }

      // Get H2H stats vs opponent
      const h2hStats = await getPlayerVsOpponent(prop.player_name, opponent, currentSeason)
      let h2hAvg = null

      if (h2hStats.length > 0) {
        const h2h = h2hStats[0]
        switch (prop.stat_type) {
          case 'Points':
            h2hAvg = h2h.ppg ? parseFloat(h2h.ppg) : null
            break
          case 'Rebounds':
            h2hAvg = h2h.rpg ? parseFloat(h2h.rpg) : null
            break
          case 'Assists':
            h2hAvg = h2h.apg ? parseFloat(h2h.apg) : null
            break
          case '3 Point FG':
            h2hAvg = h2h.three_pg ? parseFloat(h2h.three_pg) : null
            break
          case 'Pts+Rebs+Asts':
            h2hAvg = h2h.pra ? parseFloat(h2h.pra) : null
            break
        }
      }

      // Calculate weighted projection
      const { projection: weightedProjection, breakdown: weightedBreakdown } = calculateWeightedProjection(
        seasonAvg,
        locAvg,
        last5Avg,
        h2hAvg
      )

      // Fetch defensive matchup data
      const opponentDefense = await getTeamDefensiveStats(opponent, location === 'HOME' ? 'AWAY' : 'HOME', currentSeason)

      // Fetch team offensive splits
      const teamOffense = await getTeamOffensiveSplits(stats.team, location, currentSeason)

      // Calculate defensive adjustment
      const { factor: defensiveFactor, context: defensiveContext } = calculateDefensiveAdjustment(
        prop.stat_type,
        opponentDefense,
        leagueAvg,
        teamOffense
      )

      // Apply defensive adjustment to projection
      const finalProjection = weightedProjection * defensiveFactor

      // Calculate value
      const edgeVsLine = finalProjection - prop.line
      const valuePct = (edgeVsLine / prop.line) * 100

      // Calculate implied probability from odds
      const impliedProb = 1 / prop.over_odds

      // Calculate confidence
      const variability = last5Avg && seasonAvg > 0 ? Math.abs(last5Avg - seasonAvg) / seasonAvg : 0.3
      const confidence = calculateConfidence(
        parseInt(stats.gp),
        locAvg !== null,
        last5Avg !== null,
        h2hAvg !== null,
        variability
      )

      // Generate recommendation
      const recommendation = generateRecommendation(valuePct, confidence)

      analyses.push({
        player_name: prop.player_name,
        team: stats.team,
        stat_type: prop.stat_type,
        line: prop.line,
        over_odds: prop.over_odds,
        under_odds: prop.under_odds,
        season_avg: seasonAvg,
        home_avg: stats.home_ppg ? parseFloat(stats.home_ppg) : null,
        away_avg: stats.away_ppg ? parseFloat(stats.away_ppg) : null,
        last_5_avg: last5Avg,
        vs_opponent_avg: h2hAvg,
        games_played: parseInt(stats.gp),
        weighted_projection: parseFloat(weightedProjection.toFixed(2)),
        defensive_adjustment: parseFloat(defensiveFactor.toFixed(3)),
        final_projection: parseFloat(finalProjection.toFixed(2)),
        value_pct: parseFloat(valuePct.toFixed(1)),
        edge_vs_line: parseFloat(edgeVsLine.toFixed(2)),
        implied_probability: parseFloat((impliedProb * 100).toFixed(1)),
        recommendation,
        confidence,
        breakdown: {
          weighted_components: weightedBreakdown,
          defensive_context: defensiveContext,
        },
      })
    }

    // Sort by value percentage (highest first)
    analyses.sort((a, b) => b.value_pct - a.value_pct)

    return NextResponse.json({
      success: true,
      game: {
        home_team,
        away_team,
        season: currentSeason,
      },
      analyses,
      summary: {
        total_props: analyses.length,
        strong_over: analyses.filter((a) => a.recommendation === 'STRONG OVER').length,
        lean_over: analyses.filter((a) => a.recommendation === 'LEAN OVER').length,
        neutral: analyses.filter((a) => a.recommendation === 'NEUTRAL').length,
        lean_under: analyses.filter((a) => a.recommendation === 'LEAN UNDER').length,
        strong_under: analyses.filter((a) => a.recommendation === 'STRONG UNDER').length,
        high_confidence: analyses.filter((a) => a.confidence === 'HIGH').length,
      },
    })
  } catch (error) {
    console.error('Betting analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
