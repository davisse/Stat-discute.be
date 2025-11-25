'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'

/**
 * BarChart Component
 *
 * Graphique en barres verticales pour visualiser des données comparatives.
 *
 * Philosophy: Visualisation claire et épurée pour identifier rapidement
 * les tendances et comparer des valeurs.
 *
 * Features:
 * - Barres verticales avec animation
 * - Hover tooltip avec détails
 * - Option de coloration par seuil (vert/rouge)
 * - Ligne de seuil interactive (draggable avec snap 0.5)
 * - Stats en temps réel (au-dessus/en-dessous)
 * - Axes et grille clairs
 * - Responsive
 *
 * @param data - Données à afficher (array de { label, value })
 * @param threshold - Seuil initial (défaut: moyenne des valeurs)
 * @param min - Valeur min de l'échelle (défaut: auto)
 * @param max - Valeur max de l'échelle (défaut: auto)
 * @param label - Label de l'axe Y (ex: "Points")
 * @param showGrid - Afficher la grille de fond
 * @param colorMode - Mode de couleur:
 *   - 'mono' (blanc uni)
 *   - 'threshold' (vert/rouge selon seuil)
 *   - 'mono-outline' (plein blanc au-dessus, outline en-dessous)
 *   - 'mono-pattern' (plein blanc au-dessus, hachures marquées en-dessous)
 *   - 'mono-dashed' (plein blanc au-dessus, outline pointillés en-dessous)
 * @param interactiveThreshold - Activer la ligne de seuil draggable
 * @param onChange - Callback avec threshold et stats
 *
 * @example
 * <BarChart
 *   data={[
 *     { label: 'L', value: 25 },
 *     { label: 'Ma', value: 30 },
 *     { label: 'Me', value: 18 },
 *   ]}
 *   threshold={25}
 *   colorMode="threshold"
 *   interactiveThreshold
 *   label="Points"
 *   showGrid
 *   onChange={(threshold, stats) => console.log(stats)}
 * />
 */

export interface BarChartDataPoint {
  label: string
  value: number
}

export interface BarChartStats {
  above: number      // Nombre de barres au-dessus
  below: number      // Nombre de barres en-dessous
  percentage: number // % au-dessus
}

export interface BarChartProps {
  data: BarChartDataPoint[]
  threshold?: number
  min?: number
  max?: number
  label?: string
  showGrid?: boolean
  /**
   * Mode de couleur des barres
   * - 'mono': Toutes les barres en blanc (défaut)
   * - 'threshold': Vert au-dessus du seuil, rouge en-dessous
   * - 'mono-outline': Blanc plein au-dessus, outline blanc en-dessous (monochrome moderne)
   * - 'mono-pattern': Blanc plein au-dessus, hachures diagonales marquées en-dessous (monochrome académique)
   * - 'mono-dashed': Blanc plein au-dessus, outline en pointillés en-dessous (monochrome léger)
   */
  colorMode?: 'mono' | 'threshold' | 'mono-outline' | 'mono-pattern' | 'mono-dashed'
  interactiveThreshold?: boolean
  onChange?: (threshold: number, stats: BarChartStats) => void
  className?: string
}

/**
 * Calcule les valeurs min/max optimales pour l'échelle
 */
function calculateScale(data: BarChartDataPoint[], min?: number, max?: number) {
  if (data.length === 0) return { min: 0, max: 100 }

  const values = data.map((d) => d.value)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)

  // Ajouter 10% de marge en haut
  const calculatedMax = dataMax * 1.1

  return {
    min: min ?? Math.max(0, dataMin * 0.9),
    max: max ?? calculatedMax,
  }
}

/**
 * Calcule les stats pour un seuil donné
 */
function calculateStats(
  data: BarChartDataPoint[],
  threshold: number
): BarChartStats {
  const above = data.filter((d) => d.value > threshold).length
  const below = data.length - above
  const percentage = data.length > 0 ? (above / data.length) * 100 : 0

  return { above, below, percentage }
}

/**
 * Calcule la moyenne des valeurs
 */
function calculateAverage(data: BarChartDataPoint[]): number {
  if (data.length === 0) return 0
  const sum = data.reduce((acc, d) => acc + d.value, 0)
  return sum / data.length
}

/**
 * Badge de statistiques
 */
