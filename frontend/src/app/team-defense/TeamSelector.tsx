'use client'

import { useState, useEffect, useRef } from 'react'
import { type TeamOption } from '@/lib/queries'
import { colors, spacing, radius, typography, transitions } from '@/lib/design-tokens'

interface TeamSelectorProps {
  teams: TeamOption[]
  selectedTeamId: number | null
  onTeamSelect: (teamId: number | null) => void
}

export function TeamSelector({ teams, selectedTeamId, onTeamSelect }: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedTeam = teams.find(t => t.team_id === selectedTeamId)

  // Filter teams based on search
  const filteredTeams = teams.filter(team =>
    team.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTeamSelect = (teamId: number) => {
    onTeamSelect(teamId)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleInputClick = () => {
    // If a team is already selected, clear it and show dropdown
    if (selectedTeamId !== null) {
      onTeamSelect(null) // Clear selection
      setSearchTerm('')
    }
    // Always open dropdown when clicked
    setIsOpen(true)
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input */}
      <input
        type="text"
        placeholder="Select a team..."
        value={isOpen ? searchTerm : (selectedTeam?.full_name || '')}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setIsOpen(true)
        }}
        onClick={handleInputClick}
        style={{
          width: '100%',
          padding: spacing[4],
          background: 'transparent',
          border: `1px solid ${colors.gray[800]}`,
          borderRadius: radius.md,
          color: colors.foreground,
          fontSize: typography.fontSize.base,
          fontFamily: typography.fontSans,
          transition: transitions.normal,
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.foreground
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.gray[800]
        }}
        onFocus={(e) => {
          setIsOpen(true)
          e.currentTarget.style.borderColor = colors.foreground
          e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.foreground}`
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
      />

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          maxHeight: '400px',
          overflowY: 'auto',
          background: colors.background,
          border: `1px solid ${colors.gray[800]}`,
          borderRadius: radius.lg,
          zIndex: 50,
          boxShadow: '0 0 24px rgba(255, 255, 255, 0.12)'
        }}>
          {filteredTeams.length === 0 ? (
            <div style={{
              padding: spacing[4],
              textAlign: 'center',
              color: colors.gray[500],
              fontSize: typography.fontSize.sm
            }}>
              No teams found
            </div>
          ) : (
            filteredTeams.map((team) => (
              <button
                key={team.team_id}
                onClick={() => handleTeamSelect(team.team_id)}
                style={{
                  width: '100%',
                  padding: spacing[4],
                  background: team.team_id === selectedTeamId ? colors.foreground : 'transparent',
                  color: team.team_id === selectedTeamId ? colors.background : colors.foreground,
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.base,
                  fontFamily: typography.fontSans,
                  transition: transitions.fast,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3]
                }}
                onMouseEnter={(e) => {
                  if (team.team_id !== selectedTeamId) {
                    e.currentTarget.style.background = colors.gray[900]
                  }
                }}
                onMouseLeave={(e) => {
                  if (team.team_id !== selectedTeamId) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={{
                  fontWeight: typography.fontWeight.semibold,
                  fontFamily: typography.fontMono,
                  fontSize: typography.fontSize.sm
                }}>
                  {team.abbreviation}
                </span>
                <span>{team.full_name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
