'use client'

import { OddsDataPoint } from '@/lib/queries'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface OddsLineChartProps {
  data: OddsDataPoint[]
  marketName: string
}

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ea580c', '#8b5cf6', '#0891b2']

export function OddsLineChart({ data, marketName }: OddsLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">
          Aucune donnée historique disponible pour ce marché
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Sélectionnez un marché dans le tableau ci-dessus pour visualiser l'évolution des cotes
        </p>
      </div>
    )
  }

  // Group data by selection (team/player name)
  const selectionGroups = data.reduce((acc, point) => {
    if (!acc[point.selection]) {
      acc[point.selection] = []
    }
    acc[point.selection].push(point)
    return acc
  }, {} as Record<string, OddsDataPoint[]>)

  // Get unique selections for legend
  const selections = Object.keys(selectionGroups)

  // Transform data for recharts format
  // Create a timeline with all unique timestamps
  const timestamps = Array.from(new Set(data.map((d) => d.recorded_at))).sort()

  const chartData = timestamps.map((timestamp) => {
    const dataPoint: any = {
      time: new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Add odds for each selection at this timestamp
    selections.forEach((selection) => {
      const point = data.find(
        (d) => d.recorded_at === timestamp && d.selection === selection
      )
      if (point) {
        dataPoint[selection] = parseFloat(point.odds_decimal)
      }
    })

    return dataPoint
  })

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Évolution des cotes - {marketName}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Historique des dernières 24 heures
        </p>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{
                value: 'Cote décimale',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#6b7280', fontSize: 12 }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
              labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '8px' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            {selections.map((selection, idx) => (
              <Line
                key={selection}
                type="monotone"
                dataKey={selection}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[idx % COLORS.length], r: 3 }}
                activeDot={{ r: 5 }}
                name={selection}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selections.map((selection, idx) => {
            const selectionData = selectionGroups[selection]
            const latestOdds = selectionData[selectionData.length - 1]
            const firstOdds = selectionData[0]
            const change =
              parseFloat(latestOdds.odds_decimal) - parseFloat(firstOdds.odds_decimal)
            const changePercent = (change / parseFloat(firstOdds.odds_decimal)) * 100

            return (
              <div key={selection} className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900">{selection}</span>
                </div>
                <div className="text-xs text-gray-600">
                  Actuel: {parseFloat(latestOdds.odds_decimal).toFixed(2)}
                </div>
                <div
                  className={`text-xs font-medium ${
                    change > 0
                      ? 'text-green-600'
                      : change < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {change > 0 ? '+' : ''}
                  {change.toFixed(2)} ({changePercent.toFixed(1)}%)
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
