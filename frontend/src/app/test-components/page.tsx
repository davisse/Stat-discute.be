'use client'

import { useState, Suspense } from 'react'
import { AppLayout } from '@/components/layout'

// Player components
import PlayerStatsBento, { PlayerStatsData } from '@/components/player/PlayerStatsBento'
import StatCard from '@/components/player/StatCard'

// Player props components
import { AbsenceCascadeView } from '@/components/player-props/AbsenceCascadeView'
import { AbsencePlayerSelector } from '@/components/player-props/AbsencePlayerSelector'
import { GameCardsSelector } from '@/components/player-props/GameCardsSelector'
import { GameLogTable } from '@/components/player-props/GameLogTable'
import { NextGameMatchup } from '@/components/player-props/NextGameMatchup'
import { PerformanceTrends } from '@/components/player-props/PerformanceTrends'
import { PlayerAbsenceImpact } from '@/components/player-props/PlayerAbsenceImpact'
import { PlayerHeader } from '@/components/player-props/PlayerHeader'
import { PlayerPerformanceWithoutTeammate } from '@/components/player-props/PlayerPerformanceWithoutTeammate'
import { PlayerSplits } from '@/components/player-props/PlayerSplits'
import { PropAnalysisModal } from '@/components/player-props/PropAnalysisModal'
import { PropLinesPanel } from '@/components/player-props/PropLinesPanel'
import { PropsAnalysisTable, PlayerProp } from '@/components/player-props/PropsAnalysisTable'
import { TeamPerformanceWithoutPlayer } from '@/components/player-props/TeamPerformanceWithoutPlayer'

// ============================================================================
// MOCK DATA
// ============================================================================

// Mock: PlayerStatsBento
const mockPlayerStats: PlayerStatsData = {
  games_played: 42,
  ppg: 28.5,
  rpg: 7.2,
  apg: 8.1,
  spg: 1.4,
  bpg: 0.6,
  fg_pct: 52.3,
  three_pct: 38.7,
  ft_pct: 89.2,
  mpg: 35.8,
  tov: 3.2,
  ppg_rank: 3,
  rpg_rank: 28,
  apg_rank: 5,
  spg_rank: 22,
  bpg_rank: 145,
  fg_pct_rank: 18,
  three_pct_rank: 42,
  ft_pct_rank: 8,
  mpg_rank: 12,
  tov_rank: 180,
  total_players: 450
}

// Mock: AbsenceCascadeView (absentPlayer uses camelCase, teammates uses TeammatePerformanceSplit)
const mockAbsenceData = {
  absentPlayer: {
    playerId: 201566,
    playerName: 'LeBron James',
    teamId: 1610612747,
    teamAbbr: 'LAL',
    gamesPlayed: 34,
    gamesMissed: 8
  },
  teammates: [
    { player_id: 201566, player_name: 'LeBron James', teammate_id: 203076, teammate_name: 'Anthony Davis', position: 'C', with_games: 34, without_games: 8, with_pts: 24.2, without_pts: 31.8, pts_boost: 7.6, with_reb: 10.5, without_reb: 14.2, reb_boost: 3.7, with_ast: 3.2, without_ast: 4.8, ast_boost: 1.6, with_blk: 2.1, without_blk: 2.8, blk_boost: 0.7, with_stl: 1.2, without_stl: 1.8, stl_boost: 0.6, with_3pm: 0.8, without_3pm: 1.2, three_pm_boost: 0.4, with_fgm: 9.5, with_fga: 18.2, without_fgm: 12.1, without_fga: 22.5, starter_pct: 100 },
    { player_id: 201566, player_name: 'LeBron James', teammate_id: 1628389, teammate_name: 'Austin Reaves', position: 'G', with_games: 34, without_games: 8, with_pts: 15.3, without_pts: 22.1, pts_boost: 6.8, with_reb: 4.2, without_reb: 5.5, reb_boost: 1.3, with_ast: 5.1, without_ast: 7.2, ast_boost: 2.1, with_blk: 0.3, without_blk: 0.4, blk_boost: 0.1, with_stl: 0.8, without_stl: 1.5, stl_boost: 0.7, with_3pm: 2.1, without_3pm: 3.5, three_pm_boost: 1.4, with_fgm: 5.8, with_fga: 12.5, without_fgm: 8.2, without_fga: 17.1, starter_pct: 100 },
    { player_id: 201566, player_name: 'LeBron James', teammate_id: 1629234, teammate_name: "D'Angelo Russell", position: 'G', with_games: 34, without_games: 8, with_pts: 18.2, without_pts: 23.5, pts_boost: 5.3, with_reb: 3.1, without_reb: 3.8, reb_boost: 0.7, with_ast: 6.2, without_ast: 8.5, ast_boost: 2.3, with_blk: 0.2, without_blk: 0.3, blk_boost: 0.1, with_stl: 1.1, without_stl: 1.4, stl_boost: 0.3, with_3pm: 2.8, without_3pm: 3.9, three_pm_boost: 1.1, with_fgm: 6.5, with_fga: 14.8, without_fgm: 8.5, without_fga: 18.2, starter_pct: 100 },
    { player_id: 201566, player_name: 'LeBron James', teammate_id: 1630559, teammate_name: 'Rui Hachimura', position: 'F', with_games: 34, without_games: 8, with_pts: 12.1, without_pts: 15.8, pts_boost: 3.7, with_reb: 5.2, without_reb: 6.8, reb_boost: 1.6, with_ast: 1.5, without_ast: 2.1, ast_boost: 0.6, with_blk: 0.5, without_blk: 0.7, blk_boost: 0.2, with_stl: 0.6, without_stl: 0.9, stl_boost: 0.3, with_3pm: 1.2, without_3pm: 1.8, three_pm_boost: 0.6, with_fgm: 4.8, with_fga: 9.5, without_fgm: 6.2, without_fga: 12.1, starter_pct: 88 }
  ]
}

