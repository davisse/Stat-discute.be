'use client'

import { useState, useEffect } from 'react'
import { PlayerSelector, PropSelector, PropAnalysis, type SelectedPlayer, type SelectedProp } from '@/components/props-lab'
import { OpponentVulnerabilityView } from '@/components/player-props'
import { type PlayerPropAnalysis, type OpponentVulnerabilityByPosition } from '@/lib/queries'

interface TeamOption {
  team_id: number
  abbreviation: string
  full_name: string
}

interface PropsLabContentProps {
  teams: TeamOption[]
}

export function PropsLabContent({ teams }: PropsLabContentProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(null)
  const [selectedProp, setSelectedProp] = useState<SelectedProp | null>(null)
  const [analysis, setAnalysis] = useState<PlayerPropAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Opponent vulnerability state
  const [opponentVulnerability, setOpponentVulnerability] = useState<OpponentVulnerabilityByPosition[]>([])
  const [opponentVulnerabilityLoading, setOpponentVulnerabilityLoading] = useState(false)
  const [showOpponentVulnerability, setShowOpponentVulnerability] = useState(false)

  // Fetch analysis when player and prop are selected
  useEffect(() => {
    if (!selectedPlayer || !selectedProp) {
      setAnalysis(null)
      return
    }

    const fetchAnalysis = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/players/${selectedPlayer.playerId}/prop-analysis?propType=${selectedProp.id}&line=${selectedProp.line}`
        )
        if (!response.ok) {
          throw new Error('Impossible de charger l\'analyse')
        }
        const data = await response.json()
        setAnalysis(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        setAnalysis(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [selectedPlayer, selectedProp])

  // Fetch opponent vulnerability when player is selected
  useEffect(() => {
    if (!selectedPlayer) {
      setOpponentVulnerability([])
      setShowOpponentVulnerability(false)
      return
    }

    const fetchOpponentVulnerability = async () => {
      setOpponentVulnerabilityLoading(true)
      try {
        const response = await fetch(
          `/api/players/${selectedPlayer.playerId}/opponent-vulnerability`
        )
        if (response.ok) {
          const data = await response.json()
          setOpponentVulnerability(data)
        }
      } catch (err) {
        console.error('Error fetching opponent vulnerability:', err)
        setOpponentVulnerability([])
      } finally {
        setOpponentVulnerabilityLoading(false)
      }
    }

    fetchOpponentVulnerability()
  }, [selectedPlayer])

  const handlePlayerSelect = (player: SelectedPlayer | null) => {
    setSelectedPlayer(player)
    // Reset prop when player changes
    setSelectedProp(null)
    setAnalysis(null)
  }

  const handleChangePlayer = () => {
    setSelectedPlayer(null)
    setSelectedProp(null)
  }

  const handlePropSelect = (prop: SelectedProp | null) => {
    setSelectedProp(prop)
  }

  return (
    <div className="space-y-4">
      {/* Player Selector - Only shown when no player selected */}
      {!selectedPlayer && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
            Sélectionner un joueur
          </h2>
          <PlayerSelector
            teams={teams}
            onPlayerSelect={handlePlayerSelect}
          />
        </div>
      )}

      {/* Compact Selected Player Header - Shown when player is selected */}
      {selectedPlayer && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Compact Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                <span className="text-sm sm:text-base font-bold text-zinc-400">
                  {selectedPlayer.fullName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              {/* Player Info */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  {selectedPlayer.fullName}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">
                    {selectedPlayer.teamAbbreviation}
                  </span>
                  {selectedPlayer.position && (
                    <>
                      <span className="text-zinc-600">|</span>
                      <span className="text-xs text-zinc-500">
                        {selectedPlayer.position}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Change Button */}
            <button
              onClick={handleChangePlayer}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all"
            >
              Changer
            </button>
          </div>
        </div>
      )}

      {/* Prop Selector - Only shown when player is selected */}
      {selectedPlayer && !selectedProp && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <PropSelector
            onPropSelect={handlePropSelect}
            selectedProp={selectedProp}
          />
        </div>
      )}

      {/* Selected Prop Compact Header + Analysis */}
      {selectedPlayer && selectedProp && (
        <>
          {/* Compact Prop Header */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-sm sm:text-base font-bold text-black">
                    {selectedProp.label}
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                    {selectedProp.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Ligne:</span>
                    <span className="text-sm font-mono font-bold text-white">
                      {selectedProp.line.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProp(null)}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all"
              >
                Modifier
              </button>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
              Analyse: {selectedPlayer.fullName} - {selectedProp.name} O/U {selectedProp.line.toFixed(1)}
            </h2>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!isLoading && !error && analysis && (
              <PropAnalysis
                analysis={analysis}
                propLabel={selectedProp.label}
                propName={selectedProp.name}
                line={selectedProp.line}
              />
            )}

            {!isLoading && !error && !analysis && (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm">
                  Aucune donnée disponible pour ce joueur
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Opponent Vulnerability Section - Collapsible, shown when player selected */}
      {selectedPlayer && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowOpponentVulnerability(!showOpponentVulnerability)}
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                Impact Adversaire
              </span>
              <span className="text-xs text-zinc-600">
                Vulnérabilité des positions adverses sans {selectedPlayer.fullName.split(' ')[1] || selectedPlayer.fullName}
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-zinc-500 transition-transform ${showOpponentVulnerability ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showOpponentVulnerability && (
            <div className="p-4 pt-0 border-t border-zinc-800">
              {opponentVulnerabilityLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {!opponentVulnerabilityLoading && opponentVulnerability.length > 0 && (
                <OpponentVulnerabilityView
                  absentPlayer={{
                    playerId: selectedPlayer.playerId,
                    playerName: selectedPlayer.fullName,
                    teamAbbr: selectedPlayer.teamAbbreviation,
                    gamesMissed: opponentVulnerability[0]?.games_without || 0,
                  }}
                  vulnerabilities={opponentVulnerability}
                />
              )}

              {!opponentVulnerabilityLoading && opponentVulnerability.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-zinc-500 text-sm">
                    Données insuffisantes pour l&apos;analyse d&apos;impact adversaire
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State - Only when no player selected */}
      {!selectedPlayer && (
        <div className="text-center py-8 text-zinc-600">
          <p className="text-sm">
            Sélectionnez un joueur pour voir l'analyse des props
          </p>
        </div>
      )}
    </div>
  )
}
