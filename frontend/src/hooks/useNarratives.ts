'use client'

import * as React from 'react'
import type {
  GameNarratives,
  GameDataForNarratives,
  NarrativeSequence,
} from '@/lib/ai/types'

interface UseNarrativesOptions {
  gameId: string
  gameData: GameDataForNarratives | null
  enabled?: boolean
  useStreaming?: boolean
}

interface UseNarrativesResult {
  narratives: Partial<GameNarratives>
  isLoading: boolean
  isGenerating: boolean
  currentSequence: NarrativeSequence | null
  error: string | null
  regenerate: () => void
  isComplete: boolean
}

/**
 * Hook for fetching and managing AI-generated narratives
 * Supports both batch (POST) and streaming (GET/SSE) modes
 */
export function useNarratives({
  gameId,
  gameData,
  enabled = true,
  useStreaming = false,
}: UseNarrativesOptions): UseNarrativesResult {
  const [narratives, setNarratives] = React.useState<Partial<GameNarratives>>(
    {}
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [currentSequence, setCurrentSequence] =
    React.useState<NarrativeSequence | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isComplete, setIsComplete] = React.useState(false)
  const [fetchCount, setFetchCount] = React.useState(0)

  const fetchNarratives = React.useCallback(async () => {
    if (!gameData || !enabled) return

    setIsLoading(true)
    setIsGenerating(true)
    setError(null)
    setNarratives({})
    setIsComplete(false)

    try {
      if (useStreaming) {
        // SSE streaming mode
        const response = await fetch(
          `/api/analysis/storytelling/${gameId}/narratives`
        )

        if (!response.ok) {
          throw new Error('Failed to start narrative stream')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response body')
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)

              if (data === '[DONE]') {
                setIsComplete(true)
                setIsGenerating(false)
                continue
              }

              try {
                const event = JSON.parse(data)
                const { sequence, narrative } = event

                setCurrentSequence(sequence)
                setNarratives((prev) => ({
                  ...prev,
                  [sequence]: narrative,
                }))

                if (event.isComplete) {
                  setIsComplete(true)
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }

        setIsGenerating(false)
        setCurrentSequence(null)
      } else {
        // Batch mode - all at once
        const response = await fetch(
          `/api/analysis/storytelling/${gameId}/narratives`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(gameData),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to generate narratives')
        }

        const data = await response.json()
        setNarratives(data.narratives)
        setIsComplete(true)
        setIsGenerating(false)
      }
    } catch (err) {
      console.error('Error fetching narratives:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsGenerating(false)
    } finally {
      setIsLoading(false)
    }
  }, [gameId, gameData, enabled, useStreaming])

  // Initial fetch when game data is available
  React.useEffect(() => {
    if (gameData && enabled) {
      fetchNarratives()
    }
  }, [gameData, enabled, fetchCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // Regenerate function
  const regenerate = React.useCallback(() => {
    setFetchCount((c) => c + 1)
  }, [])

  return {
    narratives,
    isLoading,
    isGenerating,
    currentSequence,
    error,
    regenerate,
    isComplete,
  }
}

/**
 * Helper to check if a specific narrative is ready
 */
export function isNarrativeReady<K extends NarrativeSequence>(
  narratives: Partial<GameNarratives>,
  sequence: K
): narratives is Partial<GameNarratives> & Pick<GameNarratives, K> {
  return sequence in narratives && narratives[sequence] !== undefined
}

export default useNarratives
