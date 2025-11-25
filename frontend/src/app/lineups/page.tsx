import { getTodayLineups, getTodayInjuryReport, type GameWithLineups, type TeamLineupSnapshot, type InjuryReport } from '@/lib/queries'
import { AppLayout } from '@/components/layout'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function StatusBadge({ status }: { status: 'confirmed' | 'expected' }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full ${
          status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
        }`}
      />
      <span className="text-sm font-medium">
        {status === 'confirmed' ? 'Confirmed Lineup' : 'Expected Lineup'}
      </span>
    </div>
  )
}

function PlayerRow({
  position,
  name,
  status
}: {
  position: string
  name: string | null
  status: string | null
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-white/40 w-8">{position}</span>
        <span className="font-medium">{name || 'TBD'}</span>
      </div>
      {status && (
        <span className={`text-xs px-2 py-1 rounded ${
          status === 'Out' ? 'bg-red-500/20 text-red-400' :
          status === 'Ques' ? 'bg-yellow-500/20 text-yellow-400' :
          status === 'Doubt' ? 'bg-orange-500/20 text-orange-400' :
          status === 'Prob' ? 'bg-blue-500/20 text-blue-400' :
          'bg-white/5'
        }`}>
          {status}
        </span>
      )}
    </div>
  )
}

function TeamLineup({ lineup }: { lineup: TeamLineupSnapshot }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{lineup.team}</h3>
        <StatusBadge status={lineup.lineup_status} />
      </div>
      <div className="space-y-1">
        <PlayerRow position="PG" name={lineup.pg_name} status={lineup.pg_status} />
        <PlayerRow position="SG" name={lineup.sg_name} status={lineup.sg_status} />
        <PlayerRow position="SF" name={lineup.sf_name} status={lineup.sf_status} />
        <PlayerRow position="PF" name={lineup.pf_name} status={lineup.pf_status} />
        <PlayerRow position="C" name={lineup.c_name} status={lineup.c_status} />
      </div>
    </div>
  )
}

function BettingInfo({ game }: { game: GameWithLineups }) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
      <div>
        <div className="text-xs text-white/40 mb-1">Moneyline</div>
        <div className="text-sm font-mono">
          {game.home_ml && game.away_ml ? (
            <>
              <div>{game.home_team} {game.home_ml > 0 ? '+' : ''}{game.home_ml}</div>
              <div>{game.away_team} {game.away_ml > 0 ? '+' : ''}{game.away_ml}</div>
            </>
          ) : (
            <div className="text-white/40">N/A</div>
          )}
        </div>
      </div>
      <div>
        <div className="text-xs text-white/40 mb-1">Spread</div>
        <div className="text-sm font-mono">
          {game.spread_team && game.spread_value ? (
            <div>{game.spread_team} {game.spread_value > 0 ? '+' : ''}{game.spread_value}</div>
          ) : (
            <div className="text-white/40">N/A</div>
          )}
        </div>
      </div>
      <div>
        <div className="text-xs text-white/40 mb-1">Over/Under</div>
        <div className="text-sm font-mono">
          {game.over_under ? (
            <div>{game.over_under}</div>
          ) : (
            <div className="text-white/40">N/A</div>
          )}
        </div>
      </div>
    </div>
  )
}

function GameCard({ game }: { game: GameWithLineups }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      {/* Game Header */}
      <div className="mb-6">
        <div className="text-sm text-white/40 mb-2">{game.game_time}</div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{game.away_team}</div>
            <div className="text-xs text-white/40">{game.away_record}</div>
          </div>
          <div className="text-white/20 text-xl">@</div>
          <div className="text-center">
            <div className="text-2xl font-bold">{game.home_team}</div>
            <div className="text-xs text-white/40">{game.home_record}</div>
          </div>
        </div>

        {/* Betting Info */}
        <BettingInfo game={game} />
      </div>

      {/* Lineups */}
      <div className="grid md:grid-cols-2 gap-6">
        <TeamLineup lineup={game.away_lineup} />
        <TeamLineup lineup={game.home_lineup} />
      </div>

      {/* Referees */}
      {game.referees && game.referees.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-xs text-white/40 mb-2">Referees</div>
          <div className="text-sm">{game.referees.join(', ')}</div>
        </div>
      )}
    </div>
  )
}

function InjuryReportTable({ injuries }: { injuries: InjuryReport[] }) {
  if (injuries.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        No injury reports for today&apos;s games
      </div>
    )
  }

  // Group injuries by team
  const injuriesByTeam = injuries.reduce((acc, injury) => {
    if (!acc[injury.team]) {
      acc[injury.team] = []
    }
    acc[injury.team].push(injury)
    return acc
  }, {} as Record<string, InjuryReport[]>)

  return (
    <div className="space-y-4">
      {Object.entries(injuriesByTeam).map(([team, teamInjuries]) => {
        const firstInjury = teamInjuries[0]
        return (
          <div key={team} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">{team}</h3>
                <span className="text-sm text-white/40">vs {firstInjury.opponent}</span>
                <span className="text-xs text-white/30">{firstInjury.game_time}</span>
              </div>
            </div>
            <div className="space-y-2">
              {teamInjuries.map((injury, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white/40 w-8">{injury.position}</span>
                    <span className="font-medium">{injury.player_name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    injury.status === 'Out' ? 'bg-red-500/20 text-red-400' :
                    injury.status === 'Ques' ? 'bg-yellow-500/20 text-yellow-400' :
                    injury.status === 'Doubt' ? 'bg-orange-500/20 text-orange-400' :
                    injury.status === 'Prob' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-white/5'
                  }`}>
                    {injury.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default async function LineupsPage() {
  const games = await getTodayLineups()
  const injuries = await getTodayInjuryReport()

  // Get last update time from the first game (all games are from same scrape)
  const lastUpdate = games.length > 0
    ? new Date(games[0].scraped_at).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : null

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">NBA Daily Lineups</h1>
          {lastUpdate && <p className="text-white/60">Last updated: {lastUpdate}</p>}

          {/* Feature Highlights */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">
                <span className="font-semibold">Confirmed Lineup</span>
                <span className="text-white/60 ml-2">— Official team announcement</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">
                <span className="font-semibold">Expected Lineup</span>
                <span className="text-white/60 ml-2">— Projected based on trends</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-sm text-white/60">
                ℹ️ <span className="font-semibold">Only actual starters shown</span> — Injured "Out" players excluded
              </span>
            </div>
          </div>
        </div>

        {/* Games List */}
        {games.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-white/40 text-lg mb-2">No games scheduled for today</div>
            <div className="text-white/20 text-sm">Check back later for lineup updates</div>
          </div>
        ) : (
          <div className="space-y-6">
            {games.map((game, index) => (
              <GameCard key={index} game={game} />
            ))}
          </div>
        )}

        {/* Injury Report Section */}
        {injuries.length > 0 && (
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Injury Report</h2>
              <p className="text-white/60">Players with injury designations for today&apos;s games</p>
            </div>
            <InjuryReportTable injuries={injuries} />
          </div>
        )}

        {/* Data Source Attribution */}
        <div className="mt-12 text-center text-sm text-white/40">
          <p>Lineup data from <a href="https://www.rotowire.com/basketball/nba-lineups.php" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">RotoWire</a></p>
          <p className="mt-1">Updated multiple times daily (8am, 2pm, 5pm, 8pm ET)</p>
        </div>
      </div>
    </AppLayout>
  )
}
