'use client'

import * as React from 'react'
import { colors, transitions } from '@/lib/design-tokens'

/**
 * Composants réutilisables pour les séquences d'analyse
 */

// Couleurs sémantiques définies dans la spec
const COLORS = {
  positive: 'rgb(29, 193, 0)',    // Vert - Over, positif
  negative: 'rgb(239, 45, 44)',   // Rouge - Under, négatif
}

/**
 * StatCard - Carte de statistique avec variation
 */
interface StatCardProps {
  value: string | number
  label: string
  variation?: string | number
  variationType?: 'positive' | 'negative' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
}

export function AnalysisStatCard({
  value,
  label,
  variation,
  variationType = 'neutral',
  size = 'md',
}: StatCardProps) {
  const sizeStyles = {
    sm: { value: 'text-2xl', label: 'text-xs', variation: 'text-xs' },
    md: { value: 'text-3xl', label: 'text-sm', variation: 'text-sm' },
    lg: { value: 'text-4xl', label: 'text-base', variation: 'text-base' },
  }

  const variationColor = {
    positive: COLORS.positive,
    negative: COLORS.negative,
    neutral: colors.neutral[500],
  }

  return (
    <div
      className="p-4 rounded-lg text-center"
      style={{
        backgroundColor: colors.neutral[900],
        border: `1px solid ${colors.neutral[800]}`,
      }}
    >
      <div
        className={`${sizeStyles[size].value} font-bold font-mono`}
        style={{ color: colors.text.primary }}
      >
        {value}
      </div>
      <div
        className={`${sizeStyles[size].label} uppercase tracking-wider mt-1`}
        style={{ color: colors.neutral[500] }}
      >
        {label}
      </div>
      {variation && (
        <div
          className={`${sizeStyles[size].variation} font-medium mt-2`}
          style={{ color: variationColor[variationType] }}
        >
          {variation}
        </div>
      )}
    </div>
  )
}

/**
 * TrendBar - Barre de tendance Over/Under (5 derniers matchs)
 */
interface TrendBarProps {
  results: Array<{
    type: 'over' | 'under'
    diff: number
  }>
  showDiff?: boolean
}

export function TrendBar({ results, showDiff = true }: TrendBarProps) {
  const overCount = results.filter(r => r.type === 'over').length
  const underCount = results.filter(r => r.type === 'under').length

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {results.map((result, index) => (
          <div
            key={index}
            className="flex-1 p-2 rounded text-center text-sm font-bold"
            style={{
              backgroundColor: result.type === 'over'
                ? 'rgba(29, 193, 0, 0.15)'
                : 'rgba(239, 45, 44, 0.15)',
              color: result.type === 'over' ? COLORS.positive : COLORS.negative,
            }}
          >
            <div>{result.type === 'over' ? 'O' : 'U'}</div>
            {showDiff && (
              <div className="text-xs mt-1">
                {result.diff > 0 ? '+' : ''}{result.diff}
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        className="text-sm text-center"
        style={{ color: colors.neutral[400] }}
      >
        {overCount}-{underCount} {overCount > underCount ? 'OVER' : 'UNDER'} sur {results.length} matchs
      </div>
    </div>
  )
}

/**
 * DistributionBar - Barre de distribution des facteurs
 */
interface DistributionBarProps {
  overPercent: number
  label?: string
  animate?: boolean
}

export function DistributionBar({
  overPercent,
  label = 'Distribution des facteurs',
  animate = true,
}: DistributionBarProps) {
  const [width, setWidth] = React.useState(animate ? 0 : overPercent)

  React.useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(overPercent), 100)
      return () => clearTimeout(timer)
    }
  }, [overPercent, animate])

  return (
    <div className="space-y-2">
      <div
        className="text-xs uppercase tracking-wider"
        style={{ color: colors.neutral[500] }}
      >
        {label}
      </div>
      <div className="flex items-center gap-4">
        <span
          className="text-sm font-medium"
          style={{ color: COLORS.positive }}
        >
          OVER
        </span>
        <div
          className="flex-1 h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.neutral[800] }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${width}%`,
              backgroundColor: COLORS.positive,
              transition: animate ? 'width 800ms ease-out' : undefined,
            }}
          />
        </div>
        <span
          className="text-sm font-medium"
          style={{ color: COLORS.negative }}
        >
          UNDER
        </span>
      </div>
      <div className="flex justify-between text-sm font-mono">
        <span style={{ color: COLORS.positive }}>{overPercent}%</span>
        <span style={{ color: COLORS.negative }}>{100 - overPercent}%</span>
      </div>
    </div>
  )
}

/**
 * FactorsList - Liste de facteurs Over/Under en colonnes
 */
interface FactorsListProps {
  overFactors: string[]
  underFactors: string[]
}

