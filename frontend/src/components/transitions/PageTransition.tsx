'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface TransitionState {
  isAnimating: boolean
  rect: DOMRect | null
  href: string
  color: string
}

interface PageTransitionContextType {
  startTransition: (rect: DOMRect, href: string, color?: string) => void
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null)

export function usePageTransition() {
  const context = useContext(PageTransitionContext)
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider')
  }
  return context
}

interface PageTransitionProviderProps {
  children: ReactNode
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const router = useRouter()
  const [transition, setTransition] = useState<TransitionState>({
    isAnimating: false,
    rect: null,
    href: '',
    color: 'rgb(39, 39, 42)' // zinc-800
  })

  const startTransition = useCallback((rect: DOMRect, href: string, color: string = 'rgb(39, 39, 42)') => {
    setTransition({
      isAnimating: true,
      rect,
      href,
      color
    })
  }, [])

  const handleAnimationComplete = useCallback(() => {
    if (transition.href) {
      router.push(transition.href)
    }
  }, [transition.href, router])

  return (
    <PageTransitionContext.Provider value={{ startTransition }}>
      {children}
      <AnimatePresence>
        {transition.isAnimating && transition.rect && (
          <motion.div
            initial={{
              position: 'fixed',
              top: transition.rect.top,
              left: transition.rect.left,
              width: transition.rect.width,
              height: transition.rect.height,
              borderRadius: 12,
              backgroundColor: transition.color,
              zIndex: 9999,
            }}
            animate={{
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              borderRadius: 0,
            }}
            transition={{
              duration: 0.5,
              ease: [0.32, 0.72, 0, 1], // Custom easing for smooth expand
            }}
            onAnimationComplete={handleAnimationComplete}
            style={{
              position: 'fixed',
              zIndex: 9999,
            }}
          />
        )}
      </AnimatePresence>
    </PageTransitionContext.Provider>
  )
}
