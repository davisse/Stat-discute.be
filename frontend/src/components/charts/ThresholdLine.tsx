'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'

/**
 * ThresholdLine Component
 *
 * Graphique avec ligne de seuil interactive pour analyser la fréquence
 * des performances au-dessus/en-dessous d'une valeur.
 *
 * Philosophy: Encourage l'analyse approfondie - "Combien de fois le joueur
 * a dépassé X points?" plutôt que "parier maintenant".
 *
 * Features:
 * - Ligne de seuil draggable
 * - Input pour valeur exacte
 * - Stats en temps réel (au-dessus/en-dessous)
 * - Hover sur points pour détails
 *
 * @param data - Données à afficher (array de { date, value })
 * @param initialThreshold - Seuil initial (défaut: moyenne)
 * @param min - Valeur min du graphique
 * @param max - Valeur max du graphique
 * @param onChange - Callback avec threshold et stats
 * @param label - Label de l'axe Y (ex: "Points")
 *
 * @example
 * <ThresholdLine
 *   data={playerGames.map(g => ({ date: g.date, value: g.points }))}
 *   initialThreshold={25}
 *   min={0}
 *   max={50}
 *   label="Points"
 *   onChange={(threshold, stats) => {
 *     console.log(`${stats.above} fois au-dessus de ${threshold}`)
 *   }}
 * />
 */

export interface ThresholdStats {
  above: number      // Nombre de fois au-dessus
  below: number      // Nombre de fois en-dessous
  percentage: number // % au-dessus
}

export interface ThresholdLineProps {
  data: Array<{ date: string; value: number }>
  initialThreshold?: number
  min: number
  max: number
  onChange?: (threshold: number, stats: ThresholdStats) => void
  label?: string
  className?: string
}

/**
 * Calcule les stats pour un seuil donné
 */
function calculateStats(
  data: ThresholdLineProps['data'],
  threshold: number
): ThresholdStats {
  const above = data.filter((d) => d.value > threshold).length
  const below = data.length - above
  const percentage = data.length > 0 ? (above / data.length) * 100 : 0

  return { above, below, percentage }
}

/**
 * Calcule la moyenne des valeurs
 */
function calculateAverage(data: ThresholdLineProps['data']): number {
  if (data.length === 0) return 0
  const sum = data.reduce((acc, d) => acc + d.value, 0)
  return sum / data.length
}

/**
 * Badge de statistiques
 */
function StatsBadge({ stats, threshold }: { stats: ThresholdStats; threshold: number }) {
  return (
    <div className="absolute top-[var(--space-3)] left-[var(--space-3)] bg-[var(--color-gray-900)] bg-opacity-90 backdrop-blur-sm px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-md)] border border-[var(--color-gray-800)]">
      <div className="text-[var(--text-sm)] text-white font-[var(--font-medium)]">
        Au-dessus de{' '}
        <span className="font-[var(--font-semibold)] font-[family-name:var(--font-mono)]">
          {threshold.toFixed(1)}
        </span>
        :
      </div>
      <div className="text-[var(--text-xl)] text-white font-[var(--font-bold)] mt-[var(--space-1)]">
        <span className="font-[family-name:var(--font-mono)]">
          {stats.above}/{stats.above + stats.below}
        </span>
        <span className="text-[var(--text-sm)] text-[var(--color-gray-400)] ml-[var(--space-2)]">
          ({stats.percentage.toFixed(0)}%)
        </span>
      </div>
    </div>
  )
}

/**
 * Tooltip pour hover sur point
 */
