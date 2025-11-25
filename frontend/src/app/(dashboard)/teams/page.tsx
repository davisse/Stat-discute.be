export const dynamic = 'force-dynamic'

import { AppLayout } from '@/components/layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { TeamCard } from '@/components/dashboard/team-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, TrendingUp, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentSeason, getTeamStandings, getRecentGames, getDatabaseStats } from '@/lib/queries'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default async function TeamsPage() {
  const currentSeason = await getCurrentSeason()
  const [teams, recentGames, stats] = await Promise.all([
    getTeamStandings(),
    getRecentGames(10),
    getDatabaseStats(),
  ])

  const topTeams = teams.slice(0, 3)

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Teams Dashboard' }
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Teams Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">{currentSeason} Season Standings</p>
        </div>
      </div>
      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Teams"
          value={stats?.total_teams || 0}
          subtitle="NBA Teams"
          icon={Shield}
        />
        <StatCard
          title="Total Games"
          value={stats?.total_games || 0}
          subtitle={`${currentSeason} Season`}
          icon={Activity}
        />
        <StatCard
          title="Completion"
          value={`${((stats?.total_games || 0) / 1230 * 100).toFixed(1)}%`}
          subtitle="Season progress"
          icon={TrendingUp}
        />
      </div>

      {/* Top Teams */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Top Teams by Win % - {currentSeason}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topTeams.map((team: any) => (
            <TeamCard key={team.team_id} team={team} />
          ))}
        </div>
      </div>

      {/* Team Standings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Team Standings - {currentSeason} Season</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-right">Win %</TableHead>
                  <TableHead className="text-right">PPG</TableHead>
                  <TableHead className="text-right">Opp PPG</TableHead>
                  <TableHead className="text-right">Diff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team: any, idx: number) => {
                  const isWinning = team.win_pct > 0.5
                  return (
                    <TableRow
                      key={team.team_id}
                      className={isWinning ? 'win-row' : 'lose-row'}
                    >
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{team.full_name}</p>
                          <p className="text-xs text-muted-foreground">{team.abbreviation}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-green-600">
                        {team.wins}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-red-600">
                        {team.losses}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {(team.win_pct * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">{team.points_avg}</TableCell>
                      <TableCell className="text-right">{team.points_allowed_avg}</TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          team.point_diff > 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {team.point_diff > 0 ? '+' : ''}{team.point_diff}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Games - {currentSeason}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3">
            {recentGames && recentGames.map((game: any) => {
              const homeWon = game.home_score > game.away_score
              return (
                <div
                  key={game.game_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className={cn('flex items-center gap-2 sm:gap-3', homeWon ? 'font-semibold' : '')}>
                      <span className={cn('w-10 sm:w-12 text-center text-lg sm:text-xl flex-shrink-0', homeWon && 'text-green-600')}>
                        {game.home_score}
                      </span>
                      <span className="truncate text-sm sm:text-base">
                        {game.home_team} ({game.home_abbreviation})
                      </span>
                    </div>
                    <div className={cn('flex items-center gap-2 sm:gap-3 mt-2', !homeWon ? 'font-semibold' : '')}>
                      <span className={cn('w-10 sm:w-12 text-center text-lg sm:text-xl flex-shrink-0', !homeWon && 'text-green-600')}>
                        {game.away_score}
                      </span>
                      <span className="truncate text-sm sm:text-base">
                        {game.away_team} ({game.away_abbreviation})
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                    <p>{new Date(game.game_date).toLocaleDateString()}</p>
                    <p className="text-xs">{game.game_status}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}
