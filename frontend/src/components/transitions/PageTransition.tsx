'use client'

import { ReactNode } from 'react'
import { usePageTransition as useNewPageTransition } from '@/contexts/TransitionContext'

/**
 * @deprecated Use TransitionProvider from @/contexts/TransitionContext instead
 * This is kept for backward compatibility with existing code
 */
export function usePageTransition() {
  return useNewPageTransition()
}

/**
 * @deprecated Use TransitionProvider from @/contexts/TransitionContext instead
 * This provider is now a pass-through since TransitionProvider is in layout.tsx
 */
interface PageTransitionProviderProps {
  children: ReactNode
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  // TransitionProvider is already in layout.tsx, so this is now a pass-through
  // The overlay is rendered by RevealOverlay in layout.tsx
  return <>{children}</>
}