// Mock: AbsencePlayerSelector
const mockStarters = [
  { player_id: 201566, player_name: 'LeBron James', team_id: 1610612747, team_abbreviation: 'LAL', games_played: 34, games_missed: 8 },
  { player_id: 203076, player_name: 'Anthony Davis', team_id: 1610612747, team_abbreviation: 'LAL', games_played: 38, games_missed: 4 },
  { player_id: 203999, player_name: 'Nikola Jokic', team_id: 1610612743, team_abbreviation: 'DEN', games_played: 37, games_missed: 5 },
  { player_id: 201142, player_name: 'Kevin Durant', team_id: 1610612756, team_abbreviation: 'PHX', games_played: 36, games_missed: 6 },
  { player_id: 201935, player_name: 'James Harden', team_id: 1610612746, team_abbreviation: 'LAC', games_played: 40, games_missed: 2 }
]

// Mock: GameCardsSelector
const mockGames = [
  { game_id: '0022400501', game_date: '2025-01-10', home_team_id: 1610612747, home_abbr: 'LAL', home_team: 'Los Angeles Lakers', away_team_id: 1610612744, away_abbr: 'GSW', away_team: 'Golden State Warriors' },
  { game_id: '0022400502', game_date: '2025-01-12', home_team_id: 1610612738, home_abbr: 'BOS', home_team: 'Boston Celtics', away_team_id: 1610612747, away_abbr: 'LAL', away_team: 'Los Angeles Lakers' },
  { game_id: '0022400503', game_date: '2025-01-14', home_team_id: 1610612747, home_abbr: 'LAL', home_team: 'Los Angeles Lakers', away_team_id: 1610612756, away_abbr: 'PHX', away_team: 'Phoenix Suns' }
]

