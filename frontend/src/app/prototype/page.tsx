'use client'

import * as React from 'react'
import { AppLayout } from '@/components/layout'
import { StatCard } from '@/components/stats/StatCard'
import { TrendIndicator } from '@/components/stats/TrendIndicator'
import { StatsTable, type Column } from '@/components/stats/StatsTable'
import { PlayerCard } from '@/components/stats/PlayerCard'
import { TimeRangeFilter, defaultTimeRanges } from '@/components/filters/TimeRangeFilter'
import { ComparisonCard } from '@/components/stats/ComparisonCard'
import { BettingLine } from '@/components/betting/BettingLine'
import { ThresholdLine } from '@/components/charts/ThresholdLine'
import { BarChart } from '@/components/charts/BarChart'

/**
 * Page Prototype - Landing + Showcase
 *
 * Objectif: Valider la cohérence de la charte graphique STAT-DISCUTE
 * - Hero section (landing page style)
 * - Showcase de tous les composants Phase 3
 * - Données mockées mais interactions fonctionnelles
 * - Design monochrome avec couleurs data uniquement
 */

export default function PrototypePage() {
  // État pour TimeRangeFilter
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | 'season' | 'custom'>('7d')

  // Données mockées - LeBron James (derniers 20 matchs)
  const lebronGames = [
    { date: '2025-01-15', value: 28 },
    { date: '2025-01-17', value: 32 },
    { date: '2025-01-19', value: 18 },
    { date: '2025-01-21', value: 35 },
    { date: '2025-01-23', value: 29 },
    { date: '2025-01-25', value: 22 },
    { date: '2025-01-27', value: 31 },
    { date: '2025-01-29', value: 26 },
    { date: '2025-01-31', value: 38 },
    { date: '2025-02-02', value: 24 },
    { date: '2025-02-04', value: 27 },
    { date: '2025-02-06', value: 33 },
    { date: '2025-02-08', value: 21 },
    { date: '2025-02-10', value: 30 },
    { date: '2025-02-12', value: 25 },
    { date: '2025-02-14', value: 36 },
    { date: '2025-02-16', value: 23 },
    { date: '2025-02-18', value: 29 },
    { date: '2025-02-20', value: 34 },
    { date: '2025-02-22', value: 27 },
  ]

  // Données mockées - BarChart (derniers 7 matchs)
  const recentGames = [
    { label: 'L', value: 25 },
    { label: 'Ma', value: 32 },
    { label: 'Me', value: 18 },
    { label: 'J', value: 29 },
    { label: 'V', value: 35 },
    { label: 'S', value: 21 },
    { label: 'D', value: 28 },
  ]

  // Données mockées - StatsTable (top 8 scorers)
  const columns: Column[] = [
    { key: 'player', label: 'Joueur', sortable: true },
    { key: 'team', label: 'Équipe', sortable: true },
    { key: 'ppg', label: 'PPG', sortable: true },
    { key: 'rpg', label: 'RPG', sortable: true },
    { key: 'apg', label: 'APG', sortable: true },
    { key: 'fgPct', label: 'FG%', sortable: true },
  ]

  const rows: Record<string, string | number>[] = [
    { id: '1', player: 'LeBron James', team: 'LAL', ppg: 28.5, rpg: 7.2, apg: 8.1, fgPct: 52.3 },
    { id: '2', player: 'Stephen Curry', team: 'GSW', ppg: 29.8, rpg: 5.1, apg: 6.4, fgPct: 47.8 },
    { id: '3', player: 'Giannis Antetokounmpo', team: 'MIL', ppg: 31.1, rpg: 11.8, apg: 5.7, fgPct: 58.2 },
    { id: '4', player: 'Kevin Durant', team: 'PHX', ppg: 29.1, rpg: 6.7, apg: 5.0, fgPct: 53.7 },
    { id: '5', player: 'Luka Doncic', team: 'DAL', ppg: 32.4, rpg: 8.6, apg: 8.0, fgPct: 49.2 },
    { id: '6', player: 'Jayson Tatum', team: 'BOS', ppg: 26.9, rpg: 8.1, apg: 4.4, fgPct: 46.6 },
    { id: '7', player: 'Joel Embiid', team: 'PHI', ppg: 33.1, rpg: 10.2, apg: 4.2, fgPct: 54.8 },
    { id: '8', player: 'Nikola Jokic', team: 'DEN', ppg: 24.5, rpg: 11.8, apg: 9.8, fgPct: 63.2 },
  ]

  return (
    <AppLayout>

      {/* Stats Overview Section */}
      <section className="border-b border-[var(--color-gray-800)] py-[var(--space-12)]">
        <div className="container mx-auto px-[var(--space-4)] max-w-7xl">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-bold)] text-white mb-[var(--space-6)]">
            Performances Clés
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--space-4)]">
            <StatCard
              label="Points par match"
              value="28.5"
              trend="up"
              trendValue="+2.3"
              subtitle="Sur les 10 derniers matchs"
            />
            <StatCard
              label="Rebonds par match"
              value="7.2"
              trend="down"
              trendValue="-0.5"
              subtitle="Saison complète"
            />
            <StatCard
              label="Assists par match"
              value="8.1"
              trend="neutral"
              subtitle="Moyenne équipe"
            />
            <StatCard
              label="Victoires"
              value="45"
              trend="up"
              trendValue="+3"
              subtitle="Sur 65 matchs"
            />
          </div>
        </div>
      </section>

      {/* Visualizations Section */}
      <section className="border-b border-[var(--color-gray-800)] py-[var(--space-12)]">
        <div className="container mx-auto px-[var(--space-4)] max-w-7xl">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-bold)] text-white mb-[var(--space-6)]">
            Analyse Graphique
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-6)]">
            {/* ThresholdLine */}
            <div className="stat-card">
              <h3 className="text-[var(--text-lg)] font-[var(--font-semibold)] text-white mb-[var(--space-4)]">
                Analyse de Seuil - LeBron James
              </h3>
              <p className="text-[var(--text-sm)] text-[var(--color-gray-400)] mb-[var(--space-4)]">
                Performances sur les 20 derniers matchs. Ajustez le seuil pour analyser la fréquence des performances.
              </p>
              <ThresholdLine
                data={lebronGames}
                initialThreshold={27}
                min={15}
                max={40}
                label="Points"
                onChange={(threshold, stats) => {
                  console.log(`Threshold: ${threshold}, Above: ${stats.above}/${stats.above + stats.below} (${stats.percentage.toFixed(0)}%)`)
                }}
              />
            </div>

            {/* BarChart */}
            <div className="stat-card">
              <h3 className="text-[var(--text-lg)] font-[var(--font-semibold)] text-white mb-[var(--space-4)]">
                Performances Hebdomadaires
              </h3>
              <p className="text-[var(--text-sm)] text-[var(--color-gray-400)] mb-[var(--space-4)]">
                Points marqués sur les 7 derniers matchs avec seuil interactif.
              </p>
              <BarChart
                data={recentGames}
                threshold={27}
                min={15}
                max={40}
                label="Points"
                colorMode="threshold"
                interactiveThreshold
                showGrid
                onChange={(threshold, stats) => {
                  console.log(`BarChart - Threshold: ${threshold}, Above: ${stats.above}/${stats.above + stats.below}`)
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Players Spotlight Section */}
      <section className="border-b border-[var(--color-gray-800)] py-[var(--space-12)]">
        <div className="container mx-auto px-[var(--space-4)] max-w-7xl">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-bold)] text-white mb-[var(--space-6)]">
            Joueurs Vedettes
          </h2>

          {/* PlayerCards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)] mb-[var(--space-8)]">
            <PlayerCard
              player={{
                id: '1',
                name: 'LeBron James',
                team: 'LAL',
                number: 23,
                position: 'SF',
                stats: {
                  ppg: 28.5,
                  rpg: 7.2,
                  apg: 8.1,
                },
              }}
              onClick={() => console.log('Clicked LeBron')}
            />
            <PlayerCard
              player={{
                id: '2',
                name: 'Stephen Curry',
                team: 'GSW',
                number: 30,
                position: 'PG',
                stats: {
                  ppg: 29.8,
                  rpg: 5.1,
                  apg: 6.4,
                },
              }}
              onClick={() => console.log('Clicked Curry')}
            />
            <PlayerCard
              player={{
                id: '3',
                name: 'Giannis Antetokounmpo',
                team: 'MIL',
                number: 34,
                position: 'PF',
                stats: {
                  ppg: 31.1,
                  rpg: 11.8,
                  apg: 5.7,
                },
              }}
              onClick={() => console.log('Clicked Giannis')}
            />
          </div>

          {/* Player Comparison */}
          <div>
            <h3 className="text-[var(--text-xl)] font-[var(--font-semibold)] text-white mb-[var(--space-4)]">
              Comparaison de Joueurs
            </h3>
            <ComparisonCard
              entityA={{
                id: '1',
                name: 'LeBron James',
                stats: { ppg: 28.5, rpg: 7.2, apg: 8.1 },
              }}
              entityB={{
                id: '2',
                name: 'Kevin Durant',
                stats: { ppg: 29.1, rpg: 6.7, apg: 5.0 },
              }}
              statKeys={[
                { key: 'ppg', label: 'Points' },
                { key: 'rpg', label: 'Rebounds' },
                { key: 'apg', label: 'Assists' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Analysis Tools Section */}
      <section className="border-b border-[var(--color-gray-800)] py-[var(--space-12)]">
        <div className="container mx-auto px-[var(--space-4)] max-w-7xl">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-bold)] text-white mb-[var(--space-6)]">
            Outils d'Analyse
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-6)]">
            {/* TimeRangeFilter */}
            <div className="stat-card">
              <h3 className="text-[var(--text-lg)] font-[var(--font-semibold)] text-white mb-[var(--space-4)]">
                Filtre Temporel
              </h3>
              <p className="text-[var(--text-sm)] text-[var(--color-gray-400)] mb-[var(--space-4)]">
                Sélectionnez une période pour analyser les performances.
              </p>
              <TimeRangeFilter
                ranges={defaultTimeRanges}
                selected={timeRange}
                onChange={(value) => {
                  setTimeRange(value as '7d' | '30d' | 'season' | 'custom')
                  console.log('Time range changed:', value)
                }}
              />
              <p className="mt-[var(--space-4)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
                Période sélectionnée: <strong className="text-white">{timeRange}</strong>
              </p>
            </div>

            {/* BettingLine */}
            <div>
              <h3 className="text-[var(--text-lg)] font-[var(--font-semibold)] text-white mb-[var(--space-4)]">
                Lignes de Paris
              </h3>
              <p className="text-[var(--text-sm)] text-[var(--color-gray-400)] mb-[var(--space-4)]">
                Spread, totaux et moneyline pour le prochain match.
              </p>
              <div className="space-y-[var(--space-4)]">
                <BettingLine
                  type="spread"
                  homeTeam="Lakers"
                  awayTeam="Warriors"
                  line={{ current: -5.5, opening: -6, movement: 'down' }}
                  odds={{ home: -110, away: -110 }}
                  onClick={() => console.log('Spread clicked')}
                />
                <BettingLine
                  type="total"
                  homeTeam="Lakers"
                  awayTeam="Warriors"
                  line={{ current: 225.5, opening: 226, movement: 'down' }}
                  odds={{ home: -110, away: -110 }}
                />
                <BettingLine
                  type="moneyline"
                  homeTeam="Lakers"
                  awayTeam="Warriors"
                  line={{ current: 0 }}
                  odds={{ home: -150, away: +130 }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Table Section */}
      <section className="py-[var(--space-12)]">
        <div className="container mx-auto px-[var(--space-4)] max-w-7xl">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-bold)] text-white mb-[var(--space-6)]">
            Classement des Scoreurs
          </h2>
          <StatsTable
            columns={columns}
            data={rows}
            defaultSort={{ key: 'ppg', direction: 'desc' }}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-gray-800)] py-[var(--space-8)]">
        <div className="container mx-auto px-[var(--space-4)] max-w-7xl">
          <p className="text-center text-[var(--text-sm)] text-[var(--color-gray-500)]">
            Phase 3 - Tous les composants métier créés ✅
          </p>
        </div>
      </footer>
    </AppLayout>
  )
}
