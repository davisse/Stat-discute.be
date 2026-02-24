'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp, FileText, Clock, Sparkles, RefreshCw, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * TeamAnalysis - Displays AI-generated French narrative analysis for a team
 *
 * Features:
 * - Uses RAG system for real-time narrative generation
 * - Falls back to pre-generated analysis if RAG fails
 * - Collapsible section with smooth animation
 * - Renders narrative with cinematic styling
 * - Regenerate button for fresh analysis
 */

interface RAGNarrativeResponse {
  narrative: string
  entityType: string
  entityId: string
  language: string
  style: string
  sourcesUsed: number
  generatedAt: string
}

interface LegacyAnalysisData {
  analysis_data: Record<string, unknown>
  analysis_html: string
  generated_at: string
  games_included: number
}

export interface TeamAnalysisProps {
  teamId: number
  teamAbbreviation: string
  className?: string
  defaultExpanded?: boolean
}

export function TeamAnalysis({
  teamId,
  teamAbbreviation,
  className,
  defaultExpanded = true,
}: TeamAnalysisProps) {
  const [narrative, setNarrative] = React.useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = React.useState<string | null>(null)
  const [sourcesUsed, setSourcesUsed] = React.useState<number>(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRegenerating, setIsRegenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
  const [isRAG, setIsRAG] = React.useState(false)

  const abortControllerRef = React.useRef<AbortController | null>(null)

  // Fetch analysis using RAG or fallback to legacy
  const fetchAnalysis = React.useCallback(async (forceRAG = false) => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      if (forceRAG) {
        setIsRegenerating(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      // Try RAG narrative first
      const ragRes = await fetch('/api/rag/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'team',
          entityId: String(teamId),
          language: 'fr',
          style: 'journalistic',
        }),
        signal: controller.signal,
      })

      if (ragRes.ok) {
        const ragData: RAGNarrativeResponse = await ragRes.json()
        setNarrative(ragData.narrative)
        setGeneratedAt(ragData.generatedAt)
        setSourcesUsed(ragData.sourcesUsed)
        setIsRAG(true)
        return
      }

      // Fallback to legacy analysis API
      const legacyRes = await fetch(`/api/teams/${teamId}/analysis`, {
        signal: controller.signal,
      })

      if (legacyRes.ok) {
        const legacyData: LegacyAnalysisData = await legacyRes.json()
        // Strip HTML tags for plain text display
        const plainText = legacyData.analysis_html
          .replace(/<[^>]*>/g, '')
          .replace(/\n\s*\n/g, '\n\n')
          .trim()
        setNarrative(plainText)
        setGeneratedAt(legacyData.generated_at)
        setSourcesUsed(legacyData.games_included)
        setIsRAG(false)
        return
      }

      throw new Error('Aucune analyse disponible pour cette équipe.')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      console.error('Error fetching team analysis:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
      setIsRegenerating(false)
    }
  }, [teamId])

  React.useEffect(() => {
    fetchAnalysis()
    return () => { abortControllerRef.current?.abort() }
  }, [fetchAnalysis])

  // Format date to French locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Convert markdown-style text to styled HTML
  const formatNarrative = (text: string) => {
    return text
      // Headers (## and #)
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      // Bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Paragraphs (double newlines)
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => p.startsWith('<h') ? p : `<p>${p}</p>`)
      .join('\n')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8', className)}>
        <div className="flex items-center justify-center gap-3 text-zinc-500 py-12">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-amber-400 rounded-full animate-spin" />
          <span>Génération de l'analyse IA...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8', className)}>
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">{error}</p>
          <button
            onClick={() => fetchAnalysis(true)}
            className="mt-4 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // No data state
  if (!narrative) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8', className)}>
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">Aucune analyse disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden', className)}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 sm:p-8 hover:bg-zinc-800/30 transition-colors"
      >
        <div className="text-left">
          <div className="flex items-center gap-3">
            {isRAG ? (
              <Zap className="w-6 h-6 text-amber-400" />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-400" />
            )}
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ANALYSE {isRAG ? 'IA' : 'COMPLÈTE'}
            </h2>
            {isRAG && (
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-medium">
                RAG
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm sm:text-base tracking-[0.15em] uppercase mt-2">
            Profil détaillé • {teamAbbreviation}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 hidden sm:block px-3 py-1 bg-zinc-800 rounded-full">
            {sourcesUsed} {isRAG ? 'sources' : 'matchs'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-zinc-400" />
          ) : (
            <ChevronDown className="w-6 h-6 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-5 sm:px-8 pb-5 sm:pb-8">
          {/* Analysis Content with Custom Styles */}
          <div
            className="team-analysis-content"
            dangerouslySetInnerHTML={{ __html: formatNarrative(narrative) }}
          />

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-zinc-700/50 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Généré le {generatedAt ? formatDate(generatedAt) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block">
                {isRAG ? `${sourcesUsed} sources RAG` : `${sourcesUsed} matchs analysés`}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fetchAnalysis(true)
                }}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isRegenerating && 'animate-spin')} />
                <span>{isRegenerating ? 'Génération...' : 'Régénérer'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple styles for plain text content */}
      <style jsx global>{`
        .team-analysis-content {
          color: #d4d4d8;
          line-height: 1.8;
        }

        .team-analysis-content h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #fbbf24;
          margin: 1.5rem 0 0.75rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(251, 191, 36, 0.3);
        }

        .team-analysis-content h3:first-child {
          margin-top: 0;
        }

        .team-analysis-content p {
          margin: 0.75rem 0;
          color: #d4d4d8;
        }

        .team-analysis-content strong {
          color: #ffffff;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
