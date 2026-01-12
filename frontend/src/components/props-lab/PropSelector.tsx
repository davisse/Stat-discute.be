'use client'

import { useState, useRef, useEffect } from 'react'

// Standard NBA player props
export const PLAYER_PROPS = [
  { id: 'pts', label: 'PTS', name: 'Points', defaultLine: 20.5 },
  { id: 'reb', label: 'REB', name: 'Rebonds', defaultLine: 6.5 },
  { id: 'ast', label: 'AST', name: 'Assists', defaultLine: 5.5 },
  { id: '3pm', label: '3PM', name: '3-Points', defaultLine: 2.5 },
  { id: 'pts_reb', label: 'P+R', name: 'Points + Rebonds', defaultLine: 28.5 },
  { id: 'pts_ast', label: 'P+A', name: 'Points + Assists', defaultLine: 26.5 },
  { id: 'pts_reb_ast', label: 'PRA', name: 'Pts + Reb + Ast', defaultLine: 35.5 },
  { id: 'stl', label: 'STL', name: 'Steals', defaultLine: 1.5 },
  { id: 'blk', label: 'BLK', name: 'Blocks', defaultLine: 0.5 },
  { id: 'reb_ast', label: 'R+A', name: 'Rebonds + Assists', defaultLine: 12.5 },
  { id: 'to', label: 'TO', name: 'Turnovers', defaultLine: 3.5 },
] as const

export type PropId = typeof PLAYER_PROPS[number]['id']

export interface SelectedProp {
  id: PropId
  label: string
  name: string
  line: number
}

interface PropSelectorProps {
  onPropSelect: (prop: SelectedProp | null) => void
  selectedProp: SelectedProp | null
}

export function PropSelector({ onPropSelect, selectedProp }: PropSelectorProps) {
  const [activePropId, setActivePropId] = useState<PropId | null>(selectedProp?.id || null)
  const [line, setLine] = useState<number>(selectedProp?.line || 20.5)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Find active prop details
  const activeProp = PLAYER_PROPS.find(p => p.id === activePropId)

  // Update line when prop changes
  useEffect(() => {
    if (activeProp) {
      setLine(activeProp.defaultLine)
    }
  }, [activePropId])

  const handlePropClick = (propId: PropId) => {
    if (activePropId === propId) {
      // Deselect
      setActivePropId(null)
      onPropSelect(null)
    } else {
      setActivePropId(propId)
    }
  }

  const handleLineChange = (delta: number) => {
    setLine(prev => {
      const newValue = Math.max(0.5, prev + delta)
      return Math.round(newValue * 2) / 2 // Round to nearest 0.5
    })
  }

  const handleAnalyze = () => {
    if (activeProp) {
      onPropSelect({
        id: activeProp.id,
        label: activeProp.label,
        name: activeProp.name,
        line: line
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Horizontal Scroll Chips */}
      <div className="relative">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Prop
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
          <span className="text-[10px] text-zinc-600">scroll →</span>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {PLAYER_PROPS.map((prop) => (
            <button
              key={prop.id}
              onClick={() => handlePropClick(prop.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                activePropId === prop.id
                  ? 'bg-white text-black'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-white border border-zinc-700/50'
              }`}
            >
              {prop.label}
            </button>
          ))}
        </div>

        {/* Fade hint on right */}
        <div className="absolute right-0 top-6 bottom-2 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* Line Input - Only shown when prop is selected */}
      {activeProp && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              {activeProp.name}
            </span>
            <button
              onClick={() => {
                setActivePropId(null)
                onPropSelect(null)
              }}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Line Input Row */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Ligne</span>
            <div className="flex-1 flex items-center justify-center gap-2">
              <button
                onClick={() => handleLineChange(-0.5)}
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white font-bold transition-colors"
              >
                −
              </button>
              <div className="w-20 h-10 flex items-center justify-center bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <span className="text-xl font-mono font-bold text-white">
                  {line.toFixed(1)}
                </span>
              </div>
              <button
                onClick={() => handleLineChange(0.5)}
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            Analyser
          </button>
        </div>
      )}
    </div>
  )
}
