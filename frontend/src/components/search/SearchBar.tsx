'use client'

import { useEffect, useState } from 'react'

interface SearchBarProps {
  onClick: () => void
}

export function SearchBar({ onClick }: SearchBarProps) {
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-600 hover:bg-zinc-900 transition-all duration-200 group min-w-[200px]"
      aria-label="Ouvrir la recherche"
    >
      {/* Search Icon */}
      <svg
        className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Placeholder Text */}
      <span className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors flex-1 text-left">
        Rechercher...
      </span>

      {/* Keyboard Shortcut */}
      <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-800/80 rounded text-[10px] font-mono text-zinc-500 border border-zinc-700/50">
        <span>{isMac ? '⌘' : 'Ctrl'}</span>
        <span>K</span>
      </kbd>
    </button>
  )
}
