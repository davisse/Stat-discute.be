'use client'

import { useEffect, useRef, useState } from 'react'

interface RadarChartProps {
  data: number[] // Values from 0-100
  labels: string[]
  size?: number
  color?: string
  strokeWidth?: number
  animate?: boolean
}

export default function RadarChart({
  data,
  labels,
  size = 200,
  color = 'rgb(34, 197, 94)',
  strokeWidth = 2,
  animate = true
}: RadarChartProps) {
  const [animatedData, setAnimatedData] = useState<number[]>(data.map(() => 0))
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<SVGSVGElement>(null)
  const hasAnimated = useRef(false)

  const center = size / 2
  const radius = (size * 0.35) // 35% of size for inner radius
  const numSides = data.length

  // IntersectionObserver to trigger animation when in viewport
  useEffect(() => {
    if (!animate) {
      setAnimatedData(data)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          setIsVisible(true)
          hasAnimated.current = true
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [animate, data])

  // Animate data points
  useEffect(() => {
    if (!isVisible || !animate) return

    const startTime = Date.now()
    const duration = 1000

    const animateData = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeOutQuart easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      const currentData = data.map((value) => value * easeOutQuart)
      setAnimatedData(currentData)

      if (progress < 1) {
        requestAnimationFrame(animateData)
      } else {
        setAnimatedData(data) // Ensure exact final values
      }
    }

    requestAnimationFrame(animateData)
  }, [isVisible, data, animate])

  // Calculate point coordinates
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numSides - Math.PI / 2
    const r = (value / 100) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    }
  }

  // Create polygon path for data
  const createDataPath = () => {
    const points = animatedData.map((value, index) => getPoint(index, value))
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z'
  }

  // Create background grid circles
  const gridLevels = [20, 40, 60, 80, 100]

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      {/* Background grid circles */}
      {gridLevels.map((level) => {
        const points = Array.from({ length: numSides }, (_, i) =>
          getPoint(i, level)
        )
        return (
          <polygon
            key={level}
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={1}
          />
        )
      })}

      {/* Axis lines from center to vertices */}
      {Array.from({ length: numSides }, (_, i) => {
        const endpoint = getPoint(i, 100)
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={endpoint.x}
            y2={endpoint.y}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={1}
          />
        )
      })}

      {/* Data polygon */}
      <path
        d={createDataPath()}
        fill={color.replace('rgb', 'rgba').replace(')', ', 0.2)')}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        className="transition-all duration-300"
      />

      {/* Data points */}
      {animatedData.map((value, index) => {
        const point = getPoint(index, value)
        return (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={color}
            className="transition-all duration-300"
          />
        )
      })}

      {/* Labels */}
      {labels.map((label, index) => {
        const labelPoint = getPoint(index, 115) // Position labels outside
        return (
          <text
            key={index}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-gray-400 font-medium"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
