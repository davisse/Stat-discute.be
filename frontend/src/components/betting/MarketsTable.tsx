'use client'

import { Market, CurrentOdds } from '@/lib/queries'

interface MarketsTableProps {
  markets: Market[]
  currentOdds: Map<number, CurrentOdds[]>
  onSelectMarket: (marketId: number) => void
  selectedMarketId: number | null
}

export function MarketsTable({
  markets,
  currentOdds,
  onSelectMarket,
  selectedMarketId
}: MarketsTableProps) {
  const formatOdds = (oddsDecimal: string, oddsAmerican: number) => {
    return `${parseFloat(oddsDecimal).toFixed(2)} (${oddsAmerican > 0 ? '+' : ''}${oddsAmerican})`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Marchés disponibles
        </h2>
      </div>

      {markets.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">
          Aucun marché disponible. Sélectionnez un match et actualisez les données.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marché
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cotes actuelles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière MAJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {markets.map((market) => {
                const odds = currentOdds.get(market.market_id) || []
                const lastUpdate = new Date(market.last_updated)
                const isSelected = selectedMarketId === market.market_id

                return (
                  <tr
                    key={market.market_id}
                    className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {market.market_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {market.market_key}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {market.market_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {odds.length === 0 ? (
                          <span className="text-sm text-gray-400">Aucune cote</span>
                        ) : (
                          odds.map((odd, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-gray-900">
                                {odd.selection}:
                              </span>{' '}
                              <span className="text-gray-600">
                                {formatOdds(odd.odds_decimal, odd.odds_american)}
                              </span>
                              {odd.handicap && (
                                <span className="ml-2 text-gray-500">
                                  ({odd.handicap})
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lastUpdate.toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectMarket(market.market_id)}
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'text-blue-600'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        {isSelected ? 'Graphique actif' : 'Voir historique'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
