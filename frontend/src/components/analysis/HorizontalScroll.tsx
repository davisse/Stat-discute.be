'use client'

import * as React from 'react'
import { colors, transitions } from '@/lib/design-tokens'

/**
 * HorizontalScrollContainer
 *
 * Container principal pour le storytelling horizontal avec snap scroll.
 * Gère le scroll horizontal, la navigation par dots, et les animations.
 */

interface SequenceData {
  id: string
  title: string
  children: React.ReactNode
}

interface HorizontalScrollProps {
  sequences: SequenceData[]
  onSequenceChange?: (index: number, id: string) => void
  showSummary?: boolean
  className?: string
}

export function HorizontalScrollContainer({
  sequences,
  onSequenceChange,
  showSummary = true,
  className = '',
}: HorizontalScrollProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isScrolling, setIsScrolling] = React.useState(false)

  // Gérer le scroll et détecter la séquence active
  const handleScroll = React.useCallback(() => {
    if (!containerRef.current || isScrolling) return

    const container = containerRef.current
    const scrollLeft = container.scrollLeft
    const sequenceWidth = container.clientWidth
    const newIndex = Math.round(scrollLeft / sequenceWidth)

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < sequences.length) {
      setActiveIndex(newIndex)
      onSequenceChange?.(newIndex, sequences[newIndex].id)
    }
  }, [activeIndex, sequences, onSequenceChange, isScrolling])

  // Navigation vers une séquence spécifique
  const scrollToSequence = React.useCallback((index: number) => {
    if (!containerRef.current) return

    setIsScrolling(true)
    const sequenceWidth = containerRef.current.clientWidth

    containerRef.current.scrollTo({
      left: index * sequenceWidth,
      behavior: 'smooth',
    })

    setActiveIndex(index)
    onSequenceChange?.(index, sequences[index].id)

    // Reset scrolling flag after animation
    setTimeout(() => setIsScrolling(false), 400)
  }, [sequences, onSequenceChange])

  // Navigation clavier
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && activeIndex < sequences.length - 1) {
        scrollToSequence(activeIndex + 1)
      } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
        scrollToSequence(activeIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, sequences.length, scrollToSequence])

  return (
    <div className={`relative h-screen flex flex-col ${className}`}>
      {/* Header avec sommaire */}
      {showSummary && (
        <AnalysisHeader
          sequences={sequences}
          activeIndex={activeIndex}
          onNavigate={scrollToSequence}
        />
      )}

      {/* Container de scroll horizontal */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {sequences.map((sequence, index) => (
          <SequencePage
            key={sequence.id}
            isActive={index === activeIndex}
          >
            {sequence.children}
          </SequencePage>
        ))}
      </div>

      {/* Dots de pagination */}
      <DotsPagination
        total={sequences.length}
        active={activeIndex}
        onNavigate={scrollToSequence}
      />
    </div>
  )
}

/**
 * SequencePage
 *
 * Wrapper pour chaque séquence individuelle.
 * Occupe 100% de la viewport et gère les animations d'entrée.
 */
interface SequencePageProps {
  children: React.ReactNode
  isActive: boolean
}

