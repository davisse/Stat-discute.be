'use client'

import type { FeatureImportance } from '@/types/ml'

interface FeatureImportanceChartProps {
  features: FeatureImportance[]
  maxFeatures?: number
}

// Category colors for feature groupings
const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  team_performance: { bg: 'bg-blue-600', text: 'text-blue-400', label: 'Team Stats' },
  rest_schedule: { bg: 'bg-orange-600', text: 'text-orange-400', label: 'Rest/Schedule' },
  matchup: { bg: 'bg-purple-600', text: 'text-purple-400', label: 'Matchup' },
  trends: { bg: 'bg-green-600', text: 'text-green-400', label: 'Trends' },
  context: { bg: 'bg-gray-600', text: 'text-gray-400', label: 'Context' },
}

export function FeatureImportanceChart({
  features,
  maxFeatures = 15,
}: FeatureImportanceChartProps) {
  if (features.length === 0) {
    return (
      <div className="bg-gray-950 rounded-lg p-6 text-center">
        <p className="text-gray-400">No feature importance data available</p>
      </div>
    )
  }

  // Take top N features
  const topFeatures = features.slice(0, maxFeatures)
  const maxImportance = Math.max(...topFeatures.map((f) => f.importance))

  // Format feature name for display
  const formatFeatureName = (name: string): string => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/Ppg/g, 'PPG')
      .replace(/Ortg/g, 'ORTG')
      .replace(/Drtg/g, 'DRTG')
      .replace(/Efg/g, 'eFG%')
      .replace(/Ts Pct/g, 'TS%')
      .replace(/Oreb/g, 'OREB')
      .replace(/Dreb/g, 'DREB')
      .replace(/Ast/g, 'AST')
      .replace(/Tov/g, 'TOV')
      .replace(/B2b/g, 'B2B')
  }

  // Count features by category
  const categoryCounts = topFeatures.reduce(
    (acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="bg-gray-950 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Top {topFeatures.length} Feature Importance
      </h3>

      {/* Horizontal bar chart */}
      <div className="space-y-2">
        {topFeatures.map((feature, idx) => {
          const colors = categoryColors[feature.category] || categoryColors.context
          const barWidth = (feature.importance / maxImportance) * 100

          return (
            <div key={feature.name} className="flex items-center gap-3">
              {/* Rank */}
              <span className="text-xs text-gray-500 w-5 text-right font-mono">
                {idx + 1}
              </span>

              {/* Feature name */}
              <span className="text-xs text-gray-300 w-36 truncate" title={feature.name}>
                {formatFeatureName(feature.name)}
              </span>

              {/* Bar */}
              <div className="flex-1 relative h-5">
                <div
                  className={`absolute top-0 left-0 h-full ${colors.bg} rounded transition-all`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Value */}
              <span className="text-xs font-mono text-gray-400 w-12 text-right">
                {(feature.importance * 100).toFixed(1)}%
              </span>

              {/* Category badge */}
              <span
                className={`text-xs px-2 py-0.5 rounded ${colors.bg}/20 ${colors.text} w-20 text-center`}
              >
                {colors.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Category summary */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <h4 className="text-sm text-gray-400 mb-3">Feature Categories</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => {
              const colors = categoryColors[category] || categoryColors.context
              return (
                <div
                  key={category}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg}/20`}
                >
                  <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                  <span className={`text-xs ${colors.text}`}>{colors.label}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </div>
              )
            })}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-3 bg-gray-900 rounded-lg">
        <p className="text-xs text-gray-400">
          <span className="text-white font-medium">Key insight:</span>{' '}
          {topFeatures[0] && (
            <>
              <span className={categoryColors[topFeatures[0].category]?.text || 'text-gray-400'}>
                {formatFeatureName(topFeatures[0].name)}
              </span>{' '}
              is the most predictive feature at{' '}
              <span className="text-white font-mono">
                {(topFeatures[0].importance * 100).toFixed(1)}%
              </span>{' '}
              importance.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default FeatureImportanceChart
