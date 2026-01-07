'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface TeamGameDay {
  game_id: string
  game_date: string
  opponent: string
  is_home: boolean
  team_pts: number | null
  opp_pts: number | null
  result: 'W' | 'L' | 'Scheduled'
  point_diff: number | null
  game_status: 'Final' | 'Scheduled'
}

interface TeamPresenceCalendarProps {
  games: TeamGameDay[]
  seasonStart: string // e.g. '2025-10-22'
  seasonEnd: string   // e.g. '2026-04-13'
  teamAbbr: string    // e.g. 'ATL', 'LAL'
  fullSize?: boolean  // Enable full viewport mode
  className?: string
}

// Helper to convert date to YYYY-MM-DD string
function toDateKey(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  }
  return date.split('T')[0]
}

// Generate all weeks from season start to season end
function generateCalendarWeeks(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)

  // Adjust to start on Sunday
  const calendarStart = new Date(startDate)
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay())

  const weeks: Date[][] = []
  let currentDate = new Date(calendarStart)

  while (currentDate <= endDate) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

// Get week labels for the calendar header
function getWeekLabels(weeks: Date[][]): { label: string; isFirstOfMonth: boolean }[] {
  let lastMonth = -1

  return weeks.map((week) => {
    const midWeek = week[3] // Use Wednesday as reference
    const month = midWeek.getMonth()
    const day = midWeek.getDate()
    const isFirstOfMonth = month !== lastMonth
    lastMonth = month

    if (isFirstOfMonth) {
      return {
        label: midWeek.toLocaleString('en', { month: 'short' }),
        isFirstOfMonth: true
      }
    } else {
      return {
        label: day.toString(),
        isFirstOfMonth: false
      }
    }
  })
}

// Get color based on game result and point differential
function getSquareColor(
  game: TeamGameDay | undefined,
  isSeasonDate: boolean,
  isFutureDate: boolean,
  isNextWeek: boolean
): string {
  // Only show hatched styling for scheduled games within the next 7 days
  if (game && game.game_status === 'Scheduled' && isNextWeek) {
    return 'scheduled'  // Special marker for hatched styling
  }

  if (!isSeasonDate) {
    return 'bg-transparent'
  }

  // Future date with no game scheduled
  if (isFutureDate && !game) {
    return 'bg-zinc-900/30'  // Lighter for future rest days
  }

  // Past date with no game
  if (!game) {
    return 'bg-zinc-900/50'
  }

  const diff = Math.abs(game.point_diff ?? 0)

  if (game.result === 'W') {
    // Win - emerald gradient based on point differential
    if (diff >= 20) return 'bg-emerald-400'
    if (diff >= 15) return 'bg-emerald-500'
    if (diff >= 10) return 'bg-emerald-600'
    if (diff >= 5) return 'bg-emerald-700'
    return 'bg-emerald-800'
  } else if (game.result === 'L') {
    // Loss - red gradient based on point differential
    if (diff >= 20) return 'bg-red-400'
    if (diff >= 15) return 'bg-red-500'
    if (diff >= 10) return 'bg-red-600'
    if (diff >= 5) return 'bg-red-700'
    return 'bg-red-800'
  }

  return 'bg-zinc-900/50'
}