export function SequencePage({ children, isActive }: SequencePageProps) {
  return (
    <div
      className="min-w-full h-full snap-center snap-always flex-shrink-0"
      style={{
        scrollSnapAlign: 'center',
        scrollSnapStop: 'always',
      }}
    >
      <div
        className="h-full w-full px-8 py-6 overflow-hidden"
        style={{
          opacity: isActive ? 1 : 0.3,
          transition: `opacity ${transitions.presets.default}`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * AnalysisHeader
 *
 * Header avec titre et sommaire cliquable des séquences.
 */
interface AnalysisHeaderProps {
  sequences: SequenceData[]
  activeIndex: number
  onNavigate: (index: number) => void
}

function AnalysisHeader({ sequences, activeIndex, onNavigate }: AnalysisHeaderProps) {
  // Filtrer les séquences sans titre (comme intro)
  const navSequences = sequences.filter(seq => seq.title.trim() !== '')

  return (
    <header
      className="flex-shrink-0 border-b px-8 py-3"
      style={{
        backgroundColor: colors.background.primary,
        borderColor: colors.neutral[800],
      }}
    >
      {/* Logo centré */}
      <div className="flex justify-center mb-3">
        <img
          src="/logo-v5.png"
          alt="Stat Discute"
          className="h-10 w-auto"
        />
      </div>

      {/* Navigation sommaire */}
      <nav className="flex items-center justify-center gap-6 overflow-x-auto">
        {navSequences.map((seq) => {
          const originalIndex = sequences.findIndex(s => s.id === seq.id)
          return (
            <button
              key={seq.id}
              onClick={() => onNavigate(originalIndex)}
              className="px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                color: originalIndex === activeIndex ? colors.text.primary : colors.neutral[500],
                borderBottom: originalIndex === activeIndex ? `2px solid ${colors.text.primary}` : '2px solid transparent',
              }}
            >
              {seq.title}
            </button>
          )
        })}
      </nav>
    </header>
  )
}

/**
 * DotsPagination
 *
 * Navigation par dots en bas de l'écran.
 */
interface DotsPaginationProps {
  total: number
  active: number
  onNavigate: (index: number) => void
}

export function DotsPagination({ total, active, onNavigate }: DotsPaginationProps) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center gap-3 py-6"
      style={{
        backgroundColor: colors.background.primary,
      }}
    >
      {/* Flèche gauche */}
      <button
        onClick={() => active > 0 && onNavigate(active - 1)}
        disabled={active === 0}
        className="p-2 transition-opacity"
        style={{
          opacity: active === 0 ? 0.3 : 1,
          color: colors.neutral[400],
        }}
        aria-label="Séquence précédente"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12 15L7 10L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            onClick={() => onNavigate(index)}
            className="transition-all duration-300"
            style={{
              width: index === active ? '24px' : '10px',
              height: '10px',
              borderRadius: '5px',
              backgroundColor: index === active ? colors.text.primary : colors.neutral[700],
            }}
            aria-label={`Aller à la séquence ${index + 1}`}
            aria-current={index === active ? 'true' : undefined}
          />
        ))}
      </div>

      {/* Flèche droite */}
      <button
        onClick={() => active < total - 1 && onNavigate(active + 1)}
        disabled={active === total - 1}
        className="p-2 transition-opacity"
        style={{
          opacity: active === total - 1 ? 0.3 : 1,
          color: colors.neutral[400],
        }}
        aria-label="Séquence suivante"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M8 5L13 10L8 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

/**
 * SequenceContent
 *
 * Layout standard pour le contenu d'une séquence.
 * Avec texte contextuel en haut et visualisations en dessous.
 */
interface SequenceContentProps {
  title?: React.ReactNode  // Supports string, JSX, or loading states
  contextText?: React.ReactNode  // Supports string, JSX, or loading states
  reflectionQuestion?: React.ReactNode  // Supports string, JSX, or loading states
  children: React.ReactNode
}

export function SequenceContent({
  title,
  contextText,
  reflectionQuestion,
  children,
}: SequenceContentProps) {
  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
      {/* Titre de la séquence */}
      {title && (
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: colors.text.primary }}
        >
          {title}
        </h2>
      )}

      {/* Texte contextuel */}
      {contextText && (
        <div
          className="p-4 rounded-lg mb-6"
          style={{
            backgroundColor: colors.neutral[900],
            borderLeft: `3px solid ${colors.neutral[600]}`,
          }}
        >
          <div
            className="text-base leading-relaxed"
            style={{ color: colors.neutral[400] }}
          >
            {contextText}
          </div>
        </div>
      )}

      {/* Contenu principal (visualisations, stats, etc.) */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Question de réflexion */}
      {reflectionQuestion && (
        <div
          className="mt-auto pt-6 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${colors.neutral[800]}`,
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className="text-xl"
              style={{ color: colors.neutral[500] }}
            >
              ?
            </span>
            <div
              className="text-sm italic"
              style={{ color: colors.neutral[400] }}
            >
              {reflectionQuestion}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
