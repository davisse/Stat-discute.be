/**
 * Storytelling Prompts
 *
 * System prompts and prompt generation for AI-powered game narratives
 */

import type {
  GameDataForNarratives,
  NarrativeSequence,
  BettingFactors,
  IntroNarrative,
  AccrocheNarrative,
  ScoringNarrative,
  CombinedNarrative,
  DefenseNarrative,
  MLPredictionNarrative,
  SynthesisNarrative,
} from './types'

// ============================================
// SYSTEM PROMPT
// ============================================

export const SYSTEM_PROMPT = `You are an expert NBA analyst and sports storyteller. Your role is to analyze basketball games and create compelling narratives for betting analysis.

Key principles:
1. Be data-driven - base all analysis on the provided statistics
2. Be concise - deliver insights efficiently without unnecessary verbosity
3. Be balanced - acknowledge both sides of any matchup
4. Be honest about uncertainty - don't overstate confidence
5. Use betting terminology appropriately (spread, total, ATS, O/U)

Format your response as valid JSON matching the requested structure exactly.
Do not include any text before or after the JSON object.`

// ============================================
// PROMPT GENERATORS
// ============================================

/**
 * Get the prompt for a specific narrative sequence
 */
export function getPromptForSequence(
  sequence: NarrativeSequence,
  data: GameDataForNarratives,
  factors?: BettingFactors
): string {
  switch (sequence) {
    case 'intro':
      return getIntroPrompt(data)
    case 'accroche':
      return getAccrochePrompt(data)
    case 'scoring':
      return getScoringPrompt(data)
    case 'combined':
      return getCombinedPrompt(data)
    case 'defense':
      return getDefensePrompt(data)
    case 'ml':
      return getMLPrompt(data)
    case 'synthesis':
      return getSynthesisPrompt(data, factors)
    default:
      throw new Error(`Unknown sequence: ${sequence}`)
  }
}

function getIntroPrompt(data: GameDataForNarratives): string {
  return `Analyze this NBA matchup and create an intro narrative.

MATCHUP: ${data.awayTeam.abbreviation} @ ${data.homeTeam.abbreviation}
DATE: ${data.gameDate}
${data.venue ? `VENUE: ${data.venue}` : ''}
${data.isPlayoff ? `PLAYOFF SERIES: ${data.seriesInfo || 'Playoff Game'}` : ''}

HOME TEAM: ${data.homeTeam.name} (${data.homeStats.pointsPerGame} PPG, ORtg: ${data.homeStats.offensiveRating}, DRtg: ${data.homeStats.defensiveRating})
AWAY TEAM: ${data.awayTeam.name} (${data.awayStats.pointsPerGame} PPG, ORtg: ${data.awayStats.offensiveRating}, DRtg: ${data.awayStats.defensiveRating})

${data.bettingLine ? `
BETTING LINE:
- Spread: ${data.homeTeam.abbreviation} ${data.bettingLine.spread > 0 ? '+' : ''}${data.bettingLine.spread}
- Total: ${data.bettingLine.total}
- ML: ${data.homeTeam.abbreviation} ${data.bettingLine.moneyline.home}, ${data.awayTeam.abbreviation} ${data.bettingLine.moneyline.away}
` : ''}

Return JSON:
{
  "type": "intro",
  "headline": "Compelling headline for the matchup",
  "subheadline": "Optional subheadline with key angle",
  "context": "2-3 sentences setting up the matchup",
  "significance": "Why this game matters"
}`
}

function getAccrochePrompt(data: GameDataForNarratives): string {
  return `Create a compelling hook for this NBA matchup analysis.

MATCHUP: ${data.awayTeam.name} @ ${data.homeTeam.name}

KEY STORYLINES TO CONSIDER:
- Home team trends: ${data.homeTrends?.last5Record || 'N/A'} L5
- Away team trends: ${data.awayTrends?.last5Record || 'N/A'} L5
${data.headToHead ? `- Season series: ${data.headToHead.homeWins}-${data.headToHead.awayWins}` : ''}
${data.homeInjuries?.length ? `- Home injuries: ${data.homeInjuries.map(i => i.playerName).join(', ')}` : ''}
${data.awayInjuries?.length ? `- Away injuries: ${data.awayInjuries.map(i => i.playerName).join(', ')}` : ''}

Return JSON:
{
  "type": "accroche",
  "hook": "Attention-grabbing opening sentence",
  "keyStoryline": "The main narrative thread for this game",
  "emotionalTone": "exciting" | "tense" | "intriguing" | "dramatic" | "neutral"
}`
}

