'use client'

import { useMemo, useRef, useEffect, useState } from 'react'

export interface GameDay {
  game_id: string
  game_date: string | Date
  played: boolean
  points?: number
  result?: 'W' | 'L'
  opponent?: string
}

// Helper to convert date to YYYY-MM-DD string
function toDateKey(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  }
  return date.split('T')[0]
}

interface PlayerPresenceCalendarProps {
  games: GameDay[]
  seasonStart: string // e.g. '2025-10-22'
  seasonEnd: string   // e.g. '2026-04-13'
  fullSize?: boolean  // Enable full viewport mode (80vh, full width)
}

// Generate all weeks from season start to today (not full season)
function generateCalendarWeeks(start: string) {
  const startDate = new Date(start)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Adjust to start on Sunday
  const calendarStart = new Date(startDate)
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay())

  const weeks: Date[][] = []
  let currentDate = new Date(calendarStart)

  while (currentDate <= today) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

// Get week labels for the calendar header - full granularity
function getWeekLabels(weeks: Date[][]): { label: string; isFirstOfMonth: boolean }[] {
  let lastMonth = -1

  return weeks.map((week) => {
    const midWeek = week[3] // Use Wednesday as reference
    const month = midWeek.getMonth()
    const day = midWeek.getDate()
    const isFirstOfMonth = month !== lastMonth
    lastMonth = month

    // Show month name on first week, then week number (day range)
    if (isFirstOfMonth) {
      return {
        label: midWeek.toLocaleString('en', { month: 'short' }),
        isFirstOfMonth: true
      }
    } else {
      // Show day of month for granularity
      return {
        label: day.toString(),
        isFirstOfMonth: false
      }
    }
  })
}

// Get color based on game performance
function getSquareColor(game: GameDay | undefined, isSeasonDate: boolean, isFutureDate: boolean): string {
  if (!isSeasonDate || isFutureDate) {
    return 'bg-transparent'
  }

  if (!game) {
    // No game on this date
    return 'bg-zinc-900/50'
  }

  if (!game.played) {
    // Player missed the game (DNP)
    return 'bg-red-950 border border-red-900/50'
  }

  // Player played - intensity based on points
  const points = game.points || 0
  if (points >= 30) return 'bg-emerald-400'
  if (points >= 25) return 'bg-emerald-500'
  if (points >= 20) return 'bg-emerald-600'
  if (points >= 15) return 'bg-emerald-700'
  if (points >= 10) return 'bg-emerald-800'
  return 'bg-emerald-900'
}

