'use client'

import { useEffect, useState, useCallback } from 'react'
import { AppLayout } from '@/components/layout'
import { DatePicker, GameCard, GameSection } from '@/components/games'
import type { GameWithOdds } from '@/lib/queries'

// Helper to get date strings
function getDateString(daysOffset: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

function formatDateHeader(dateStr: string): string {
  const today = getDateString()
  const yesterday = getDateString(-1)

  if (dateStr === today) return "Ce soir"
  if (dateStr === yesterday) return "Hier"

  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

export default function GamesPage() {
  const today = getDateString()
  const yesterday = getDateString(-1)

  const [selectedDate, setSelectedDate] = useState(today)
  const [games, setGames] = useState<GameWithOdds[]>([])
  const [yesterdayGames, setYesterdayGames] = useState<GameWithOdds[]>([])
  const [gamesPerDay, setGamesPerDay] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Fetch games for a specific date
  const fetchGamesForDate = useCallback(async (date: string): Promise<GameWithOdds[]> => {
    try {
      const res = await fetch(`/api/games?date=${date}`)
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  }, [])

  // Fetch games count for date range (for DatePicker indicators)
  const fetchGamesCount = useCallback(async (): Promise<Record<string, number>> => {
    try {
      const startDate = getDateString(-3)
      const endDate = getDateString(3)
      const res = await fetch(`/api/games/count?start=${startDate}&end=${endDate}`)
      if (!res.ok) return {}
      const data = await res.json()
      return data.reduce((acc: Record<string, number>, item: { date: string; count: number }) => {
        acc[item.date] = item.count
        return acc
      }, {})
    } catch {
      return {}
    }
  }, [])

  // Initial load
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true)
      const [todayData, yesterdayData, counts] = await Promise.all([
        fetchGamesForDate(today),
        fetchGamesForDate(yesterday),
        fetchGamesCount()
      ])
      setGames(todayData)
      setYesterdayGames(yesterdayData)
      setGamesPerDay(counts)
      setLoading(false)
    }
    loadInitialData()
  }, [today, yesterday, fetchGamesForDate, fetchGamesCount])

  // Load games when date changes
  useEffect(() => {
    async function loadGamesForSelectedDate() {
      if (selectedDate === today) return // Already loaded
      setLoading(true)
      const data = await fetchGamesForDate(selectedDate)
      setGames(data)
      setLoading(false)
    }
    loadGamesForSelectedDate()
  }, [selectedDate, today, fetchGamesForDate])

  // Handle date change
  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate)
    // Update counts around new date
    const counts = await fetchGamesCount()
    setGamesPerDay(counts)
  }

  const showYesterdaySection = selectedDate === today
  const dateHeader = formatDateHeader(selectedDate)

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-11rem)] px-4 md:px-8 py-6 max-w-6xl mx-auto">
        {/* Date Picker */}
        <div className="mb-6">
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            gamesPerDay={gamesPerDay}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Selected Date Games */}
            <GameSection
              title={dateHeader}
              games={games}
              emptyMessage={selectedDate === today ? "Pas de matchs ce soir" : "Aucun match"}
            />

            {/* Yesterday's Results (only shown when viewing today) */}
            {showYesterdaySection && (
              <GameSection
                title="Hier"
                subtitle="Résultats"
                games={yesterdayGames}
                emptyMessage="Aucun match hier"
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
