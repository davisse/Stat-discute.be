'use client'

interface ASCIIBarProps {
  openValue: number
  currentValue: number
  minValue?: number
  maxValue?: number
  width?: number
  showValues?: boolean
  inverted?: boolean // For odds where lower = better (favorites)
}

/**
 * ASCII-style progress bar showing movement from open to current value
 *
 * For odds: Lower value = favorite (steam toward favorite)
 * Example: 1.84 ●━━━━━━━━━━━▶ 1.62 (steamed toward favorite)
 */
export function ASCIIBar({
  openValue,
  currentValue,
  minValue,
  maxValue,
  width = 15,
  showValues = true,
  inverted = false
}: ASCIIBarProps) {
  const movement = currentValue - openValue
  const isPositive = inverted ? movement < 0 : movement > 0
  const isNegative = inverted ? movement > 0 : movement < 0

  // Calculate bar position
  const min = minValue ?? Math.min(openValue, currentValue) - 0.1
  const max = maxValue ?? Math.max(openValue, currentValue) + 0.1
  const range = max - min || 1

  const openPos = Math.round(((openValue - min) / range) * width)
  const currentPos = Math.round(((currentValue - min) / range) * width)

  // Build the bar
  let bar = ''
  const start = Math.min(openPos, currentPos)
  const end = Math.max(openPos, currentPos)

  for (let i = 0; i < width; i++) {
    if (i === openPos && openPos === currentPos) {
      bar += '●'
    } else if (i === openPos) {
      bar += '●'
    } else if (i === currentPos) {
      bar += movement > 0 ? '▶' : '◀'
    } else if (i > start && i < end) {
      bar += '━'
    } else {
      bar += '░'
    }
  }

  // Color class based on movement
  const colorClass = isNegative
    ? 'text-green-500' // Steam (favorite getting shorter)
    : isPositive
      ? 'text-red-500' // Drift (underdog getting longer)
      : 'text-gray-500'

  const movementArrow = movement > 0 ? '↗' : movement < 0 ? '↘' : '='

  return (
    <span className={`font-mono ${colorClass}`}>
      {showValues && (
        <span className="text-gray-400">{openValue.toFixed(2)} </span>
      )}
      <span>{bar}</span>
      {showValues && (
        <>
          <span className="text-white"> {currentValue.toFixed(2)}</span>
          <span className="ml-1">{movementArrow}</span>
        </>
      )}
    </span>
  )
}
