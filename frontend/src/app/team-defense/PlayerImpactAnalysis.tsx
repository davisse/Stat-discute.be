'use client'

import { useState, useEffect } from 'react'
import { type PlayerImpactGame, type TeamPlayer } from '@/lib/queries'
import { colors, spacing, radius, typography, transitions } from '@/lib/design-tokens'
import { PlayerImpactChart } from './PlayerImpactChart'

interface PlayerImpactAnalysisProps {
  teamId: number
  teamAbbreviation: string
}

export function PlayerImpactAnalysis({ teamId, teamAbbreviation }: PlayerImpactAnalysisProps) {
  const [players, setPlayers] = useState<TeamPlayer[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [games, setGames] = useState<PlayerImpactGame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'opponent-scoring' | 'combined-totals'>('opponent-scoring')
  const [opponentLine, setOpponentLine] = useState<string>('115')
  const [totalLine, setTotalLine] = useState<string>('220')

  // Fetch players when team changes
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch(`/api/team-defense?action=players&teamId=${teamId}`)
        const data = await response.json()
        setPlayers(data)
        // Auto-select first player if available
        if (data.length > 0 && !selectedPlayerId) {
          setSelectedPlayerId(data[0].player_id)
        }
      } catch (error) {
        console.error('Failed to fetch players:', error)
      }
    }

    if (teamId) {
      fetchPlayers()
    }
  }, [teamId])

  // Fetch games when player changes
  useEffect(() => {
    async function fetchGames() {
      if (!selectedPlayerId) {
        setGames([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/team-defense?action=player-impact&teamId=${teamId}&playerId=${selectedPlayerId}`
        )
        const data = await response.json()
        setGames(data)
      } catch (error) {
        console.error('Failed to fetch player impact games:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [teamId, selectedPlayerId])

  // Split games by player participation
  const gamesWithPlayer = games.filter(g => g.player_played)
  const gamesWithoutPlayer = games.filter(g => !g.player_played)

  // Calculate metrics based on view mode
  const getMetrics = (gamesList: PlayerImpactGame[]) => {
    if (gamesList.length === 0) return { avg: 0, count: 0 }

    const values = gamesList.map(g =>
      viewMode === 'opponent-scoring'
        ? g.opponent_score
        : g.team_score + g.opponent_score
    )

    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    return { avg, count: gamesList.length }
  }

  const withPlayerMetrics = getMetrics(gamesWithPlayer)
  const withoutPlayerMetrics = getMetrics(gamesWithoutPlayer)
  const allGamesMetrics = getMetrics(games)

  const selectedPlayer = players.find(p => p.player_id === selectedPlayerId)

  if (!selectedPlayerId || players.length === 0) {
    return (
      <div style={{
        background: colors.gray[950],
        border: `1px solid ${colors.gray[900]}`,
        borderRadius: radius.lg,
        padding: spacing[6],
        marginBottom: spacing[8]
      }}>
        <h2 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.foreground,
          marginBottom: spacing[2]
        }}>
          Player Impact Analysis
        </h2>
        <p style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400]
        }}>
          No players available for analysis. Players need at least 3 games played this season.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: colors.gray[950],
      border: `1px solid ${colors.gray[900]}`,
      borderRadius: radius.lg,
      padding: spacing[6],
      marginBottom: spacing[8]
    }}>
      {/* Header */}
      <div style={{
        marginBottom: spacing[6]
      }}>
        <h2 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.foreground,
          marginBottom: spacing[1]
        }}>
          Player Impact Analysis
        </h2>
        <p style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[400]
        }}>
          Compare {teamAbbreviation} performance with and without selected player
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[6],
        flexWrap: 'wrap',
        gap: spacing[4]
      }}>
        {/* Player Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <label style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400],
            fontWeight: typography.fontWeight.medium
          }}>
            Player:
          </label>
          <select
            value={selectedPlayerId || ''}
            onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              background: colors.background,
              border: `1px solid ${colors.gray[800]}`,
              borderRadius: radius.md,
              color: colors.foreground,
              fontSize: typography.fontSize.base,
              fontFamily: typography.fontMono,
              outline: 'none',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            {players.map(player => (
              <option key={player.player_id} value={player.player_id}>
                {player.full_name} ({player.games_played} GP)
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <label style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[400],
            fontWeight: typography.fontWeight.medium
          }}>
            View:
          </label>
          <div style={{
            display: 'flex',
            gap: spacing[2],
            background: colors.background,
            padding: spacing[1],
            borderRadius: radius.md,
            border: `1px solid ${colors.gray[800]}`
          }}>
            <button
              onClick={() => setViewMode('opponent-scoring')}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                background: viewMode === 'opponent-scoring' ? colors.gray[800] : 'transparent',
                border: 'none',
                borderRadius: radius.sm,
                color: viewMode === 'opponent-scoring' ? colors.foreground : colors.gray[400],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                transition: transitions.fast
              }}
            >
              Opponent Scoring
            </button>
            <button
              onClick={() => setViewMode('combined-totals')}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                background: viewMode === 'combined-totals' ? colors.gray[800] : 'transparent',
                border: 'none',
                borderRadius: radius.sm,
                color: viewMode === 'combined-totals' ? colors.foreground : colors.gray[400],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                transition: transitions.fast
              }}
            >
              Combined Totals
            </button>
          </div>
        </div>

        {/* Betting Line Input (for opponent-scoring mode) */}
        {viewMode === 'opponent-scoring' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <label style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[400],
              fontWeight: typography.fontWeight.medium
            }}>
              Betting Line:
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={opponentLine}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty, numbers, and decimals
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setOpponentLine(value)
                }
              }}
              style={{
                width: '100px',
                padding: `${spacing[2]} ${spacing[3]}`,
                background: colors.background,
                border: `1px solid ${colors.gray[800]}`,
                borderRadius: radius.md,
                color: colors.foreground,
                fontSize: typography.fontSize.base,
                fontFamily: typography.fontMono,
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>
        )}

        {/* Total Line Input (for combined-totals mode) */}
        {viewMode === 'combined-totals' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <label style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[400],
              fontWeight: typography.fontWeight.medium
            }}>
              Betting Line:
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={totalLine}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty, numbers, and decimals
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setTotalLine(value)
                }
              }}
              style={{
                width: '100px',
                padding: `${spacing[2]} ${spacing[3]}`,
                background: colors.background,
                border: `1px solid ${colors.gray[800]}`,
                borderRadius: radius.md,
                color: colors.foreground,
                fontSize: typography.fontSize.base,
                fontFamily: typography.fontMono,
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          textAlign: 'center',
          padding: spacing[8],
          fontSize: typography.fontSize.base,
          color: colors.gray[500]
        }}>
          Loading player impact data...
        </div>
      )}

      {/* Content */}
      {!isLoading && selectedPlayerId && (
        <>
          {/* Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: spacing[4],
            marginBottom: spacing[6]
          }}>
            {/* With Player Card */}
            <div style={{
              background: colors.background,
              padding: spacing[4],
              borderRadius: radius.md,
              border: `1px solid ${colors.positive}20`,
              borderLeft: `4px solid ${colors.positive}`
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                WITH {selectedPlayer?.full_name.toUpperCase()}
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.positive,
                fontFamily: typography.fontMono,
                marginBottom: spacing[1]
              }}>
                {withPlayerMetrics.avg.toFixed(1)}
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.gray[500]
              }}>
                {viewMode === 'opponent-scoring' ? 'Avg Opponent PPG' : 'Avg Combined Total'}
              </div>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginTop: spacing[2]
              }}>
                {withPlayerMetrics.count} games
              </div>
            </div>

            {/* Without Player Card */}
            <div style={{
              background: colors.background,
              padding: spacing[4],
              borderRadius: radius.md,
              border: `1px solid ${colors.negative}20`,
              borderLeft: `4px solid ${colors.negative}`
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                WITHOUT {selectedPlayer?.full_name.toUpperCase()}
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.negative,
                fontFamily: typography.fontMono,
                marginBottom: spacing[1]
              }}>
                {withoutPlayerMetrics.count > 0 ? withoutPlayerMetrics.avg.toFixed(1) : 'N/A'}
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.gray[500]
              }}>
                {viewMode === 'opponent-scoring' ? 'Avg Opponent PPG' : 'Avg Combined Total'}
              </div>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginTop: spacing[2]
              }}>
                {withoutPlayerMetrics.count} games
              </div>
            </div>

            {/* Impact Difference Card */}
            <div style={{
              background: colors.background,
              padding: spacing[4],
              borderRadius: radius.md,
              border: `1px solid ${colors.gray[900]}`
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.gray[400],
                marginBottom: spacing[1]
              }}>
                IMPACT
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: withoutPlayerMetrics.count > 0
                  ? (withoutPlayerMetrics.avg > withPlayerMetrics.avg ? colors.positive : colors.negative)
                  : colors.gray[400],
                fontFamily: typography.fontMono,
                marginBottom: spacing[1]
              }}>
                {withoutPlayerMetrics.count > 0
                  ? `${(withoutPlayerMetrics.avg - withPlayerMetrics.avg) > 0 ? '+' : ''}${(withoutPlayerMetrics.avg - withPlayerMetrics.avg).toFixed(1)}`
                  : 'N/A'}
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.gray[500]
              }}>
                Difference without player
              </div>
              {withoutPlayerMetrics.count < 3 && withoutPlayerMetrics.count > 0 && (
                <div style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.gray[500],
                  marginTop: spacing[2],
                  padding: spacing[1],
                  background: colors.gray[900],
                  borderRadius: radius.sm
                }}>
                  ⚠️ Small sample size
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <PlayerImpactChart
            games={games}
            viewMode={viewMode}
            avgWithPlayer={withPlayerMetrics.avg}
            avgWithoutPlayer={withoutPlayerMetrics.avg}
            totalLine={viewMode === 'combined-totals' && totalLine ? parseFloat(totalLine) :
                      viewMode === 'opponent-scoring' && opponentLine ? parseFloat(opponentLine) : undefined}
          />

          {/* Detailed Breakdown Table */}
          <div style={{
            marginTop: spacing[6],
            overflowX: 'auto',
            border: `1px solid ${colors.gray[900]}`,
            borderRadius: radius.md
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: typography.fontSize.sm
            }}>
              <thead>
                <tr style={{ background: colors.background }}>
                  <th style={{
                    padding: spacing[3],
                    textAlign: 'left',
                    color: colors.gray[400],
                    fontWeight: typography.fontWeight.semibold,
                    borderBottom: `1px solid ${colors.gray[900]}`
                  }}>
                    Date
                  </th>
                  <th style={{
                    padding: spacing[3],
                    textAlign: 'left',
                    color: colors.gray[400],
                    fontWeight: typography.fontWeight.semibold,
                    borderBottom: `1px solid ${colors.gray[900]}`
                  }}>
                    Opponent
                  </th>
                  <th style={{
                    padding: spacing[3],
                    textAlign: 'center',
                    color: colors.gray[400],
                    fontWeight: typography.fontWeight.semibold,
                    borderBottom: `1px solid ${colors.gray[900]}`
                  }}>
                    Location
                  </th>
                  <th style={{
                    padding: spacing[3],
                    textAlign: 'center',
                    color: colors.gray[400],
                    fontWeight: typography.fontWeight.semibold,
                    borderBottom: `1px solid ${colors.gray[900]}`
                  }}>
                    {viewMode === 'opponent-scoring' ? 'OPP PTS' : 'Total'}
                  </th>
                  <th style={{
                    padding: spacing[3],
                    textAlign: 'center',
                    color: colors.gray[400],
                    fontWeight: typography.fontWeight.semibold,
                    borderBottom: `1px solid ${colors.gray[900]}`
                  }}>
                    vs Avg
                  </th>
                  <th style={{
                    padding: spacing[3],
                    textAlign: 'center',
                    color: colors.gray[400],
                    fontWeight: typography.fontWeight.semibold,
                    borderBottom: `1px solid ${colors.gray[900]}`
                  }}>
                    Player Status
                  </th>
                  <th style={{
                    padding: spacing[3],
                    textAlign: 'center',
                    color: colors.gray[400],
                    fontWeight: typography.fontWeight.semibold,
                    borderBottom: `1px solid ${colors.gray[900]}`
                  }}>
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, index) => {
                  const value = viewMode === 'opponent-scoring'
                    ? game.opponent_score
                    : game.team_score + game.opponent_score
                  const diff = value - allGamesMetrics.avg

                  return (
                    <tr
                      key={game.game_id}
                      style={{
                        background: index % 2 === 0 ? colors.background : 'transparent',
                        transition: transitions.fast
                      }}
                    >
                      <td style={{
                        padding: spacing[3],
                        color: colors.gray[400],
                        fontFamily: typography.fontMono,
                        fontSize: typography.fontSize.xs
                      }}>
                        {new Date(game.game_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td style={{
                        padding: spacing[3],
                        color: colors.foreground,
                        fontFamily: typography.fontMono,
                        fontWeight: typography.fontWeight.semibold
                      }}>
                        {game.opponent_abbr}
                      </td>
                      <td style={{
                        padding: spacing[3],
                        textAlign: 'center',
                        color: colors.gray[400],
                        fontSize: typography.fontSize.xs
                      }}>
                        {game.location === 'HOME' ? 'vs' : '@'}
                      </td>
                      <td style={{
                        padding: spacing[3],
                        textAlign: 'center',
                        color: colors.foreground,
                        fontFamily: typography.fontMono,
                        fontWeight: typography.fontWeight.bold
                      }}>
                        {value}
                      </td>
                      <td style={{
                        padding: spacing[3],
                        textAlign: 'center',
                        color: diff > 0 ? colors.negative : colors.positive,
                        fontFamily: typography.fontMono,
                        fontWeight: typography.fontWeight.semibold
                      }}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                      </td>
                      <td style={{
                        padding: spacing[3],
                        textAlign: 'center'
                      }}>
                        <span style={{
                          padding: `${spacing[1]} ${spacing[2]}`,
                          borderRadius: radius.sm,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                          background: game.player_played ? colors.positiveBg : colors.negativeBg,
                          color: game.player_played ? colors.positive : colors.negative
                        }}>
                          {game.player_played
                            ? `✓ ${game.player_minutes?.toFixed(0)} min`
                            : '✗ DNP'}
                        </span>
                      </td>
                      <td style={{
                        padding: spacing[3],
                        textAlign: 'center',
                        color: game.result === 'W' ? colors.positive : colors.negative,
                        fontFamily: typography.fontMono,
                        fontWeight: typography.fontWeight.bold
                      }}>
                        {game.result}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