export default function PlayerPresenceCalendar({
  games,
  seasonStart,
  seasonEnd,
  fullSize = false
}: PlayerPresenceCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [squareSize, setSquareSize] = useState(fullSize ? 14 : 11)
  const [gapSize, setGapSize] = useState(fullSize ? 2 : 3)
  const [isMobile, setIsMobile] = useState(false)

  // Create a map of date -> game for quick lookup
  const gameMap = useMemo(() => {
    const map = new Map<string, GameDay>()
    games.forEach(game => {
      const dateKey = toDateKey(game.game_date)
      map.set(dateKey, game)
    })
    return map
  }, [games])

  // Generate calendar structure (only up to today)
  const weeks = useMemo(() => generateCalendarWeeks(seasonStart), [seasonStart])
  const weekLabels = useMemo(() => getWeekLabels(weeks), [weeks])

  const seasonStartDate = new Date(seasonStart)
  const seasonEndDate = new Date(seasonEnd)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize to start of day

  // Stats
  const totalGames = games.length
  const gamesPlayed = games.filter(g => g.played).length
  const gamesMissed = totalGames - gamesPlayed
  const wins = games.filter(g => g.played && g.result === 'W').length
  const losses = games.filter(g => g.played && g.result === 'L').length

  // Calculate dynamic square size for fullSize mode - WIDTH FIRST to prevent horizontal scroll
  useEffect(() => {
    if (!fullSize || !containerRef.current) return

    const calculateSize = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const mobile = containerWidth < 768
      setIsMobile(mobile)

      // Day labels width: ~30px on mobile (single letter), ~40px on desktop
      const dayLabelsWidth = mobile ? 25 : 35
      const padding = mobile ? 16 : 24
      const availableWidth = containerWidth - dayLabelsWidth - (padding * 2)

      // Grid has ~26 weeks (columns) with gaps
      const numWeeks = weeks.length
      const gapEstimate = mobile ? 2 : 3

      // WIDTH IS PRIORITY - calculate size to fit width perfectly (no horizontal scroll)
      const widthBasedSize = Math.floor((availableWidth - ((numWeeks - 1) * gapEstimate)) / numWeeks)

      // Use width-based size, with reasonable min/max
      const newSize = Math.max(8, Math.min(widthBasedSize, 60))
      const newGap = Math.max(1, Math.min(Math.floor(newSize * 0.15), 4))

      setSquareSize(newSize)
      setGapSize(newGap)
    }

    calculateSize()
    window.addEventListener('resize', calculateSize)
    return () => window.removeEventListener('resize', calculateSize)
  }, [fullSize, weeks.length])

  // Dynamic styles based on fullSize mode
  // Mobile: auto height, no vertical whitespace. Desktop: can use more height
  const containerClass = fullSize
    ? "bg-zinc-950 border border-zinc-800 rounded-2xl p-3 md:p-6 w-full h-full flex flex-col"
    : "bg-zinc-950 border border-zinc-800 rounded-lg p-6"

  const headerClass = fullSize
    ? "flex flex-row items-center justify-between mb-3 md:mb-4 gap-2"
    : "flex items-center justify-between mb-6"

  const titleClass = fullSize
    ? "text-2xl md:text-4xl font-black text-white uppercase"
    : "text-xl md:text-2xl font-black text-white uppercase"

  const legendBadgeClass = fullSize
    ? "flex items-center gap-1 md:gap-2 text-xs md:text-sm text-zinc-500"
    : "flex items-center gap-1.5 text-xs text-zinc-500"

  const legendSquareClass = fullSize
    ? "w-3 h-3 md:w-4 md:h-4 rounded-sm"
    : "w-2.5 h-2.5 rounded-sm"

  // Day labels - single letter on mobile, full on desktop
  const dayLabels = isMobile
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div ref={containerRef} className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <div className="flex items-baseline gap-2">
          <h3 className={titleClass} style={{ letterSpacing: '-0.05em' }}>
            Game
          </h3>
          <span className={`${titleClass.replace('text-white', 'text-zinc-600').replace('font-black', 'font-light')}`} style={{ letterSpacing: '-0.05em' }}>
            Presence
          </span>
        </div>
        <div className={`flex items-center gap-4 ${fullSize ? 'gap-6' : 'gap-4'}`}>
          <span className={legendBadgeClass}>
            <span className={`${legendSquareClass} bg-emerald-600`} />
            Played ({gamesPlayed})
          </span>
          <span className={legendBadgeClass}>
            <span className={`${legendSquareClass} bg-red-950 border border-red-900/50`} />
            Missed ({gamesMissed})
          </span>
        </div>
      </div>

      {/* Calendar Grid - NO horizontal scroll, width-fitted */}
      <div className={fullSize ? 'flex-1 flex flex-col justify-center' : ''}>
        <div>
          {/* Week labels - Full granularity */}
          <div className="flex items-center" style={{ marginBottom: `${gapSize}px` }}>
            {/* Spacer matching day labels column */}
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
                  {/* On mobile, only show month names, not day numbers */}
                  {isMobile ? (label.isFirstOfMonth ? label.label : '') : label.label}
                </div>
              ))}
            </div>
          </div>

          {/* Day labels + Grid */}
          <div className="flex">
            {/* Day labels - Responsive (single letter on mobile) */}
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
                    const game = gameMap.get(dateKey)
                    const isSeasonDate = date >= seasonStartDate && date <= seasonEndDate
                    const isFutureDate = date > today
                    const color = getSquareColor(game, isSeasonDate, isFutureDate)

                    return (
                      <div
                        key={dayIndex}
                        className={`rounded-sm ${color} transition-colors cursor-default hover:ring-2 hover:ring-white/20`}
                        style={{
                          width: `${squareSize}px`,
                          height: `${squareSize}px`
                        }}
                        title={
                          game && !isFutureDate
                            ? `${dateKey}\n${game.opponent ? `vs ${game.opponent}` : ''}\n${game.played ? `${game.points} pts (${game.result})` : 'DNP'}`
                            : isSeasonDate && !isFutureDate ? dateKey : ''
                        }
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={`flex items-center justify-between border-t border-zinc-800 ${fullSize ? 'mt-4 pt-4' : 'mt-4 pt-4'}`}>
        <div className={`flex items-center gap-2 text-zinc-500 ${fullSize ? 'text-sm' : 'text-[10px]'}`}>
          <span>Less</span>
          <div className="flex" style={{ gap: fullSize ? '3px' : '2px' }}>
            {['bg-emerald-900', 'bg-emerald-800', 'bg-emerald-700', 'bg-emerald-600', 'bg-emerald-500', 'bg-emerald-400'].map((bg, i) => (
              <span
                key={i}
                className={`rounded-sm ${bg}`}
                style={{
                  width: fullSize ? '16px' : '10px',
                  height: fullSize ? '16px' : '10px'
                }}
              />
            ))}
          </div>
          <span>More pts</span>
        </div>

        <div className={`text-zinc-400 ${fullSize ? 'text-base font-medium' : 'text-xs'}`}>
          {gamesPlayed} games • {wins}W-{losses}L
        </div>
      </div>
    </div>
  )
}
