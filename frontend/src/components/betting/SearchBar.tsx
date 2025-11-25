'use client'

import { useState, useEffect, useCallback } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  resultCount?: number
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher un match... (équipe, date)",
  resultCount
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced onChange with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }, [])

  return (
    <div className="w-full">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          🔍
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-10 px-3 py-2 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />

        {/* Clear Button */}
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="mt-2 text-xs text-gray-400">
          {resultCount} résultat{resultCount !== 1 ? 's' : ''} trouvé{resultCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
