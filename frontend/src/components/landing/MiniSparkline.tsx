'use client'

import { useEffect, useRef, useState } from 'react'

interface MiniSparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  animate?: boolean
}

export default function MiniSparkline({
  data,
  width = 120,
  height = 40,
  color = 'rgb(34, 197, 94)',
  strokeWidth = 2,
  animate = true
}: MiniSparklineProps) {
  const [animatedData, setAnimatedData] = useState<number[]>(data.map(() => 0))
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<SVGSVGElement>(null)
  const hasAnimated = useRef(false)

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

  // Calculate SVG path
  const createPath = (values: number[]) => {
    if (values.length === 0) return ''

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return { x, y }
    })

    // Create smooth curve using quadratic Bézier curves
    let path = `M ${points[0].x},${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const midX = (current.x + next.x) / 2
      const midY = (current.y + next.y) / 2

      path += ` Q ${current.x},${current.y} ${midX},${midY}`
    }

    // End with line to last point
    const lastPoint = points[points.length - 1]
    path += ` L ${lastPoint.x},${lastPoint.y}`

    return path
  }

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <path
        d={createPath(animatedData)}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
    </svg>
  )
}
