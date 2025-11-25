'use client'

import { useEffect, useRef, useState } from 'react'

interface ComparisonCardProps {
  icon: string
  title: string
  percentage: number
  color: string
  label: string
}

export default function ComparisonCard({
  icon,
  title,
  percentage,
  color,
  label
}: ComparisonCardProps) {
  const [animatedHeight, setAnimatedHeight] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  // IntersectionObserver to trigger animation when in viewport
  useEffect(() => {
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
  }, [])

  // Bar height animation
  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const duration = 1000

    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeOutQuart easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentHeight = percentage * easeOutQuart

      setAnimatedHeight(currentHeight)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setAnimatedHeight(percentage) // Ensure exact final value
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, percentage])

  return (
    <div
      ref={ref}
      className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/20 active:translate-y-0 active:shadow-sm"
    >
      {/* Icon */}
      <div className="text-4xl mb-4 text-center">{icon}</div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-6 text-center leading-tight">{title}</h3>

      {/* Bar Chart */}
      <div className="mb-4">
        <div className="w-full h-32 bg-white/5 rounded-lg overflow-hidden relative">
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out"
            style={{
              height: `${animatedHeight}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>

      {/* Percentage Label */}
      <div className="text-center">
        <div className="text-3xl font-bold font-mono mb-1">{percentage}%</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </div>
  )
}
