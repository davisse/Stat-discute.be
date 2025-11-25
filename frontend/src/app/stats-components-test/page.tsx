'use client'

import * as React from 'react'
import { AppLayout } from '@/components/layout'
import {
  StatCard,
  TrendIndicator,
  StatsTable,
  PlayerCard,
  ComparisonCard,
  type Column,
  type Player,
  type ComparisonItem,
} from '@/components/stats'
import { TimeRangeFilter, defaultTimeRanges } from '@/components/filters'
import { BettingLine } from '@/components/betting'
import { ThresholdLine, BarChart } from '@/components/charts'

/**
 * Page de test pour tous les composants métier Phase 3
 *
 * Cette page affiche tous les composants avec des données de test
 * pour vérifier le design, les interactions, et le responsive.
 */

// =============================================================================
// DONNÉES DE TEST
// =============================================================================

const testPlayers: Player[] = [
  {
    id: '1',
    name: 'LeBron James',
    team: 'LAL',
    number: 23,
    position: 'SF',
    photoUrl: '',
    stats: { ppg: 28.5, rpg: 7.2, apg: 8.1 },
  },
  {
    id: '2',
    name: 'Stephen Curry',
    team: 'GSW',
    number: 30,
    position: 'PG',
    photoUrl: '',
    stats: { ppg: 29.8, rpg: 5.1, apg: 6.4 },
  },
  {
    id: '3',
    name: 'Giannis Antetokounmpo',
    team: 'MIL',
    number: 34,
    position: 'PF',
    photoUrl: '',
    stats: { ppg: 31.1, rpg: 11.8, apg: 5.7 },
  },
]

const testStatsData = [
  { id: '1', name: 'LeBron James', team: 'LAL', ppg: 28.5, rpg: 7.2, apg: 8.1, fg: 52.3 },
  { id: '2', name: 'Stephen Curry', team: 'GSW', ppg: 29.8, rpg: 5.1, apg: 6.4, fg: 47.8 },
  { id: '3', name: 'Giannis Antetokounmpo', team: 'MIL', ppg: 31.1, rpg: 11.8, apg: 5.7, fg: 58.2 },
  { id: '4', name: 'Kevin Durant', team: 'PHX', ppg: 29.1, rpg: 6.7, apg: 5.0, fg: 53.7 },
  { id: '5', name: 'Luka Doncic', team: 'DAL', ppg: 32.4, rpg: 8.6, apg: 8.0, fg: 49.2 },
  { id: '6', name: 'Jayson Tatum', team: 'BOS', ppg: 26.9, rpg: 8.1, apg: 4.4, fg: 46.6 },
  { id: '7', name: 'Joel Embiid', team: 'PHI', ppg: 33.1, rpg: 10.2, apg: 4.2, fg: 54.8 },
  { id: '8', name: 'Nikola Jokic', team: 'DEN', ppg: 24.5, rpg: 11.8, apg: 9.8, fg: 63.2 },
]

const testGameData = Array.from({ length: 20 }, (_, i) => ({
  date: `2024-11-${String(i + 1).padStart(2, '0')}`,
  value: Math.floor(Math.random() * 20) + 20, // 20-40 points
}))

const tableColumns: Column[] = [
  { key: 'name', label: 'Joueur', sortable: true, width: '200px' },
  { key: 'team', label: 'Équipe', sortable: true, align: 'center', width: '80px' },
  { key: 'ppg', label: 'PPG', sortable: true, align: 'right', width: '80px' },
  { key: 'rpg', label: 'RPG', sortable: true, align: 'right', width: '80px' },
  { key: 'apg', label: 'APG', sortable: true, align: 'right', width: '80px' },
  { key: 'fg', label: 'FG%', sortable: true, align: 'right', width: '80px' },
]

// =============================================================================
// COMPOSANT PAGE
// =============================================================================

