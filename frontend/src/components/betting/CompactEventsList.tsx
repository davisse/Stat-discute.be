'use client'

import type { BettingEvent } from '@/lib/queries'

interface CompactEventsListProps {
  events: BettingEvent[]
  selectedEventId: string | null
  onSelectEvent: (eventId: string) => void
}

export function CompactEventsList({
  events,
  selectedEventId,
  onSelectEvent
}: CompactEventsListProps) {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      'Live': { bg: 'bg-green-500', text: 'text-white', label: 'Live' },
      'Scheduled': { bg: 'bg-blue-500', text: 'text-white', label: 'À venir' },
      'Final': { bg: 'bg-gray-500', text: 'text-white', label: 'Terminé' }
    }

    const statusInfo = statusMap[status] || statusMap['Scheduled']

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {status === 'Live' && (
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        )}
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">
          Événements ({events.length})
        </h3>
      </div>

      {/* Events List */}
      <div className="divide-y divide-gray-700">
        {events.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            Aucun événement disponible
          </div>
        ) : (
          events.map((event) => (
            <button
              key={event.event_id}
              onClick={() => onSelectEvent(String(event.event_id))}
              className={`
                w-full px-3 py-2 text-left text-xs transition-all duration-200
                hover:bg-gray-700/30 cursor-pointer
                ${selectedEventId === String(event.event_id)
                  ? 'bg-blue-600/20 border-l-4 border-blue-500'
                  : 'border-l-4 border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Badge */}
                {getStatusBadge(event.status)}

                {/* Teams */}
                <span className="font-bold text-white">
                  {event.away_team} @ {event.home_team}
                </span>

                {/* Separator */}
                <span className="text-gray-500">•</span>

                {/* Time */}
                <span className="text-gray-300">
                  {formatTime(event.game_time)}
                </span>

                {/* Separator */}
                <span className="text-gray-500">•</span>

                {/* Date */}
                <span className="text-gray-400">
                  {formatDate(event.game_time)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
