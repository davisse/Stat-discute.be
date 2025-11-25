import { AppLayout } from '@/components/layout'
import {
  getBestDefensesAgainstPosition,
  getWorstDefensesAgainstPosition,
  type DefensiveStatsByPosition
} from '@/lib/queries'

// Position display names
const POSITIONS = [
  { value: 'PG', label: 'Point Guard', emoji: '🎯' },
  { value: 'SG', label: 'Shooting Guard', emoji: '🏀' },
  { value: 'SF', label: 'Small Forward', emoji: '⚡' },
  { value: 'PF', label: 'Power Forward', emoji: '💪' },
  { value: 'C', label: 'Center', emoji: '🏔️' }
]

function DefenseRankCard({
  defense,
  isFavorable
}: {
  defense: DefensiveStatsByPosition
  isFavorable: boolean
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-white font-bold text-lg font-mono">
            {defense.team_abbreviation}
          </div>
          <div className="text-white/60 text-sm">
            {defense.team_full_name}
          </div>
        </div>
        <div
          className="text-2xl font-bold font-mono"
          style={{
            color: isFavorable
              ? 'oklch(75% 0.2 145)' // Green for favorable (bad defense)
              : 'oklch(75% 0.2 25)'   // Red for tough (good defense)
          }}
        >
          #{defense.points_allowed_rank}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-white/40 text-xs mb-1">PPG Allowed</div>
          <div className="text-white font-mono text-xl font-bold">
            {defense.points_allowed_per_game.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-white/40 text-xs mb-1">FG% Allowed</div>
          <div className="text-white font-mono text-xl font-bold">
            {defense.fg_pct_allowed.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-white/40 text-xs mb-1">Rebounds/G</div>
          <div className="text-white font-mono text-base">
            {defense.rebounds_allowed_per_game.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-white/40 text-xs mb-1">Assists/G</div>
          <div className="text-white font-mono text-base">
            {defense.assists_allowed_per_game.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
}

function PositionSection({ position }: { position: typeof POSITIONS[0] }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{position.emoji}</span>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {position.label} ({position.value})
          </h2>
          <p className="text-white/60 text-sm">
            Matchup analysis for {position.label.toLowerCase()}s
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Tough Matchups (Best Defenses) */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1">
              🛡️ Toughest Defenses
            </h3>
            <p className="text-white/50 text-sm">
              Teams that allow fewest points to {position.value}s
            </p>
          </div>
          <PositionDefenses position={position.value} favorable={false} />
        </div>

        {/* Favorable Matchups (Worst Defenses) */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1">
              🎯 Best Matchups
            </h3>
            <p className="text-white/50 text-sm">
              Teams that allow most points to {position.value}s
            </p>
          </div>
          <PositionDefenses position={position.value} favorable={true} />
        </div>
      </div>
    </div>
  )
}

async function PositionDefenses({
  position,
  favorable
}: {
  position: string
  favorable: boolean
}) {
  try {
    const defenses = favorable
      ? await getWorstDefensesAgainstPosition(position, 5)
      : await getBestDefensesAgainstPosition(position, 5)

    if (defenses.length === 0) {
      return (
        <div className="text-white/40 text-sm italic">
          No data available for this position
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {defenses.map((defense) => (
          <DefenseRankCard
            key={`${defense.team_id}-${position}`}
            defense={defense}
            isFavorable={favorable}
          />
        ))}
      </div>
    )
  } catch (error) {
    console.error(`Error fetching defenses for ${position}:`, error)
    return (
      <div className="text-red-400 text-sm">
        Error loading defensive stats
      </div>
    )
  }
}

export default async function MatchupsPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Positional Matchup Analysis
          </h1>
          <p className="text-white/70 text-lg max-w-3xl">
            Identify favorable and tough matchups based on how teams defend against
            specific positions. Find betting edges by targeting players facing weak
            positional defenses.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 mb-12">
          <h3 className="text-white font-bold text-lg mb-4">📊 How to Use This Data</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-white/90 font-semibold mb-1">🛡️ Tough Matchups</div>
              <div className="text-white/60">
                Teams ranked #1-5 have elite defense against this position.
                Consider UNDER on player props.
              </div>
            </div>
            <div>
              <div className="text-white/90 font-semibold mb-1">🎯 Best Matchups</div>
              <div className="text-white/60">
                Teams that struggle defensively. Target these matchups for
                OVER on player props.
              </div>
            </div>
            <div>
              <div className="text-white/90 font-semibold mb-1">📈 Key Metrics</div>
              <div className="text-white/60">
                PPG Allowed = Points per game allowed to this position.
                Lower is better defense.
              </div>
            </div>
          </div>
        </div>

        {/* Position Sections */}
        <div className="space-y-16">
          {POSITIONS.map((position) => (
            <PositionSection key={position.value} position={position} />
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 p-6 bg-white/5 border border-white/10 rounded-xl">
          <div className="text-white/60 text-sm">
            <p className="mb-2">
              <strong className="text-white">Data Notes:</strong> Defensive stats
              calculated from 2025-26 season games. Rankings are relative to all 30 NBA teams.
            </p>
            <p>
              <strong className="text-white">Coverage:</strong> Stats based on 84 major players
              with position data (13% of active roster). Analytics update daily with new games.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export const metadata = {
  title: 'Positional Matchup Analysis | Stat Discute',
  description: 'NBA positional matchup analysis - identify favorable betting matchups based on team defense by position'
}
