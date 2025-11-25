import * as React from 'react'
import { AppLayout } from '@/components/layout'
import {
  PlayerAbsenceImpact,
  TeamPerformanceWithoutPlayer,
  PlayerPerformanceWithoutTeammate,
} from '@/components/player-props'
import {
  getMostImpactfulAbsences,
  getTeamSplitsWithPlayer,
  getPlayerSplitsWithTeammate,
} from '@/lib/queries'
import { query } from '@/lib/db'

/**
 * Player Absence Impact Test Page
 *
 * Demonstrates the three player absence impact analysis components:
 * 1. PlayerAbsenceImpact - Ranked list of most impactful absences
 * 2. TeamPerformanceWithoutPlayer - Team performance with/without a specific player
 * 3. PlayerPerformanceWithoutTeammate - Player performance with/without a specific teammate
 *
 * Uses real data from the database.
 */

// Helper function to get sample player and team IDs for demonstration
async function getSamplePlayerAndTeam() {
  const currentSeason = await query(`
    SELECT season_id FROM seasons WHERE is_current = true LIMIT 1
  `)
  const season = currentSeason.rows[0]?.season_id || '2025-26'

  // Get a player who has BOTH played AND missed games (for meaningful comparison)
  const playerResult = await query(
    `
    WITH player_participation_summary AS (
      SELECT
        pgp.player_id,
        p.full_name as player_name,
        pgp.team_id,
        t.abbreviation as team_abbreviation,
        COUNT(*) FILTER (WHERE pgp.is_active = TRUE) as games_played,
        COUNT(*) FILTER (WHERE pgp.is_active = FALSE) as games_missed
      FROM player_game_participation pgp
      JOIN games g ON pgp.game_id = g.game_id
      JOIN players p ON pgp.player_id = p.player_id
      JOIN teams t ON pgp.team_id = t.team_id
      WHERE g.season = $1
      GROUP BY pgp.player_id, p.full_name, pgp.team_id, t.abbreviation
    )
    SELECT player_id, player_name, team_id, team_abbreviation, games_played, games_missed
    FROM player_participation_summary
    WHERE games_played >= 5 AND games_missed >= 3
    ORDER BY games_played DESC, games_missed DESC
    LIMIT 1
  `,
    [season]
  )

  if (playerResult.rows.length === 0) {
    return null
  }

  const player = playerResult.rows[0]

  // Get a teammate for the player
  const teammateResult = await query(
    `
    SELECT
      p2.player_id,
      p2.full_name as player_name
    FROM players p2
    JOIN player_game_stats pgs2 ON p2.player_id = pgs2.player_id
    JOIN games g ON pgs2.game_id = g.game_id
    WHERE g.season = $1
      AND pgs2.team_id = $2
      AND p2.player_id != $3
    GROUP BY p2.player_id, p2.full_name
    HAVING COUNT(DISTINCT pgs2.game_id) >= 10
    ORDER BY COUNT(DISTINCT pgs2.game_id) DESC
    LIMIT 1
  `,
    [season, player.team_id, player.player_id]
  )

  const teammate = teammateResult.rows[0] || null

  return {
    player: {
      player_id: parseInt(player.player_id),
      player_name: player.player_name,
      team_id: parseInt(player.team_id),
      team_abbreviation: player.team_abbreviation,
      games_played: parseInt(player.games_played),
    },
    teammate: teammate
      ? {
          player_id: parseInt(teammate.player_id),
          player_name: teammate.player_name,
        }
      : null,
  }
}

