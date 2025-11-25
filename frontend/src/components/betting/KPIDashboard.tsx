'use client'

import type { BettingEvent, Market } from '@/lib/queries'

interface KPIDashboardProps {
  totalEvents: number
  liveEventsCount: number
  totalMarkets: number
  selectedMarketCount: number
  lastUpdate: Date | null
}

const getRelativeTime = (date: Date) => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 60) return `Il y a ${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `Il y a ${hours}h`
}

export function KPIDashboard({
  totalEvents,
  liveEventsCount,
  totalMarkets,
  selectedMarketCount,
  lastUpdate
}: KPIDashboardProps) {
  const liveRate = totalEvents > 0
    ? ((liveEventsCount / totalEvents) * 100).toFixed(0)
    : '0'

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Card 1: Événements Actifs */}
      <div className="h-20 bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:scale-[1.02] transition-transform">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 uppercase mb-1">
              Événements Actifs
            </div>
            <div className="text-2xl font-bold">{totalEvents}</div>
            {liveEventsCount > 0 && (
              <div className="text-xs text-green-500 mt-0.5">
                +{liveEventsCount} Live
              </div>
            )}
          </div>
          <div className="text-xl">🏀</div>
        </div>
      </div>

      {/* Card 2: Marchés Disponibles */}
      <div className="h-20 bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:scale-[1.02] transition-transform">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 uppercase mb-1">
              Marchés Disponibles
            </div>
            <div className="text-2xl font-bold">{totalMarkets}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Match sél: {selectedMarketCount}
            </div>
          </div>
          <div className="text-xl">📊</div>
        </div>
      </div>

      {/* Card 3: Dernière MAJ */}
      <div className="h-20 bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:scale-[1.02] transition-transform">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 uppercase mb-1">
              Dernière MAJ
            </div>
            <div className="text-2xl font-bold">
              {lastUpdate ? getRelativeTime(lastUpdate) : 'Jamais'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {lastUpdate
                ? lastUpdate.toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Aucune mise à jour'
              }
            </div>
          </div>
          <div className="text-xl">🔄</div>
        </div>
      </div>

      {/* Card 4: Taux Live */}
      <div className="h-20 bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:scale-[1.02] transition-transform">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 uppercase mb-1">
              Taux Live
            </div>
            <div className="text-2xl font-bold">{liveRate}%</div>
            <div className="text-xs text-gray-500 mt-0.5">
              En direct maintenant
            </div>
          </div>
          <div className="text-xl">📈</div>
        </div>
      </div>
    </div>
  )
}
