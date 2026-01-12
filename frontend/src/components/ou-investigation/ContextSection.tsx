'use client'

interface TeamContextStats {
  abbreviation: string
  name: string
  avgPointsFor: number
  avgPointsAgainst: number
  overRecord: string      // e.g., "7-3"
  underRecord: string     // e.g., "3-7"
  last5OU: ('O' | 'U')[]  // Last 5 games O/U results
  pace: number            // Possessions per game
}

interface ContextSectionProps {
  homeTeam: TeamContextStats
  awayTeam: TeamContextStats
  narrativeIntro: string  // Main narrative paragraph
  keyInsight: string      // Highlighted insight
}

export function ContextSection({
  homeTeam,
  awayTeam,
  narrativeIntro,
  keyInsight
}: ContextSectionProps) {
  return (
    <section className="mt-6 sm:mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-600 tracking-widest">01</span>
          <div className="w-8 h-px bg-zinc-700" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
          Contexte du Match
        </h2>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Narrative Column - Takes 2 cols on desktop */}
        <div className="lg:col-span-2 space-y-4">
          {/* Narrative Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-1 h-12 rounded-full bg-gradient-to-b from-zinc-500 to-transparent flex-shrink-0" />
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {narrativeIntro}
              </p>
            </div>

            {/* Key Insight Highlight */}
            <div className="mt-4 p-3 sm:p-4 bg-white/5 border border-zinc-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Point d'attention</span>
              </div>
              <p className="text-sm text-zinc-300">
                {keyInsight}
              </p>
            </div>
          </div>

          {/* Quick Stats Comparison - Mobile horizontal scroll */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
              <QuickStat
                label="Points/Match"
                awayAbbr={awayTeam.abbreviation}
                homeAbbr={homeTeam.abbreviation}
                awayValue={`${awayTeam.avgPointsFor.toFixed(1)}`}
                homeValue={`${homeTeam.avgPointsFor.toFixed(1)}`}
              />
              <QuickStat
                label="Pts encaissés"
                awayAbbr={awayTeam.abbreviation}
                homeAbbr={homeTeam.abbreviation}
                awayValue={`${awayTeam.avgPointsAgainst.toFixed(1)}`}
                homeValue={`${homeTeam.avgPointsAgainst.toFixed(1)}`}
              />
              <QuickStat
                label="Pace"
                awayAbbr={awayTeam.abbreviation}
                homeAbbr={homeTeam.abbreviation}
                awayValue={`${awayTeam.pace.toFixed(1)}`}
                homeValue={`${homeTeam.pace.toFixed(1)}`}
              />
              <QuickStat
                label="Over %"
                awayAbbr={awayTeam.abbreviation}
                homeAbbr={homeTeam.abbreviation}
                awayValue={calculateOverPercentage(awayTeam.overRecord)}
                homeValue={calculateOverPercentage(homeTeam.overRecord)}
              />
            </div>
          </div>
        </div>

        {/* O/U Recent Form Column */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
            Forme O/U Récente
          </h3>

          {/* Away Team Form */}
          <TeamOUForm
            team={awayTeam}
            side="away"
          />

          <div className="my-4 h-px bg-zinc-800" />

          {/* Home Team Form */}
          <TeamOUForm
            team={homeTeam}
            side="home"
          />

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-center gap-4 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-white/20 border border-white/50" />
              OVER
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-zinc-700/50 border border-zinc-600/50" />
              UNDER
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickStat({
  label,
  awayAbbr,
  homeAbbr,
  awayValue,
  homeValue
}: {
  label: string
  awayAbbr: string
  homeAbbr: string
  awayValue: string
  homeValue: string
}) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-2.5 sm:p-3 min-w-[100px] sm:min-w-0 flex-1">
      <div className="text-[9px] sm:text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-2 text-center truncate">
        {label}
      </div>
      <div className="flex flex-col gap-1">
        {/* Away Team Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase text-zinc-400">
            {awayAbbr}
          </span>
          <span className="text-xs sm:text-sm font-bold tabular-nums text-white">
            {awayValue}
          </span>
        </div>
        {/* Divider */}
        <div className="h-px bg-zinc-800/50" />
        {/* Home Team Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase text-zinc-400">
            {homeAbbr}
          </span>
          <span className="text-xs sm:text-sm font-bold tabular-nums text-white">
            {homeValue}
          </span>
        </div>
      </div>
    </div>
  )
}

function TeamOUForm({
  team,
  side
}: {
  team: TeamContextStats
  side: 'home' | 'away'
}) {
  const overWins = parseInt(team.overRecord.split('-')[0]) || 0
  const underWins = parseInt(team.underRecord.split('-')[0]) || 0
  const total = overWins + underWins
  const overPct = total > 0 ? (overWins / total) * 100 : 50

  return (
    <div className="space-y-3">
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-white">
            {team.abbreviation}
          </span>
          <span className="text-[10px] text-zinc-600 uppercase">
            {side === 'home' ? 'DOM' : 'EXT'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white font-medium">{team.overRecord}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500 font-medium">{team.underRecord}</span>
        </div>
      </div>

      {/* O/U Progress Bar */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-white/60 to-white/30"
          style={{ width: `${overPct}%` }}
        />
      </div>

      {/* Last 5 Games Visual */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-zinc-600 shrink-0">L5</span>
        <svg className="w-2.5 h-2.5 text-zinc-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="flex items-center gap-1">
          {team.last5OU.map((result, i) => (
            <div
              key={i}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 ${
                result === 'O'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/50'
              } ${i === team.last5OU.length - 1 ? 'ring-1 ring-zinc-600' : ''}`}
              title={i === team.last5OU.length - 1 ? 'Dernier match' : `Match ${team.last5OU.length - i}`}
            >
              {result}
            </div>
          ))}
        </div>
        <span className="text-[9px] text-zinc-700 ml-1 hidden sm:inline">récent</span>
      </div>
    </div>
  )
}

function calculateOverPercentage(overRecord: string): string {
  const [wins, losses] = overRecord.split('-').map(Number)
  const total = wins + losses
  if (total === 0) return '50%'
  return `${Math.round((wins / total) * 100)}%`
}

export default ContextSection
