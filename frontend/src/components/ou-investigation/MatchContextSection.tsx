'use client'

import React from 'react'
import Image from 'next/image'
import { getTeamColors, getTeamLogoUrl, hexToRgba } from '@/lib/team-colors'
import { motion } from 'framer-motion'

// ============================================================================
// TYPES
// ============================================================================

interface TeamBasicInfo {
  abbreviation: string
  name: string
  wins: number
  losses: number
}

interface H2HGame {
  date: string           // "2025-01-05"
  homeTeam: string       // abbreviation
  awayTeam: string       // abbreviation
  homeScore: number
  awayScore: number
  total: number          // homeScore + awayScore
  line?: number          // O/U line that was set (optional - may not be available)
  result?: 'OVER' | 'UNDER' | 'PUSH'  // optional if line not available
}

interface PlayerLineup {
  name: string
  position: string       // "PG", "SG", "SF", "PF", "C"
  status: 'CONFIRMED' | 'GTD' | 'OUT'
  injuryNote?: string    // "Knee", "Rest", etc.
}

interface TeamLineup {
  abbreviation: string
  starters: PlayerLineup[]
  bench?: PlayerLineup[]  // Rotation players (optional - may not be available)
  out: PlayerLineup[]
}

interface MatchContextSectionProps {
  homeTeam: TeamBasicInfo
  awayTeam: TeamBasicInfo
  cinematicTitle: string
  narrativeContext: string
  h2hGames: H2HGame[]
  homeLineup: TeamLineup
  awayLineup: TeamLineup
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MatchContextSection({
  homeTeam,
  awayTeam,
  cinematicTitle,
  narrativeContext,
  h2hGames,
  homeLineup,
  awayLineup
}: MatchContextSectionProps) {
  const homeColors = getTeamColors(homeTeam.abbreviation)
  const awayColors = getTeamColors(awayTeam.abbreviation)

  return (
    <section className="mt-8 sm:mt-12">
      {/* ================================================================== */}
      {/* 01 - CINEMATIC TITLE SECTION */}
      {/* ================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-zinc-800/60 mb-6"
      >
        {/* Background gradient mesh */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, ${hexToRgba(awayColors.primary, 0.4)} 0%, transparent 50%),
              radial-gradient(ellipse at 80% 50%, ${hexToRgba(homeColors.primary, 0.4)} 0%, transparent 50%),
              linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)
            `
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Cinematic Title Content */}
        <div className="relative py-12 sm:py-16 px-6 sm:px-10 text-center">
          {/* Decorative top line */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-zinc-600" />
            <span className="text-[10px] font-bold text-zinc-500 tracking-[0.3em] uppercase">
              O/U Investigation
            </span>
            <div className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-zinc-600" />
          </div>

          {/* Main Title - Spotlight effect */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight"
            style={{
              background: `linear-gradient(135deg,
                ${hexToRgba(awayColors.primary, 0.9)} 0%,
                #ffffff 30%,
                #ffffff 70%,
                ${hexToRgba(homeColors.primary, 0.9)} 100%
              )`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 80px rgba(255,255,255,0.15)'
            }}
          >
            {cinematicTitle}
          </motion.h1>

          {/* Team VS indicator below title */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <TeamBadge team={awayTeam} colors={awayColors} />
            <span className="text-xs font-bold text-zinc-600 tracking-wider">@</span>
            <TeamBadge team={homeTeam} colors={homeColors} />
          </div>

          {/* Decorative bottom corner accents */}
          <div className="absolute bottom-4 left-4 w-6 h-6">
            <div className="absolute bottom-0 left-0 w-full h-px bg-zinc-700" />
            <div className="absolute bottom-0 left-0 w-px h-full bg-zinc-700" />
          </div>
          <div className="absolute bottom-4 right-4 w-6 h-6">
            <div className="absolute bottom-0 right-0 w-full h-px bg-zinc-700" />
            <div className="absolute bottom-0 right-0 w-px h-full bg-zinc-700" />
          </div>
        </div>
      </motion.div>

      {/* ================================================================== */}
      {/* 02 - NARRATIVE CONTEXT (Data-Oriented) */}
      {/* ================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 sm:p-6 mb-6"
      >
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Analyse Statistique
          </span>
        </div>

        <div className="flex items-start gap-4">
          {/* Accent bar */}
          <div
            className="w-1 min-h-[60px] rounded-full flex-shrink-0"
            style={{
              background: `linear-gradient(180deg,
                ${hexToRgba(awayColors.primary, 0.8)} 0%,
                ${hexToRgba(homeColors.primary, 0.8)} 100%
              )`
            }}
          />

          {/* Narrative text with highlighted stats */}
          <div className="space-y-3">
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              <StatHighlight text={narrativeContext} />
            </p>
          </div>
        </div>
      </motion.div>

      {/* ================================================================== */}
      {/* 03 - H2H HISTORICAL CONFRONTATIONS (only if games exist) */}
      {/* ================================================================== */}
      {h2hGames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          {/* Section Header */}
          <SectionHeader number="02" title="Face-à-Face (Saison en cours)" />

          {/* H2H Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {h2hGames.map((game, index) => (
              <H2HGameCard
                key={`${game.date}-${index}`}
                game={game}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                index={index}
              />
            ))}
          </div>

          {/* H2H Summary Stats */}
          <H2HSummary games={h2hGames} awayTeam={awayTeam} homeTeam={homeTeam} />
        </motion.div>
      )}

      {/* ================================================================== */}
      {/* 04 - LINEUPS PROBABLES */}
      {/* ================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {/* Section Header */}
        <SectionHeader number="03" title="Lineups Probables" />

        {/* Lineups Grid - Face to Face */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <LineupCard
            lineup={awayLineup}
            team={awayTeam}
            side="away"
          />
          <LineupCard
            lineup={homeLineup}
            team={homeTeam}
            side="home"
          />
        </div>
      </motion.div>
    </section>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TeamBadge({
  team,
  colors
}: {
  team: TeamBasicInfo
  colors: { primary: string; secondary: string }
}) {
  const logoUrl = getTeamLogoUrl(team.abbreviation)

  return (
    <div className="flex items-center gap-2">
      {logoUrl && (
        <div className="relative w-6 h-6 sm:w-8 sm:h-8">
          <Image
            src={logoUrl}
            alt={team.name}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}
      <div className="text-left">
        <span
          className="text-sm sm:text-base font-bold"
          style={{ color: colors.primary }}
        >
          {team.abbreviation}
        </span>
        <span className="block text-[10px] text-zinc-500 tabular-nums">
          {team.wins}-{team.losses}
        </span>
      </div>
    </div>
  )
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-zinc-600 tracking-widest font-mono">
          {number}
        </span>
        <div className="w-6 h-px bg-zinc-700" />
      </div>
      <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
        {title}
      </h2>
    </div>
  )
}

function H2HGameCard({
  game,
  homeTeam,
  awayTeam,
  index
}: {
  game: H2HGame
  homeTeam: TeamBasicInfo
  awayTeam: TeamBasicInfo
  index: number
}) {
  const hasLine = game.line !== undefined && game.result !== undefined
  const isOver = game.result === 'OVER'
  const isUnder = game.result === 'UNDER'
  const margin = hasLine ? game.total - game.line! : 0

  // Format date
  const dateObj = new Date(game.date)
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4 overflow-hidden group hover:border-zinc-700/80 transition-colors"
    >
      {/* Result indicator bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isOver
            ? 'bg-gradient-to-r from-emerald-500/80 to-emerald-400/60'
            : isUnder
              ? 'bg-gradient-to-r from-red-500/80 to-red-400/60'
              : 'bg-zinc-600'
        }`}
      />

