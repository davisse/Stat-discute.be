/**
 * ML API Client
 *
 * Functions for interacting with the ML prediction service
 * and formatting prediction data for display
 */

import type {
  GamePrediction,
  PredictionsResponse,
  BacktestResponse,
  ModelInfo
} from '@/types/ml'

// Re-export types for convenience
export type { PredictionsResponse, BacktestResponse }

// ============================================
// CONFIGURATION
// ============================================

const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000'

// ============================================
// FORMATTING FUNCTIONS
// ============================================

/**
 * Format confidence as a percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`
}

/**
 * Format expected value with sign and percentage
 */
export function formatExpectedValue(ev: number): string {
  const sign = ev >= 0 ? '+' : ''
  return `${sign}${(ev * 100).toFixed(1)}%`
}

/**
 * Get Tailwind color class based on confidence level
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return 'text-green-400'
  if (confidence >= 0.6) return 'text-yellow-400'
  if (confidence >= 0.5) return 'text-orange-400'
  return 'text-red-400'
}

/**
 * Get Tailwind color class based on expected value
 */
export function getEVColor(ev: number): string {
  if (ev >= 0.05) return 'text-green-400'
  if (ev >= 0.02) return 'text-green-300'
  if (ev >= 0) return 'text-gray-400'
  if (ev >= -0.02) return 'text-orange-400'
  return 'text-red-400'
}

/**
 * Get background color class based on prediction result
 */
export function getResultColor(correct: boolean | null): string {
  if (correct === null) return 'bg-gray-800'
  return correct ? 'bg-green-900/30' : 'bg-red-900/30'
}

/**
 * Format profit/loss with sign and currency
 */
export function formatProfit(profit: number): string {
  const sign = profit >= 0 ? '+' : ''
  return `${sign}${profit.toFixed(2)}u`
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch today's predictions from the ML API
 */
export async function fetchPredictions(): Promise<PredictionsResponse> {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/predictions/today`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[ML API] Failed to fetch predictions:', error)

    // Return empty response on error matching PredictionsResponse from @/types/ml
    return {
      date: new Date().toISOString().split('T')[0],
      games: [],
      highConfidencePicks: [],
      modelInfo: {
        trainingSamples: 0,
        features: 0,
        seasons: [],
        confidenceThreshold: 0.6,
      },
      error: error instanceof Error ? error.message : 'Failed to fetch predictions',
    }
  }
}

/**
 * Fetch backtesting results from the ML API
 */
export async function fetchBacktest(
  startDate?: string,
  endDate?: string
): Promise<BacktestResponse> {
  try {
    const params = new URLSearchParams()
    if (startDate) params.append('start', startDate)
    if (endDate) params.append('end', endDate)

    const url = `${ML_API_BASE_URL}/backtest${params.toString() ? `?${params}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[ML API] Failed to fetch backtest:', error)

    // Return empty response on error matching BacktestResponse from @/types/ml
    return {
      thresholds: [],
      byModel: {},
      features: [],
      error: error instanceof Error ? error.message : 'Failed to fetch backtest',
    }
  }
}

/**
 * Fetch predictions for a specific game
 */
export async function fetchGamePrediction(gameId: string): Promise<GamePrediction | null> {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/predictions/game/${gameId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`ML API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`[ML API] Failed to fetch prediction for game ${gameId}:`, error)
    return null
  }
}

/**
 * Check if the ML API is available
 */
export async function isMLApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get model performance metrics
 */
export async function fetchModelMetrics(): Promise<{
  accuracy: number
  roi: number
  totalPredictions: number
  lastUpdated: string
} | null> {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[ML API] Failed to fetch metrics:', error)
    return null
  }
}
