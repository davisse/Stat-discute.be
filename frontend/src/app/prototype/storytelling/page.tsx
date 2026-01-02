'use client'

import * as React from 'react'
import Link from 'next/link'
import { colors } from '@/lib/design-tokens'

interface TonightGame {
  gameId: string
  gameDate: string
  gameTime: string
  awayTeam: {
    teamId: number
    abbreviation: string
    name: string
    record: string
    ppg: number
  }
  homeTeam: {
    teamId: number
    abbreviation: string
    name: string
    record: string
    ppg: number
  }
  betting: {
    total: number | null
    spread: number | null
    awayML: number | null
    homeML: number | null
  }
  status: string
}

interface TonightData {
  date: string
  games: TonightGame[]
  count: number
}

export default function StorytellingLanding() {
  const [data, setData] = React.useState<TonightData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analysis/storytelling/tonight')
        if (!response.ok) {
          throw new Error('Failed to fetch games')
        }
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format today's date
  const formattedDate = data?.date
    ? new Date(data.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : ''

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: colors.background,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      >
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p style={{ color: colors.gray[400] }}>Chargement des matchs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: colors.background,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      >
        <div className="text-center">
          <p style={{ color: colors.gray[400] }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: colors.background,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }}
    >
      {/* Header */}
      <header className="px-8 py-6 border-b" style={{ borderColor: colors.gray[800] }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/logo-v5.png"
              alt="Stat Discute"
              className="h-12 w-auto"
            />
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.gray[600] }}>
              Analyse Totaux
            </div>
            <div className="font-medium capitalize" style={{ color: colors.foreground }}>
              {formattedDate}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1
              className="text-5xl font-bold mb-4"
              style={{ color: colors.foreground }}
            >
              Matchs du Soir
            </h1>
            <p className="text-xl" style={{ color: colors.gray[400] }}>
              {data?.count || 0} matchs disponibles pour analyse
            </p>
          </div>

          {/* Games Grid */}
          {data?.games && data.games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.games.map((game) => (
                <GameCard key={game.gameId} game={game} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-20 rounded-2xl"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: `1px dashed ${colors.gray[700]}`,
              }}
            >
              <div className="text-6xl mb-4">🏀</div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: colors.foreground }}
              >
                Pas de matchs ce soir
              </h3>
              <p style={{ color: colors.gray[500] }}>
                Revenez demain pour de nouvelles analyses !
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function GameCard({ game }: { game: TonightGame }) {
  const [isHovered, setIsHovered] = React.useState(false)

  // Calculate projected total from PPGs
  const projectedTotal = game.awayTeam.ppg + game.homeTeam.ppg
  const hasLine = game.betting.total !== null
  const diffVsLine = hasLine
    ? projectedTotal - (game.betting.total as number)
    : 0

  return (
    <Link
      href={`/prototype/storytelling/${game.gameId}`}
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${isHovered ? colors.gray[600] : colors.gray[800]}`,
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered
            ? '0 20px 40px rgba(0, 0, 0, 0.4)'
            : '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Team Logos Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={`https://cdn.nba.com/logos/nba/${game.awayTeam.teamId}/global/L/logo.svg`}
            alt=""
            className="absolute -left-8 -top-8 opacity-10"
            style={{ width: '180px', height: '180px', filter: 'grayscale(100%)' }}
          />
          <img
            src={`https://cdn.nba.com/logos/nba/${game.homeTeam.teamId}/global/L/logo.svg`}
            alt=""
            className="absolute -right-8 -bottom-8 opacity-10"
            style={{ width: '180px', height: '180px', filter: 'grayscale(100%)' }}
          />
        </div>

        {/* Content */}
        <div className="relative p-6">
          {/* Time & Status */}
          <div className="flex items-center justify-between mb-4">
            <div
              className="text-xs uppercase tracking-widest"
              style={{ color: colors.gray[500] }}
            >
              {formatGameTime(game.gameTime)}
            </div>
            {hasLine && (
              <div
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: colors.foreground,
                }}
              >
                O/U {game.betting.total}
              </div>
            )}
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between mb-6">
            {/* Away Team */}
            <div className="flex items-center gap-3">
              <img
                src={`https://cdn.nba.com/logos/nba/${game.awayTeam.teamId}/global/L/logo.svg`}
                alt={game.awayTeam.abbreviation}
                className="w-14 h-14"
              />
              <div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: colors.foreground }}
                >
                  {game.awayTeam.abbreviation}
                </div>
                <div className="text-sm" style={{ color: colors.gray[500] }}>
                  {game.awayTeam.record}
                </div>
              </div>
            </div>

            {/* @ */}
            <div
              className="text-2xl font-light"
              style={{ color: colors.gray[600] }}
            >
              @
            </div>

            {/* Home Team */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div
                  className="text-2xl font-bold"
                  style={{ color: colors.foreground }}
                >
                  {game.homeTeam.abbreviation}
                </div>
                <div className="text-sm" style={{ color: colors.gray[500] }}>
                  {game.homeTeam.record}
                </div>
              </div>
              <img
                src={`https://cdn.nba.com/logos/nba/${game.homeTeam.teamId}/global/L/logo.svg`}
                alt={game.homeTeam.abbreviation}
                className="w-14 h-14"
              />
            </div>
          </div>

          {/* Stats Row */}
          <div
            className="grid grid-cols-3 gap-4 pt-4 border-t"
            style={{ borderColor: colors.gray[800] }}
          >
            <div className="text-center">
              <div
                className="text-lg font-bold font-mono"
                style={{ color: colors.foreground }}
              >
                {game.awayTeam.ppg.toFixed(1)}
              </div>
              <div className="text-xs" style={{ color: colors.gray[600] }}>
                {game.awayTeam.abbreviation} PPG
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-lg font-bold font-mono"
                style={{
                  color: diffVsLine > 0 ? 'rgb(29, 193, 0)' : diffVsLine < 0 ? 'rgb(239, 45, 44)' : colors.foreground,
                }}
              >
                {projectedTotal.toFixed(1)}
              </div>
              <div className="text-xs" style={{ color: colors.gray[600] }}>
                Proj. Total
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-lg font-bold font-mono"
                style={{ color: colors.foreground }}
              >
                {game.homeTeam.ppg.toFixed(1)}
              </div>
              <div className="text-xs" style={{ color: colors.gray[600] }}>
                {game.homeTeam.abbreviation} PPG
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            className="mt-4 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: isHovered ? colors.foreground : colors.gray[500],
            }}
          >
            <span className="text-sm font-medium">Voir l'analyse</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 0.3s ease',
              }}
            >
              <path
                d="M9 5L15 12L9 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

function formatGameTime(gameTime: string): string {
  if (!gameTime) return 'TBD'

  // Parse time (expected format: HH:MM or similar)
  try {
    const [hours, minutes] = gameTime.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period} ET`
  } catch {
    return gameTime
  }
}