export function TeamPresenceCalendar({
  games,
  seasonStart,
  seasonEnd,
  teamAbbr,
  fullSize = false,
  className
}: TeamPresenceCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [squareSize, setSquareSize] = useState(fullSize ? 14 : 11)
  const [gapSize, setGapSize] = useState(fullSize ? 2 : 3)
  const [isMobile, setIsMobile] = useState(false)

  // Create a map of date -> game for quick lookup
  const gameMap = useMemo(() => {
    const map = new Map<string, TeamGameDay>()
    games.forEach(game => {
      const dateKey = toDateKey(game.game_date)
      map.set(dateKey, game)
    })
    return map
  }, [games])

  // Generate calendar structure - show past games + 8 weeks ahead
  const weeks = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const seasonStartDate = new Date(seasonStart)
    const seasonEndDate = new Date(seasonEnd)

    // Start from season start to show past games
    const calendarStartDate = seasonStartDate

    // End 8 weeks from today (or season end, whichever is earlier)
    const eightWeeksFromNow = new Date(now)
    eightWeeksFromNow.setDate(eightWeeksFromNow.getDate() + 56) // 8 weeks from today
    const calendarEndDate = eightWeeksFromNow < seasonEndDate ? eightWeeksFromNow : seasonEndDate

    return generateCalendarWeeks(
      calendarStartDate.toISOString().split('T')[0],
      calendarEndDate.toISOString().split('T')[0]
    )
  }, [seasonStart, seasonEnd])
  const weekLabels = useMemo(() => getWeekLabels(weeks), [weeks])

  const seasonStartDate = new Date(seasonStart)
  const seasonEndDate = new Date(seasonEnd)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Stats (only for completed games)
  const completedGames = games.filter(g => g.game_status === 'Final')
  const upcomingGames = games.filter(g => g.game_status === 'Scheduled')
  const totalGames = completedGames.length
  const wins = completedGames.filter(g => g.result === 'W').length
  const losses = completedGames.filter(g => g.result === 'L').length
  const homeGames = completedGames.filter(g => g.is_home)
  const homeWins = homeGames.filter(g => g.result === 'W').length
  const homeLosses = homeGames.length - homeWins
  const awayGames = completedGames.filter(g => !g.is_home)
  const awayWins = awayGames.filter(g => g.result === 'W').length
  const awayLosses = awayGames.length - awayWins
  const avgPointDiff = totalGames > 0
    ? completedGames.reduce((sum, g) => sum + (g.point_diff ?? 0), 0) / totalGames
    : 0

  // Calculate dynamic square size for fullSize mode
  useEffect(() => {
    if (!fullSize || !containerRef.current) return

    const calculateSize = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const mobile = containerWidth < 768
      setIsMobile(mobile)

      const dayLabelsWidth = mobile ? 25 : 35
      const padding = mobile ? 16 : 24
      const availableWidth = containerWidth - dayLabelsWidth - (padding * 2)

      const numWeeks = weeks.length
      const gapEstimate = mobile ? 2 : 3

      const widthBasedSize = Math.floor((availableWidth - ((numWeeks - 1) * gapEstimate)) / numWeeks)
      const newSize = Math.max(8, Math.min(widthBasedSize, 60))
      const newGap = Math.max(1, Math.min(Math.floor(newSize * 0.15), 4))

      setSquareSize(newSize)
      setGapSize(newGap)
    }

    calculateSize()
    window.addEventListener('resize', calculateSize)
    return () => window.removeEventListener('resize', calculateSize)
  }, [fullSize, weeks.length])

  const containerClass = fullSize
    ? "bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg p-2 sm:p-3 md:p-6 w-full h-full flex flex-col"
    : "bg-zinc-900/50 sm:border sm:border-zinc-800 sm:rounded-lg p-2 sm:p-4"

  const headerClass = fullSize
    ? "flex flex-row items-center justify-between mb-3 md:mb-4 gap-2"
    : "flex items-center justify-between mb-4"

  const titleClass = fullSize
    ? "text-lg md:text-xl font-medium text-white"
    : "text-sm font-medium text-white"

  const legendBadgeClass = fullSize
    ? "flex items-center gap-1 md:gap-2 text-xs md:text-sm text-zinc-500"
    : "flex items-center gap-1.5 text-xs text-zinc-500"

  const legendSquareClass = fullSize
    ? "w-3 h-3 md:w-4 md:h-4 rounded-sm"
    : "w-2.5 h-2.5 rounded-sm"

  const dayLabels = isMobile
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div ref={containerRef} className={cn(containerClass, className)}>
      {/* Cinematic Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          PARCOURS
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base tracking-[0.2em] uppercase mt-2">
          Calendrier de la Saison
        </p>

        {/* Stats Pills */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4">
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-400 text-sm font-bold">{wins}W</span>
          </div>
          <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
            <span className="text-red-400 text-sm font-bold">{losses}L</span>
          </div>
          <div className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-full">
            <span className="text-zinc-300 text-sm font-bold font-mono">{totalGames} matchs</span>
          </div>
          {upcomingGames.length > 0 && (
            <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <span className="text-amber-400 text-sm font-bold">{upcomingGames.length} à venir</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend Row */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
        <span className={legendBadgeClass}>
          <span className={`${legendSquareClass} bg-emerald-600`} />
          Victoire
        </span>
        <span className={legendBadgeClass}>
          <span className={`${legendSquareClass} bg-red-600`} />
          Défaite
        </span>
        <span className={legendBadgeClass}>
          <span
            className={legendSquareClass}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.6)',
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.15) 2px,
                rgba(255, 255, 255, 0.15) 4px
              )`
            }}
          />
          Cette semaine
        </span>
        <span className={legendBadgeClass}>
          <span className={`${legendSquareClass} bg-zinc-900/50 border border-zinc-800`} />
          Repos
        </span>
        <span className={legendBadgeClass}>
          <span className={`${legendSquareClass} bg-zinc-800 ring-2 ring-amber-400 ring-offset-1 ring-offset-black`} />
          Aujourd'hui
        </span>
      </div>

      {/* Calendar Grid */}
      <div className={fullSize ? 'flex-1 flex flex-col justify-center' : ''}>
        <div>
          {/* Week labels */}
          <div className="flex items-center" style={{ marginBottom: `${gapSize}px` }}>
            <div
              className="font-mono opacity-0"
              style={{
                paddingRight: `${gapSize * 2}px`,
                fontSize: fullSize ? (isMobile ? '10px' : '12px') : '10px'
              }}
            >
              {isMobile ? 'S' : 'Sun'}
            </div>
            <div className="flex" style={{ gap: `${gapSize}px` }}>
              {weekLabels.map((label, i) => (
                <div
                  key={i}
                  className={`text-center ${
                    label.isFirstOfMonth
                      ? 'text-zinc-300 font-semibold'
                      : 'text-zinc-600'
                  }`}
                  style={{
                    width: `${squareSize}px`,
                    fontSize: fullSize ? '10px' : '8px'
                  }}
                  title={`Week ${i + 1}`}
                >
                  {isMobile ? (label.isFirstOfMonth ? label.label : '') : label.label}
                </div>
              ))}
            </div>
          </div>

          {/* Day labels + Grid */}
          <div className="flex">
            <div
              className="flex flex-col text-zinc-600 font-mono"
              style={{
                gap: `${gapSize}px`,
                paddingRight: `${gapSize * 2}px`,
                fontSize: fullSize ? (isMobile ? '10px' : '12px') : '10px'
              }}
            >
              {dayLabels.map((day, idx) => (
                <span
                  key={idx}
                  style={{
                    height: `${squareSize}px`,
                    lineHeight: `${squareSize}px`
                  }}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Grid of squares */}
            <div className="flex" style={{ gap: `${gapSize}px` }}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col" style={{ gap: `${gapSize}px` }}>
                  {week.map((date, dayIndex) => {
                    const dateKey = date.toISOString().split('T')[0]
                    const todayKey = today.toISOString().split('T')[0]
                    const game = gameMap.get(dateKey)
                    const isSeasonDate = date >= seasonStartDate && date <= seasonEndDate
                    const isFutureDate = date > today
                    const isToday = dateKey === todayKey
                    // Check if date is within next 7 days
                    const nextWeekEnd = new Date(today)
                    nextWeekEnd.setDate(today.getDate() + 7)
                    const isNextWeek = date > today && date <= nextWeekEnd
                    const color = getSquareColor(game, isSeasonDate, isFutureDate, isNextWeek)

                    // Build tooltip
                    let tooltip = ''
                    if (game) {
                      const homeAway = game.is_home ? 'H' : 'A'
                      if (game.game_status === 'Scheduled') {
                        // Upcoming game
                        tooltip = `${dateKey} - vs ${game.opponent} (${homeAway}) - Scheduled`
                      } else {
                        // Completed game
                        const diffSign = (game.point_diff ?? 0) >= 0 ? '+' : ''
                        tooltip = `vs ${game.opponent} (${homeAway}) - ${game.result} ${game.team_pts}-${game.opp_pts} (${diffSign}${game.point_diff})`
                      }
                    } else if (isSeasonDate) {
                      tooltip = isToday ? 'Today' : dateKey
                    }
                    if (isToday) {
                      tooltip = `TODAY${tooltip ? ' — ' + tooltip : ''}`
                    }

                    const isScheduled = color === 'scheduled'

                    return (
                      <div
                        key={dayIndex}
                        className={`rounded-sm transition-colors cursor-default hover:ring-2 hover:ring-white/20 ${isScheduled ? '' : color} ${isToday ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-black' : ''}`}
                        style={{
                          width: `${squareSize}px`,
                          height: `${squareSize}px`,
                          ...(isScheduled && {
                            border: '1px solid rgba(255, 255, 255, 0.6)',
                            background: `repeating-linear-gradient(
                              45deg,
                              transparent,
                              transparent 2px,
                              rgba(255, 255, 255, 0.15) 2px,
                              rgba(255, 255, 255, 0.15) 4px
                            )`
                          })
                        }}
                        title={tooltip}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Stats Summary */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-zinc-800 ${fullSize ? 'mt-6 pt-4' : 'mt-4 pt-3'}`}>
        <div className={`flex items-center gap-2 text-zinc-500 ${fullSize ? 'text-xs' : 'text-[10px]'}`}>
          <span className="text-zinc-600">Margin:</span>
          <div className="flex items-center gap-1">
            <span className="text-zinc-600">Close</span>
            <div className="flex" style={{ gap: '2px' }}>
              {['bg-emerald-800', 'bg-emerald-700', 'bg-emerald-600', 'bg-emerald-500', 'bg-emerald-400'].map((bg, i) => (
                <span key={i} className={`rounded-sm ${bg}`} style={{ width: '12px', height: '12px' }} />
              ))}
            </div>
            <span className="text-zinc-600">Blowout</span>
          </div>
          <span className="text-zinc-700 mx-1">|</span>
          <div className="flex items-center gap-1">
            <span className="text-zinc-600">Close</span>
            <div className="flex" style={{ gap: '2px' }}>
              {['bg-red-800', 'bg-red-700', 'bg-red-600', 'bg-red-500', 'bg-red-400'].map((bg, i) => (
                <span key={i} className={`rounded-sm ${bg}`} style={{ width: '12px', height: '12px' }} />
              ))}
            </div>
            <span className="text-zinc-600">Blowout</span>
          </div>
        </div>

        <div className={`text-zinc-500 font-mono ${fullSize ? 'text-xs' : 'text-[10px]'}`}>
          <span className="text-zinc-400">{homeWins}-{homeLosses}</span> Home
          <span className="text-zinc-700 mx-2">•</span>
          <span className="text-zinc-400">{awayWins}-{awayLosses}</span> Away
          <span className="text-zinc-700 mx-2">•</span>
          <span className={avgPointDiff >= 0 ? 'text-emerald-500' : 'text-red-500'}>{avgPointDiff >= 0 ? '+' : ''}{avgPointDiff.toFixed(1)}</span> Avg Margin
          {upcomingGames.length > 0 && (
            <>
              <span className="text-zinc-700 mx-2">•</span>
              <span className="text-zinc-300">{upcomingGames.length}</span> <span className="text-zinc-500">Scheduled</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
