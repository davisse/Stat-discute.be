'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { ImpactfulAbsence } from '@/lib/queries'

/**
 * PlayerAbsenceImpact Component
 *
 * Affiche une liste classée des absences de joueurs les plus impactantes sur la performance de leur équipe.
 * Permet d'identifier les joueurs clés dont l'absence affecte significativement les résultats de l'équipe.
 *
 * Philosophy: Aide à évaluer la vraie valeur d'un joueur via l'analyse de son absence.
 * Design minimaliste avec focus sur les métriques d'impact.
 *
 * @param absences - Liste des absences impactantes à afficher
 * @param variant - Style: 'list' (liste détaillée) | 'compact' (version condensée)
 * @param showTeamFilter - Afficher le filtre par équipe
 * @param onPlayerClick - Callback quand on clique sur un joueur
 *
 * @example
 * <PlayerAbsenceImpact
 *   absences={absencesData}
 *   variant="list"
 *   showTeamFilter={true}
 *   onPlayerClick={(playerId) => router.push(`/players/${playerId}`)}
 * />
 */

const playerAbsenceImpactVariants = cva('', {
  variants: {
    variant: {
      list: 'space-y-[var(--space-3)]',
      compact: 'space-y-[var(--space-2)]',
    },
  },
  defaultVariants: {
    variant: 'list',
  },
})

export interface PlayerAbsenceImpactProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof playerAbsenceImpactVariants> {
  absences: ImpactfulAbsence[]
  variant?: 'list' | 'compact'
  showTeamFilter?: boolean
  onPlayerClick?: (playerId: number) => void
}

/**
 * Badge d'impact (positif ou négatif)
 */
function ImpactBadge({ value, label }: { value: number; label: string }) {
  const isNegative = value < 0
  const isNeutral = value === 0

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'text-[var(--text-xs)] uppercase tracking-wider mb-[var(--space-1)]',
          isNeutral
            ? 'text-[var(--color-gray-500)]'
            : 'text-[var(--color-gray-400)]'
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'font-[family-name:var(--font-mono)] text-[var(--text-lg)] font-[var(--font-bold)]',
          isNegative
            ? 'text-red-400'
            : isNeutral
            ? 'text-[var(--color-gray-500)]'
            : 'text-green-400'
        )}
      >
        {value > 0 ? '+' : ''}
        {value.toFixed(1)}
        {label.includes('Win') ? '%' : ''}
      </div>
    </div>
  )
}

/**
 * Row d'absence (layout liste)
 */
function AbsenceListRow({
  absence,
  rank,
  onPlayerClick,
}: {
  absence: ImpactfulAbsence
  rank: number
  onPlayerClick?: (playerId: number) => void
}) {
  return (
    <Card
      variant="default"
      className="hover:bg-[var(--color-gray-900)] transition-colors cursor-pointer"
      onClick={() => onPlayerClick?.(absence.player_id)}
    >
      <div className="flex items-center justify-between gap-[var(--space-6)]">
        {/* Rank + Player Info */}
        <div className="flex items-center gap-[var(--space-4)] flex-1 min-w-0">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-gray-900)] flex items-center justify-center">
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-sm)] text-[var(--color-gray-400)] font-[var(--font-semibold)]">
              {rank}
            </span>
          </div>

          {/* Player Name + Team */}
          <div className="flex-1 min-w-0">
            <div className="text-[var(--text-base)] text-white font-[var(--font-semibold)] truncate">
              {absence.player_name}
            </div>
            <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-1)]">
              <span className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
                {absence.team_abbreviation}
              </span>
              <span className="text-[var(--color-gray-600)]">•</span>
              <span className="text-[var(--text-sm)] text-[var(--color-gray-500)] font-[family-name:var(--font-mono)]">
                {absence.games_missed} games missed
              </span>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="flex items-center gap-[var(--space-8)]">
          {/* Team Record Without */}
          <div className="flex flex-col items-center">
            <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-400)] mb-[var(--space-1)]">
              Record
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[var(--text-base)] text-white font-[var(--font-semibold)]">
              {absence.team_record_without}
            </div>
          </div>

          {/* Win% Impact */}
          <ImpactBadge value={absence.win_pct_impact} label="Win% Δ" />

          {/* Net Rating Impact */}
          <ImpactBadge value={absence.net_rating_impact} label="Net Rating Δ" />
        </div>
      </div>
    </Card>
  )
}

/**
 * Row d'absence (layout compact)
 */
