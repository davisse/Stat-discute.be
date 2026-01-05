'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'

interface Team {
  team_id: number
  full_name: string
  abbreviation: string
  city?: string
  conference?: string
  division?: string
}


// Group teams by conference and division
const CONFERENCE_DIVISIONS = {
  East: ['Atlantic', 'Central', 'Southeast'],
  West: ['Northwest', 'Pacific', 'Southwest'],
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch teams and rankings on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/teams')
        const data = await res.json()
        setTeams(data)
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter teams based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams

    const query = searchQuery.toLowerCase()
    return teams.filter(team =>
      team.full_name.toLowerCase().includes(query) ||
      team.abbreviation.toLowerCase().includes(query) ||
      (team.city && team.city.toLowerCase().includes(query))
    )
  }, [teams, searchQuery])

  // Sort teams alphabetically
  const sortedTeams = useMemo(() => {
    return [...filteredTeams].sort((a, b) => a.full_name.localeCompare(b.full_name))
  }, [filteredTeams])

  return (
    <AppLayout>
      <div className="px-8 pt-8 max-w-7xl mx-auto pb-16">
        {/* Main Title */}
        <h1 className="text-[clamp(3rem,10vw,8rem)] font-black uppercase tracking-tighter leading-[0.9] text-white">
          ÉQUIPES
        </h1>

        <p className="mt-4 text-xl text-zinc-400 max-w-2xl">
          Sélectionnez une équipe pour voir ses statistiques détaillées, tendances récentes et analyses de totaux.
        </p>

        {/* Search Field */}
        <div className="mt-8 max-w-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isLoading ? "Chargement..." : "Filtrer les équipes..."}
            disabled={isLoading}
            className="w-full px-6 py-4 bg-zinc-900/50 border border-zinc-700 rounded-lg
                       text-white placeholder-zinc-500 text-lg
                       focus:outline-none focus:border-white focus:ring-1 focus:ring-white
                       transition-all duration-300 disabled:opacity-50"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-12 flex items-center gap-3 text-zinc-500">
            <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
            <span>Chargement des équipes...</span>
          </div>
        )}

        {/* Teams Grid */}
        {!isLoading && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedTeams.map((team) => (
              <Link
                key={team.team_id}
                href={`/teams/${team.team_id}`}
                className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg
                           hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
                           transition-all duration-300"
              >
                {/* Team Logo Background */}
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{
                    backgroundImage: `url(https://cdn.nba.com/logos/nba/${team.team_id}/primary/L/logo.svg)`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                />

                {/* Team Info */}
                <div className="relative z-10">
                  <span className="text-xs font-mono text-zinc-500 mb-1 block">{team.abbreviation}</span>
                  <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                    {team.full_name}
                  </h3>
                </div>

                {/* Arrow */}
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                  →
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && searchQuery && sortedTeams.length === 0 && (
          <div className="mt-12 p-8 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <p className="text-zinc-400">Aucune équipe trouvée pour "{searchQuery}"</p>
          </div>
        )}

        {/* Stats Summary */}
        {!isLoading && teams.length > 0 && (
          <div className="mt-16 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              {searchQuery ? `${sortedTeams.length} équipe${sortedTeams.length > 1 ? 's' : ''} trouvée${sortedTeams.length > 1 ? 's' : ''}` : `${teams.length} équipes NBA`}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
