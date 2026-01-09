'use client'

import type { SearchResult } from '@/types/search'

interface SearchResultItemProps {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}

function getResultMeta(result: SearchResult): string | null {
  switch (result.type) {
    case 'team':
      return `${result.abbreviation} · ${result.record} · #${result.conferenceRank} ${result.conference}`
    case 'player':
      return `${result.teamAbbreviation} · ${result.ppg.toFixed(1)} PPG`
    case 'game':
      return result.isToday ? `AUJOURD'HUI` : result.gameDate
    case 'page':
      return result.category.toUpperCase()
    default:
      return null
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'team': return 'ÉQUIPE'
    case 'player': return 'JOUEUR'
    case 'game': return 'MATCH'
    default: return 'PAGE'
  }
}

export function SearchResultItem({
  result,
  isSelected,
  onClick,
  onMouseEnter
}: SearchResultItemProps) {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-200
        ${isSelected
          ? 'bg-white/[0.08]'
          : 'hover:bg-white/[0.04]'
        }
      `}
    >
      {/* Content - Cinematic Typography */}
      <div className="flex-1 min-w-0">
        {/* Title - Bold, prominent */}
        <p className={`
          text-[15px] font-semibold tracking-tight truncate transition-colors duration-200
          ${isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'}
        `}>
          {result.title}
        </p>

        {/* Meta - Subtle, monospace feel */}
        {getResultMeta(result) && (
          <p className="text-[11px] text-zinc-500 tracking-wide font-medium truncate mt-1 font-mono">
            {getResultMeta(result)}
          </p>
        )}
      </div>

      {/* Type indicator - Minimal */}
      <span className={`
        text-[9px] font-bold tracking-[0.15em] px-2 py-1 rounded transition-colors duration-200
        ${isSelected
          ? 'text-zinc-400 bg-white/[0.08]'
          : 'text-zinc-600 bg-transparent'
        }
      `}>
        {getTypeLabel(result.type)}
      </span>
    </li>
  )
}