function getScoringPrompt(data: GameDataForNarratives): string {
  return `Analyze the offensive matchup for this NBA game.

MATCHUP: ${data.awayTeam.abbreviation} @ ${data.homeTeam.abbreviation}

OFFENSIVE STATS:
Home (${data.homeTeam.name}):
- PPG: ${data.homeStats.pointsPerGame}
- ORtg: ${data.homeStats.offensiveRating}
- eFG%: ${(data.homeStats.effectiveFgPct * 100).toFixed(1)}%
- Pace: ${data.homeStats.pace}

Away (${data.awayTeam.name}):
- PPG: ${data.awayStats.pointsPerGame}
- ORtg: ${data.awayStats.offensiveRating}
- eFG%: ${(data.awayStats.effectiveFgPct * 100).toFixed(1)}%
- Pace: ${data.awayStats.pace}

${data.bettingLine ? `Current Total: ${data.bettingLine.total}` : ''}

Return JSON:
{
  "type": "scoring",
  "headline": "Offensive analysis headline",
  "offensiveAnalysis": {
    "homeTeam": "1-2 sentences on home offense",
    "awayTeam": "1-2 sentences on away offense"
  },
  "keyMatchup": "Key offensive matchup to watch",
  "totalProjection": "Brief total projection context"
}`
}

function getCombinedPrompt(data: GameDataForNarratives): string {
  const avgPace = (data.homeStats.pace + data.awayStats.pace) / 2
  const paceCategory = avgPace > 102 ? 'high' : avgPace < 98 ? 'low' : 'medium'

  return `Analyze the tempo and style matchup.

MATCHUP: ${data.awayTeam.abbreviation} @ ${data.homeTeam.abbreviation}

TEMPO DATA:
- Home Pace: ${data.homeStats.pace}
- Away Pace: ${data.awayStats.pace}
- Average: ${avgPace.toFixed(1)} (${paceCategory} tempo)

EFFICIENCY:
- Home: ORtg ${data.homeStats.offensiveRating} / DRtg ${data.homeStats.defensiveRating}
- Away: ORtg ${data.awayStats.offensiveRating} / DRtg ${data.awayStats.defensiveRating}

${data.bettingLine ? `Total: ${data.bettingLine.total}` : ''}

Return JSON:
{
  "type": "combined",
  "headline": "Tempo/style headline",
  "tempoAnalysis": "How pace affects this matchup",
  "styleMatchup": "How team styles interact",
  "expectedGameFlow": "What to expect from the game flow",
  "scoringEnvironment": "high" | "medium" | "low"
}`
}

function getDefensePrompt(data: GameDataForNarratives): string {
  return `Analyze the defensive matchup.

MATCHUP: ${data.awayTeam.abbreviation} @ ${data.homeTeam.abbreviation}

DEFENSIVE STATS:
Home (${data.homeTeam.name}):
- DRtg: ${data.homeStats.defensiveRating}
- Opp eFG% (lower is better): Implied from DRtg

Away (${data.awayTeam.name}):
- DRtg: ${data.awayStats.defensiveRating}
- Opp eFG% (lower is better): Implied from DRtg

Return JSON:
{
  "type": "defense",
  "headline": "Defensive analysis headline",
  "defensiveAnalysis": {
    "homeTeam": "1-2 sentences on home defense",
    "awayTeam": "1-2 sentences on away defense"
  },
  "keyDefensiveMatchup": "Key defensive battle",
  "impactOnTotal": "How defenses affect the total"
}`
}

