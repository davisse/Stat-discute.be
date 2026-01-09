'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  selectedDate: string // YYYY-MM-DD format
  onDateChange: (date: string) => void
  gamesPerDay: Record<string, number>
}

function formatDayLabel(dateStr: string, isToday: boolean): { day: string; date: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const day = date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
  const dateNum = date.getDate().toString()

  if (isToday) {
    return { day: "Auj.", date: dateNum }
  }

  return { day, date: dateNum }
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T12:00:00')
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function getDateRange(centerDate: string): string[] {
  const dates: string[] = []
  for (let i = -3; i <= 3; i++) {
    dates.push(addDays(centerDate, i))
  }
  return dates
}

export function DatePicker({ selectedDate, onDateChange, gamesPerDay }: DatePickerProps) {
  const today = new Date().toISOString().split('T')[0]
  const dates = getDateRange(selectedDate)

  const handlePrev = () => {
    onDateChange(addDays(selectedDate, -1))
  }

  const handleNext = () => {
    onDateChange(addDays(selectedDate, 1))
  }

  return (
    <div className="flex items-center justify-center gap-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-2">
      {/* Previous Button */}
      <button
        onClick={handlePrev}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        aria-label="Jour précédent"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Date Buttons */}
      <div className="flex items-center gap-1">
        {dates.map((date) => {
          const isSelected = date === selectedDate
          const isToday = date === today
          const { day, date: dateNum } = formatDayLabel(date, isToday)
          const gameCount = gamesPerDay[date] || 0

          return (
            <button
              key={date}
              onClick={() => onDateChange(date)}
              className={`
                relative flex flex-col items-center justify-center
                min-w-[52px] px-2 py-2 rounded-lg transition-all
                ${isSelected
                  ? 'bg-white text-black'
                  : isToday
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }
              `}
            >
              <span className={`text-[10px] uppercase tracking-wide ${isSelected ? 'text-zinc-600' : ''}`}>
                {day}
              </span>
              <span className={`text-lg font-bold ${isSelected ? 'text-black' : ''}`}>
                {dateNum}
              </span>
              {gameCount > 0 && (
                <span className={`text-[10px] ${isSelected ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {gameCount} match{gameCount > 1 ? 's' : ''}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        aria-label="Jour suivant"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
