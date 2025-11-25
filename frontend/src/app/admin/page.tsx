import { getAdminStats, getGamesWithStats, getTopPlayers, getTeamStandings, getSyncLogs } from '@/lib/queries'
import { StatsCard } from './components/StatsCard'
import { DataTable } from './components/DataTable'
import { Tabs } from './components/Tabs'
import { SyncActions } from './components/SyncActions'
import { AppLayout } from '@/components/layout'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  // Fetch all data in parallel
  const [stats, games, players, standings, logs] = await Promise.all([
    getAdminStats(),
    getGamesWithStats(20, 0),
    getTopPlayers(20),
    getTeamStandings(),
    getSyncLogs(10)
  ])

  // Format last update date
  const lastUpdate = stats.last_update
    ? new Date(stats.last_update).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    : 'Never'

  return (
    <AppLayout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
      {/* Page Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        padding: '24px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#111827',
          margin: '0 0 8px 0'
        }}>
          Dashboard
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          margin: 0
        }}>
          Season {stats.current_season} - Data Management & Synchronization
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <StatsCard
          title="Total Games"
          value={stats.total_games.toLocaleString()}
          subtitle={`Season ${stats.current_season}`}
        />
        <StatsCard
          title="Player Stats"
          value={stats.total_player_stats.toLocaleString()}
          subtitle="Box scores recorded"
        />
        <StatsCard
          title="Unique Players"
          value={stats.unique_players.toLocaleString()}
          subtitle="Active this season"
        />
        <StatsCard
          title="Last Update"
          value={lastUpdate.split(' ')[1] || 'N/A'}
          subtitle={lastUpdate.split(' ')[0] || 'Never synced'}
        />
      </div>

      {/* Data Tables with Tabs */}
      <Tabs
        tabs={[
          {
            id: 'games',
            label: `Games (${games.length})`,
            content: (
              <DataTable
                columns={[
                  { key: 'game_date', label: 'Date', width: '120px' },
                  { key: 'away_team', label: 'Away', width: '80px' },
                  { key: 'away_team_score', label: 'Score', width: '70px' },
                  { key: 'home_team', label: 'Home', width: '80px' },
                  { key: 'home_team_score', label: 'Score', width: '70px' },
                  { key: 'game_status', label: 'Status', width: '100px' },
                  { key: 'stats_count', label: 'Stats', width: '80px' }
                ]}
                data={games.map(g => ({
                  game_date: new Date(g.game_date).toLocaleDateString('fr-FR'),
                  away_team: g.away_team,
                  away_team_score: g.away_team_score || '-',
                  home_team: g.home_team,
                  home_team_score: g.home_team_score || '-',
                  game_status: g.game_status,
                  stats_count: g.stats_count
                }))}
              />
            )
          },
          {
            id: 'players',
            label: `Top Players (${players.length})`,
            content: (
              <DataTable
                columns={[
                  { key: 'full_name', label: 'Player', width: '180px' },
                  { key: 'team_abbreviation', label: 'Team', width: '80px' },
                  { key: 'games_played', label: 'GP', width: '60px' },
                  { key: 'points_avg', label: 'PPG', width: '70px' },
                  { key: 'rebounds_avg', label: 'RPG', width: '70px' },
                  { key: 'assists_avg', label: 'APG', width: '70px' }
                ]}
                data={players}
              />
            )
          },
          {
            id: 'standings',
            label: `Standings (${standings.length})`,
            content: (
              <DataTable
                columns={[
                  { key: 'full_name', label: 'Team', width: '200px' },
                  { key: 'wins', label: 'W', width: '60px' },
                  { key: 'losses', label: 'L', width: '60px' },
                  { key: 'win_pct', label: 'PCT', width: '80px' },
                  { key: 'points_avg', label: 'PPG', width: '70px' },
                  { key: 'points_allowed_avg', label: 'OPP', width: '70px' },
                  { key: 'point_diff', label: 'DIFF', width: '70px' }
                ]}
                data={standings.map(team => ({
                  ...team,
                  win_pct: team.win_pct ? parseFloat(team.win_pct.toString()).toFixed(3) : '0.000',
                  points_avg: team.points_avg ? parseFloat(team.points_avg.toString()).toFixed(1) : '0.0',
                  points_allowed_avg: team.points_allowed_avg ? parseFloat(team.points_allowed_avg.toString()).toFixed(1) : '0.0',
                  point_diff: team.point_diff ? parseFloat(team.point_diff.toString()).toFixed(1) : '0.0'
                }))}
              />
            )
          }
        ]}
        defaultTab="games"
      />

      {/* Sync Actions */}
      <SyncActions />

      {/* Sync Logs */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        padding: '24px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 16px 0'
        }}>
          Recent Sync Logs
        </h2>
        <DataTable
          columns={[
            { key: 'created_at', label: 'Time', width: '180px' },
            { key: 'action', label: 'Action', width: '180px' },
            { key: 'status', label: 'Status', width: '100px' },
            { key: 'duration', label: 'Duration', width: '100px' },
            { key: 'message', label: 'Message' }
          ]}
          data={logs.map(log => ({
            created_at: new Date(log.created_at).toLocaleString('fr-FR', {
              dateStyle: 'short',
              timeStyle: 'medium'
            }),
            action: log.action.replace(/_/g, ' ').toUpperCase(),
            status: log.status === 'success' ? '✓ Success' : log.status === 'error' ? '✗ Error' : '⟳ Running',
            duration: log.duration ? `${log.duration}s` : '-',
            message: log.message || '-'
          }))}
        />
      </div>
      </div>
    </AppLayout>
  )
}
