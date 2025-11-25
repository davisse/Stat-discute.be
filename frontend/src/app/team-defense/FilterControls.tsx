'use client'

import { useState } from 'react'
import { colors, spacing, radius, typography, transitions } from '@/lib/design-tokens'

interface FilterControlsProps {
  onFilterChange: (filters: {
    location?: 'HOME' | 'AWAY'
    limit?: number
  }) => void
}

export function FilterControls({ onFilterChange }: FilterControlsProps) {
  const [limit, setLimit] = useState<number | undefined>(undefined)
  const [location, setLocation] = useState<'HOME' | 'AWAY' | undefined>(undefined)

  const handleLimitChange = (newLimit: number | undefined) => {
    setLimit(newLimit)
    onFilterChange({ location, limit: newLimit })
  }

  const handleLocationChange = (newLocation: 'HOME' | 'AWAY' | undefined) => {
    setLocation(newLocation)
    onFilterChange({ location: newLocation, limit })
  }

  const ghostButtonStyle = (isActive: boolean) => ({
    background: isActive ? colors.gray[900] : 'transparent',
    color: isActive ? colors.foreground : colors.gray[400],
    border: `1px solid ${isActive ? colors.gray[700] : colors.gray[800]}`,
    borderRadius: radius.md,
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontSans,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: transitions.fast
  })

  return (
    <div style={{
      background: colors.gray[950],
      border: `1px solid ${colors.gray[800]}`,
      borderRadius: radius.lg,
      padding: spacing[6],
      marginBottom: spacing[6]
    }}>
      {/* Filter Buttons */}
      <div style={{
        marginBottom: spacing[4]
      }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400],
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[3]
        }}>
          Filters
        </div>

        <div style={{
          display: 'flex',
          gap: spacing[3],
          flexWrap: 'wrap'
        }}>
          {/* Last N Games Filters */}
          <button
            onClick={() => handleLimitChange(limit === 10 ? undefined : 10)}
            style={ghostButtonStyle(limit === 10)}
            onMouseEnter={(e) => {
              if (limit !== 10) {
                e.currentTarget.style.borderColor = colors.gray[700]
                e.currentTarget.style.color = colors.foreground
              }
            }}
            onMouseLeave={(e) => {
              if (limit !== 10) {
                e.currentTarget.style.borderColor = colors.gray[800]
                e.currentTarget.style.color = colors.gray[400]
              }
            }}
          >
            Last 10
          </button>

          <button
            onClick={() => handleLimitChange(limit === 20 ? undefined : 20)}
            style={ghostButtonStyle(limit === 20)}
            onMouseEnter={(e) => {
              if (limit !== 20) {
                e.currentTarget.style.borderColor = colors.gray[700]
                e.currentTarget.style.color = colors.foreground
              }
            }}
            onMouseLeave={(e) => {
              if (limit !== 20) {
                e.currentTarget.style.borderColor = colors.gray[800]
                e.currentTarget.style.color = colors.gray[400]
              }
            }}
          >
            Last 20
          </button>

          {/* Location Filters */}
          <button
            onClick={() => handleLocationChange(location === 'HOME' ? undefined : 'HOME')}
            style={ghostButtonStyle(location === 'HOME')}
            onMouseEnter={(e) => {
              if (location !== 'HOME') {
                e.currentTarget.style.borderColor = colors.gray[700]
                e.currentTarget.style.color = colors.foreground
              }
            }}
            onMouseLeave={(e) => {
              if (location !== 'HOME') {
                e.currentTarget.style.borderColor = colors.gray[800]
                e.currentTarget.style.color = colors.gray[400]
              }
            }}
          >
            Home Only
          </button>

          <button
            onClick={() => handleLocationChange(location === 'AWAY' ? undefined : 'AWAY')}
            style={ghostButtonStyle(location === 'AWAY')}
            onMouseEnter={(e) => {
              if (location !== 'AWAY') {
                e.currentTarget.style.borderColor = colors.gray[700]
                e.currentTarget.style.color = colors.foreground
              }
            }}
            onMouseLeave={(e) => {
              if (location !== 'AWAY') {
                e.currentTarget.style.borderColor = colors.gray[800]
                e.currentTarget.style.color = colors.gray[400]
              }
            }}
          >
            Away Only
          </button>

          {/* Clear Filters */}
          {(limit || location) && (
            <button
              onClick={() => {
                setLimit(undefined)
                setLocation(undefined)
                onFilterChange({})
              }}
              style={{
                background: 'transparent',
                color: colors.gray[500],
                border: 'none',
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontFamily: typography.fontSans,
                cursor: 'pointer',
                textDecoration: 'underline',
                transition: transitions.fast
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.foreground
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.gray[500]
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