export default function StatsComponentsTestPage() {
  const [timeRange, setTimeRange] = React.useState('7d')
  const [customDates, setCustomDates] = React.useState<{ from: Date; to: Date }>()
  const [threshold, setThreshold] = React.useState(25)
  const [thresholdStats, setThresholdStats] = React.useState({
    above: 0,
    below: 0,
    percentage: 0,
  })

  return (
    <AppLayout>
      <div className="container mx-auto px-[var(--space-6)] py-[var(--space-12)]">
        {/* Header */}
        <div className="mb-[var(--space-12)]">
          <h1 className="text-[var(--text-3xl)] font-[var(--font-bold)] text-white mb-[var(--space-2)]">
            Phase 3 - Composants Métier
          </h1>
          <p className="text-[var(--text-base)] text-[var(--color-gray-400)]">
            Page de test pour tous les composants avec données de test
          </p>
        </div>

        {/* Section: StatCard */}
        <section className="mb-[var(--space-16)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-6)]">
            1. StatCard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-4)]">
            <StatCard label="Points par match" value={28.5} />
            <StatCard
              label="Points par match"
              value={28.5}
              subtitle="Sur les 10 derniers matchs"
              trend="up"
              trendValue="+2.3"
            />
            <StatCard
              label="Rebonds par match"
              value={7.2}
              subtitle="Saison complète"
              trend="down"
              trendValue="-0.5"
            />
            <StatCard
              label="Assists par match"
              value={8.1}
              variant="large"
              trend="neutral"
            />
          </div>
        </section>

        {/* Section: TrendIndicator */}
        <section className="mb-[var(--space-16)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-6)]">
            2. TrendIndicator
          </h2>
          <div className="flex flex-wrap gap-[var(--space-8)]">
            <TrendIndicator trend="up" value="+5.2" size="sm" />
            <TrendIndicator trend="up" value="+5.2" size="md" />
            <TrendIndicator trend="up" value="+5.2" size="lg" />
            <TrendIndicator trend="down" value="-3%" inline />
            <TrendIndicator trend="neutral" size="md" />
          </div>
        </section>

        {/* Section: StatsTable */}
        <section className="mb-[var(--space-16)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-6)]">
            3. StatsTable
          </h2>
          <StatsTable
            columns={tableColumns}
            data={testStatsData}
            highlightThreshold={{ key: 'ppg', value: 28, type: 'above' }}
            onRowClick={(row) => console.log('Clicked:', row)}
          />
        </section>

        {/* Section: PlayerCard */}
        <section className="mb-[var(--space-16)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-6)]">
            4. PlayerCard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)]">
            {testPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                variant="detailed"
                showStats
                onClick={() => console.log('Clicked:', player.name)}
              />
            ))}
          </div>
        </section>

        {/* Section: TimeRangeFilter */}
        <section className="mb-[var(--space-16)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-6)]">
            5. TimeRangeFilter
          </h2>
          <div className="flex flex-col gap-[var(--space-4)]">
            <TimeRangeFilter
              ranges={defaultTimeRanges}
              selected={timeRange}
              onChange={setTimeRange}
              customRange={customDates}
              onCustomChange={(from, to) => setCustomDates({ from, to })}
            />
            <p className="text-[var(--text-sm)] text-[var(--color-gray-400)]">
              Période sélectionnée: <strong className="text-white">{timeRange}</strong>
              {customDates && ` (${customDates.from.toLocaleDateString()} - ${customDates.to.toLocaleDateString()})`}
            </p>
          </div>
        </section>

        {/* Section: ComparisonCard */}
        <section className="mb-[var(--space-16)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-6)]">
            6. ComparisonCard
          </h2>
          <div className="space-y-[var(--space-6)]">
            {/* Horizontal */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">Horizontal Layout</h3>
              <ComparisonCard
                entityA={{
                  id: '1',
                  name: 'LeBron James',
                  photoUrl: '',
                  stats: { ppg: 28.5, rpg: 7.2, apg: 8.1 },
                }}
                entityB={{
                  id: '2',
                  name: 'Kevin Durant',
                  photoUrl: '',
                  stats: { ppg: 29.1, rpg: 6.7, apg: 5.0 },
                }}
                statKeys={[
                  { key: 'ppg', label: 'Points' },
                  { key: 'rpg', label: 'Rebounds' },
                  { key: 'apg', label: 'Assists' },
                ]}
                variant="horizontal"
              />
            </div>

            {/* Vertical */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">Vertical Layout</h3>
              <ComparisonCard
                entityA={{
                  id: '1',
                  name: 'Stephen Curry',
                  photoUrl: '',
                  stats: { ppg: 29.8, rpg: 5.1, apg: 6.4 },
                }}
                entityB={{
                  id: '3',
                  name: 'Giannis Antetokounmpo',
                  photoUrl: '',
                  stats: { ppg: 31.1, rpg: 11.8, apg: 5.7 },
                }}
                statKeys={[
                  { key: 'ppg', label: 'Points' },
                  { key: 'rpg', label: 'Rebounds' },
                  { key: 'apg', label: 'Assists' },
                ]}
                variant="vertical"
              />
            </div>
          </div>
        </section>

        {/* Section: BettingLine */}
        <section className="mb-[var(--space-16)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-6)]">
            7. BettingLine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-4)]">
            <BettingLine
              type="spread"
              homeTeam="Lakers"
              awayTeam="Warriors"
              line={{ current: -5.5, opening: -6.0, movement: 'down' }}
              odds={{ home: -110, away: -110 }}
              onClick={() => console.log('Show history')}
            />
            <BettingLine
              type="total"
              homeTeam="Lakers"
              awayTeam="Warriors"
              line={{ current: 225.5, opening: 226.0, movement: 'down' }}
              odds={{ home: -110, away: -110 }}
            />
            <BettingLine
              type="moneyline"
              homeTeam="Lakers"
              awayTeam="Warriors"
              line={{ current: -150 }}
              odds={{ home: -150, away: +130 }}
            />
          </div>
        </section>

        {/* Section: ThresholdLine */}
        <section className="mb-[var(--space-16)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-6)]">
            8. ThresholdLine
          </h2>
          <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
            <ThresholdLine
              data={testGameData}
              initialThreshold={threshold}
              min={0}
              max={50}
              label="Points"
              onChange={(t, stats) => {
                setThreshold(t)
                setThresholdStats(stats)
              }}
            />
            <div className="mt-[var(--space-6)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
              <p>
                Seuil actuel:{' '}
                <strong className="text-white font-[family-name:var(--font-mono)]">
                  {threshold.toFixed(1)}
                </strong>
              </p>
              <p className="mt-[var(--space-2)]">
                Au-dessus: {thresholdStats.above} / En-dessous: {thresholdStats.below} / Pourcentage:{' '}
                {thresholdStats.percentage.toFixed(0)}%
              </p>
            </div>
          </div>
        </section>

        {/* Section: BarChart */}
        <section className="mb-[var(--space-16)]">
          <h2 className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-white mb-[var(--space-6)]">
            9. BarChart
          </h2>
          <div className="space-y-[var(--space-6)]">
            {/* Mono Color */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">Mode Monochrome</h3>
              <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
                <BarChart
                  data={[
                    { label: 'L', value: 25 },
                    { label: 'Ma', value: 32 },
                    { label: 'Me', value: 18 },
                    { label: 'J', value: 29 },
                    { label: 'V', value: 35 },
                    { label: 'S', value: 21 },
                    { label: 'D', value: 28 },
                  ]}
                  label="Points"
                  colorMode="mono"
                  showGrid
                />
              </div>
            </div>

            {/* Threshold Color */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">Mode Seuil (vert/rouge)</h3>
              <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
                <BarChart
                  data={[
                    { label: 'L', value: 25 },
                    { label: 'Ma', value: 32 },
                    { label: 'Me', value: 18 },
                    { label: 'J', value: 29 },
                    { label: 'V', value: 35 },
                    { label: 'S', value: 21 },
                    { label: 'D', value: 28 },
                  ]}
                  threshold={27}
                  label="Points"
                  colorMode="threshold"
                  showGrid
                />
              </div>
            </div>

            {/* Without Grid */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">Sans grille</h3>
              <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
                <BarChart
                  data={[
                    { label: 'Oct', value: 24.5 },
                    { label: 'Nov', value: 26.8 },
                    { label: 'Déc', value: 28.2 },
                    { label: 'Jan', value: 27.5 },
                  ]}
                  label="Moyenne PPG"
                  colorMode="mono"
                  showGrid={false}
                />
              </div>
            </div>

            {/* Interactive Threshold */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">Seuil interactif (draggable avec snap 0.5)</h3>
              <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
                <BarChart
                  data={[
                    { label: 'L', value: 25 },
                    { label: 'Ma', value: 32 },
                    { label: 'Me', value: 18 },
                    { label: 'J', value: 29 },
                    { label: 'V', value: 35 },
                    { label: 'S', value: 21 },
                    { label: 'D', value: 28 },
                  ]}
                  threshold={27}
                  label="Points"
                  colorMode="threshold"
                  interactiveThreshold
                  showGrid
                  onChange={(threshold, stats) => {
                    console.log(`Threshold: ${threshold}, Above: ${stats.above}/${stats.above + stats.below} (${stats.percentage.toFixed(0)}%)`)
                  }}
                />
              </div>
            </div>

            {/* Monochrome - Outline Mode */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">Mode Monochrome - Outline (au-dessus = plein, en-dessous = outline)</h3>
              <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
                <BarChart
                  data={[
                    { label: 'L', value: 25 },
                    { label: 'Ma', value: 32 },
                    { label: 'Me', value: 18 },
                    { label: 'J', value: 29 },
                    { label: 'V', value: 35 },
                    { label: 'S', value: 21 },
                    { label: 'D', value: 28 },
                  ]}
                  threshold={27}
                  label="Points"
                  colorMode="mono-outline"
                  interactiveThreshold
                  showGrid
                  onChange={(threshold, stats) => {
                    console.log(`[Outline] Threshold: ${threshold}, Above: ${stats.above}/${stats.above + stats.below} (${stats.percentage.toFixed(0)}%)`)
                  }}
                />
              </div>
              <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
                Style moderne et élégant. Barres pleines au-dessus du seuil, barres en outline en-dessous.
              </p>
            </div>

            {/* Monochrome - Pattern Mode */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">Mode Monochrome - Pattern (au-dessus = plein, en-dessous = hachures marquées)</h3>
              <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
                <BarChart
                  data={[
                    { label: 'L', value: 25 },
                    { label: 'Ma', value: 32 },
                    { label: 'Me', value: 18 },
                    { label: 'J', value: 29 },
                    { label: 'V', value: 35 },
                    { label: 'S', value: 21 },
                    { label: 'D', value: 28 },
                  ]}
                  threshold={27}
                  label="Points"
                  colorMode="mono-pattern"
                  interactiveThreshold
                  showGrid
                  onChange={(threshold, stats) => {
                    console.log(`[Pattern] Threshold: ${threshold}, Above: ${stats.above}/${stats.above + stats.below} (${stats.percentage.toFixed(0)}%)`)
                  }}
                />
              </div>
              <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
                Style académique et formel. Barres pleines au-dessus du seuil, hachures diagonales marquées en-dessous.
              </p>
            </div>

            {/* Monochrome - Dashed Mode */}
            <div>
              <h3 className="text-[var(--text-lg)] text-white mb-[var(--space-4)]">Mode Monochrome - Dashed (au-dessus = plein, en-dessous = outline pointillés)</h3>
              <div className="bg-[var(--color-gray-950)] p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-gray-800)]">
                <BarChart
                  data={[
                    { label: 'L', value: 25 },
                    { label: 'Ma', value: 32 },
                    { label: 'Me', value: 18 },
                    { label: 'J', value: 29 },
                    { label: 'V', value: 35 },
                    { label: 'S', value: 21 },
                    { label: 'D', value: 28 },
                  ]}
                  threshold={27}
                  label="Points"
                  colorMode="mono-dashed"
                  interactiveThreshold
                  showGrid
                  onChange={(threshold, stats) => {
                    console.log(`[Dashed] Threshold: ${threshold}, Above: ${stats.above}/${stats.above + stats.below} (${stats.percentage.toFixed(0)}%)`)
                  }}
                />
              </div>
              <p className="mt-[var(--space-3)] text-[var(--text-sm)] text-[var(--color-gray-400)]">
                Style léger et aéré. Barres pleines au-dessus du seuil, outline en pointillés en-dessous.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-[var(--space-16)] pt-[var(--space-8)] border-t border-[var(--color-gray-800)] text-center text-[var(--text-sm)] text-[var(--color-gray-500)]">
          Phase 3 - Tous les composants métier créés ✅
        </footer>
      </div>
    </AppLayout>
  )
}
