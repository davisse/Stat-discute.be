'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts'

interface ChartConfig {
  type: string
  dataField: string
  labelField: string
  title: string
  threshold?: number
}

interface DynamicChartProps {
  data: any[]
  config: ChartConfig
}

// Color palette
const COLORS = {
  primary: '#ffffff',
  secondary: '#a3a3a3',
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#737373',
  threshold: '#f59e0b',
  gridLine: '#262626',
  background: '#0a0a0a'
}

const PIE_COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']

export function DynamicChart({ data, config }: DynamicChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    )
  }

  const { type, dataField, title, threshold } = config

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-300">
              {entry.name}: <span className="text-white font-mono">{entry.value}</span>
            </p>
          ))}
          {dataPoint.opponent && (
            <p className="text-gray-400 text-sm">vs {dataPoint.opponent}</p>
          )}
        </div>
      )
    }
    return null
  }

  // Render bar chart
  if (type === 'bar') {
    return (
      <div className="w-full">
        <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} vertical={false} />
            <XAxis
              dataKey="label"
              stroke={COLORS.secondary}
              tick={{ fill: COLORS.secondary, fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              stroke={COLORS.secondary}
              tick={{ fill: COLORS.secondary, fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} activeBar={{ fill: 'rgba(255,255,255,0.8)' }}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={threshold
                    ? entry.value > threshold ? COLORS.positive : COLORS.negative
                    : COLORS.primary}
                />
              ))}
            </Bar>
            {threshold && (
              <ReferenceLine
                y={threshold}
                stroke={COLORS.threshold}
                strokeDasharray="5 5"
                label={{ value: `Line: ${threshold}`, fill: COLORS.threshold, position: 'right' }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Render horizontal bar chart
  if (type === 'horizontal_bar') {
    return (
      <div className="w-full">
        <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} horizontal={false} />
            <XAxis type="number" stroke={COLORS.secondary} tick={{ fill: COLORS.secondary }} />
            <YAxis
              type="category"
              dataKey="label"
              stroke={COLORS.secondary}
              tick={{ fill: COLORS.secondary, fontSize: 12 }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
            <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} activeBar={{ fill: 'rgba(255,255,255,0.8)' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Render line chart (with optional threshold)
  if (type === 'line' || type === 'line_threshold') {
    return (
      <div className="w-full">
        <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} />
            <XAxis
              dataKey="label"
              stroke={COLORS.secondary}
              tick={{ fill: COLORS.secondary, fontSize: 12 }}
              angle={-45}
              textAnchor="end"
            />
            <YAxis
              stroke={COLORS.secondary}
              tick={{ fill: COLORS.secondary, fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.positive }}
            />
            {threshold && (
              <ReferenceLine
                y={threshold}
                stroke={COLORS.threshold}
                strokeDasharray="5 5"
                label={{ value: `Prop Line: ${threshold}`, fill: COLORS.threshold, position: 'right' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        {threshold && (
          <div className="mt-4 flex gap-4 justify-center text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Over: {data.filter(d => d.value > threshold).length}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Under: {data.filter(d => d.value < threshold).length}
            </span>
            <span className="text-gray-400">
              Hit Rate: {Math.round((data.filter(d => d.value > threshold).length / data.length) * 100)}%
            </span>
          </div>
        )}
      </div>
    )
  }

  // Render grouped bar chart (for comparisons)
  if (type === 'grouped_bar') {
    // Assume data has multiple series
    const keys = Object.keys(data[0] || {}).filter(k =>
      !['full_name', 'label', 'team', 'games'].includes(k) &&
      typeof data[0][k] === 'number'
    )

    return (
      <div className="w-full">
        <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gridLine} />
            <XAxis
              dataKey="full_name"
              stroke={COLORS.secondary}
              tick={{ fill: COLORS.secondary, fontSize: 12 }}
            />
            <YAxis stroke={COLORS.secondary} tick={{ fill: COLORS.secondary }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
            {keys.slice(0, 4).map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                fill={PIE_COLORS[idx % PIE_COLORS.length]}
                radius={[4, 4, 0, 0]}
                activeBar={{ fill: PIE_COLORS[idx % PIE_COLORS.length], fillOpacity: 0.8 }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Render pie chart
  if (type === 'pie') {
    return (
      <div className="w-full">
        <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Render table (default fallback)
  return (
    <div className="w-full">
      <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {Object.keys(data[0] || {}).map(key => (
                <th key={key} className="text-left text-gray-400 py-2 px-3 font-medium">
                  {formatColumnHeader(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                {Object.entries(row).map(([key, value], cellIdx) => (
                  <td key={cellIdx} className="py-2 px-3 text-gray-300 font-mono">
                    {formatCellValue(value, key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Format column header
function formatColumnHeader(key: string): string {
  const headerMap: Record<string, string> = {
    full_name: 'Player',
    abbreviation: 'Team',
    game_date: 'Date',
    opponent: 'Opp',
    ppg: 'PPG',
    rpg: 'RPG',
    apg: 'APG',
    fg_pct: 'FG%',
    fg3_pct: '3P%',
    wins: 'W',
    losses: 'L',
    win_pct: 'Win%',
    conference_rank: 'Rank',
    games_back: 'GB',
    last_10: 'L10',
    spread_home: 'Spread',
    total: 'Total',
    over_odds_decimal: 'Over',
    under_odds_decimal: 'Under'
  }
  return headerMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Format cell value
function formatCellValue(value: any, key: string): string {
  if (value === null || value === undefined) return '-'

  // Date formatting
  if (key === 'game_date' || key.includes('date')) {
    const date = new Date(value)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Decimal formatting for odds
  if (key.includes('odds') && typeof value === 'number') {
    return value.toFixed(2)
  }

  // Percentage formatting
  if (key.includes('pct') && typeof value === 'number') {
    return value < 1 ? (value * 100).toFixed(1) + '%' : value.toFixed(1) + '%'
  }

  return String(value)
}
