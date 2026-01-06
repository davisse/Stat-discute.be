'use client'

import { useEffect } from 'react'
import { useTransition } from '@/contexts/TransitionContext'

/**
 * Hook to signal that a page is ready to be revealed.
 * Call this hook in AppLayout or individual pages to trigger the reveal animation.
 *
 * @returns {boolean} isEntering - Whether the page content should animate in
 */
export function useTransitionReady(): { isEntering: boolean } {
  const { signalPageReady, isEntering } = useTransition()

  useEffect(() => {
    // Signal that the page is mounted and ready
    signalPageReady()
  }, [signalPageReady])

  return { isEntering }
}
