'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { UseSearchReturn } from '@/types/search'
import { SearchResults } from './SearchResults'

interface SearchModalProps {
  search: UseSearchReturn
}

export function SearchModal({ search }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const {
    query,
    setQuery,
    isOpen,
    close,
    isLoading,
    results,
    flatResults,
    selectedIndex,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    handleSelect,
    error,
    recentSearches
  } = search

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard navigation within modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        selectNext()
        break
      case 'ArrowUp':
        e.preventDefault()
        selectPrevious()
        break
      case 'Enter':
        e.preventDefault()
        handleSelect()
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
    }
  }, [selectNext, selectPrevious, handleSelect, close])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        close()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen, close])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
      {/* Backdrop - Cinematic blur */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      {/* Modal - Clean, minimal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Recherche globale"
        className="relative w-full max-w-lg mx-4 bg-zinc-950 border border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input - Prominent */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-800/50">
          {/* Search Icon - Larger */}
          <svg
            className="w-5 h-5 text-zinc-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Input - Larger, prominent */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher..."
            className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none text-[15px] font-medium tracking-tight"
            aria-label="Recherche"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={flatResults[selectedIndex] ? `result-${selectedIndex}` : undefined}
          />

          {/* Loading indicator - Subtle */}
          {isLoading && (
            <div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin flex-shrink-0" />
          )}

          {/* Keyboard shortcut hint */}
          <kbd className="hidden sm:block text-[10px] font-mono text-zinc-600 px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
            ESC
          </kbd>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-red-900/20 border-b border-red-900/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Recent searches (when no query) */}
        {!query && recentSearches.length > 0 && (
          <div className="py-2">
            <h3 className="px-4 py-1 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
              Recherches récentes
            </h3>
            <ul>
              {recentSearches.map((recent, index) => (
                <li
                  key={index}
                  onClick={() => setQuery(recent)}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                >
                  <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-zinc-400">{recent}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Search Results */}
        <SearchResults
          results={results}
          flatResults={flatResults}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          onSelect={handleSelect}
          isLoading={isLoading}
          query={query}
        />

        {/* Footer with keyboard hints - Minimal */}
        <div className="flex items-center justify-center gap-6 px-5 py-3 border-t border-zinc-800/50">
          <span className="flex items-center gap-2 text-[9px] text-zinc-600 tracking-wide">
            <kbd className="font-mono text-zinc-500">↑↓</kbd>
            <span className="uppercase">Navigate</span>
          </span>
          <span className="flex items-center gap-2 text-[9px] text-zinc-600 tracking-wide">
            <kbd className="font-mono text-zinc-500">↵</kbd>
            <span className="uppercase">Select</span>
          </span>
          <span className="flex items-center gap-2 text-[9px] text-zinc-600 tracking-wide">
            <kbd className="font-mono text-zinc-500">esc</kbd>
            <span className="uppercase">Close</span>
          </span>
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at document body level
  if (typeof window === 'undefined') return null

  return createPortal(modalContent, document.body)
}
