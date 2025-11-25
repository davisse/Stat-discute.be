'use client'

interface MarketTypeFilterProps {
  selectedType: string
  onSelectType: (type: string) => void
  marketCounts: Record<string, number>
}

const MARKET_TYPES = [
  { value: 'all', label: 'Tous les marchés' },
  { value: 'moneyline', label: 'Money Line' },
  { value: 'spread', label: 'Spread (Handicap)' },
  { value: 'total', label: 'Total (Over/Under)' },
  { value: 'player_prop', label: 'Player Props' }
]

export function MarketTypeFilter({
  selectedType,
  onSelectType,
  marketCounts
}: MarketTypeFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Type de marché
      </h2>

      <div className="flex flex-wrap gap-2">
        {MARKET_TYPES.map((type) => {
          const count = marketCounts[type.value] || 0
          const isSelected = selectedType === type.value

          return (
            <button
              key={type.value}
              onClick={() => onSelectType(type.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
              {type.value !== 'all' && (
                <span
                  className={`ml-2 text-sm ${
                    isSelected ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