function StatsBadge({ stats, threshold }: { stats: BarChartStats; threshold: number }) {
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
 * Tooltip pour hover sur barre
 */
function BarTooltip({
  visible,
  x,
  y,
  label,
  value,
}: {
  visible: boolean
  x: number
  y: number
  label: string
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
      <div className="text-[var(--text-xs)] text-[var(--color-gray-400)]">{label}</div>
      <div className="text-[var(--text-base)] text-white font-[var(--font-semibold)] font-[family-name:var(--font-mono)] mt-[var(--space-1)]">
        {value.toFixed(1)}
      </div>
    </div>
  )
}

export function BarChart({
  data,
  threshold: thresholdProp,
  min: minProp,
  max: maxProp,
  label = 'Valeur',
  showGrid = true,
  colorMode = 'mono',
  interactiveThreshold = false,
  onChange,
  className,
}: BarChartProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [hoveredBar, setHoveredBar] = React.useState<{
    index: number
    x: number
    y: number
    label: string
    value: number
  } | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [animated, setAnimated] = React.useState(false)

  // Threshold state (interactive or static)
  const [threshold, setThreshold] = React.useState<number>(() =>
    thresholdProp ?? calculateAverage(data)
  )
  const [isDragging, setIsDragging] = React.useState(false)

  // Éviter les problèmes d'hydration
  React.useEffect(() => {
    setMounted(true)
    // Déclencher l'animation après le mount
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Dimensions du graphique
  const width = 800
  const height = 300
  const padding = { top: 40, right: 40, bottom: 60, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Échelle
  const { min, max } = calculateScale(data, minProp, maxProp)

  // Calcul des stats
  const stats = React.useMemo(
    () => calculateStats(data, threshold),
    [data, threshold]
  )

  // Notify parent
  React.useEffect(() => {
    if (interactiveThreshold && onChange) {
      onChange(threshold, stats)
    }
  }, [threshold, stats, interactiveThreshold, onChange])

  // Largeur des barres
  const barWidth = data.length > 0 ? chartWidth / data.length * 0.7 : 20
  const barGap = data.length > 0 ? chartWidth / data.length * 0.3 : 10

  // Scale functions
  const xScale = (index: number) => {
    const fullBarWidth = chartWidth / Math.max(data.length, 1)
    return padding.left + index * fullBarWidth + fullBarWidth / 2
  }

  const yScale = (value: number) => {
    const normalized = (value - min) / (max - min)
    return padding.top + chartHeight - normalized * chartHeight
  }

  // Grille horizontale (5 lignes)
  const gridLines = showGrid
    ? Array.from({ length: 5 }, (_, i) => {
        const value = min + ((max - min) / 4) * i
        const y = yScale(value)
        return { value, y }
      })
    : []

  // Style de la barre selon le mode
  const getBarStyle = (value: number) => {
    const isAbove = threshold !== undefined && value > threshold

    switch (colorMode) {
      case 'threshold':
        return {
          fill: isAbove ? 'var(--color-positive)' : 'var(--color-negative)',
          stroke: 'none',
          strokeWidth: 0,
          strokeDasharray: 'none',
        }

      case 'mono-outline':
        return isAbove
          ? { fill: 'white', stroke: 'white', strokeWidth: 0, strokeDasharray: 'none' }
          : { fill: 'transparent', stroke: 'white', strokeWidth: 2, strokeDasharray: 'none' }

      case 'mono-pattern':
        return {
          fill: isAbove ? 'white' : 'url(#diagonal-pattern-below)',
          stroke: 'none',
          strokeWidth: 0,
          strokeDasharray: 'none',
        }

      case 'mono-dashed':
        return isAbove
          ? { fill: 'white', stroke: 'white', strokeWidth: 0, strokeDasharray: 'none' }
          : { fill: 'transparent', stroke: 'white', strokeWidth: 2, strokeDasharray: '4 2' }

      case 'mono':
      default:
        return { fill: 'white', stroke: 'none', strokeWidth: 0, strokeDasharray: 'none' }
    }
  }

  // Handle bar hover
  const handleBarHover = (
    e: React.MouseEvent,
    index: number,
    label: string,
    value: number
  ) => {
    const svg = svgRef.current
    if (!svg) return

    const x = xScale(index)
    const y = yScale(value)

    setHoveredBar({ index, x, y, label, value })
  }

  const handleBarLeave = () => {
    setHoveredBar(null)
  }

  // Handle threshold drag (only if interactiveThreshold)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactiveThreshold) return
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactiveThreshold) return

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

  // Handle input change
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
      {/* Stats Badge (if interactive threshold) */}
      {interactiveThreshold && <StatsBadge stats={stats} threshold={threshold} />}

      {/* Threshold Input (top-right, if interactive) */}
      {interactiveThreshold && (
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
      )}

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
        {/* Pattern Definitions for mono-pattern mode */}
        <defs>
          <pattern
            id="diagonal-pattern-below"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="white"
              strokeWidth="1.5"
              opacity="0.7"
            />
          </pattern>
        </defs>

        {/* Grid Lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={line.y}
              x2={padding.left + chartWidth}
              y2={line.y}
              stroke="var(--color-gray-800)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 10}
              y={line.y + 4}
              fill="var(--color-gray-400)"
              fontSize="12"
              textAnchor="end"
              fontFamily="var(--font-family-mono)"
            >
              {line.value.toFixed(0)}
            </text>
          </g>
        ))}

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

        {/* Threshold Line (if threshold mode) */}
        {colorMode === 'threshold' && threshold !== undefined && (
          <line
            x1={padding.left}
            y1={yScale(threshold)}
            x2={padding.left + chartWidth}
            y2={yScale(threshold)}
            stroke={interactiveThreshold ? "white" : "var(--color-gray-600)"}
            strokeWidth={interactiveThreshold ? "2" : "1"}
            strokeDasharray={interactiveThreshold ? "8 4" : "4 4"}
            className={interactiveThreshold ? "cursor-ns-resize" : ""}
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const x = xScale(i)
          const barY = yScale(d.value)
          const barHeight = animated ? padding.top + chartHeight - barY : 0
          const baseY = animated ? barY : padding.top + chartHeight
          const barStyle = getBarStyle(d.value)

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x - barWidth / 2}
                y={baseY}
                width={barWidth}
                height={barHeight}
                fill={barStyle.fill}
                stroke={barStyle.stroke}
                strokeWidth={barStyle.strokeWidth}
                strokeDasharray={barStyle.strokeDasharray}
                className="cursor-pointer transition-all duration-300"
                style={{
                  opacity: hoveredBar?.index === i ? 0.8 : 1,
                }}
                onMouseEnter={(e) => handleBarHover(e, i, d.label, d.value)}
                onMouseLeave={handleBarLeave}
              />

              {/* X Label */}
              <text
                x={x}
                y={padding.top + chartHeight + 20}
                fill="var(--color-gray-400)"
                fontSize="12"
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Bar Tooltip */}
      {hoveredBar && (
        <BarTooltip
          visible
          x={hoveredBar.x}
          y={hoveredBar.y}
          label={hoveredBar.label}
          value={hoveredBar.value}
        />
      )}
    </div>
  )
}