function getMLPrompt(data: GameDataForNarratives): string {
  if (!data.mlPrediction) {
    return ''
  }

  const ml = data.mlPrediction
  const confidenceLevel =
    ml.confidence > 0.7 ? 'high' : ml.confidence > 0.5 ? 'medium' : 'low'

  return `Summarize the ML model prediction for this matchup.

MATCHUP: ${data.awayTeam.abbreviation} @ ${data.homeTeam.abbreviation}

ML PREDICTION:
- Predicted Winner: ${ml.predictedWinner}
- Confidence: ${(ml.confidence * 100).toFixed(1)}%
- Predicted Spread: ${ml.predictedSpread > 0 ? '+' : ''}${ml.predictedSpread}
- Predicted Total: ${ml.predictedTotal}
${ml.overProbability ? `- Over Probability: ${(ml.overProbability * 100).toFixed(1)}%` : ''}

${data.bettingLine ? `
CURRENT LINE:
- Spread: ${data.homeTeam.abbreviation} ${data.bettingLine.spread > 0 ? '+' : ''}${data.bettingLine.spread}
- Total: ${data.bettingLine.total}
` : ''}

Return JSON:
{
  "type": "ml",
  "headline": "ML prediction headline",
  "modelPrediction": "Summary of model prediction",
  "confidenceLevel": "${confidenceLevel}",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "caveat": "Any important caveats"
}`
}

function getSynthesisPrompt(
  data: GameDataForNarratives,
  factors?: BettingFactors
): string {
  return `Create a final synthesis and betting considerations.

MATCHUP: ${data.awayTeam.abbreviation} @ ${data.homeTeam.abbreviation}

${data.bettingLine ? `
BETTING LINE:
- Spread: ${data.homeTeam.abbreviation} ${data.bettingLine.spread > 0 ? '+' : ''}${data.bettingLine.spread}
- Total: ${data.bettingLine.total}
` : ''}

${factors ? `
DERIVED FACTORS:
- Spread Value: ${factors.spreadValue}
- Total Value: ${factors.totalValue}
- Key Factors: ${factors.keyFactors.join(', ')}
- Risk Level: ${factors.riskLevel}
` : ''}

KEY STATS SUMMARY:
- Home: ${data.homeStats.pointsPerGame} PPG, ${data.homeStats.offensiveRating} ORtg, ${data.homeStats.defensiveRating} DRtg
- Away: ${data.awayStats.pointsPerGame} PPG, ${data.awayStats.offensiveRating} ORtg, ${data.awayStats.defensiveRating} DRtg

Return JSON:
{
  "type": "synthesis",
  "headline": "Final analysis headline",
  "summaryAnalysis": "2-3 sentence overall analysis",
  "bettingConsiderations": {
    "spreadAnalysis": "Spread lean with reasoning",
    "totalAnalysis": "Total lean with reasoning",
    "valuePlay": "Best value opportunity if any"
  },
  "finalThought": "Closing thought for bettors",
  "riskLevel": "low" | "medium" | "high"
}`
}

// ============================================
// BETTING FACTORS DERIVATION
// ============================================

/**
 * Derive betting factors from game data
 */
export function deriveBettingFactors(data: GameDataForNarratives): BettingFactors {
  const factors: string[] = []
  let spreadValue: 'home' | 'away' | 'neutral' = 'neutral'
  let totalValue: 'over' | 'under' | 'neutral' = 'neutral'
  let confidence = 0.5

  // Efficiency edge analysis
  const homeNetRating = data.homeStats.offensiveRating - data.homeStats.defensiveRating
  const awayNetRating = data.awayStats.offensiveRating - data.awayStats.defensiveRating
  const netRatingDiff = homeNetRating - awayNetRating

  if (netRatingDiff > 5) {
    spreadValue = 'home'
    factors.push('Strong home efficiency advantage')
    confidence += 0.1
  } else if (netRatingDiff < -5) {
    spreadValue = 'away'
    factors.push('Strong away efficiency advantage')
    confidence += 0.1
  }

  // Pace-based total analysis
  const avgPace = (data.homeStats.pace + data.awayStats.pace) / 2
  const projectedPossessions = avgPace * 0.96 // Approximate possessions per team

  if (data.bettingLine?.total) {
    const avgPPG = (data.homeStats.pointsPerGame + data.awayStats.pointsPerGame) / 2
    const projectedTotal = avgPPG * 2

    if (projectedTotal > data.bettingLine.total + 4) {
      totalValue = 'over'
      factors.push('Projected total significantly above line')
      confidence += 0.1
    } else if (projectedTotal < data.bettingLine.total - 4) {
      totalValue = 'under'
      factors.push('Projected total significantly below line')
      confidence += 0.1
    }
  }

  // Pace mismatch
  const paceDiff = Math.abs(data.homeStats.pace - data.awayStats.pace)
  if (paceDiff > 4) {
    factors.push('Significant pace mismatch')
  }

  // Injury impact
  const highImpactInjuries = [
    ...(data.homeInjuries?.filter(i => i.impact === 'High' && i.status === 'Out') || []),
    ...(data.awayInjuries?.filter(i => i.impact === 'High' && i.status === 'Out') || []),
  ]

  if (highImpactInjuries.length > 0) {
    factors.push(`Key injuries: ${highImpactInjuries.map(i => i.playerName).join(', ')}`)
    confidence -= 0.1 // More uncertainty with injuries
  }

  // Risk assessment
  let riskLevel: 'low' | 'medium' | 'high' = 'medium'
  if (confidence > 0.65 && factors.length >= 2) {
    riskLevel = 'low'
  } else if (confidence < 0.45 || highImpactInjuries.length > 1) {
    riskLevel = 'high'
  }

  return {
    spreadValue,
    totalValue,
    keyFactors: factors.length > 0 ? factors : ['No strong edges identified'],
    riskLevel,
    confidence: Math.max(0.3, Math.min(0.9, confidence)),
  }
}