// Mock: GameLogTable
const mockGameLog = [
  { game_id: '0022400401', game_date: '2025-01-05', home_team: 'LAL', away_team: 'GSW', home_team_score: 118, away_team_score: 108, location: 'home' as const, result: 'W' as const, points: 32, rebounds: 8, assists: 11, steals: 2, blocks: 1, turnovers: 3, minutes: 36, fg_made: 12, fg_attempted: 22, fg3_made: 3, fg3_attempted: 8, ft_made: 5, ft_attempted: 6 },
  { game_id: '0022400392', game_date: '2025-01-03', home_team: 'DEN', away_team: 'LAL', home_team_score: 112, away_team_score: 105, location: 'away' as const, result: 'L' as const, points: 28, rebounds: 6, assists: 9, steals: 1, blocks: 0, turnovers: 4, minutes: 38, fg_made: 10, fg_attempted: 24, fg3_made: 2, fg3_attempted: 7, ft_made: 6, ft_attempted: 7 },
  { game_id: '0022400380', game_date: '2025-01-01', home_team: 'LAL', away_team: 'PHX', home_team_score: 122, away_team_score: 115, location: 'home' as const, result: 'W' as const, points: 35, rebounds: 9, assists: 12, steals: 3, blocks: 1, turnovers: 2, minutes: 37, fg_made: 13, fg_attempted: 21, fg3_made: 4, fg3_attempted: 9, ft_made: 5, ft_attempted: 5 },
  { game_id: '0022400365', game_date: '2024-12-29', home_team: 'SAC', away_team: 'LAL', home_team_score: 102, away_team_score: 110, location: 'away' as const, result: 'W' as const, points: 26, rebounds: 7, assists: 8, steals: 1, blocks: 0, turnovers: 3, minutes: 34, fg_made: 9, fg_attempted: 18, fg3_made: 2, fg3_attempted: 5, ft_made: 6, ft_attempted: 8 },
  { game_id: '0022400350', game_date: '2024-12-27', home_team: 'LAL', away_team: 'MIN', home_team_score: 98, away_team_score: 105, location: 'home' as const, result: 'L' as const, points: 22, rebounds: 5, assists: 10, steals: 0, blocks: 0, turnovers: 5, minutes: 35, fg_made: 8, fg_attempted: 20, fg3_made: 1, fg3_attempted: 6, ft_made: 5, ft_attempted: 6 }
]

// Mock: NextGameMatchup
const mockNextGame = {
  game_id: '0022400501',
  game_date: '2025-01-10',
  game_time: '7:30 PM ET',
  venue: 'Crypto.com Arena',
  home_team: 'Los Angeles Lakers',
  home_abbr: 'LAL',
  away_team: 'Golden State Warriors',
  away_abbr: 'GSW',
  player_location: 'home' as const
}

// Mock: PerformanceTrends
const mockTrendsGames = [
  { game_id: '1', game_date: '2025-01-05', points: 32, rebounds: 8, assists: 11 },
  { game_id: '2', game_date: '2025-01-03', points: 28, rebounds: 6, assists: 9 },
  { game_id: '3', game_date: '2025-01-01', points: 35, rebounds: 9, assists: 12 },
  { game_id: '4', game_date: '2024-12-29', points: 26, rebounds: 7, assists: 8 },
  { game_id: '5', game_date: '2024-12-27', points: 22, rebounds: 5, assists: 10 },
  { game_id: '6', game_date: '2024-12-25', points: 30, rebounds: 8, assists: 7 },
  { game_id: '7', game_date: '2024-12-23', points: 28, rebounds: 6, assists: 11 },
  { game_id: '8', game_date: '2024-12-21', points: 33, rebounds: 9, assists: 9 },
  { game_id: '9', game_date: '2024-12-19', points: 25, rebounds: 7, assists: 8 },
  { game_id: '10', game_date: '2024-12-17', points: 29, rebounds: 8, assists: 10 }
]

