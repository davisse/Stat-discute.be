'use client'

import { Market, CurrentOdds } from '@/lib/queries'

interface CompactMarketsGridProps {
  markets: Market[]
  currentOdds: Map<number, CurrentOdds[]>
  onSelectMarket: (marketId: number) => void
  selectedMarketId: number | null
}

const formatOdds = (decimal: string, american: number) => {
  return `${parseFloat(decimal).toFixed(2)} (${american > 0 ? '+' : ''}${american})`
}

const getMarketTypeBadge = (marketType: string) => {
  const badgeClasses = {
    moneyline: 'bg-blue-500/20 text-blue-300',
    spread: 'bg-purple-500/20 text-purple-300',
    total: 'bg-green-500/20 text-green-300',
    prop: 'bg-orange-500/20 text-orange-300',
  }

  const labels = {
    moneyline: 'ML',
    spread: 'SPR',
    total: 'TOT',
    prop: 'PROP',
  }

  const type = marketType.toLowerCase() as keyof typeof badgeClasses
  const badgeClass = badgeClasses[type] || 'bg-gray-500/20 text-gray-300'
  const label = labels[type] || marketType.slice(0, 4).toUpperCase()

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeClass}`}>
      {label}
    </span>
  )
}

export function CompactMarketsGrid({
  markets,
  currentOdds,
  onSelectMarket,
  selectedMarketId,
}: CompactMarketsGridProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">
              Marchés ({markets.length})
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">
              Cotes
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 w-16">
              Chart
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {markets.map((market) => {
            const odds = currentOdds.get(market.market_id) || []
            const isSelected = selectedMarketId === market.market_id

            // Format odds inline (e.g., "2.05 (+104) | 1.85 (-118)")
            const oddsText = odds.length > 0
              ? odds
                  .map((odd) => formatOdds(odd.odds_decimal, odd.odds_american))
                  .join(' | ')
              : 'N/A'

            return (
              <tr
                key={market.market_id}
                onClick={() => onSelectMarket(market.market_id)}
                className={`
                  cursor-pointer transition-colors h-8
                  ${isSelected ? 'bg-blue-600/20' : 'hover:bg-gray-700/30'}
                `}
              >
                {/* Market name + type badge */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {getMarketTypeBadge(market.market_type)}
                    <span className="text-xs text-gray-200 truncate">
                      {market.market_name}
                    </span>
                  </div>
                </td>

                {/* Odds inline */}
                <td className="px-3 py-2">
                  <span className="text-xs text-gray-300 font-mono">
                    {oddsText}
                  </span>
                </td>

                {/* Chart icon button */}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectMarket(market.market_id)
                    }}
                    className="text-lg hover:scale-110 transition-transform"
                    aria-label="View chart"
                  >
                    📊
                  </button>
                </td>
              </tr>
            )
          })}

          {markets.length === 0 && (
            <tr>
              <td colSpan={3} className="px-3 py-8 text-center text-sm text-gray-500">
                Aucun marché disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
