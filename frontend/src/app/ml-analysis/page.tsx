'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PredictionsTable } from '@/components/ml/PredictionsTable'
import { ROIChart } from '@/components/ml/ROIChart'
import { ModelComparisonChart } from '@/components/ml/ModelComparisonChart'
import { FeatureImportanceChart } from '@/components/ml/FeatureImportanceChart'
import { fetchPredictions, fetchBacktest } from '@/lib/ml-api'
import type { PredictionsResponse, BacktestResponse } from '@/types/ml'

export default function MLAnalysisPage() {
  const [predictions, setPredictions] = useState<PredictionsResponse | null>(null)
  const [backtest, setBacktest] = useState<BacktestResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [backtestLoading, setBacktestLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'predictions' | 'backtest'>('predictions')

  const loadPredictions = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const data = await fetchPredictions()
      setPredictions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load predictions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadBacktest = async () => {
    try {
      setBacktestLoading(true)
      const data = await fetchBacktest()
      setBacktest(data)
    } catch (err) {
      console.error('Failed to load backtest:', err)
      // Set backtest with error so UI shows error state
      setBacktest({
        error: err instanceof Error ? err.message : 'Failed to load backtest',
        thresholds: [],
        byModel: {},
        features: [],
      })
    } finally {
      setBacktestLoading(false)
    }
  }

  useEffect(() => {
    loadPredictions()
    loadBacktest()
  }, [])

  const highConfidenceIds = predictions?.highConfidencePicks.map((p) => p.gameId) || []

  return (
    <AppLayout>
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">ML Totals Analysis</h1>
            <button
              onClick={() => loadPredictions(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Training...
                </>
              ) : (
                <>
                  <span>↻</span>
                  Refresh
                </>
              )}
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Machine learning predictions for NBA totals using Logistic Regression and XGBoost ensemble
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'predictions'
                ? 'bg-white text-black'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Tonight&apos;s Predictions
          </button>
          <button
            onClick={() => setActiveTab('backtest')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'backtest'
                ? 'bg-white text-black'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Backtest Results
          </button>
        </div>

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <>
            {/* Loading State */}
            {loading && (
              <div className="bg-gray-950 rounded-lg p-8">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-white rounded-full" />
                  <span className="text-gray-400">Training models and generating predictions...</span>
                </div>
                <p className="text-center text-gray-500 text-sm mt-4">
                  This may take up to 2 minutes as models are trained on historical data
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
                <h3 className="text-red-400 font-medium mb-2">Error Loading Predictions</h3>
                <p className="text-red-300 text-sm">{error}</p>
                <button
                  onClick={() => loadPredictions()}
                  className="mt-4 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Predictions Content */}
            {predictions && !loading && (
          <div className="space-y-8">
            {/* Model Info Banner */}
            <div className="bg-gray-950 rounded-lg p-4 flex flex-wrap items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-400">Date:</span>{' '}
                <span className="text-white font-mono">{predictions.date}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Training:</span>{' '}
                <span className="text-white font-mono">
                  {predictions.modelInfo.trainingSamples.toLocaleString()} games
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Features:</span>{' '}
                <span className="text-white font-mono">{predictions.modelInfo.features}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Seasons:</span>{' '}
                <span className="text-white font-mono">
                  {predictions.modelInfo.seasons.join(', ')}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Threshold:</span>{' '}
                <span className="text-white font-mono">
                  {(predictions.modelInfo.confidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* High Confidence Picks Section */}
            {predictions.highConfidencePicks.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-green-400">●</span>
                  High Confidence Picks ({predictions.highConfidencePicks.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {predictions.highConfidencePicks.map((pick) => (
                    <div
                      key={pick.gameId}
                      className="bg-gray-950 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-white text-lg">{pick.matchup}</span>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            pick.prediction === 'OVER'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {pick.prediction}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Line:</span>
                          <span className="text-white font-mono ml-2">{pick.line.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Odds:</span>
                          <span className="text-white font-mono ml-2">{pick.odds.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Confidence:</span>
                          <span className="text-green-400 font-mono ml-2">
                            {(pick.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">EV:</span>
                          <span
                            className={`font-mono ml-2 ${
                              pick.expectedValue >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {pick.expectedValue >= 0 ? '+' : ''}
                            {(pick.expectedValue * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                        <span>Logistic: {(pick.logisticProb * 100).toFixed(1)}%</span>
                        <span>XGBoost: {(pick.xgboostProb * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All Predictions Table */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                All Predictions ({predictions.games.length} games)
              </h2>
              <div className="bg-gray-950 rounded-lg overflow-hidden">
                <PredictionsTable
                  predictions={predictions.games}
                  highConfidenceIds={highConfidenceIds}
                  showModelDetails={true}
                />
              </div>
            </section>

            {/* Disclaimer */}
            <div className="text-center text-gray-500 text-xs py-4">
              <p>
                ⚠️ This is for educational purposes only. Past performance does not guarantee
                future results.
              </p>
            </div>
          </div>
            )}

            {/* No Games State */}
            {predictions && predictions.games.length === 0 && !loading && (
              <div className="bg-gray-950 rounded-lg p-8 text-center">
                <p className="text-gray-400 text-lg mb-2">No games with betting lines for today</p>
                <p className="text-gray-500 text-sm">Check back later when lines are available</p>
              </div>
            )}
          </>
        )}

        {/* Backtest Tab */}
        {activeTab === 'backtest' && (
          <>
            {/* Backtest Loading State */}
            {backtestLoading && (
              <div className="bg-gray-950 rounded-lg p-8">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-white rounded-full" />
                  <span className="text-gray-400">Running walk-forward backtest...</span>
                </div>
                <p className="text-center text-gray-500 text-sm mt-4">
                  This may take up to 5 minutes as models are trained and validated on historical data
                </p>
              </div>
            )}

            {/* Backtest Error State */}
            {backtest?.error && !backtestLoading && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
                <h3 className="text-red-400 font-medium mb-2">Error Loading Backtest</h3>
                <p className="text-red-300 text-sm">{backtest.error}</p>
                <button
                  onClick={loadBacktest}
                  className="mt-4 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Backtest Content */}
            {backtest && !backtest.error && !backtestLoading && (
              <div className="space-y-8">
                {/* Backtest Summary Banner */}
                {backtest.summary && (
                  <div className="bg-gray-950 rounded-lg p-4 flex flex-wrap items-center gap-6">
                    <div className="text-sm">
                      <span className="text-gray-400">Total Games:</span>{' '}
                      <span className="text-white font-mono">
                        {backtest.summary.totalGames.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Seasons:</span>{' '}
                      <span className="text-white font-mono">
                        {backtest.summary.seasons?.join(', ') || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Date Range:</span>{' '}
                      <span className="text-white font-mono">
                        {backtest.summary.dateRange?.start} - {backtest.summary.dateRange?.end}
                      </span>
                    </div>
                  </div>
                )}

                {/* Charts Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* ROI by Threshold */}
                  <ROIChart thresholds={backtest.thresholds} highlightThreshold={0.58} />

                  {/* Model Comparison */}
                  <ModelComparisonChart models={backtest.byModel} />
                </div>

                {/* Feature Importance - Full Width */}
                <FeatureImportanceChart features={backtest.features} maxFeatures={15} />

                {/* Disclaimer */}
                <div className="text-center text-gray-500 text-xs py-4">
                  <p>
                    ⚠️ Backtest results are based on historical data. Past performance does not
                    guarantee future results.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </AppLayout>
  )
}
