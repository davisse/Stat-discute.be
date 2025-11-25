export const dynamic = 'force-dynamic'

import { AppLayout } from '@/components/layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { PlayerCard } from '@/components/dashboard/player-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, Target, Users } from 'lucide-react'
import { getCurrentSeason, getPlayersWithStats, getTopPerformers, getDatabaseStats } from '@/lib/queries'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default async function PlayersPage() {
  const currentSeason = await getCurrentSeason()
  const [players, topPerformers, stats] = await Promise.all([
    getPlayersWithStats(),
    getTopPerformers(),
    getDatabaseStats(),
  ])

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Players Dashboard' }
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Players Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">{currentSeason} Season Statistics</p>
        </div>
      </div>
      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Players"
          value={stats?.total_players || 0}
          subtitle="Active in database"
          icon={Trophy}
        />
        <StatCard
          title="Total Games"
          value={stats?.total_games || 0}
          subtitle={`${currentSeason} Season`}
          icon={TrendingUp}
        />
        <StatCard
          title="Player Stats"
          value={stats?.total_player_stats || 0}
          subtitle="Individual performances"
          icon={Target}
        />
      </div>

      {/* Top Performers */}
      {topPerformers && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Top Performers - {currentSeason}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topPerformers.top_scorer && (
              <PlayerCard
                title="Top Scorer"
                player={{
                  full_name: topPerformers.top_scorer.full_name,
                  team_abbreviation: topPerformers.top_scorer.team_abbreviation,
                  value: topPerformers.top_scorer.points_avg,
                  games_played: topPerformers.top_scorer.games_played,
                }}
              />
            )}
            {topPerformers.top_rebounder && (
              <PlayerCard
                title="Top Rebounder"
                player={{
                  full_name: topPerformers.top_rebounder.full_name,
                  team_abbreviation: topPerformers.top_rebounder.team_abbreviation,
                  value: topPerformers.top_rebounder.rebounds_avg,
                  games_played: topPerformers.top_rebounder.games_played,
                }}
              />
            )}
            {topPerformers.top_playmaker && (
              <PlayerCard
                title="Top Playmaker"
                player={{
                  full_name: topPerformers.top_playmaker.full_name,
                  team_abbreviation: topPerformers.top_playmaker.team_abbreviation,
                  value: topPerformers.top_playmaker.assists_avg,
                  games_played: topPerformers.top_playmaker.games_played,
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Players Statistics - {currentSeason} Season</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">GP</TableHead>
                  <TableHead className="text-right">MIN</TableHead>
                  <TableHead className="text-right">PTS</TableHead>
                  <TableHead className="text-right">REB</TableHead>
                  <TableHead className="text-right">AST</TableHead>
                  <TableHead className="text-right">FG%</TableHead>
                  <TableHead className="text-right">3P%</TableHead>
                  <TableHead className="text-right">FT%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players && players.map((player: any, idx: number) => (
                  <TableRow key={player.player_id} className={idx < 10 ? 'win-row' : ''}>
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{player.full_name}</TableCell>
                    <TableCell>{player.team_abbreviation}</TableCell>
                    <TableCell className="text-right">{player.games_played}</TableCell>
                    <TableCell className="text-right">{player.minutes_avg}</TableCell>
                    <TableCell className="text-right font-semibold">{player.points_avg}</TableCell>
                    <TableCell className="text-right">{player.rebounds_avg}</TableCell>
                    <TableCell className="text-right">{player.assists_avg}</TableCell>
                    <TableCell className="text-right">
                      {player.fg_pct ? (player.fg_pct * 100).toFixed(1) : '0.0'}%
                    </TableCell>
                    <TableCell className="text-right">
                      {player.fg3_pct ? (player.fg3_pct * 100).toFixed(1) : '0.0'}%
                    </TableCell>
                    <TableCell className="text-right">
                      {player.ft_pct ? (player.ft_pct * 100).toFixed(1) : '0.0'}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}
