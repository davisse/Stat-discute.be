'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getTeamColors, getTeamLogoUrl, hexToRgba } from '@/lib/team-colors'

interface TeamInfo {
  abbreviation: string
  name: string
  city?: string
  wins: number
  losses: number
}

interface MatchHeaderProps {
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  gameDate: string
  gameTime?: string
}

export function MatchHeader({
  homeTeam,
  awayTeam,
  gameDate,
  gameTime
}: MatchHeaderProps) {
  const homeColors = getTeamColors(homeTeam.abbreviation)
  const awayColors = getTeamColors(awayTeam.abbreviation)

  return (
    <div className="relative">
      {/* Back Navigation */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/games"
          className="group inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium tracking-wide uppercase"
        >
          <span className="w-6 h-6 rounded-full border border-zinc-700 group-hover:border-zinc-500 flex items-center justify-center transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          <span className="hidden sm:inline">Games</span>
        </Link>
      </div>

      {/* Split Screen Hero Container */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-zinc-800/80">
        {/* Date/Time Pill - Floating top center */}
        <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-30">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-zinc-700/50 rounded-full shadow-lg">
            <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-200 tracking-wider uppercase">
              {gameDate} {gameTime && `• ${gameTime}`}
            </span>
          </div>
        </div>

        {/* Split Screen Layout */}
        <div className="relative flex flex-col sm:flex-row min-h-[280px] sm:min-h-[320px]">
          {/* Away Team Panel (Left) */}
          <TeamPanel
            team={awayTeam}
            colors={awayColors}
            side="away"
          />

          {/* Center Divider with VS */}
          <div className="relative z-20 flex items-center justify-center sm:absolute sm:inset-y-0 sm:left-1/2 sm:-translate-x-1/2">
            {/* Horizontal divider (mobile) */}
            <div className="sm:hidden w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Vertical divider (desktop) */}
            <div className="hidden sm:block absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent" />

            {/* Glowing edge effect */}
            <div className="hidden sm:block absolute inset-y-0 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm" />

            {/* VS Badge */}
            <div className="relative py-3 sm:py-0">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-xl bg-white/20 rounded-full scale-150" />

              {/* VS Text */}
              <div className="relative bg-black border border-zinc-600 rounded-full px-4 py-2 sm:px-5 sm:py-3">
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-white drop-shadow-lg">
                  VS
                </span>
              </div>
            </div>
          </div>

          {/* Home Team Panel (Right) */}
          <TeamPanel
            team={homeTeam}
            colors={homeColors}
            side="home"
          />
        </div>
      </div>
    </div>
  )
}

function TeamPanel({
  team,
  colors,
  side
}: {
  team: TeamInfo
  colors: { primary: string; secondary: string }
  side: 'home' | 'away'
}) {
  const isHome = side === 'home'
  const logoUrl = getTeamLogoUrl(team.abbreviation)

  // Derive city from team name if not provided
  const cityName = team.city || team.name.split(' ').slice(0, -1).join(' ') || team.abbreviation

  return (
    <div
      className="relative flex-1 flex flex-col items-center justify-center py-10 sm:py-14 px-4 overflow-hidden"
      style={{
        background: `linear-gradient(${isHome ? '135deg' : '225deg'},
          ${hexToRgba(colors.primary, 0.15)} 0%,
          rgba(0,0,0,0.95) 60%,
          rgba(0,0,0,1) 100%)`
      }}
    >
      {/* Watermark Team Logo - Giant background image */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        {logoUrl && (
          <div
            className="relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[340px] md:h-[340px]"
            style={{
              opacity: 0.08,
              filter: `drop-shadow(0 0 60px ${hexToRgba(colors.primary, 0.3)})`,
              transform: isHome ? 'translateX(20%)' : 'translateX(-20%)'
            }}
          >
            <Image
              src={logoUrl}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* Subtle radial glow from team color */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${isHome ? '70% 30%' : '30% 30%'},
            ${hexToRgba(colors.primary, 0.12)} 0%,
            transparent 50%)`
        }}
      />

      {/* Team Indicator Badge */}
      <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 z-10">
        <span
          className="px-2.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] rounded"
          style={{
            backgroundColor: hexToRgba(colors.primary, 0.3),
            color: '#fff',
            border: `1px solid ${hexToRgba(colors.primary, 0.4)}`
          }}
        >
          {isHome ? 'DOMICILE' : 'EXTÉRIEUR'}
        </span>
      </div>

      {/* Team Content */}
      <div className="relative z-10 text-center">
        {/* City Name - Small */}
        <div className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-[0.25em] mb-1">
          {cityName}
        </div>

        {/* Team Abbreviation - Large dramatic */}
        <div
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none"
          style={{
            color: '#fff',
            textShadow: `0 0 40px ${hexToRgba(colors.primary, 0.5)}, 0 2px 4px rgba(0,0,0,0.8)`
          }}
        >
          {team.abbreviation}
        </div>

        {/* Full Team Name */}
        <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-zinc-400 uppercase tracking-wider">
          {team.name}
        </div>

        {/* Record Badge */}
        <div className="mt-3 sm:mt-4 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm border border-zinc-700/50">
          <span className="text-sm sm:text-base font-bold tabular-nums text-white">
            {team.wins}
          </span>
          <span className="text-zinc-600 text-sm">-</span>
          <span className="text-sm sm:text-base font-bold tabular-nums text-zinc-400">
            {team.losses}
          </span>
        </div>
      </div>

      {/* Corner accent lines */}
      <div
        className={`absolute ${isHome ? 'bottom-4 right-4' : 'bottom-4 left-4'} w-12 sm:w-16 h-px`}
        style={{ backgroundColor: hexToRgba(colors.primary, 0.4) }}
      />
      <div
        className={`absolute ${isHome ? 'bottom-4 right-4' : 'bottom-4 left-4'} w-px h-12 sm:h-16`}
        style={{ backgroundColor: hexToRgba(colors.primary, 0.4) }}
      />
    </div>
  )
}

export default MatchHeader