export default async function PlayerAbsenceTestPage() {
  // Fetch real data
  const impactfulAbsences = await getMostImpactfulAbsences(20)
  const sampleData = await getSamplePlayerAndTeam()

  // Fetch team splits and player splits if we have sample data
  let teamSplits = null
  let playerSplits = null

  if (sampleData) {
    teamSplits = await getTeamSplitsWithPlayer(
      sampleData.player.team_id,
      sampleData.player.player_id
    )

    if (sampleData.teammate) {
      playerSplits = await getPlayerSplitsWithTeammate(
        sampleData.player.player_id,
        sampleData.teammate.player_id
      )
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-[var(--space-6)] py-[var(--space-12)]">
        {/* Header */}
        <div className="mb-[var(--space-12)]">
          <h1 className="text-[var(--text-3xl)] font-[var(--font-bold)] text-white mb-[var(--space-2)]">
            Player Absence Impact Analysis
          </h1>
          <p className="text-[var(--text-base)] text-[var(--color-gray-400)]">
            Analyze how player absences affect team and individual performance
          </p>
        </div>

        {/* Section 1: Most Impactful Absences (List) */}
        <section className="mb-[var(--space-16)]">
          <div className="mb-[var(--space-6)]">
            <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-2)]">
              1. Most Impactful Absences (List Variant)
            </h2>
            <p className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
              Ranked list of players whose absence had the biggest impact on their team&apos;s
              performance. Shows win% and net rating differences.
            </p>
          </div>

          <PlayerAbsenceImpact
            absences={impactfulAbsences}
            variant="list"
            showTeamFilter={true}
          />
        </section>

        {/* Section 2: Most Impactful Absences (Compact) */}
        <section className="mb-[var(--space-16)]">
          <div className="mb-[var(--space-6)]">
            <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-2)]">
              2. Most Impactful Absences (Compact Variant)
            </h2>
            <p className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
              Same data in a more condensed format, useful for sidebars or smaller spaces.
            </p>
          </div>

          <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
            <PlayerAbsenceImpact
              absences={impactfulAbsences.slice(0, 10)}
              variant="compact"
              showTeamFilter={false}
            />
          </div>
        </section>

        {/* Section 3: Team Performance Without Player */}
        {teamSplits && sampleData ? (
          <section className="mb-[var(--space-16)]">
            <div className="mb-[var(--space-6)]">
              <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-2)]">
                3. Team Performance Without Player
              </h2>
              <p className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
                Compare {sampleData.player.team_abbreviation}&apos;s performance with and without{' '}
                {sampleData.player.player_name}. Shows comprehensive team metrics.
              </p>
            </div>

            {/* Side-by-side layout */}
            <div className="mb-[var(--space-8)]">
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">
                Side-by-Side Layout
              </h3>
              <TeamPerformanceWithoutPlayer
                splits={teamSplits}
                variant="side-by-side"
                highlightDifferences={true}
              />
            </div>

            {/* Stacked layout */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">
                Stacked Layout
              </h3>
              <TeamPerformanceWithoutPlayer
                splits={teamSplits}
                variant="stacked"
                highlightDifferences={true}
              />
            </div>
          </section>
        ) : (
          <section className="mb-[var(--space-16)]">
            <div className="mb-[var(--space-6)]">
              <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-2)]">
                3. Team Performance Without Player
              </h2>
            </div>
            <div className="bg-[var(--color-gray-950)] p-[var(--space-8)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)] text-center">
              <p className="text-[var(--color-gray-400)] text-[var(--text-base)]">
                No sample data available. Need players with sufficient games played this season.
              </p>
            </div>
          </section>
        )}

        {/* Section 4: Player Performance Without Teammate */}
        {playerSplits && sampleData && sampleData.teammate ? (
          <section className="mb-[var(--space-16)]">
            <div className="mb-[var(--space-6)]">
              <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-2)]">
                4. Player Performance Without Teammate
              </h2>
              <p className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
                Compare {sampleData.player.player_name}&apos;s stats with and without{' '}
                {sampleData.teammate.player_name} on the court. Includes advanced metrics (Usage%,
                TS%).
              </p>
            </div>

            {/* Side-by-side layout */}
            <div className="mb-[var(--space-8)]">
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">
                Side-by-Side Layout
              </h3>
              <PlayerPerformanceWithoutTeammate
                splits={playerSplits}
                variant="side-by-side"
                highlightDifferences={true}
                showAdvancedStats={true}
              />
            </div>

            {/* Stacked layout */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">
                Stacked Layout
              </h3>
              <PlayerPerformanceWithoutTeammate
                splits={playerSplits}
                variant="stacked"
                highlightDifferences={true}
                showAdvancedStats={true}
              />
            </div>
          </section>
        ) : (
          <section className="mb-[var(--space-16)]">
            <div className="mb-[var(--space-6)]">
              <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-2)]">
                4. Player Performance Without Teammate
              </h2>
            </div>
            <div className="bg-[var(--color-gray-950)] p-[var(--space-8)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)] text-center">
              <p className="text-[var(--color-gray-400)] text-[var(--text-base)]">
                No sample data available. Need multiple players with sufficient games played on the
                same team.
              </p>
            </div>
          </section>
        )}

        {/* Component Features Overview */}
        <section className="mb-[var(--space-16)]">
          <div className="mb-[var(--space-6)]">
            <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-2)]">
              Component Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-6)]">
            {/* Feature 1 */}
            <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
              <h3 className="text-[var(--text-lg)] font-[var(--font-semibold)] text-white mb-[var(--space-3)]">
                PlayerAbsenceImpact
              </h3>
              <ul className="space-y-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
                <li>✓ List and compact variants</li>
                <li>✓ Team filtering</li>
                <li>✓ Impact badges (Win%, Net Rating)</li>
                <li>✓ Games missed tracking</li>
                <li>✓ Clickable player cards</li>
                <li>✓ Empty state handling</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
              <h3 className="text-[var(--text-lg)] font-[var(--font-semibold)] text-white mb-[var(--space-3)]">
                TeamPerformanceWithoutPlayer
              </h3>
              <ul className="space-y-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
                <li>✓ Side-by-side and stacked layouts</li>
                <li>✓ Win/loss records comparison</li>
                <li>✓ Offensive/defensive ratings</li>
                <li>✓ Shooting percentages</li>
                <li>✓ Difference indicators</li>
                <li>✓ Insufficient data handling</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
              <h3 className="text-[var(--text-lg)] font-[var(--font-semibold)] text-white mb-[var(--space-3)]">
                PlayerPerformanceWithoutTeammate
              </h3>
              <ul className="space-y-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
                <li>✓ Basic stats (PTS, REB, AST)</li>
                <li>✓ Advanced stats (Usage%, TS%)</li>
                <li>✓ Side-by-side and stacked layouts</li>
                <li>✓ Performance delta indicators</li>
                <li>✓ Higher/lower is better logic</li>
                <li>✓ Games played tracking</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Summary */}
        {sampleData && (
          <section className="mb-[var(--space-16)]">
            <div className="mb-[var(--space-6)]">
              <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-2)]">
                Test Data Summary
              </h2>
            </div>

            <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-6)]">
                <div>
                  <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-500)] mb-[var(--space-2)]">
                    Sample Player
                  </div>
                  <div className="text-[var(--text-base)] text-white font-[var(--font-semibold)]">
                    {sampleData.player.player_name}
                  </div>
                  <div className="text-[var(--text-sm)] text-[var(--color-gray-400)] mt-[var(--space-1)]">
                    {sampleData.player.team_abbreviation} • {sampleData.player.games_played} games
                  </div>
                </div>

                {sampleData.teammate && (
                  <div>
                    <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-500)] mb-[var(--space-2)]">
                      Sample Teammate
                    </div>
                    <div className="text-[var(--text-base)] text-white font-[var(--font-semibold)]">
                      {sampleData.teammate.player_name}
                    </div>
                    <div className="text-[var(--text-sm)] text-[var(--color-gray-400)] mt-[var(--space-1)]">
                      {sampleData.player.team_abbreviation}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[var(--text-xs)] uppercase tracking-wider text-[var(--color-gray-500)] mb-[var(--space-2)]">
                    Impactful Absences
                  </div>
                  <div className="text-[var(--text-base)] text-white font-[var(--font-semibold)]">
                    {impactfulAbsences.length} players
                  </div>
                  <div className="text-[var(--text-sm)] text-[var(--color-gray-400)] mt-[var(--space-1)]">
                    Ranked by win% impact
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-[var(--space-16)] pt-[var(--space-8)] border-t border-[var(--color-gray-800)] text-center text-[var(--text-sm)] text-[var(--color-gray-500)]">
          Player Absence Impact Analysis Components ✅
        </footer>
      </div>
    </AppLayout>
  )
}
