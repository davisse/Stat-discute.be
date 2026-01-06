'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTransition, useTransitionCallbacks, EASING, TIMING } from '@/contexts/TransitionContext'

export function RevealOverlay() {
  const { state } = useTransition()
  const { onFadeInComplete, onFadeOutComplete } = useTransitionCallbacks()
  const prevPhaseRef = useRef(state.phase)

  const isVisible = state.phase !== 'idle'
  const isFading = state.phase === 'fading'

  // Use useEffect with timer for reliable callback triggering
  // (onAnimationComplete can be unreliable with black-on-black animations)
  useEffect(() => {
    const prevPhase = prevPhaseRef.current
    prevPhaseRef.current = state.phase

    if (prevPhase === 'idle' && state.phase === 'active') {
      // Fade-in started, trigger callback after animation
      const timer = setTimeout(() => {
        onFadeInComplete()
      }, TIMING.FADE_IN + 50) // Small buffer for safety
      return () => clearTimeout(timer)
    }

    if (prevPhase === 'active' && state.phase === 'fading') {
      // Fade-out started, trigger callback after animation
      const timer = setTimeout(() => {
        onFadeOutComplete()
      }, TIMING.FADE_OUT + 50)
      return () => clearTimeout(timer)
    }
  }, [state.phase, onFadeInComplete, onFadeOutComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFading ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: isFading ? TIMING.FADE_OUT / 1000 : TIMING.FADE_IN / 1000,
            ease: isFading ? EASING.fadeOut : EASING.fadeIn,
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#000000',
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  )
}
