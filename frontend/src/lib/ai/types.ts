/**
 * AI Storytelling Types
 *
 * Type definitions for game narratives and storytelling system
 */

// ============================================
// NARRATIVE SEQUENCES
// ============================================

export type NarrativeSequence =
  | 'intro'
  | 'accroche'
  | 'scoring'
  | 'combined'
  | 'defense'
  | 'ml'
  | 'synthesis'

// ============================================
// TEAM AND PLAYER DATA
// ============================================

export interface TeamData {
  teamId: number
  abbreviation: string
  name: string
  record?: string
  wins?: number
  losses?: number
  streak?: string
}

export interface TeamStats {
  pointsPerGame: number
  offensiveRating: number
  defensiveRating: number
  pace: number
  effectiveFgPct: number
  trueShooting: number
  reboundsPerGame: number
  assistsPerGame: number
  turnoversPerGame: number
  plusMinus?: number
  atsRecord?: string
  overUnderRecord?: string
}

export interface PlayerStats {
  playerId: number
  name: string
  position: string
  pointsPerGame: number
  reboundsPerGame: number
  assistsPerGame: number
  minutes: number
  gamesPlayed: number
  effectiveFgPct?: number
  usageRate?: number
}

export interface InjuryReport {
  playerId: number
  playerName: string
  status: 'Out' | 'Doubtful' | 'Questionable' | 'Probable' | 'Day-To-Day'
  injury: string
  impact?: 'High' | 'Medium' | 'Low'
}

// ============================================
// BETTING DATA
// ============================================

export interface BettingLine {
  spread: number
  spreadOdds: {
    home: number
    away: number
  }
  moneyline: {
    home: number
    away: number
  }
  total: number
  totalOdds: {
    over: number
    under: number
  }
}

export interface MLPrediction {
  predictedWinner: string
  confidence: number
  predictedSpread: number
  predictedTotal: number
  overProbability?: number
  underProbability?: number
}

// ============================================
// GAME DATA FOR NARRATIVES
// ============================================

export interface GameDataForNarratives {
  gameId: string
  gameDate: string
  gameTime?: string
  venue?: string
  isPlayoff?: boolean
  seriesInfo?: string

  // Teams
  homeTeam: TeamData
  awayTeam: TeamData

  // Team stats
  homeStats: TeamStats
  awayStats: TeamStats

  // Key players
  homeKeyPlayers?: PlayerStats[]
  awayKeyPlayers?: PlayerStats[]

  // Injuries
  homeInjuries?: InjuryReport[]
  awayInjuries?: InjuryReport[]

  // Betting
  bettingLine?: BettingLine
  mlPrediction?: MLPrediction

  // Head to head
  headToHead?: {
    homeWins: number
    awayWins: number
    lastMeetings?: Array<{
      date: string
      homeScore: number
      awayScore: number
      winner: string
    }>
  }

  // Trends
  homeTrends?: {
    last5Record: string
    atsLast10: string
    overUnderLast10: string
    homeRecord: string
  }
  awayTrends?: {
    last5Record: string
    atsLast10: string
    overUnderLast10: string
    awayRecord: string
  }
}

// ============================================
// NARRATIVE TYPES
// ============================================

export interface IntroNarrative {
  type: 'intro'
  headline: string
  subheadline?: string
  context: string
  significance?: string
}

export interface AccrocheNarrative {
  type: 'accroche'
  hook: string
  keyStoryline: string
  emotionalTone: 'exciting' | 'tense' | 'intriguing' | 'dramatic' | 'neutral'
}

export interface ScoringNarrative {
  type: 'scoring'
  headline: string
  offensiveAnalysis: {
    homeTeam: string
    awayTeam: string
  }
  keyMatchup?: string
  totalProjection?: string
}

export interface CombinedNarrative {
  type: 'combined'
  headline: string
  tempoAnalysis: string
  styleMatchup: string
  expectedGameFlow: string
  scoringEnvironment: 'high' | 'medium' | 'low'
}

export interface DefenseNarrative {
  type: 'defense'
  headline: string
  defensiveAnalysis: {
    homeTeam: string
    awayTeam: string
  }
  keyDefensiveMatchup?: string
  impactOnTotal?: string
}

export interface MLPredictionNarrative {
  type: 'ml'
  headline: string
  modelPrediction: string
  confidenceLevel: 'high' | 'medium' | 'low'
  keyFactors: string[]
  caveat?: string
}

export interface SynthesisNarrative {
  type: 'synthesis'
  headline: string
  summaryAnalysis: string
  bettingConsiderations: {
    spreadAnalysis?: string
    totalAnalysis?: string
    valuePlay?: string
  }
  finalThought: string
  riskLevel: 'low' | 'medium' | 'high'
}

// ============================================
// GAME NARRATIVES (COMPLETE SET)
// ============================================

export interface GameNarratives {
  intro: IntroNarrative
  accroche: AccrocheNarrative
  scoring: ScoringNarrative
  combined: CombinedNarrative
  defense: DefenseNarrative
  ml?: MLPredictionNarrative
  synthesis: SynthesisNarrative
}

// ============================================
// BETTING FACTORS
// ============================================

export interface BettingFactors {
  spreadValue: 'home' | 'away' | 'neutral'
  totalValue: 'over' | 'under' | 'neutral'
  keyFactors: string[]
  riskLevel: 'low' | 'medium' | 'high'
  confidence: number
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface NarrativeStreamEvent {
  sequence: NarrativeSequence
  narrative:
    | IntroNarrative
    | AccrocheNarrative
    | ScoringNarrative
    | CombinedNarrative
    | DefenseNarrative
    | MLPredictionNarrative
    | SynthesisNarrative
  isComplete: boolean
  error?: boolean
}

export interface NarrativeGenerationResponse {
  gameId: string
  narratives: GameNarratives
  generatedAt: string
}
