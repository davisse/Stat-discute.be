'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  end: number
  duration?: number
  label: string
  decimals?: number
}

export default function AnimatedCounter({
  end,
  duration = 2000,
  label,
  decimals = 0
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
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
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  // Counter animation using requestAnimationFrame
  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeOutQuart easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = startValue + (end - startValue) * easeOutQuart

      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end) // Ensure we end at exact value
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  // Format number with commas and decimals
  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-bold mb-2 font-mono">
        {formatNumber(count)}
      </div>
      <div className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider leading-tight">
        {label}
      </div>
    </div>
  )
}