function PointTooltip({
  visible,
  x,
  y,
  date,
  value,
}: {
  visible: boolean
  x: number
  y: number
  date: string
  value: number
}) {
  if (!visible) return null

  return (
    <div
      className="absolute pointer-events-none z-10 bg-[var(--color-gray-900)] border border-[var(--color-gray-700)] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] shadow-[var(--shadow-lg)]"
      style={{
        left: `${x}px`,
        top: `${y - 60}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="text-[var(--text-xs)] text-[var(--color-gray-400)]">{date}</div>
      <div className="text-[var(--text-base)] text-white font-[var(--font-semibold)] font-[family-name:var(--font-mono)] mt-[var(--space-1)]">
        {value.toFixed(1)}
      </div>
    </div>
  )
}

export function ThresholdLine({
  data,
  initialThreshold,
  min,
  max,
  onChange,
  label = 'Valeur',
  className,
}: ThresholdLineProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [threshold, setThreshold] = React.useState<number>(() =>
    initialThreshold ?? calculateAverage(data)
  )
  const [isDragging, setIsDragging] = React.useState(false)
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    x: number
    y: number
    date: string
    value: number
  } | null>(null)
  const [mounted, setMounted] = React.useState(false)

  // Éviter les problèmes d'hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Dimensions du graphique
  const width = 800
  const height = 300
  const padding = { top: 40, right: 40, bottom: 40, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calcul des stats
  const stats = React.useMemo(
    () => calculateStats(data, threshold),
    [data, threshold]
  )

  // Notify parent
  React.useEffect(() => {
    onChange?.(threshold, stats)
  }, [threshold, stats, onChange])

  // Scale functions
  const xScale = (index: number) => {
    return padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth
  }

  const yScale = (value: number) => {
    const normalized = (value - min) / (max - min)
    return padding.top + chartHeight - normalized * chartHeight
  }

  // Points path
  const pointsPath = React.useMemo(() => {
    if (data.length === 0) return ''

    return data
      .map((d, i) => {
        const x = xScale(i)
        const y = yScale(d.value)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }, [data, min, max])

  // Threshold Y position
  const thresholdY = yScale(threshold)

  // Handle threshold drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const y = e.clientY - rect.top

    // Clamp y to chart bounds
    const clampedY = Math.max(padding.top, Math.min(y, padding.top + chartHeight))

    // Convert y to value
    const normalized = 1 - (clampedY - padding.top) / chartHeight
    const newThreshold = min + normalized * (max - min)

    // Round to nearest 0.5 (snap behavior)
    const roundedThreshold = Math.round(newThreshold * 2) / 2

    setThreshold(Math.max(min, Math.min(roundedThreshold, max)))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle point hover
  const handlePointHover = (
    e: React.MouseEvent,
    index: number,
    date: string,
    value: number
  ) => {
    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const x = xScale(index)
    const y = yScale(value)

    setHoveredPoint({ x, y, date, value })
  }

  const handlePointLeave = () => {
    setHoveredPoint(null)
  }

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      // Round to nearest 0.5 (snap behavior)
      const roundedValue = Math.round(value * 2) / 2
      setThreshold(Math.max(min, Math.min(roundedValue, max)))
    }
  }

  // Éviter l'erreur d'hydration - ne rendre qu'après montage
  if (!mounted) {
    return (
      <div className={cn('relative bg-transparent', className)} style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[var(--color-gray-500)] text-[var(--text-sm)]">
            Chargement du graphique...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Stats Badge */}
      <StatsBadge stats={stats} threshold={threshold} />

      {/* Threshold Input (top-right) */}
      <div className="absolute top-[var(--space-3)] right-[var(--space-3)] w-24">
        <Input
          type="number"
          value={threshold.toFixed(1)}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={0.5}
          className="text-center"
        />
      </div>

      {/* SVG Chart */}
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="bg-transparent"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Y Axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="var(--color-gray-800)"
          strokeWidth="2"
        />

        {/* X Axis */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="var(--color-gray-800)"
          strokeWidth="2"
        />

        {/* Y Axis Label */}
        <text
          x={padding.left - 40}
          y={padding.top + chartHeight / 2}
          fill="var(--color-gray-400)"
          fontSize="14"
          textAnchor="middle"
          transform={`rotate(-90, ${padding.left - 40}, ${padding.top + chartHeight / 2})`}
        >
          {label}
        </text>

        {/* Threshold Line (draggable) */}
        <line
          x1={padding.left}
          y1={thresholdY}
          x2={padding.left + chartWidth}
          y2={thresholdY}
          stroke="white"
          strokeWidth="2"
          strokeDasharray="8 4"
          className="cursor-ns-resize"
          onMouseDown={handleMouseDown}
        />

        {/* Data Line */}
        <path d={pointsPath} stroke="white" strokeWidth="2" fill="none" />

        {/* Data Points */}
        {data.map((d, i) => {
          const x = xScale(i)
          const y = yScale(d.value)

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="white"
              className="cursor-pointer hover:r-6 transition-all"
              onMouseEnter={(e) => handlePointHover(e, i, d.date, d.value)}
              onMouseLeave={handlePointLeave}
            />
          )
        })}
      </svg>

      {/* Point Tooltip */}
      {hoveredPoint && (
        <PointTooltip
          visible
          x={hoveredPoint.x}
          y={hoveredPoint.y}
          date={hoveredPoint.date}
          value={hoveredPoint.value}
        />
      )}
    </div>
  )
}
