'use client'

import type { ModelMetrics } from '@/types/ml'

interface ModelComparisonChartProps {
  models: Record<string, ModelMetrics>
}

export function ModelComparisonChart({ models }: ModelComparisonChartProps) {
  const modelEntries = Object.entries(models)

  if (modelEntries.length === 0) {
    return (
      <div className="bg-gray-950 rounded-lg p-6 text-center">
        <p className="text-gray-400">No model data available</p>
      </div>
    )
  }

  // Define metrics to display
  const metrics = [
    { key: 'accuracy', label: 'Accuracy', format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'roi', label: 'ROI', format: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
    { key: 'sharpe', label: 'Sharpe', format: (v: number) => v.toFixed(2) },
  ]

  // Model colors
  const modelColors: Record<string, { bg: string; border: string }> = {
    logistic: { bg: 'bg-blue-600', border: 'border-blue-500' },
    xgboost: { bg: 'bg-purple-600', border: 'border-purple-500' },
    ensemble: { bg: 'bg-green-600', border: 'border-green-500' },
  }

  return (
    <div className="bg-gray-950 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Model Performance Comparison</h3>

      {/* Metrics comparison */}
      <div className="space-y-6">
        {metrics.map((metric) => {
          const values = modelEntries.map(([key, m]) => ({
            key,
            name: m.name,
            value: m[metric.key as keyof ModelMetrics] as number,
          }))
          const maxValue = Math.max(...values.map((v) => Math.abs(v.value)))
          const minValue = Math.min(...values.map((v) => v.value))
          const hasNegative = minValue < 0

          return (
            <div key={metric.key}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">{metric.label}</span>
              </div>
              <div className="space-y-2">
                {values.map(({ key, name, value }) => {
                  const colors = modelColors[key] || { bg: 'bg-gray-600', border: 'border-gray-500' }
                  const barWidth = Math.abs(value) / (maxValue || 1) * 100

                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-20 font-mono">{name}</span>
                      <div className="flex-1 relative h-6">
                        {hasNegative ? (
                          // Show negative/positive bar from center
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-1/2 flex justify-end">
                              {value < 0 && (
                                <div
                                  className={`h-4 ${colors.bg} rounded-l`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              )}
                            </div>
                            <div className="w-px h-full bg-gray-700" />
                            <div className="w-1/2">
                              {value >= 0 && (
                                <div
                                  className={`h-4 ${colors.bg} rounded-r`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          // Simple bar from left
                          <div className="absolute inset-0 flex items-center">
                            <div
                              className={`h-4 ${colors.bg} rounded`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-sm font-mono w-16 text-right ${
                          metric.key === 'roi'
                            ? value >= 0
                              ? 'text-green-400'
                              : 'text-red-400'
                            : 'text-white'
                        }`}
                      >
                        {metric.format(value)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Model cards with additional stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
        {modelEntries.map(([key, model]) => {
          const colors = modelColors[key] || { bg: 'bg-gray-600', border: 'border-gray-500' }
          return (
            <div
              key={key}
              className={`bg-gray-900 rounded-lg p-4 border-l-4 ${colors.border}`}
            >
              <h4 className="text-white font-medium mb-2">{model.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-white font-mono">
                    {(model.winRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max DD</span>
                  <span className="text-red-400 font-mono">
                    -{(model.maxDrawdown * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-xs text-gray-400">
        {modelEntries.map(([key, model]) => {
          const colors = modelColors[key] || { bg: 'bg-gray-600', border: 'border-gray-500' }
          return (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${colors.bg}`} />
              <span>{model.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ModelComparisonChart
