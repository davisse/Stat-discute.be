'use client'

import type { BacktestThreshold } from '@/types/ml'

interface ROIChartProps {
  thresholds: BacktestThreshold[]
  highlightThreshold?: number
}

export function ROIChart({ thresholds, highlightThreshold = 0.58 }: ROIChartProps) {
  if (thresholds.length === 0) {
    return (
      <div className="bg-gray-950 rounded-lg p-6 text-center">
        <p className="text-gray-400">No backtest data available</p>
      </div>
    )
  }

  // Find max/min for scaling
  const maxROI = Math.max(...thresholds.map((t) => t.roi), 10)
  const minROI = Math.min(...thresholds.map((t) => t.roi), -10)
  const range = maxROI - minROI
  const zeroPosition = ((maxROI - 0) / range) * 100

  return (
    <div className="bg-gray-950 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">ROI by Confidence Threshold</h3>

      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400 font-mono">
          <span>{maxROI.toFixed(0)}%</span>
          <span>0%</span>
          <span>{minROI.toFixed(0)}%</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0 bottom-8">
          {/* Zero line */}
          <div
            className="absolute left-0 right-0 border-t border-gray-700"
            style={{ top: `${zeroPosition}%` }}
          />

          {/* Grid lines */}
          {[25, 50, 75].map((percent) => (
            <div
              key={percent}
              className="absolute left-0 right-0 border-t border-gray-800"
              style={{ top: `${percent}%` }}
            />
          ))}

          {/* Bars */}
          <div className="flex items-end justify-around h-full gap-2 px-2">
            {thresholds.map((t, idx) => {
              const isHighlighted = t.threshold === highlightThreshold
              const barHeight = Math.abs(t.roi) / range * 100
              const isPositive = t.roi >= 0

              return (
                <div
                  key={t.threshold}
                  className="flex-1 flex flex-col items-center relative"
                  style={{ height: '100%' }}
                >
                  {/* Bar */}
                  <div
                    className="absolute w-full flex flex-col items-center"
                    style={{
                      [isPositive ? 'bottom' : 'top']: `${zeroPosition}%`,
                      height: `${barHeight}%`,
                    }}
                  >
                    <div
                      className={`w-full rounded-sm transition-all ${
                        isHighlighted
                          ? isPositive
                            ? 'bg-green-500'
                            : 'bg-red-500'
                          : isPositive
                          ? 'bg-green-600/60'
                          : 'bg-red-600/60'
                      }`}
                      style={{ height: '100%' }}
                    />
                    {/* Value label */}
                    <span
                      className={`absolute text-xs font-mono ${
                        isPositive ? '-top-5' : '-bottom-5'
                      } ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {t.roi > 0 ? '+' : ''}{t.roi.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-14 right-0 bottom-0 flex justify-around">
          {thresholds.map((t) => (
            <div
              key={t.threshold}
              className={`text-xs font-mono text-center flex-1 ${
                t.threshold === highlightThreshold ? 'text-white font-medium' : 'text-gray-400'
              }`}
            >
              {(t.threshold * 100).toFixed(0)}%
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span>Highlighted threshold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-600/60" />
          <span>Other thresholds</span>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
        {thresholds
          .filter((t) => [0.50, 0.58, 0.60].includes(t.threshold))
          .map((t) => (
            <div key={t.threshold} className="text-center">
              <p className="text-xs text-gray-400 mb-1">≥{(t.threshold * 100).toFixed(0)}%</p>
              <p className={`text-lg font-mono ${t.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {t.roi > 0 ? '+' : ''}{t.roi.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">{t.totalBets} bets</p>
            </div>
          ))}
      </div>
    </div>
  )
}

export default ROIChart