// Mock: PlayerAbsenceImpact (uses ImpactfulAbsence interface)
const mockAbsences = [
  {
    absent_player_id: 201566,
    absent_player_name: 'LeBron James',
    games_missed: 8,
    team_pts_diff: -13.3,
    beneficiaries: [
      { player_id: 201566, player_name: 'LeBron James', teammate_id: 203076, teammate_name: 'Anthony Davis', position: 'C', with_games: 34, without_games: 8, with_pts: 24.2, without_pts: 31.8, pts_boost: 7.6, with_reb: 10.5, without_reb: 14.2, reb_boost: 3.7, with_ast: 3.2, without_ast: 4.8, ast_boost: 1.6, with_blk: 2.1, without_blk: 2.8, blk_boost: 0.7, with_stl: 1.2, without_stl: 1.8, stl_boost: 0.6, with_3pm: 0.8, without_3pm: 1.2, three_pm_boost: 0.4, with_fgm: 9.5, with_fga: 18.2, without_fgm: 12.1, without_fga: 22.5, starter_pct: 100 }
    ]
  },
  {
    absent_player_id: 203999,
    absent_player_name: 'Nikola Jokic',
    games_missed: 5,
    team_pts_diff: -13.7,
    beneficiaries: [
      { player_id: 203999, player_name: 'Nikola Jokic', teammate_id: 1628370, teammate_name: 'Jamal Murray', position: 'G', with_games: 35, without_games: 5, with_pts: 21.5, without_pts: 28.2, pts_boost: 6.7, with_reb: 4.1, without_reb: 5.2, reb_boost: 1.1, with_ast: 6.2, without_ast: 8.1, ast_boost: 1.9, with_blk: 0.2, without_blk: 0.3, blk_boost: 0.1, with_stl: 1.5, without_stl: 2.1, stl_boost: 0.6, with_3pm: 2.5, without_3pm: 3.2, three_pm_boost: 0.7, with_fgm: 7.8, with_fga: 17.5, without_fgm: 10.2, without_fga: 21.8, starter_pct: 100 }
    ]
  },
  {
    absent_player_id: 201142,
    absent_player_name: 'Kevin Durant',
    games_missed: 6,
    team_pts_diff: -8.4,
    beneficiaries: [
      { player_id: 201142, player_name: 'Kevin Durant', teammate_id: 1629630, teammate_name: 'Devin Booker', position: 'G', with_games: 36, without_games: 6, with_pts: 26.8, without_pts: 32.1, pts_boost: 5.3, with_reb: 4.5, without_reb: 5.8, reb_boost: 1.3, with_ast: 6.8, without_ast: 8.5, ast_boost: 1.7, with_blk: 0.3, without_blk: 0.4, blk_boost: 0.1, with_stl: 1.0, without_stl: 1.4, stl_boost: 0.4, with_3pm: 2.8, without_3pm: 3.5, three_pm_boost: 0.7, with_fgm: 9.2, with_fga: 20.5, without_fgm: 11.5, without_fga: 24.2, starter_pct: 100 }
    ]
  }
]

// Mock: PlayerHeader
const mockPlayer = {
  player_id: '201566',
  full_name: 'LeBron James',
  position: 'SF',
  jersey_number: '23',
  team_abbr: 'LAL',
  team_name: 'Los Angeles Lakers',
  height: '6-9',
  weight: '250',
  games_played: 42,
  points_avg: 28.5,
  rebounds_avg: 7.2,
  assists_avg: 8.1,
  minutes_avg: 35.8,
  fg_pct: 52.3
}

// Mock: PlayerPerformanceWithoutTeammate (uses PlayerSplitsWithTeammate interface)
const mockPlayerSplitsWithTeammate = {
  with_teammate_games: 34,
  without_teammate_games: 8,
  with_teammate_pts: 28.5,
  without_teammate_pts: 32.1,
  with_teammate_usage: 32.5,
  without_teammate_usage: 38.2
}

// Mock: PlayerSplits
const mockSplits = {
  home: {
    location: 'home' as const,
    games: 21,
    points_avg: 30.2,
    rebounds_avg: 7.8,
    assists_avg: 8.5,
    minutes_avg: 35.2,
    fg_pct: 54.1
  },
  away: {
    location: 'away' as const,
    games: 21,
    points_avg: 26.8,
    rebounds_avg: 6.6,
    assists_avg: 7.7,
    minutes_avg: 36.4,
    fg_pct: 50.5
  }
}

// Mock: PropAnalysisModal & PropsAnalysisTable (PlayerProp)
const mockPlayerProp: PlayerProp = {
  player_id: 201566,
  player_name: 'LeBron James',
  team_abbr: 'LAL',
  position: 'SF',
  games_played: 42,
  ppg: '28.5',
  rpg: '7.2',
  apg: '8.1',
  threes_pg: '2.3',
  pra_pg: '43.8',
  mpg: '35.8',
  game_id: '0022400501',
  event_id: 'evt_123',
  opponent_abbr: 'GSW',
  is_home: true,
  defense_starter_ppg_allowed: 26.5,
  defense_rank: 18,
  edge_points: 2.0,
  edge_verdict: 'LEAN_OVER',
  starter_rate: 100,
  prop_line: 27.5,
  prop_type: 'Points',
  prop_over_odds: 1.91,
  prop_under_odds: 1.91,
  all_props: [
    { prop_type: 'Points', line: 27.5, over_odds: 1.91, under_odds: 1.91, bookmaker: 'Pinnacle' },
    { prop_type: 'Rebounds', line: 6.5, over_odds: 1.87, under_odds: 1.95, bookmaker: 'Pinnacle' },
    { prop_type: 'Assists', line: 7.5, over_odds: 1.83, under_odds: 2.00, bookmaker: 'Pinnacle' },
    { prop_type: 'Pts+Reb+Ast', line: 42.5, over_odds: 1.90, under_odds: 1.92, bookmaker: 'Pinnacle' }
  ]
}

