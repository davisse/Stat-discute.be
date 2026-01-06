'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Simple transition phases:
 * - idle: No transition active
 * - active: Overlay visible, navigation in progress
 * - fading: Overlay fading out
 */
export type TransitionPhase = 'idle' | 'active' | 'fading'

export interface TransitionState {
  phase: TransitionPhase
  href: string
}

export interface TransitionContextType {
  state: TransitionState
  startTransition: (rect: DOMRect, href: string, color?: string) => void
  signalPageReady: () => void
  isEntering: boolean
}

const TransitionContext = createContext<TransitionContextType | null>(null)

// Timing configuration (in ms)
const TIMING = {
  FADE_IN: 200,
  FADE_OUT: 300,
  FALLBACK_TIMEOUT: 800,
} as const

// Easing curves
export const EASING = {
  fadeIn: [0.4, 0, 0.2, 1],
  fadeOut: [0.4, 0, 0.2, 1],
} as const

interface TransitionProviderProps {
  children: ReactNode
}

export function TransitionProvider({ children }: TransitionProviderProps) {
  const router = useRouter()
  const [state, setState] = useState<TransitionState>({
    phase: 'idle',
    href: '',
  })

  const pageReadyRef = useRef(false)
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hrefRef = useRef(state.href)
  hrefRef.current = state.href

  // Called when fade-in animation completes
  const handleFadeInComplete = useCallback(() => {
    const targetHref = hrefRef.current
    if (targetHref) {
      router.push(targetHref)
    }

    // Start fallback timer
    fallbackTimeoutRef.current = setTimeout(() => {
      if (!pageReadyRef.current) {
        setState(prev => ({ ...prev, phase: 'fading' }))
      }
    }, TIMING.FALLBACK_TIMEOUT)
  }, [router])

  // Called by target page when it's ready
  const signalPageReady = useCallback(() => {
    if (state.phase !== 'active') return

    pageReadyRef.current = true

    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current)
      fallbackTimeoutRef.current = null
    }

    // Small delay then fade out
    setTimeout(() => {
      setState(prev => ({ ...prev, phase: 'fading' }))
    }, 100)
  }, [state.phase])

  // Called when fade-out animation completes
  const handleFadeOutComplete = useCallback(() => {
    setState({ phase: 'idle', href: '' })
    pageReadyRef.current = false
  }, [])

  // Start a new transition
  const startTransition = useCallback((rect: DOMRect, href: string) => {
    if (state.phase !== 'idle') {
      return
    }

    setState({
      phase: 'active',
      href,
    })
  }, [state.phase])

  const isEntering = state.phase === 'fading'

  return (
    <TransitionContext.Provider
      value={{
        state,
        startTransition,
        signalPageReady,
        isEntering
      }}
    >
      <TransitionCallbackContext.Provider
        value={{
          onFadeInComplete: handleFadeInComplete,
          onFadeOutComplete: handleFadeOutComplete
        }}
      >
        {children}
      </TransitionCallbackContext.Provider>
    </TransitionContext.Provider>
  )
}

// Callback context
interface TransitionCallbackContextType {
  onFadeInComplete: () => void
  onFadeOutComplete: () => void
}

const TransitionCallbackContext = createContext<TransitionCallbackContextType | null>(null)

export function useTransitionCallbacks() {
  const context = useContext(TransitionCallbackContext)
  if (!context) {
    throw new Error('useTransitionCallbacks must be used within TransitionProvider')
  }
  return context
}

export function useTransition() {
  const context = useContext(TransitionContext)
  if (!context) {
    throw new Error('useTransition must be used within TransitionProvider')
  }
  return context
}

// For backward compatibility
export function usePageTransition() {
  const { startTransition } = useTransition()
  return { startTransition }
}

export { TIMING }
