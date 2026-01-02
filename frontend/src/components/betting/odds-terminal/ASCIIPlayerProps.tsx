'use client'

import { useState } from 'react'

interface PlayerPropData {
  playerName: string
  game: string
  propType: string
  openLine: number
  currentLine: number
  movement: number
  overOdds: number
  underOdds: number
}

interface ASCIIPlayerPropsProps {
  data: PlayerPropData[]
}

const PROP_TABS = [
  { id: 'points', label: 'POINTS', icon: '🏀' },
  { id: '3pm', label: '3PM', icon: '🎯' },
  { id: 'assists', label: 'ASSISTS', icon: '🤝' },
  { id: 'rebounds', label: 'REBOUNDS', icon: '📊' },
  { id: 'double_double', label: 'DBL-DBL', icon: '✌️' },
]

export function ASCIIPlayerProps({ data }: ASCIIPlayerPropsProps) {
  const [activeTab, setActiveTab] = useState('points')

  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 font-mono text-center py-8">
        No player props data available
      </div>
    )
  }

  // Filter by active prop type
  const filteredData = data.filter(p => p.propType === activeTab)

  // Count props with movement
  const propsWithMovement = data.filter(p => p.movement !== 0).length

  return (
    <div className="font-mono text-sm">
      {/* Summary */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400">Total Props: </span>
            <span className="text-white font-bold">{data.length}</span>
          </div>
          <div>
            <span className="text-gray-400">With Movement: </span>
            <span className="text-amber-500 font-bold">{propsWithMovement}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 border-b border-gray-800 pb-2">
        {PROP_TABS.map((tab) => {
          const count = data.filter(p => p.propType === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-black font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
              <span className="ml-1 text-xs opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Table Header */}
      <div className="text-gray-500 border-b border-gray-800 pb-2 mb-2">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-3">PLAYER</div>
          <div className="col-span-2">GAME</div>
          <div className="col-span-1 text-right">OPEN</div>
          <div className="col-span-1 text-right">CURR</div>
          <div className="col-span-1 text-right">MOV</div>
          <div className="col-span-1 text-right">OVER</div>
          <div className="col-span-1 text-right">UNDER</div>
          <div className="col-span-2 text-right">SIGNAL</div>
        </div>
      </div>

      {/* Rows */}
      {filteredData.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No {activeTab.replace('_', ' ')} props available
        </div>
      ) : (
        [...filteredData]
          .sort((a, b) => b.currentLine - a.currentLine)
          .map((prop, idx) => {
            const movement = prop.movement
            const hasMovement = movement !== 0

            // Determine lean based on juice
            const juiceDiff = prop.overOdds - prop.underOdds
            const juiceLean = juiceDiff < -0.05 ? 'OVER ↑' : juiceDiff > 0.05 ? 'UNDER ↓' : '—'

            // Signal based on line movement
            let signal = ''
            if (movement < -1) {
              signal = '🔥 LINE DROP'
            } else if (movement > 1) {
              signal = '📈 LINE RISE'
            } else if (movement !== 0) {
              signal = movement < 0 ? '↓ -' + Math.abs(movement).toFixed(1) : '↑ +' + movement.toFixed(1)
            }

            return (
              <div
                key={`${prop.playerName}-${prop.propType}-${idx}`}
                className={`grid grid-cols-12 gap-2 items-center py-1 border-b border-gray-800/30 ${
                  hasMovement ? 'bg-gray-900/30' : ''
                }`}
              >
                <div className="col-span-3 text-white truncate">{prop.playerName}</div>
                <div className="col-span-2 text-gray-400 text-xs">{prop.game}</div>
                <div className="col-span-1 text-right text-gray-400">{prop.openLine}</div>
                <div className={`col-span-1 text-right font-bold ${
                  movement < 0 ? 'text-green-400' : movement > 0 ? 'text-red-400' : 'text-white'
                }`}>
                  {prop.currentLine}
                </div>
                <div className={`col-span-1 text-right ${
                  movement < 0 ? 'text-green-500' : movement > 0 ? 'text-red-500' : 'text-gray-600'
                }`}>
                  {movement !== 0 ? (movement > 0 ? '+' : '') + movement.toFixed(1) : '—'}
                </div>
                <div className="col-span-1 text-right text-gray-300">{prop.overOdds.toFixed(2)}</div>
                <div className="col-span-1 text-right text-gray-300">{prop.underOdds.toFixed(2)}</div>
                <div className={`col-span-2 text-right text-xs ${
                  signal.includes('DROP') ? 'text-green-500' :
                  signal.includes('RISE') ? 'text-red-500' :
                  movement < 0 ? 'text-green-400' :
                  movement > 0 ? 'text-red-400' :
                  'text-gray-600'
                }`}>
                  {signal || juiceLean}
                </div>
              </div>
            )
          })
      )}

      {/* Legend */}
      <div className="pt-4 text-xs text-gray-600 flex gap-6">
        <span><span className="text-green-500">🔥 LINE DROP</span> = Sharp under action</span>
        <span><span className="text-red-500">📈 LINE RISE</span> = Sharp over action</span>
      </div>
    </div>
  )
}