// Mock: PropLinesPanel
const mockPropLinesPanelStats = {
  points_avg: 28.5,
  rebounds_avg: 7.2,
  assists_avg: 8.1,
  games_played: 42
}

const mockRecentGames = [
  { points: 32, rebounds: 8, assists: 11 },
  { points: 28, rebounds: 6, assists: 9 },
  { points: 35, rebounds: 9, assists: 12 },
  { points: 26, rebounds: 7, assists: 8 },
  { points: 22, rebounds: 5, assists: 10 },
  { points: 30, rebounds: 8, assists: 7 },
  { points: 28, rebounds: 6, assists: 11 },
  { points: 33, rebounds: 9, assists: 9 },
  { points: 25, rebounds: 7, assists: 8 },
  { points: 29, rebounds: 8, assists: 10 }
]

// Mock: PropsAnalysisTable
const mockPlayersProps: PlayerProp[] = [
  mockPlayerProp,
  {
    player_id: 203999,
    player_name: 'Nikola Jokic',
    team_abbr: 'DEN',
    position: 'C',
    games_played: 40,
    ppg: '26.2',
    rpg: '12.8',
    apg: '9.5',
    threes_pg: '1.2',
    pra_pg: '48.5',
    mpg: '34.2',
    game_id: '0022400502',
    opponent_abbr: 'MIA',
    is_home: false,
    defense_starter_ppg_allowed: 24.8,
    defense_rank: 12,
    edge_points: 1.4,
    edge_verdict: 'LEAN_OVER',
    starter_rate: 100,
    prop_line: 25.5,
    prop_type: 'Points',
    prop_over_odds: 1.88,
    prop_under_odds: 1.94,
    all_props: [
      { prop_type: 'Points', line: 25.5, over_odds: 1.88, under_odds: 1.94, bookmaker: 'Pinnacle' },
      { prop_type: 'Rebounds', line: 12.5, over_odds: 1.90, under_odds: 1.92, bookmaker: 'Pinnacle' }
    ]
  },
  {
    player_id: 201142,
    player_name: 'Kevin Durant',
    team_abbr: 'PHX',
    position: 'SF',
    games_played: 38,
    ppg: '27.8',
    rpg: '6.4',
    apg: '5.2',
    threes_pg: '2.1',
    pra_pg: '39.4',
    mpg: '36.5',
    game_id: '0022400503',
    opponent_abbr: 'BOS',
    is_home: true,
    defense_starter_ppg_allowed: 23.2,
    defense_rank: 5,
    edge_points: -0.6,
    edge_verdict: 'LEAN_UNDER',
    starter_rate: 95,
    prop_line: 27.5,
    prop_type: 'Points',
    prop_over_odds: 1.95,
    prop_under_odds: 1.87,
    all_props: [
      { prop_type: 'Points', line: 27.5, over_odds: 1.95, under_odds: 1.87, bookmaker: 'Pinnacle' }
    ]
  }
]

// Mock: TeamPerformanceWithoutPlayer
const mockTeamSplits = {
  with_player_games: 34,
  with_player_ppg: 118.5,
  with_player_total: 4029,
  without_player_games: 8,
  without_player_ppg: 105.2,
  without_player_total: 842
}

// ============================================================================
// TEST PAGE COMPONENT
// ============================================================================

