'use client'

import * as React from 'react'
import { colors } from '@/lib/design-tokens'

interface StreamingNarrativeProps {
  text: string
  isLoading?: boolean
  className?: string
  style?: React.CSSProperties
  typewriterSpeed?: number // ms per character
  showCursor?: boolean
}

/**
 * A component that displays text with a typewriter effect
 * Used for AI-generated narratives in the storytelling page
 */
export function StreamingNarrative({
  text,
  isLoading = false,
  className = '',
  style,
  typewriterSpeed = 15,
  showCursor = true,
}: StreamingNarrativeProps) {
  const [displayedText, setDisplayedText] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const previousTextRef = React.useRef('')

  React.useEffect(() => {
    // If text hasn't changed, don't re-animate
    if (text === previousTextRef.current) {
      return
    }

    // If we have new text, start typewriter effect
    if (text && text !== previousTextRef.current) {
      setIsTyping(true)
      setDisplayedText('')
      previousTextRef.current = text

      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, typewriterSpeed)

      return () => clearInterval(interval)
    }
  }, [text, typewriterSpeed])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={className} style={style}>
        <div className="animate-pulse space-y-2">
          <div
            className="h-4 rounded"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '80%' }}
          />
          <div
            className="h-4 rounded"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '60%' }}
          />
        </div>
      </div>
    )
  }

  return (
    <span className={className} style={style}>
      {displayedText}
      {showCursor && isTyping && (
        <span
          className="animate-pulse"
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            backgroundColor: colors.text.primary,
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
          }}
        />
      )}
    </span>
  )
}

interface NarrativeBlockProps {
  title?: string
  content: string
  isLoading?: boolean
  className?: string
}

/**
 * A block component for displaying narrative sections
 * with consistent styling
 */
export function NarrativeBlock({
  title,
  content,
  isLoading = false,
  className = '',
}: NarrativeBlockProps) {
  if (isLoading) {
    return (
      <div className={`${className}`}>
        {title && (
          <div
            className="h-6 rounded mb-3 animate-pulse"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              width: '40%',
            }}
          />
        )}
        <div className="space-y-2 animate-pulse">
          <div
            className="h-4 rounded"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '90%' }}
          />
          <div
            className="h-4 rounded"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '75%' }}
          />
          <div
            className="h-4 rounded"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '85%' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {title && (
        <h3
          className="text-xl font-bold mb-3"
          style={{ color: colors.text.primary }}
        >
          {title}
        </h3>
      )}
      <StreamingNarrative text={content} />
    </div>
  )
}

interface VerdictBadgeProps {
  verdict: 'OVER' | 'UNDER' | 'PASS'
  confidence: number
  isLoading?: boolean
}

/**
 * Badge component for displaying the synthesis verdict
 */
export function VerdictBadge({
  verdict,
  confidence,
  isLoading = false,
}: VerdictBadgeProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-24 rounded-lg animate-pulse"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        />
        <div
          className="h-6 w-16 rounded animate-pulse"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        />
      </div>
    )
  }

  const getVerdictColor = () => {
    switch (verdict) {
      case 'OVER':
        return 'rgb(29, 193, 0)' // Green
      case 'UNDER':
        return 'rgb(239, 45, 44)' // Red
      case 'PASS':
        return colors.neutral[500]
    }
  }

  const getConfidenceColor = () => {
    if (confidence >= 70) return 'rgb(29, 193, 0)'
    if (confidence >= 50) return 'rgb(255, 193, 7)'
    return colors.neutral[500]
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="px-6 py-2 rounded-lg font-bold text-lg"
        style={{
          backgroundColor: getVerdictColor(),
          color: verdict === 'PASS' ? colors.text.primary : '#000',
        }}
      >
        {verdict}
      </div>
      <div className="flex items-center gap-2">
        <span style={{ color: colors.neutral[500] }}>Confiance:</span>
        <span
          className="font-mono font-bold"
          style={{ color: getConfidenceColor() }}
        >
          {confidence}%
        </span>
      </div>
    </div>
  )
}

interface ReasoningListProps {
  reasons: string[]
  isLoading?: boolean
}

/**
 * List component for displaying synthesis reasoning
 */
export function ReasoningList({ reasons, isLoading = false }: ReasoningListProps) {
  if (isLoading) {
    return (
      <ul className="space-y-2">
        {[1, 2, 3].map((i) => (
          <li key={i} className="flex items-start gap-2">
            <div
              className="w-5 h-5 rounded-full animate-pulse mt-0.5"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            />
            <div
              className="h-4 rounded animate-pulse flex-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                width: `${70 + i * 10}%`,
              }}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="space-y-2">
      {reasons.map((reason, index) => (
        <li
          key={index}
          className="flex items-start gap-2"
          style={{ color: colors.neutral[400] }}
        >
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: colors.text.primary,
            }}
          >
            {index + 1}
          </span>
          <StreamingNarrative text={reason} typewriterSpeed={10} />
        </li>
      ))}
    </ul>
  )
}

export default StreamingNarrative