function AbsenceCompactRow({
  absence,
  rank,
  onPlayerClick,
}: {
  absence: ImpactfulAbsence
  rank: number
  onPlayerClick?: (playerId: number) => void
}) {
  return (
    <div
      className="flex items-center justify-between py-[var(--space-2)] border-b border-[var(--color-gray-800)] last:border-b-0 hover:bg-[var(--color-gray-900)] px-[var(--space-3)] -mx-[var(--space-3)] cursor-pointer transition-colors"
      onClick={() => onPlayerClick?.(absence.player_id)}
    >
      {/* Rank + Player */}
      <div className="flex items-center gap-[var(--space-3)] flex-1 min-w-0">
        <span className="font-[family-name:var(--font-mono)] text-[var(--text-xs)] text-[var(--color-gray-500)] w-6 text-right">
          {rank}
        </span>
        <span className="text-[var(--text-sm)] text-white truncate">
          {absence.player_name}
        </span>
        <span className="text-[var(--text-xs)] text-[var(--color-gray-500)]">
          {absence.team_abbreviation}
        </span>
      </div>

      {/* Compact Metrics */}
      <div className="flex items-center gap-[var(--space-4)]">
        <span className="font-[family-name:var(--font-mono)] text-[var(--text-xs)] text-[var(--color-gray-400)]">
          {absence.games_missed}G
        </span>
        <span
          className={cn(
            'font-[family-name:var(--font-mono)] text-[var(--text-sm)] font-[var(--font-semibold)]',
            absence.win_pct_impact < 0 ? 'text-red-400' : 'text-green-400'
          )}
        >
          {absence.win_pct_impact > 0 ? '+' : ''}
          {absence.win_pct_impact.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

/**
 * Header avec titre et filtre équipe optionnel
 */
function AbsenceHeader({
  showTeamFilter,
  teams,
  selectedTeam,
  onTeamChange,
}: {
  showTeamFilter?: boolean
  teams?: string[]
  selectedTeam?: string
  onTeamChange?: (team: string) => void
}) {
  if (!showTeamFilter) return null

  return (
    <div className="flex items-center justify-between mb-[var(--space-4)] pb-[var(--space-4)] border-b border-[var(--color-gray-800)]">
      <div>
        <h3 className="text-[var(--text-lg)] text-white font-[var(--font-semibold)]">
          Most Impactful Absences
        </h3>
        <p className="text-[var(--text-sm)] text-[var(--color-gray-400)] mt-[var(--space-1)]">
          Players whose absence significantly affects team performance
        </p>
      </div>

      {teams && teams.length > 1 && (
        <select
          className="bg-[var(--color-gray-900)] text-white border border-[var(--color-gray-700)] rounded-[var(--radius-2)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] focus:outline-none focus:ring-2 focus:ring-white/20"
          value={selectedTeam}
          onChange={(e) => onTeamChange?.(e.target.value)}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export const PlayerAbsenceImpact = React.forwardRef<
  HTMLDivElement,
  PlayerAbsenceImpactProps
>(
  (
    {
      className,
      absences,
      variant = 'list',
      showTeamFilter = false,
      onPlayerClick,
      ...props
    },
    ref
  ) => {
    const [selectedTeam, setSelectedTeam] = React.useState<string>('')

    // Extract unique teams from absences
    const teams = React.useMemo(() => {
      return Array.from(new Set(absences.map((a) => a.team_abbreviation))).sort()
    }, [absences])

    // Filter absences by selected team
    const filteredAbsences = React.useMemo(() => {
      if (!selectedTeam) return absences
      return absences.filter((a) => a.team_abbreviation === selectedTeam)
    }, [absences, selectedTeam])

    // Empty state
    if (filteredAbsences.length === 0) {
      return (
        <Card ref={ref} variant="default" className={cn(className)} {...props}>
          <div className="text-center py-[var(--space-8)]">
            <p className="text-[var(--color-gray-400)] text-[var(--text-base)]">
              No player absence data available
            </p>
            <p className="text-[var(--color-gray-600)] text-[var(--text-sm)] mt-[var(--space-2)]">
              Data will appear once players have missed games this season
            </p>
          </div>
        </Card>
      )
    }

    return (
      <div ref={ref} className={cn(className)} {...props}>
        <AbsenceHeader
          showTeamFilter={showTeamFilter}
          teams={teams}
          selectedTeam={selectedTeam}
          onTeamChange={setSelectedTeam}
        />

        <div className={playerAbsenceImpactVariants({ variant })}>
          {filteredAbsences.map((absence, index) => {
            const rank = index + 1

            if (variant === 'compact') {
              return (
                <AbsenceCompactRow
                  key={`${absence.player_id}-${absence.team_id}`}
                  absence={absence}
                  rank={rank}
                  onPlayerClick={onPlayerClick}
                />
              )
            }

            return (
              <AbsenceListRow
                key={`${absence.player_id}-${absence.team_id}`}
                absence={absence}
                rank={rank}
                onPlayerClick={onPlayerClick}
              />
            )
          })}
        </div>
      </div>
    )
  }
)

PlayerAbsenceImpact.displayName = 'PlayerAbsenceImpact'
