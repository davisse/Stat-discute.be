'use client'

import { useState } from 'react'
import { Search, RefreshCw, ChevronDown, ChevronUp, TrendingUp, Calendar, Activity } from 'lucide-react'

interface Match {
  id: string
  type: 'ML' | 'SPREAD' | 'TOTAL' | 'OTHER'
  description: string
  odds: string
  movement: string
}

export default function OddsTrackerPage() {
  const [selectedMarket, setSelectedMarket] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = useState(false)

  // Mock data
  const events = [
    { id: '1', teams: 'DEN @ GSW', time: '04:30', date: '24 oct.' },
    { id: '2', teams: 'HOU @ CLE', time: '01:10', date: '19 nov.' },
    { id: '3', teams: 'CHA @ IND', time: '01:10', date: '19 nov.' },
    { id: '4', teams: 'TOR @ PHI', time: '01:10', date: '19 nov.' },
    { id: '5', teams: 'GSW @ MIA', time: '01:40', date: '19 nov.' }
  ]

  const stats = {
    activeEvents: 5,
    availableMarkets: 126,
    lastUpdate: '643h',
    liveRate: '0%'
  }

  const matches: Match[] = [
    { id: '1', type: 'ML', description: 'Moneyline (1st Half Spread) - Denver Nuggets', odds: '2.02 (+102)', movement: '+102' },
    { id: '2', type: 'ML', description: 'Moneyline (1st Half Spread) - Golden State Warriors', odds: '1.85 (-117)', movement: '-117' },
    // Add more mock data as needed
  ]

  const toggleEvent = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsUpdating(false)
  }

  const marketTypes = [
    { id: 'all', label: 'Tous les marchés', count: null },
    { id: 'moneyline', label: 'Money Line', count: 8 },
    { id: 'spread', label: 'Spread (Handicap)', count: 13 },
    { id: 'total', label: 'Total (Over/Under)', count: 50 },
    { id: 'props', label: 'Player Props', count: 51 }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold mb-2">Tracker des Cotes Pinnacle</h1>
          <p className="text-sm text-gray-400">Dashboard de trading en temps réel</p>
        </div>
      </header>

      {/* Stats Cards - Horizontal Scroll on Mobile */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="flex overflow-x-auto gap-3 px-4 py-4 no-scrollbar">
          <div className="flex-shrink-0 bg-gray-900 rounded-lg p-3 border border-gray-800 min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Événements actifs</span>
            </div>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
          </div>

          <div className="flex-shrink-0 bg-gray-900 rounded-lg p-3 border border-gray-800 min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Marchés disponibles</span>
            </div>
            <div className="text-2xl font-bold">{stats.availableMarkets}</div>
            <div className="text-xs text-gray-500 mt-1">Match adj. 1/6</div>
          </div>

          <div className="flex-shrink-0 bg-gray-900 rounded-lg p-3 border border-gray-800 min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Dernier MAJ</span>
            </div>
            <div className="text-2xl font-bold">Il y a {stats.lastUpdate}</div>
            <div className="text-xs text-gray-500 mt-1">74/79 restant</div>
          </div>

          <div className="flex-shrink-0 bg-gray-900 rounded-lg p-3 border border-gray-800 min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Taux live</span>
            </div>
            <div className="text-2xl font-bold">{stats.liveRate}</div>
            <div className="text-xs text-gray-500 mt-1">En jeu maintenant</div>
          </div>
        </div>
      </div>

      {/* Update Button - Fixed on Mobile */}
      <div className="sticky top-[88px] z-40 bg-black border-b border-gray-800 px-4 py-3">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Actualisation...' : 'Actualiser les données Pinnacle'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Lance le scraper Python pour récupérer les dernières cotes
        </p>
      </div>

      {/* Search - Mobile Optimized */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un match... (équipe, date)"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
          />
        </div>
      </div>

      {/* Events List - Collapsible */}
      <div className="border-b border-gray-800">
        <div className="px-4 py-3 bg-gray-950">
          <h2 className="text-sm font-semibold text-gray-400">
            Événements ({events.length} résultats trouvés)
          </h2>
        </div>

        <div className="divide-y divide-gray-800">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => toggleEvent(event.id)}
              className="w-full text-left px-4 py-3 hover:bg-gray-950 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                      À venir
                    </span>
                    <span className="text-white font-medium">{event.teams}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {event.time} • {event.date}
                  </div>
                </div>
                {expandedEvents.has(event.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Market Type Filter - Horizontal Scroll */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Type de marché</h3>
          <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
            {marketTypes.map((market) => (
              <button
                key={market.id}
                onClick={() => setSelectedMarket(market.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMarket === market.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {market.label}
                {market.count !== null && (
                  <span className="ml-2 text-xs opacity-75">({market.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matches List - Mobile Cards */}
      <div className="px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-400">
            Matchés ({matches.length})
          </h3>
        </div>

        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      match.type === 'ML'
                        ? 'bg-blue-600/20 text-blue-400'
                        : match.type === 'SPREAD'
                        ? 'bg-purple-600/20 text-purple-400'
                        : match.type === 'TOTAL'
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-orange-600/20 text-orange-400'
                    }`}
                  >
                    {match.type}
                  </span>
                  <button className="text-gray-400 hover:text-white p-1">
                    <TrendingUp className="w-5 h-5" />
                  </button>
                </div>

                <h4 className="text-white font-medium mb-2 leading-snug">
                  {match.description}
                </h4>

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Cotes</div>
                    <div className="text-white font-bold">{match.odds}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Mouvement</div>
                    <div
                      className={`font-bold ${
                        match.movement.startsWith('+')
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {match.movement}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
            <div className="text-gray-400 mb-2">
              Aucune donnée historique disponible pour ce marché
            </div>
            <p className="text-sm text-gray-500">
              Sélectionnez un marché dans le tableau ci-dessus pour visualiser l'évolution des cotes
            </p>
          </div>
        )}
      </div>

      {/* Add spacing at bottom for mobile scrolling */}
      <div className="h-20" />
    </div>
  )
}