      {/* Date */}
      <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-3">
        {formattedDate}
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400">
            {game.awayTeam}
          </span>
          <span className="text-lg font-black tabular-nums text-white">
            {game.awayScore}
          </span>
        </div>
        <span className="text-zinc-600 text-xs">@</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tabular-nums text-white">
            {game.homeScore}
          </span>
          <span className="text-xs font-bold text-zinc-400">
            {game.homeTeam}
          </span>
        </div>
      </div>

      {/* O/U Details */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
        <div className="space-y-1">
          <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Total</div>
          <div className="text-sm font-bold tabular-nums text-white">{game.total}</div>
        </div>

        {hasLine ? (
          <>
            <div className="space-y-1 text-center">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Ligne</div>
              <div className="text-sm font-bold tabular-nums text-zinc-400">{game.line}</div>
            </div>

            <div className="space-y-1 text-right">
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Résultat</div>
              <div className={`text-sm font-black ${
                isOver ? 'text-emerald-400' : isUnder ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {game.result}
                <span className="text-[10px] font-medium text-zinc-500 ml-1">
                  ({margin > 0 ? '+' : ''}{margin.toFixed(1)})
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-xs text-zinc-500 italic">
            Données O/U non disponibles
          </div>
        )}
      </div>
    </motion.div>
  )
}

function H2HSummary({
  games,
  awayTeam,
  homeTeam
}: {
  games: H2HGame[]
  awayTeam: TeamBasicInfo
  homeTeam: TeamBasicInfo
}) {
  // Filter games that have O/U data
  const gamesWithLines = games.filter(g => g.line !== undefined && g.result !== undefined)
  const hasLineData = gamesWithLines.length > 0

  const overCount = gamesWithLines.filter(g => g.result === 'OVER').length
  const underCount = gamesWithLines.filter(g => g.result === 'UNDER').length
  const avgTotal = games.reduce((sum, g) => sum + g.total, 0) / games.length
  const avgLine = hasLineData
    ? gamesWithLines.reduce((sum, g) => sum + (g.line || 0), 0) / gamesWithLines.length
    : null

  const overPct = hasLineData ? (overCount / gamesWithLines.length) * 100 : 0

  return (
    <div className="mt-4 p-4 bg-zinc-900/30 border border-zinc-800/40 rounded-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* O/U Record - only show if we have line data */}
        {hasLineData ? (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl font-black text-emerald-400 tabular-nums">{overCount}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Over</div>
            </div>
            <div className="text-zinc-600 text-lg">-</div>
            <div className="text-center">
              <div className="text-xl font-black text-red-400 tabular-nums">{underCount}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Under</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-bold text-zinc-400 tabular-nums">{games.length}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Match(s)</div>
            </div>
          </div>
        )}

        {/* Progress Bar - only show if we have line data */}
        {hasLineData && (
          <div className="flex-1 max-w-xs">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${overPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-zinc-500">
              <span>OVER {overPct.toFixed(0)}%</span>
              <span>UNDER {(100 - overPct).toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Averages */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-white tabular-nums">{avgTotal.toFixed(1)}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Moy. Total</div>
          </div>
          {avgLine !== null && (
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-400 tabular-nums">{avgLine.toFixed(1)}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Moy. Ligne</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LineupCard({
  lineup,
  team,
  side
}: {
  lineup: TeamLineup
  team: TeamBasicInfo
  side: 'home' | 'away'
}) {
  const colors = getTeamColors(team.abbreviation)
  const logoUrl = getTeamLogoUrl(team.abbreviation)
  const isHome = side === 'home'

  return (
    <div
      className="relative bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden"
      style={{
        background: `linear-gradient(${isHome ? '135deg' : '225deg'},
          ${hexToRgba(colors.primary, 0.08)} 0%,
          rgba(24,24,27,0.6) 100%
        )`
      }}
    >
      {/* Header with team info */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800/50">
        {logoUrl && (
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src={logoUrl}
              alt={team.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">{team.abbreviation}</span>
            <span
              className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
              style={{
                backgroundColor: hexToRgba(colors.primary, 0.3),
                color: colors.primary,
                border: `1px solid ${hexToRgba(colors.primary, 0.4)}`
              }}
            >
              {isHome ? 'DOM' : 'EXT'}
            </span>
          </div>
          <div className="text-xs text-zinc-500">{team.name}</div>
        </div>
      </div>

      {/* Starters Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              5 Titulaires
            </span>
          </div>
          <span className="text-[10px] text-zinc-600">
            {lineup.starters.filter(p => p.status === 'CONFIRMED').length}/5 confirmés
          </span>
        </div>
        <div className="space-y-2">
          {lineup.starters.slice(0, 5).map((player, index) => (
            <PlayerRow
              key={`starter-${index}`}
              player={player}
              colors={colors}
            />
          ))}
        </div>

        {/* Out Players Section */}
        {lineup.out.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider">
                Absences ({lineup.out.length})
              </span>
            </div>
            <div className="space-y-2">
              {lineup.out.map((player, index) => (
                <PlayerRow
                  key={`out-${index}`}
                  player={player}
                  colors={colors}
                  isOut
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Highlights statistics in text (numbers, percentages, rankings)
 * Makes data points visually prominent in narrative text
 */
function StatHighlight({ text }: { text: string }) {
  // Regex patterns for different stat types
  const patterns = [
    // Percentages: 58%, 67%
    { regex: /(\d+(?:\.\d+)?%)/g, className: 'text-white font-semibold' },
    // PPG/Points with decimals: 113.2 PPG, 221.9 points
    { regex: /(\d+\.\d+)\s*(PPG|pts|points|possessions)/gi, className: 'text-white font-semibold tabular-nums' },
    // Rankings: (8e NBA), (vs 101.2)
    { regex: /\(([^)]+)\)/g, className: 'text-zinc-500 text-xs' },
    // Negative changes: -14.2, -3.1
    { regex: /(-\d+(?:\.\d+)?)/g, className: 'text-red-400 font-semibold tabular-nums' },
    // Positive changes: +7.2
    { regex: /(\+\d+(?:\.\d+)?)/g, className: 'text-emerald-400 font-semibold tabular-nums' },
    // O/U Records: 2 UNDER, 58% OVER
    { regex: /(\d+)\s*(OVER|UNDER)/gi, className: 'text-white font-semibold' },
    // Ranges: 216-224
    { regex: /(\d{3}-\d{3})/g, className: 'text-white font-bold tabular-nums' },
    // Line values: 220.5
    { regex: /(\d{3}\.\d)/g, className: 'text-amber-400 font-semibold tabular-nums' },
  ]

  // Simple approach: split by known patterns and rebuild with highlights
  // For a more robust solution, use a proper parser
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  // Process OVER/UNDER keywords
  remaining = remaining.replace(/\b(OVER)\b/g, '###OVER_KEYWORD###')
  remaining = remaining.replace(/\b(UNDER)\b/g, '###UNDER_KEYWORD###')

  // Split and process
  const segments = remaining.split(/(###OVER_KEYWORD###|###UNDER_KEYWORD###|\d+(?:\.\d+)?%|\d{3}\.\d|\d{3}-\d{3}|[+-]\d+(?:\.\d+)?|\d+\.\d+\s*(?:PPG|pts|points|possessions))/gi)

  segments.forEach((segment, i) => {
    if (!segment) return

    if (segment === '###OVER_KEYWORD###') {
      parts.push(
        <span key={key++} className="text-emerald-400 font-bold">OVER</span>
      )
    } else if (segment === '###UNDER_KEYWORD###') {
      parts.push(
        <span key={key++} className="text-red-400 font-bold">UNDER</span>
      )
    } else if (/^\d+(?:\.\d+)?%$/.test(segment)) {
      // Percentage
      parts.push(
        <span key={key++} className="text-white font-semibold bg-white/5 px-1 rounded">{segment}</span>
      )
    } else if (/^\d{3}\.\d$/.test(segment)) {
      // Line value (e.g., 220.5)
      parts.push(
        <span key={key++} className="text-amber-400 font-semibold tabular-nums">{segment}</span>
      )
    } else if (/^\d{3}-\d{3}$/.test(segment)) {
      // Range
      parts.push(
        <span key={key++} className="text-white font-bold tabular-nums bg-white/5 px-1.5 py-0.5 rounded">{segment}</span>
      )
    } else if (/^-\d+(?:\.\d+)?$/.test(segment)) {
      // Negative
      parts.push(
        <span key={key++} className="text-red-400 font-semibold tabular-nums">{segment}</span>
      )
    } else if (/^\+\d+(?:\.\d+)?$/.test(segment)) {
      // Positive
      parts.push(
        <span key={key++} className="text-emerald-400 font-semibold tabular-nums">{segment}</span>
      )
    } else if (/^\d+\.\d+\s*(?:PPG|pts|points|possessions)$/i.test(segment)) {
      // Stats with unit
      parts.push(
        <span key={key++} className="text-white font-semibold tabular-nums">{segment}</span>
      )
    } else {
      parts.push(segment)
    }
  })

  return <>{parts}</>
}

function PlayerRow({
  player,
  colors,
  isOut = false,
  isBench = false
}: {
  player: PlayerLineup
  colors: { primary: string; secondary: string }
  isOut?: boolean
  isBench?: boolean
}) {
  const statusConfig = {
    CONFIRMED: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: '✓' },
    GTD: { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: '?' },
    OUT: { color: 'text-red-400', bg: 'bg-red-400/10', icon: '✕' }
  }

  const status = statusConfig[player.status]

  // Determine background styling based on player type
  const getBgClass = () => {
    if (isOut) return 'bg-red-950/20'
    if (isBench) return 'bg-blue-950/20 hover:bg-blue-950/30'
    return 'bg-zinc-800/30 hover:bg-zinc-800/50'
  }

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${getBgClass()}`}
    >
      <div className="flex items-center gap-3">
        {/* Position badge */}
        <span
          className="w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded"
          style={{
            backgroundColor: hexToRgba(colors.primary, isOut ? 0.1 : isBench ? 0.15 : 0.2),
            color: isOut ? '#71717a' : isBench ? hexToRgba(colors.primary, 0.7) : colors.primary
          }}
        >
          {player.position}
        </span>

        {/* Player name */}
        <span className={`text-sm font-medium ${
          isOut ? 'text-zinc-500 line-through' :
          isBench ? 'text-zinc-300' :
          'text-white'
        }`}>
          {player.name}
        </span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {player.injuryNote && (
          <span className="text-[10px] text-zinc-500 hidden sm:inline">
            {player.injuryNote}
          </span>
        )}
        <span className={`px-2 py-1 text-[10px] font-bold rounded ${status.bg} ${status.color}`}>
          {player.status}
        </span>
      </div>
    </div>
  )
}

export default MatchContextSection