// ============================================
// FALLBACK NARRATIVES
// ============================================

type NarrativeType =
  | IntroNarrative
  | AccrocheNarrative
  | ScoringNarrative
  | CombinedNarrative
  | DefenseNarrative
  | MLPredictionNarrative
  | SynthesisNarrative

/**
 * Get a fallback narrative when AI generation fails
 */
export function getFallbackNarrative(
  sequence: NarrativeSequence,
  data: GameDataForNarratives
): NarrativeType {
  const matchup = `${data.awayTeam.abbreviation} @ ${data.homeTeam.abbreviation}`

  switch (sequence) {
    case 'intro':
      return {
        type: 'intro',
        headline: matchup,
        context: `${data.awayTeam.name} travels to face ${data.homeTeam.name} in this NBA matchup.`,
        significance: 'Regular season contest.',
      } as IntroNarrative

    case 'accroche':
      return {
        type: 'accroche',
        hook: `${matchup} promises an intriguing matchup.`,
        keyStoryline: 'Two teams looking to build momentum.',
        emotionalTone: 'neutral',
      } as AccrocheNarrative

    case 'scoring':
      return {
        type: 'scoring',
        headline: 'Offensive Outlook',
        offensiveAnalysis: {
          homeTeam: `${data.homeTeam.name} averages ${data.homeStats.pointsPerGame} PPG.`,
          awayTeam: `${data.awayTeam.name} averages ${data.awayStats.pointsPerGame} PPG.`,
        },
      } as ScoringNarrative

    case 'combined':
      return {
        type: 'combined',
        headline: 'Tempo Analysis',
        tempoAnalysis: `Home pace: ${data.homeStats.pace}, Away pace: ${data.awayStats.pace}.`,
        styleMatchup: 'Both teams bring their distinct styles.',
        expectedGameFlow: 'Standard game flow expected.',
        scoringEnvironment: 'medium',
      } as CombinedNarrative

    case 'defense':
      return {
        type: 'defense',
        headline: 'Defensive Matchup',
        defensiveAnalysis: {
          homeTeam: `${data.homeTeam.name} has a ${data.homeStats.defensiveRating} DRtg.`,
          awayTeam: `${data.awayTeam.name} has a ${data.awayStats.defensiveRating} DRtg.`,
        },
      } as DefenseNarrative

    case 'ml':
      return {
        type: 'ml',
        headline: 'Model Prediction',
        modelPrediction: data.mlPrediction
          ? `Model favors ${data.mlPrediction.predictedWinner}.`
          : 'No model prediction available.',
        confidenceLevel: 'medium',
        keyFactors: ['Efficiency metrics', 'Recent form', 'Head-to-head'],
      } as MLPredictionNarrative

    case 'synthesis':
      return {
        type: 'synthesis',
        headline: 'Game Summary',
        summaryAnalysis: `${matchup} features two competitive teams.`,
        bettingConsiderations: {
          spreadAnalysis: 'Market appears efficient.',
          totalAnalysis: 'Total in line with team averages.',
        },
        finalThought: 'Exercise caution with betting decisions.',
        riskLevel: 'medium',
      } as SynthesisNarrative

    default:
      throw new Error(`Unknown sequence: ${sequence}`)
  }
}
