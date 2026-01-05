'use client'

import { BettingEvent } from '@/lib/queries'

interface GamesSelectorProps {
  events: BettingEvent[]
  selectedEventId: string | null
  onSelectEvent: (eventId: string) => void
}

export function GamesSelector({ events, selectedEventId, onSelectEvent }: GamesSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Sélectionner un match
      </h2>

      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun match disponible avec des cotes</p>
        ) : (
          events.map((event) => {
            const eventDate = new Date(event.game_time)
            const isSelected = selectedEventId === String(event.event_id)

            return (
              <button
                key={event.event_id}
                onClick={() => onSelectEvent(String(event.event_id))}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">
                        {event.away_team}
                      </span>
                      <span className="text-gray-500">@</span>
                      <span className="font-semibold text-gray-900">
                        {event.home_team}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.away_team} @ {event.home_team}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {eventDate.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {eventDate.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {event.status}
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
