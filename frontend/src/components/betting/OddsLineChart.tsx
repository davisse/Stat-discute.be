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

  // Transform data for recharts format - single line per market
  const sortedData = [...data].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const chartData = sortedData.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    odds: point.odds
  }))

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
            <Line
              type="monotone"
              dataKey="odds"
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={{ fill: COLORS[0], r: 3 }}
              activeDot={{ r: 5 }}
              name="Cote"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {sortedData.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[0] }}
              />
              <span className="font-medium text-gray-900">Évolution</span>
            </div>
            <div className="text-xs text-gray-600">
              Actuel: {sortedData[sortedData.length - 1].odds.toFixed(2)}
            </div>
            {(() => {
              const change = sortedData[sortedData.length - 1].odds - sortedData[0].odds
              const changePercent = (change / sortedData[0].odds) * 100
              return (
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
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