export function FactorsList({ overFactors, underFactors }: FactorsListProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Facteurs OVER */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: 'rgba(29, 193, 0, 0.05)',
          border: `1px solid rgba(29, 193, 0, 0.2)`,
        }}
      >
        <h4
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: COLORS.positive }}
        >
          Facteurs Over
        </h4>
        <ul className="space-y-2">
          {overFactors.map((factor, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm"
              style={{ color: colors.neutral[400] }}
            >
              <span style={{ color: COLORS.positive }}>+</span>
              {factor}
            </li>
          ))}
        </ul>
      </div>

      {/* Facteurs UNDER */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: 'rgba(239, 45, 44, 0.05)',
          border: `1px solid rgba(239, 45, 44, 0.2)`,
        }}
      >
        <h4
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: COLORS.negative }}
        >
          Facteurs Under
        </h4>
        <ul className="space-y-2">
          {underFactors.map((factor, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm"
              style={{ color: colors.neutral[400] }}
            >
              <span style={{ color: COLORS.negative }}>-</span>
              {factor}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * InjuryStatus - Statut d'un joueur (blessure)
 */
interface InjuryStatusProps {
  players: Array<{
    name: string
    status: 'available' | 'questionable' | 'out'
    impact?: string
  }>
}

export function InjuryStatus({ players }: InjuryStatusProps) {
  const statusConfig = {
    available: {
      icon: '✓',
      label: 'Available',
      color: COLORS.positive,
      bg: 'rgba(29, 193, 0, 0.1)',
    },
    questionable: {
      icon: '?',
      label: 'Questionable',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    out: {
      icon: '✗',
      label: 'Out',
      color: COLORS.negative,
      bg: 'rgba(239, 45, 44, 0.1)',
    },
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: `1px solid ${colors.neutral[800]}` }}
    >
      {players.map((player, index) => {
        const config = statusConfig[player.status]
        return (
          <div
            key={index}
            className="flex items-center justify-between px-4 py-3"
            style={{
              backgroundColor: index % 2 === 0 ? colors.neutral[900] : colors.neutral[950],
              borderBottom: index < players.length - 1 ? `1px solid ${colors.neutral[800]}` : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: config.bg,
                  color: config.color,
                }}
              >
                {config.icon}
              </span>
              <span style={{ color: colors.text.primary }}>{player.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="text-sm"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
              {player.impact && (
                <span
                  className="text-sm font-mono"
                  style={{ color: colors.neutral[500] }}
                >
                  {player.impact}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * MatchupHeader - Header avec les deux équipes et la ligne
 */
interface MatchupHeaderProps {
  awayTeam: string
  homeTeam: string
  line: string
  lineType: string
}

export function MatchupHeader({ awayTeam, homeTeam, line, lineType }: MatchupHeaderProps) {
  return (
    <div className="text-center py-8">
      <div
        className="text-3xl font-bold mb-2"
        style={{ color: colors.text.primary }}
      >
        {awayTeam} <span style={{ color: colors.neutral[600] }}>@</span> {homeTeam}
      </div>
      <div
        className="inline-block px-6 py-2 rounded-full"
        style={{
          backgroundColor: colors.neutral[900],
          border: `1px solid ${colors.neutral[700]}`,
        }}
      >
        <span style={{ color: colors.neutral[400] }}>{lineType}</span>
        <span
          className="ml-2 font-mono font-bold text-xl"
          style={{ color: colors.text.primary }}
        >
          {line}
        </span>
      </div>
    </div>
  )
}

/**
 * AnimatedChart - Graphique avec animation de construction
 */
interface AnimatedChartProps {
  data: Array<{ label: string; value: number }>
  threshold?: number
  height?: number
  animate?: boolean
}

export function AnimatedChart({
  data,
  threshold,
  height = 200,
  animate = true,
}: AnimatedChartProps) {
  const [animated, setAnimated] = React.useState(!animate)
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue
  const paddedMin = minValue - range * 0.1
  const paddedMax = maxValue + range * 0.1
  const paddedRange = paddedMax - paddedMin

  React.useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimated(true), 300)
      return () => clearTimeout(timer)
    }
  }, [animate])

  return (
    <div
      className="relative"
      style={{ height }}
    >
      {/* Ligne de seuil */}
      {threshold && (
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed"
          style={{
            bottom: `${((threshold - paddedMin) / paddedRange) * 100}%`,
            borderColor: colors.neutral[600],
            transition: animate ? `bottom ${transitions.duration.slow} ${transitions.easing.inOut}` : undefined,
          }}
        >
          <span
            className="absolute right-0 -top-5 text-xs font-mono px-2 py-0.5 rounded"
            style={{
              backgroundColor: colors.neutral[900],
              color: colors.neutral[400],
            }}
          >
            {threshold}
          </span>
        </div>
      )}

      {/* Barres */}
      <div className="absolute inset-0 flex items-end justify-around gap-2 px-4">
        {data.map((item, index) => {
          const heightPercent = ((item.value - paddedMin) / paddedRange) * 100
          const isAboveThreshold = threshold ? item.value >= threshold : true

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{
                  height: animated ? `${heightPercent}%` : '0%',
                  backgroundColor: isAboveThreshold ? COLORS.positive : COLORS.negative,
                  transitionDelay: animate ? `${index * 100}ms` : '0ms',
                }}
              />
              <span
                className="mt-2 text-xs"
                style={{ color: colors.neutral[500] }}
              >
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * ConfidenceIndicator - Indicateur de confiance des données
 */
interface ConfidenceIndicatorProps {
  percent: number
  label?: string
}

export function ConfidenceIndicator({
  percent,
  label = 'Confiance données',
}: ConfidenceIndicatorProps) {
  const blocks = 10
  const filledBlocks = Math.round((percent / 100) * blocks)

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs uppercase tracking-wider"
        style={{ color: colors.neutral[500] }}
      >
        {label}:
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: blocks }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor: i < filledBlocks ? colors.text.primary : colors.neutral[800],
            }}
          />
        ))}
      </div>
      <span
        className="text-sm font-mono"
        style={{ color: colors.neutral[400] }}
      >
        {percent}%
      </span>
    </div>
  )
}
