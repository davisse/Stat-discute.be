import { NextResponse } from 'next/server'
import { getQ1ValueAnalysis, getQ1Leaderboard, getQ1TeamStats } from '@/lib/queries'

/**
 * GET /api/analysis/q1-value
 *
 * Returns Q1 moneyline value analysis for today's games.
 * Includes:
 * - Today's games with Q1 projections and model win probabilities
 * - Q1 leaderboards (offense, defense, margin, win%)
 * - All team Q1 stats for reference
 */
export async function GET() {
  try {
    // Fetch all data in parallel
    const [todayGames, leaderboard, allTeamStats] = await Promise.all([
      getQ1ValueAnalysis(),
      getQ1Leaderboard(10),
      getQ1TeamStats()
    ])

    // Calculate value edges when we have odds data
    // For now, return model probabilities for comparison with market odds
    const gamesWithValue = todayGames.map(game => {
      // Determine which side has the higher model probability
      const favoredSide = game.home_model_win_prob > game.away_model_win_prob ? 'home' : 'away'
      const favoredProb = Math.max(game.home_model_win_prob, game.away_model_win_prob)
      const underdogProb = Math.min(game.home_model_win_prob, game.away_model_win_prob)

      // Calculate fair decimal odds from model probability
      const favoredFairOdds = 1 / favoredProb
      const underdogFairOdds = 1 / underdogProb

      return {
        ...game,
        favored_side: favoredSide,
        favored_team: favoredSide === 'home' ? game.home_abbr : game.away_abbr,
        underdog_team: favoredSide === 'home' ? game.away_abbr : game.home_abbr,
        favored_model_prob: favoredProb,
        underdog_model_prob: underdogProb,
        favored_fair_odds: favoredFairOdds,
        underdog_fair_odds: underdogFairOdds,
        projected_margin: game.projected_home_q1 - game.projected_away_q1
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        today_games: gamesWithValue,
        leaderboard,
        all_team_stats: allTeamStats,
        metadata: {
          games_count: todayGames.length,
          generated_at: new Date().toISOString(),
          model_description: 'Logistic regression on Q1 scoring margins with k=0.15 calibration factor'
        }
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching Q1 value analysis:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while fetching Q1 value analysis.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
