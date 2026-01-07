'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp, FileText, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * TeamAnalysis - Displays AI-generated French narrative analysis for a team
 *
 * Features:
 * - Fetches pre-generated analysis from /api/teams/{teamId}/analysis
 * - Collapsible section with smooth animation
 * - Renders HTML narrative with cinematic styling
 * - Custom CSS for DVP grid, form metrics, and splits
 * - Shows generation timestamp and games included
 */

interface TeamAnalysisData {
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
  const [data, setData] = React.useState<TeamAnalysisData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  React.useEffect(() => {
    async function fetchAnalysis() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(`/api/teams/${teamId}/analysis`)

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Aucune analyse disponible pour cette équipe.')
          }
          throw new Error('Erreur lors du chargement de l\'analyse.')
        }

        const analysisData: TeamAnalysisData = await res.json()
        setData(analysisData)
      } catch (err) {
        console.error('Error fetching team analysis:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [teamId])

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

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-8', className)}>
        <div className="flex items-center justify-center gap-3 text-zinc-500 py-12">
          <div className="w-5 h-5 border-2 border-zinc-500 border-t-amber-400 rounded-full animate-spin" />
          <span>Chargement de l'analyse...</span>
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
        </div>
      </div>
    )
  }

  // No data state
  if (!data) {
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
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ANALYSE COMPLÈTE
            </h2>
          </div>
          <p className="text-zinc-400 text-sm sm:text-base tracking-[0.15em] uppercase mt-2">
            Profil détaillé • {teamAbbreviation}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 hidden sm:block px-3 py-1 bg-zinc-800 rounded-full">
            {data.games_included} matchs
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
            dangerouslySetInnerHTML={{ __html: data.analysis_html }}
          />

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-zinc-700/50 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Généré le {formatDate(data.generated_at)}</span>
            </div>
            <span className="hidden sm:block">
              Basé sur {data.games_included} matchs de la saison
            </span>
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