export default function TestComponentsPage() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [selectedPropsPlayer, setSelectedPropsPlayer] = useState<PlayerProp | null>(null)
  const [showPropModal, setShowPropModal] = useState(false)

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Component Test Gallery
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Visualisation des 16 composants non-utilisés pour décider lesquels intégrer à la page player detail.
          </p>
        </header>

        {/* ================================================================ */}
        {/* SECTION 1: Player Stats Components */}
        {/* ================================================================ */}
        <section className="space-y-8">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-bold text-white">1. Player Stats Components</h2>
            <p className="text-zinc-500 text-sm mt-1">Composants de statistiques traditionnelles</p>
          </div>

          {/* 1.1 PlayerStatsBento */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">1.1 PlayerStatsBento</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player/PlayerStatsBento.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Grille Bento pour stats traditionnelles (PPG, RPG, APG, etc.) avec classements NBA.
              Hero card pour PPG, cartes medium/small pour autres stats.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <PlayerStatsBento stats={mockPlayerStats} season="2024-25" />
            </div>
          </div>

          {/* 1.2 StatCard */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">1.2 StatCard</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player/StatCard.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Carte de stat réutilisable avec 4 tailles (hero/large/medium/small).
              Supporte les classements et le mode &quot;lower is better&quot; pour les turnovers.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Points Per Game" shortLabel="PPG" value={28.5} rank={3} size="hero" />
                <StatCard label="Rebounds Per Game" shortLabel="RPG" value={7.2} rank={28} size="large" />
                <StatCard label="Assists Per Game" shortLabel="APG" value={8.1} rank={5} size="medium" />
                <StatCard label="Turnovers" shortLabel="TOV" value={3.2} rank={180} size="small" lowerIsBetter />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 2: Player Identity & Header */}
        {/* ================================================================ */}
        <section className="space-y-8">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-bold text-white">2. Player Identity</h2>
            <p className="text-zinc-500 text-sm mt-1">Composants d&apos;identité joueur</p>
          </div>

          {/* 2.1 PlayerHeader */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">2.1 PlayerHeader</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/PlayerHeader.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Carte d&apos;identité joueur avec photo placeholder, position, équipe et grille des moyennes de saison.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <PlayerHeader player={mockPlayer} />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 3: Game & Schedule Components */}
        {/* ================================================================ */}
        <section className="space-y-8">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-bold text-white">3. Game & Schedule</h2>
            <p className="text-zinc-500 text-sm mt-1">Composants de matchs et calendrier</p>
          </div>

          {/* 3.1 NextGameMatchup */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">3.1 NextGameMatchup</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/NextGameMatchup.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Aperçu du prochain match avec logos équipes, date/heure/lieu, indicateur home/away.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <NextGameMatchup nextGame={mockNextGame} playerTeam="LAL" />
            </div>
          </div>

          {/* 3.2 GameCardsSelector */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">3.2 GameCardsSelector</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/GameCardsSelector.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Sélecteur horizontal scrollable de cartes de matchs pour les matchs du soir.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <GameCardsSelector
                games={mockGames}
                selectedGameId={selectedGameId}
                onSelectGame={setSelectedGameId}
              />
            </div>
          </div>

          {/* 3.3 GameLogTable */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">3.3 GameLogTable</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/GameLogTable.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Game log responsive (cartes mobile, tableau desktop) avec PTS/REB/AST et stats de tir.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <GameLogTable games={mockGameLog} playerTeam="LAL" />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 4: Performance & Trends */}
        {/* ================================================================ */}
        <section className="space-y-8">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-bold text-white">4. Performance & Trends</h2>
            <p className="text-zinc-500 text-sm mt-1">Composants de tendances et performance</p>
          </div>

          {/* 4.1 PerformanceTrends */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">4.1 PerformanceTrends</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/PerformanceTrends.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Graphiques SVG en lignes pour tendances PTS/REB/AST sur les 10 derniers matchs avec indicateurs de tendance.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <PerformanceTrends
                games={mockTrendsGames}
                playerAvg={{ points_avg: 28.5, rebounds_avg: 7.2, assists_avg: 8.1 }}
              />
            </div>
          </div>

          {/* 4.2 PlayerSplits */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">4.2 PlayerSplits</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/PlayerSplits.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Tableau comparatif Home/Away avec icônes.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 max-w-2xl">
              <PlayerSplits splits={mockSplits} />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 5: Absence Impact Analysis */}
        {/* ================================================================ */}
        <section className="space-y-8">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-bold text-white">5. Absence Impact Analysis</h2>
            <p className="text-zinc-500 text-sm mt-1">Analyse d&apos;impact des absences</p>
          </div>

          {/* 5.1 AbsencePlayerSelector */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">5.1 AbsencePlayerSelector</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/AbsencePlayerSelector.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Double dropdown (équipe → joueur) pour analyse d&apos;absence avec sync URL.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <Suspense fallback={<div className="text-zinc-500 animate-pulse">Loading selector...</div>}>
                <AbsencePlayerSelector starters={mockStarters} currentPlayerId={201566} />
              </Suspense>
            </div>
          </div>

          {/* 5.2 AbsenceCascadeView */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">5.2 AbsenceCascadeView</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/AbsenceCascadeView.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Grille de cartes coéquipiers montrant le boost de points quand le joueur est absent.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <AbsenceCascadeView
                absentPlayer={mockAbsenceData.absentPlayer}
                teammates={mockAbsenceData.teammates}
              />
            </div>
          </div>

          {/* 5.3 PlayerAbsenceImpact */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">5.3 PlayerAbsenceImpact</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/PlayerAbsenceImpact.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Liste classée des absences les plus impactantes avec différentiel de points équipe.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 max-w-2xl">
              <PlayerAbsenceImpact absences={mockAbsences} variant="list" />
            </div>
          </div>

          {/* 5.4 PlayerPerformanceWithoutTeammate */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">5.4 PlayerPerformanceWithoutTeammate</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/PlayerPerformanceWithoutTeammate.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Comparaison côte à côte des stats du joueur avec/sans un coéquipier spécifique.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 max-w-2xl">
              <PlayerPerformanceWithoutTeammate
                splits={mockPlayerSplitsWithTeammate}
                playerName="LeBron James"
                teammateName="Anthony Davis"
              />
            </div>
          </div>

          {/* 5.5 TeamPerformanceWithoutPlayer */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">5.5 TeamPerformanceWithoutPlayer</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/TeamPerformanceWithoutPlayer.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Splits de performance équipe (PPG, points totaux) avec/sans un joueur.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 max-w-2xl">
              <TeamPerformanceWithoutPlayer
                splits={mockTeamSplits}
                playerName="LeBron James"
                teamName="Los Angeles Lakers"
              />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 6: Props & Betting Analysis */}
        {/* ================================================================ */}
        <section className="space-y-8">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-bold text-white">6. Props & Betting Analysis</h2>
            <p className="text-zinc-500 text-sm mt-1">Analyse de props betting</p>
          </div>

          {/* 6.1 PropLinesPanel */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">6.1 PropLinesPanel</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/PropLinesPanel.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Cartes de hit rate pour props PTS/REB/AST avec tendances L5/L10 et recommandations.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 max-w-2xl">
              <PropLinesPanel
                playerId="201566"
                playerName="LeBron James"
                stats={mockPropLinesPanelStats}
                recentGames={mockRecentGames}
              />
            </div>
          </div>

          {/* 6.2 PropsAnalysisTable */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">6.2 PropsAnalysisTable</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/PropsAnalysisTable.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Tableau complet avec pills de type prop, filtres, vue mobile en cartes, calcul d&apos;edge.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <PropsAnalysisTable
                players={mockPlayersProps}
                onSelectPlayer={(player) => setSelectedPropsPlayer(player)}
                selectedPlayerId={selectedPropsPlayer?.player_id ?? null}
              />
            </div>
          </div>

          {/* 6.3 PropAnalysisModal */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-emerald-400">6.3 PropAnalysisModal</h3>
              <span className="text-xs text-zinc-500 font-mono">components/player-props/PropAnalysisModal.tsx</span>
            </div>
            <p className="text-zinc-400 text-sm">
              Modal plein écran avec slider de seuil, double bar charts, résumé d&apos;analyse.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <button
                onClick={() => setShowPropModal(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
              >
                Ouvrir PropAnalysisModal
              </button>
            </div>
          </div>
        </section>

        {/* Modal */}
        {showPropModal && (
          <PropAnalysisModal
            player={mockPlayerProp}
            onClose={() => setShowPropModal(false)}
          />
        )}

        {/* Footer */}
        <footer className="border-t border-zinc-800 pt-8 text-center text-zinc-500 text-sm">
          <p>16 composants affichés avec données mock</p>
          <p className="mt-2">Sélectionne ceux à intégrer dans la page player detail</p>
        </footer>
      </div>
    </AppLayout>
  )
}
