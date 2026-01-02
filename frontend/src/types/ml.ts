/**
 * TypeScript types for ML Analysis features
 */

// Single game prediction from ML model
export interface GamePrediction {
  gameId: string
  matchup: string
  line: number
  prediction: 'OVER' | 'UNDER'
  confidence: number
  probOver: number
  logisticProb: number
  xgboostProb: number
  overOdds: number
  underOdds: number
  odds: number
  expectedValue: number
}

// Model metadata from training
export interface ModelInfo {
  trainingSamples: number
  features: number
  seasons: string[]
  confidenceThreshold: number
}

// Full predictions response from API
export interface PredictionsResponse {
  date: string
  games: GamePrediction[]
  highConfidencePicks: GamePrediction[]
  modelInfo: ModelInfo
  error?: string
}

// Backtest metrics for a specific confidence threshold
export interface BacktestThreshold {
  threshold: number
  accuracy: number
  roi: number
  totalBets: number
  wins: number
  losses: number
  pushes: number
  profit: number
}

// Metrics for individual model
export interface ModelMetrics {
  name: string
  accuracy: number
  roi: number
  sharpe: number
  maxDrawdown: number
  winRate: number
}

// Feature importance data
export interface FeatureImportance {
  name: string
  importance: number
  category: 'team_performance' | 'rest_schedule' | 'matchup' | 'trends' | 'context'
}

// Full backtest response from API
export interface BacktestResponse {
  thresholds: BacktestThreshold[]
  byModel: Record<string, ModelMetrics>
  features: FeatureImportance[]
  summary?: {
    totalGames: number
    dateRange?: {
      start: string
      end: string
    }
    seasons?: string[]
  }
  error?: string
}

// Results comparison (predictions vs actual)
export interface ResultComparison {
  gameId: string
  matchup: string
  gameDate: string
  prediction: 'OVER' | 'UNDER'
  confidence: number
  line: number
  actualTotal: number
  result: 'WIN' | 'LOSS' | 'PUSH'
  profit: number
}

export interface ResultsResponse {
  results: ResultComparison[]
  summary: {
    wins: number
    losses: number
    pushes: number
    roi: number
    profit: number
    accuracy: number
  }
  dateRange: {
    start: string
    end: string
  }
}

// Category colors for feature importance chart
export const CATEGORY_COLORS: Record<FeatureImportance['category'], string> = {
  team_performance: '#3b82f6', // blue
  rest_schedule: '#10b981',    // green
  matchup: '#f59e0b',          // amber
  trends: '#8b5cf6',           // purple
  context: '#6b7280',          // gray
}

// Category labels for display
export const CATEGORY_LABELS: Record<FeatureImportance['category'], string> = {
  team_performance: 'Team Performance',
  rest_schedule: 'Rest & Schedule',
  matchup: 'Matchup',
  trends: 'Trends',
  context: 'Context',
}
