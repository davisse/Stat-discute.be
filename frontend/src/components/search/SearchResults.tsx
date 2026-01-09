'use client'

import type { SearchResults as SearchResultsType, SearchResult } from '@/types/search'
import { SearchResultItem } from './SearchResultItem'

interface SearchResultsProps {
  results: SearchResultsType
  flatResults: SearchResult[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  onSelect: (result: SearchResult) => void
  isLoading: boolean
  query: string
}

interface ResultGroupProps {
  title: string
  results: SearchResult[]
  startIndex: number
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  onSelect: (result: SearchResult) => void
}

function ResultGroup({
  title,
  results,
  startIndex,
  selectedIndex,
  setSelectedIndex,
  onSelect
}: ResultGroupProps) {
  if (results.length === 0) return null

  return (
    <div className="pt-3 pb-1">
      {/* Section header - Cinematic minimal */}
      <div className="px-5 pb-2 flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase">
          {title}
        </span>
        <div className="flex-1 h-px bg-zinc-800/50" />
        <span className="text-[10px] font-mono text-zinc-700">
          {results.length}
        </span>
      </div>
      <ul role="listbox">
        {results.map((result, index) => {
          const absoluteIndex = startIndex + index
          return (
            <SearchResultItem
              key={`${result.type}-${result.id}`}
              result={result}
              isSelected={selectedIndex === absoluteIndex}
              onClick={() => onSelect(result)}
              onMouseEnter={() => setSelectedIndex(absoluteIndex)}
            />
          )
        })}
      </ul>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="py-3 px-5 space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
            <div className="h-3 bg-zinc-800/40 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ query }: { query: string }) {
  if (!query) {
    return (
      <div className="py-12 px-5 text-center">
        <p className="text-[13px] text-zinc-600 font-medium tracking-wide">
          Rechercher équipes, joueurs, matchs...
        </p>
      </div>
    )
  }

  return (
    <div className="py-12 px-5 text-center">
      <p className="text-[13px] text-zinc-500 font-medium">
        Aucun résultat pour "{query}"
      </p>
      <p className="text-[11px] text-zinc-700 mt-2 tracking-wide">
        ESSAYEZ UNE AUTRE RECHERCHE
      </p>
    </div>
  )
}

export function SearchResults({
  results,
  flatResults,
  selectedIndex,
  setSelectedIndex,
  onSelect,
  isLoading,
  query
}: SearchResultsProps) {
  const hasResults = flatResults.length > 0
  const showLoading = isLoading && query.length >= 2

  // Calculate start indices for each group
  let currentIndex = 0
  const teamStartIndex = currentIndex
  currentIndex += results.teams.length
  const playerStartIndex = currentIndex
  currentIndex += results.players.length
  const gameStartIndex = currentIndex
  currentIndex += results.games.length
  const pageStartIndex = currentIndex

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      {/* Teams (instant results) */}
      <ResultGroup
        title="Équipes"
        results={results.teams}
        startIndex={teamStartIndex}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        onSelect={onSelect}
      />

      {/* Players (server results with loading) */}
      {showLoading && results.players.length === 0 && (
        <div className="pt-3 pb-1">
          <div className="px-5 pb-2 flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase">
              Joueurs
            </span>
            <div className="flex-1 h-px bg-zinc-800/50" />
          </div>
          <LoadingSkeleton />
        </div>
      )}
      <ResultGroup
        title="Joueurs"
        results={results.players}
        startIndex={playerStartIndex}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        onSelect={onSelect}
      />

      {/* Games (server results with loading) */}
      {showLoading && results.games.length === 0 && (
        <div className="pt-3 pb-1">
          <div className="px-5 pb-2 flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase">
              Matchs
            </span>
            <div className="flex-1 h-px bg-zinc-800/50" />
          </div>
          <LoadingSkeleton />
        </div>
      )}
      <ResultGroup
        title="Matchs"
        results={results.games}
        startIndex={gameStartIndex}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        onSelect={onSelect}
      />

      {/* Pages (instant results) */}
      <ResultGroup
        title="Pages"
        results={results.pages}
        startIndex={pageStartIndex}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        onSelect={onSelect}
      />

      {/* Empty state */}
      {!hasResults && !showLoading && <EmptyState query={query} />}
    </div>
  )
}
