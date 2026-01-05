import { Metadata } from 'next'
import { getQ1TodayGames, getQ1Leaderboard, getQ1TeamStats, Q1TeamStats, Q1TodayGame } from '@/lib/queries'
import { AppLayout } from '@/components/layout/AppLayout'

export const metadata: Metadata = {
  title: 'Q1 Moneyline Value Finder | Stat Discute',
  description: 'Find value in first quarter moneyline betting using statistical analysis'
}

// Value badge component
function ValueBadge({ edge }: { edge: number }) {
  if (edge >= 0.15) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
        EXCEPTIONAL VALUE
      </span>
    )
  } else if (edge >= 0.10) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        STRONG VALUE
      </span>
    )
  } else if (edge >= 0.05) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        MODERATE VALUE
      </span>
    )
  }
  return null
}

// Probability bar component
function ProbabilityBar({ homeProb, awayProb, homeAbbr, awayAbbr }: {
  homeProb: number
  awayProb: number
  homeAbbr: string
  awayAbbr: string
}) {
  const homeWidth = Math.round(homeProb * 100)
  const awayWidth = 100 - homeWidth

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-white/60">
        <span>{homeAbbr} {(homeProb * 100).toFixed(1)}%</span>
        <span>{(awayProb * 100).toFixed(1)}% {awayAbbr}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden flex">
        <div
          className="bg-blue-500 transition-all duration-300"
          style={{ width: `${homeWidth}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-300"
          style={{ width: `${awayWidth}%` }}
        />
      </div>
    </div>
  )
}

// Q1 stats mini table
function Q1StatsTable({ team, q1Avg, q1Allowed, q1WinPct, gamesPlayed, label }: {
  team: string
  q1Avg: number
  q1Allowed: number
  q1WinPct: number
  gamesPlayed: number
  label: 'HOME' | 'AWAY'
}) {
  const margin = q1Avg - q1Allowed
  const marginColor = margin > 0 ? 'text-green-400' : margin < 0 ? 'text-red-400' : 'text-white/60'

  return (
    <div className={`p-3 rounded-lg ${label === 'HOME' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-white">{team}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${label === 'HOME' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
          {label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-white/50 text-xs">Q1 Avg</div>
          <div className="text-white font-medium">{q1Avg.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-white/50 text-xs">Q1 Allow</div>
          <div className="text-white font-medium">{q1Allowed.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-white/50 text-xs">Q1 Margin</div>
          <div className={`font-medium ${marginColor}`}>
            {margin > 0 ? '+' : ''}{margin.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-white/50 text-xs">Q1 Win%</div>
          <div className="text-white font-medium">{(q1WinPct * 100).toFixed(0)}%</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-white/40">
        {gamesPlayed} games ({label.toLowerCase()})
      </div>
    </div>
  )
}

// Game card component
function GameCard({ game }: { game: Q1TodayGame }) {
  const projectedMargin = game.projected_home_q1 - game.projected_away_q1
  const favoredTeam = projectedMargin > 0 ? game.home_abbr : game.away_abbr
  const favoredProb = Math.max(game.home_model_win_prob, game.away_model_win_prob)

  // Calculate fair odds (decimal)
  const homeFairOdds = 1 / game.home_model_win_prob
  const awayFairOdds = 1 / game.away_model_win_prob

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          {game.away_abbr} @ {game.home_abbr}
        </h3>
        <span className="text-xs text-white/40">Q1 Moneyline</span>
      </div>

      {/* Team stats side by side */}
      <div className="grid grid-cols-2 gap-3">
        <Q1StatsTable
          team={game.home_abbr}
          q1Avg={game.home_q1_avg}
          q1Allowed={game.home_q1_allowed}
          q1WinPct={game.home_q1_win_pct}
          gamesPlayed={game.home_games_played}
          label="HOME"
        />
        <Q1StatsTable
          team={game.away_abbr}
          q1Avg={game.away_q1_avg}
          q1Allowed={game.away_q1_allowed}
          q1WinPct={game.away_q1_win_pct}
          gamesPlayed={game.away_games_played}
          label="AWAY"
        />
      </div>

      {/* Projections */}
      <div className="bg-white/5 rounded-lg p-3 space-y-3">
        <div className="text-sm font-medium text-white/80">Projections</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{game.projected_home_q1.toFixed(1)}</div>
            <div className="text-xs text-white/50">{game.home_abbr} Proj</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${projectedMargin > 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {projectedMargin > 0 ? '+' : ''}{projectedMargin.toFixed(1)}
            </div>
            <div className="text-xs text-white/50">Margin</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{game.projected_away_q1.toFixed(1)}</div>
            <div className="text-xs text-white/50">{game.away_abbr} Proj</div>
          </div>
        </div>
      </div>

      {/* Win probability bar */}
      <ProbabilityBar
        homeProb={game.home_model_win_prob}
        awayProb={game.away_model_win_prob}
        homeAbbr={game.home_abbr}
        awayAbbr={game.away_abbr}
      />

      {/* Fair odds */}
      <div className="flex justify-between items-center pt-2 border-t border-white/10">
        <div className="text-sm">
          <span className="text-white/50">Model Fair Odds:</span>
          <span className="ml-2 text-blue-400 font-mono">{game.home_abbr} {homeFairOdds.toFixed(2)}</span>
          <span className="text-white/30 mx-2">|</span>
          <span className="text-red-400 font-mono">{game.away_abbr} {awayFairOdds.toFixed(2)}</span>
        </div>
        <div className="text-xs text-white/40">
          Favored: {favoredTeam} ({(favoredProb * 100).toFixed(0)}%)
        </div>
      </div>
    </div>
  )
}

// Leaderboard component
function Leaderboard({ title, data, metric, format }: {
  title: string
  data: Q1TeamStats[]
  metric: keyof Q1TeamStats
  format: (val: number) => string
}) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <h3 className="text-sm font-bold text-white/80 mb-3">{title}</h3>
      <div className="space-y-2">
        {data.slice(0, 5).map((team, idx) => (
          <div key={team.abbreviation} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                'bg-white/10 text-white/50'
              }`}>
                {idx + 1}
              </span>
              <span className="text-white font-medium">{team.abbreviation}</span>
            </div>
            <span className="text-white/80 font-mono text-sm">
              {format(team[metric] as number)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function Q1ValuePage() {
  const [todayGames, leaderboard, allTeamStats] = await Promise.all([
    getQ1TodayGames(),
    getQ1Leaderboard(10),
    getQ1TeamStats()
  ])

  return (
    <AppLayout>
      <div className="min-h-screen p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Q1 Moneyline Value Finder</h1>
          <p className="text-white/60">
            Statistical analysis for first quarter moneyline betting
          </p>
        </div>

        {/* Model explanation */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400">i</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">How it works</h3>
              <p className="text-sm text-white/60">
                We project each team&apos;s Q1 score using opponent-adjusted averages, then convert the expected margin
                to a win probability using a logistic model. Compare our model&apos;s fair odds with market odds to find value.
              </p>
              <p className="text-xs text-white/40 mt-2">
                Formula: Projected Q1 = (Team Q1 Avg + Opponent Q1 Allowed) / 2 | Win Prob = 1 / (1 + e^(-0.15 * margin))
              </p>
            </div>
          </div>
        </div>

        {/* Today's Games */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Today&apos;s Games</h2>
            <span className="text-sm text-white/40">{todayGames.length} games</span>
          </div>

          {todayGames.length === 0 ? (
            <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
              <div className="text-white/40 text-lg">No games scheduled for today</div>
              <div className="text-white/30 text-sm mt-2">Check back when games are on the schedule</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {todayGames.map(game => (
                <GameCard key={game.game_id} game={game} />
              ))}
            </div>
          )}
        </section>

        {/* Leaderboards */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Q1 Leaderboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Leaderboard
              title="Best Q1 Offense"
              data={leaderboard.best_q1_offense}
              metric="q1_avg_scored"
              format={(val) => val.toFixed(1)}
            />
            <Leaderboard
              title="Best Q1 Defense"
              data={leaderboard.best_q1_defense}
              metric="q1_avg_allowed"
              format={(val) => val.toFixed(1)}
            />
            <Leaderboard
              title="Best Q1 Margin"
              data={leaderboard.best_q1_margin}
              metric="q1_margin"
              format={(val) => (val > 0 ? '+' : '') + val.toFixed(1)}
            />
            <Leaderboard
              title="Best Q1 Win%"
              data={leaderboard.best_q1_win_pct}
              metric="q1_win_pct"
              format={(val) => (val * 100).toFixed(0) + '%'}
            />
          </div>
        </section>

        {/* All Teams Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">All Teams Q1 Stats</h2>
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-sm font-medium text-white/60">Team</th>
                    <th className="text-right p-3 text-sm font-medium text-white/60">Q1 Avg</th>
                    <th className="text-right p-3 text-sm font-medium text-white/60">Q1 Allow</th>
                    <th className="text-right p-3 text-sm font-medium text-white/60">Margin</th>
                    <th className="text-right p-3 text-sm font-medium text-white/60">Win%</th>
                    <th className="text-right p-3 text-sm font-medium text-white/60">Games</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allTeamStats.map(team => {
                    const marginColor = team.q1_margin > 0 ? 'text-green-400' : team.q1_margin < 0 ? 'text-red-400' : 'text-white/60'
                    return (
                      <tr key={team.abbreviation} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-medium text-white">{team.abbreviation}</td>
                        <td className="p-3 text-right text-white/80 font-mono">{team.q1_avg_scored.toFixed(1)}</td>
                        <td className="p-3 text-right text-white/80 font-mono">{team.q1_avg_allowed.toFixed(1)}</td>
                        <td className={`p-3 text-right font-mono font-medium ${marginColor}`}>
                          {team.q1_margin > 0 ? '+' : ''}{team.q1_margin.toFixed(1)}
                        </td>
                        <td className="p-3 text-right text-white/80 font-mono">{(team.q1_win_pct * 100).toFixed(0)}%</td>
                        <td className="p-3 text-right text-white/60">{team.games_played}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center text-xs text-white/30 pt-4">
          Data updated from team_period_averages | Model: Logistic regression (k=0.15) on Q1 margins
        </div>
      </div>
    </AppLayout>
  )
}
