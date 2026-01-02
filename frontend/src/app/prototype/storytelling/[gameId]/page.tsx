'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { colors } from '@/lib/design-tokens'
import {
  HorizontalScrollContainer,
  SequenceContent,
  AnalysisStatCard,
  TrendBar,
  DistributionBar,
  FactorsList,
  InjuryStatus,
  MatchupHeader,
  AnimatedChart,
  ConfidenceIndicator,
} from '@/components/analysis'
import { BarChart } from '@/components/charts'
import { useNarratives } from '@/hooks/useNarratives'
import { StreamingNarrative, VerdictBadge, ReasoningList } from '@/components/analysis/StreamingNarrative'
import type {
  GameNarratives,
  GameDataForNarratives,
  IntroNarrative,
  AccrocheNarrative,
  ScoringNarrative,
  CombinedNarrative,
  DefenseNarrative,
  MLPredictionNarrative,
  SynthesisNarrative,
} from '@/lib/ai/types'

// Type definitions for API response
interface TeamData {
  teamId: number
  abbreviation: string
  name: string
  ppg: number
  fgPct: number
  threePct: number
  pace: number
  teamTotal: number | null
  teamTotalOverOdds: number | null
  teamTotalUnderOdds: number | null
  scoringHistory: Array<{
    opponent: string
    points: number
    gameDate: string
  }>
  teamTotalHistory: Array<{
    opponent: string
    total: number
  }>
  pointsAllowed: number
  pointsAllowedLast5: Array<{
    opponent: string
    pointsAllowed: number
    gameDate: string
  }>
  offensiveRank: number
  defensiveRank: number
}

interface BettingData {
  total: number | null
  overOdds: number
  underOdds: number
  spread: number
  awayML: number
  homeML: number
}

interface H2HData {
  games: Array<{
    date: string
    totalPoints: number
    awayPoints: number
    homePoints: number
  }>
  avgTotal: number
  overCount: number
  underCount: number
}

interface TrendData {
  overCount: number
  underCount: number
  recentResults: Array<{
    type: 'over' | 'under'
    diff: number
  }>
}

interface MLPredictionData {
  prediction: 'OVER' | 'UNDER' | null
  confidence: number
  logisticProb: number
  xgboostProb: number
  expectedValue: number
  line: number
}

interface RestData {
  awayRestDays: number
  homeRestDays: number
  awayLastGame: string | null
  homeLastGame: string | null
  restAdvantage: 'away' | 'home' | 'even'
  isBackToBack: { away: boolean; home: boolean }
}

interface StorytellingData {
  gameId: string
  gameDate: string
  awayTeam: TeamData
  homeTeam: TeamData
  betting: BettingData
  h2h: H2HData
  trend: TrendData
  projectedPace: number
  projectedTotal: number
  mlPrediction?: MLPredictionData
  rest: RestData
}

/**
 * Prototype Storytelling - Navigation Horizontale
 *
 * Démonstration du concept de storytelling horizontal avec snap scroll
 * pour l'analyse de matchs NBA (Totaux O/U).
 */

export default function StorytellingPrototype() {
  const params = useParams()
  const gameId = params.gameId as string

  const [data, setData] = React.useState<StorytellingData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      if (!gameId) {
        setError('No gameId provided.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/analysis/storytelling/${gameId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [gameId])

  // AI-generated narratives hook
  const {
    narratives,
    isLoading: narrativesLoading,
    isGenerating,
    error: narrativesError,
    regenerate,
  } = useNarratives({
    gameId,
    gameData: data as GameDataForNarratives | null,
    enabled: !!data,
    useStreaming: false, // Use batch mode for now
  })

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p style={{ color: colors.gray[400] }}>Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <p style={{ color: colors.gray[400] }}>{error || 'No data available'}</p>
          <p className="mt-4 text-sm" style={{ color: colors.gray[600] }}>
            Example: /prototype/storytelling?gameId=0022400001
          </p>
        </div>
      </div>
    )
  }

  // Format date for display
  const gameDate = new Date(data.gameDate)
  const formattedDate = gameDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).toUpperCase()

  const sequences = [
    {
      id: 'intro',
      title: '',
      children: <SequenceIntro data={data} formattedDate={formattedDate} narrative={narratives.intro} isLoading={narrativesLoading} />,
    },
    {
      id: 'odds',
      title: 'Cotes',
      children: <SequenceOdds data={data} formattedDate={formattedDate} />,
    },
    {
      id: 'accroche',
      title: 'Accroche',
      children: <SequenceAccroche data={data} narrative={narratives.accroche} isLoading={narrativesLoading} />,
    },
    {
      id: 'scoring',
      title: 'Scoring',
      children: <SequenceScoringCombined data={data} narrative={narratives.scoring} isLoading={narrativesLoading} />,
    },
    {
      id: 'combine',
      title: 'Combiné',
      children: <SequenceCombine data={data} narrative={narratives.combined} isLoading={narrativesLoading} />,
    },
    {
      id: 'opponent',
      title: 'Défenses',
      children: <SequenceOpponent data={data} narrative={narratives.defense} isLoading={narrativesLoading} />,
    },
    {
      id: 'rest',
      title: 'Repos',
      children: <SequenceRest data={data} />,
    },
    ...(data.mlPrediction ? [{
      id: 'ml',
      title: 'Prédiction ML',
      children: <SequenceML data={data} narrative={narratives.ml} isLoading={narrativesLoading} />,
    }] : []),
    {
      id: 'synthese',
      title: 'Synthèse',
      children: <SequenceSynthese data={data} narrative={narratives.synthesis} isLoading={narrativesLoading} onRegenerate={regenerate} isGenerating={isGenerating} />,
    },
  ]

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: colors.background,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }}
    >
      <HorizontalScrollContainer
        sequences={sequences}
        onSequenceChange={(index, id) => {
          console.log(`Séquence active: ${index} (${id})`)
        }}
      />
    </div>
  )
}

// ============================================
// SÉQUENCE 0 : INTRO (PAGE D'ACCROCHE)
// ============================================
function SequenceIntro({
  data,
  formattedDate,
  narrative,
  isLoading,
}: {
  data: StorytellingData
  formattedDate: string
  narrative?: IntroNarrative
  isLoading?: boolean
}) {
  const [showBadge, setShowBadge] = React.useState(false)
  const [showTeams, setShowTeams] = React.useState(false)
  const [showText, setShowText] = React.useState(false)

  React.useEffect(() => {
    const timer1 = setTimeout(() => setShowBadge(true), 200)
    const timer2 = setTimeout(() => setShowTeams(true), 600)
    const timer3 = setTimeout(() => setShowText(true), 1200)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Encart principal - positionné de manière asymétrique */}
      <div
        className="absolute"
        style={{
          top: '8%',
          left: '6%',
          maxWidth: '700px',
          maxHeight: '80%',
          overflow: 'visible',
        }}
      >
        {/* Badge type d'analyse */}
        <div
          className="inline-block px-4 py-2 rounded-full text-sm font-medium tracking-wider mb-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: colors.gray[400],
            border: `1px solid ${colors.gray[800]}`,
            opacity: showBadge ? 1 : 0,
            transform: showBadge ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          ANALYSE TOTAUX · {formattedDate}
        </div>

        {/* Équipes */}
        <div
          className="mb-6"
          style={{
            opacity: showTeams ? 1 : 0,
            transform: showTeams ? 'translateX(0)' : 'translateX(-40px)',
            transition: 'all 0.8s ease-out',
          }}
        >
          <div
            className="font-bold tracking-tighter leading-none"
            style={{
              color: colors.foreground,
              fontSize: '140px',
            }}
          >
            {data.awayTeam.abbreviation}
          </div>
          <div
            className="font-light"
            style={{
              color: colors.gray[600],
              fontSize: '60px',
              marginTop: '-15px',
              marginBottom: '-15px',
            }}
          >
            @
          </div>
          <div
            className="font-bold tracking-tighter leading-none"
            style={{
              color: colors.foreground,
              fontSize: '140px',
            }}
          >
            {data.homeTeam.abbreviation}
          </div>
        </div>

        {/* Texte d'accroche détaillé - AI Generated */}
        <div
          style={{
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease-out',
          }}
        >
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '80%' }} />
              <div className="h-6 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '60%' }} />
            </div>
          ) : (
            <>
              <p className="text-2xl leading-relaxed mb-6" style={{ color: '#D1D5DB' }}>
                {narrative?.headline ? (
                  <StreamingNarrative text={narrative.headline} />
                ) : data.betting.total !== null ? (
                  <>Une ligne à {data.betting.total} points — l'une des plus hautes de la soirée.</>
                ) : (
                  <>Deux équipes offensives face à face ce soir.</>
                )}
              </p>
              <p className="text-xl leading-relaxed" style={{ color: colors.gray[500] }}>
                {narrative?.subtext ? (
                  <StreamingNarrative text={narrative.subtext} />
                ) : (
                  <>
                    {data.awayTeam.name} ({data.awayTeam.ppg} pts/match) se déplace chez {data.homeTeam.name} ({data.homeTeam.ppg} pts/match).
                    {data.awayTeam.offensiveRank <= 10 && data.homeTeam.offensiveRank <= 15 ? (
                      ' Deux équipes offensives au tempo rapide.'
                    ) : (
                      ' Deux équipes aux styles de jeu contrastés.'
                    )}
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Logos NBA décoratifs - côté droit */}
      <div
        className="absolute select-none pointer-events-none"
        style={{
          top: '5%',
          right: '3%',
        }}
      >
        <img
          src={`https://cdn.nba.com/logos/nba/${data.awayTeam.teamId}/global/L/logo.svg`}
          alt=""
          style={{
            width: '400px',
            height: '400px',
            opacity: 0.35,
            filter: 'grayscale(100%)',
          }}
        />
      </div>
      <div
        className="absolute select-none pointer-events-none"
        style={{
          bottom: '5%',
          right: '6%',
        }}
      >
        <img
          src={`https://cdn.nba.com/logos/nba/${data.homeTeam.teamId}/global/L/logo.svg`}
          alt=""
          style={{
            width: '450px',
            height: '450px',
            opacity: 0.3,
            filter: 'grayscale(100%)',
          }}
        />
      </div>

      {/* Indicateur scroll */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: colors.gray[600] }}
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5L15 12L9 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

// ============================================
// SÉQUENCE 1 : COTES & LIGNES
// ============================================
function SequenceOdds({ data, formattedDate }: { data: StorytellingData; formattedDate: string }) {
  const [showContent, setShowContent] = React.useState(false)
  const [showCursors, setShowCursors] = React.useState(false)

  React.useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 300)
    const timer2 = setTimeout(() => setShowCursors(true), 900)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  // Team Totals from API
  const teamTotals = {
    away: {
      abbr: data.awayTeam.abbreviation,
      name: data.awayTeam.name,
      teamId: data.awayTeam.teamId,
      total: data.awayTeam.teamTotal || data.awayTeam.ppg,
      overOdds: data.awayTeam.teamTotalOverOdds || 1.91,
      underOdds: data.awayTeam.teamTotalUnderOdds || 1.91,
    },
    home: {
      abbr: data.homeTeam.abbreviation,
      name: data.homeTeam.name,
      teamId: data.homeTeam.teamId,
      total: data.homeTeam.teamTotal || data.homeTeam.ppg,
      overOdds: data.homeTeam.teamTotalOverOdds || 1.91,
      underOdds: data.homeTeam.teamTotalUnderOdds || 1.91,
    },
  }

  // Historique des Team Totals
  const atlTeamTotalHistory = data.awayTeam.teamTotalHistory.length > 0
    ? data.awayTeam.teamTotalHistory
    : data.awayTeam.scoringHistory.slice(0, 8).map(g => ({ opp: g.opponent, total: g.points }))

  const chaTeamTotalHistory = data.homeTeam.teamTotalHistory.length > 0
    ? data.homeTeam.teamTotalHistory
    : data.homeTeam.scoringHistory.slice(0, 8).map(g => ({ opp: g.opponent, total: g.points }))

  const atlAvg = atlTeamTotalHistory.length > 0
    ? atlTeamTotalHistory.reduce((sum, g) => sum + (g.total || 0), 0) / atlTeamTotalHistory.length
    : data.awayTeam.ppg
  const chaAvg = chaTeamTotalHistory.length > 0
    ? chaTeamTotalHistory.reduce((sum, g) => sum + (g.total || 0), 0) / chaTeamTotalHistory.length
    : data.homeTeam.ppg

  const mainLine = {
    total: data.betting.total,
    overOdds: data.betting.overOdds,
    underOdds: data.betting.underOdds,
  }

  const atlOverCount = atlTeamTotalHistory.filter(g => (g.total || 0) >= teamTotals.away.total).length
  const chaOverCount = chaTeamTotalHistory.filter(g => (g.total || 0) >= teamTotals.home.total).length

  return (
    <div className="h-full w-full flex flex-col px-8 py-4 gap-4 overflow-hidden box-border">
      {/* HEADER ROW - Badge + Titre */}
      <div
        className="flex items-center justify-between"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.5s ease-out',
        }}
      >
        <div className="flex items-center gap-6">
          <div
            className="px-4 py-2 rounded-full text-sm font-medium tracking-wider"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: colors.gray[400],
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            LIGNES PINNACLE · {formattedDate}
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.foreground }}
          >
            {data.awayTeam.abbreviation} @ {data.homeTeam.abbreviation} — Cotes & Team Totals
          </h2>
        </div>
        <p className="text-sm" style={{ color: colors.gray[500] }}>
          <span style={{ color: 'rgb(29, 193, 0)' }}>Vert</span> = OVER · <span style={{ color: 'rgb(239, 45, 44)' }}>Rouge</span> = UNDER
        </p>
      </div>

      {/* MAIN CONTENT - 3 rangées */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">

        {/* RANGÉE 1 : Team Totals individuels avec descriptions */}
        <div
          className="grid grid-cols-2 gap-4"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease-out 0.1s',
          }}
        >
          {/* ATL Team Total */}
          <div
            className="p-4 rounded-xl flex gap-4 overflow-hidden min-w-0"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                src={`https://cdn.nba.com/logos/nba/${teamTotals.away.teamId}/global/L/logo.svg`}
                alt={teamTotals.away.abbr}
                style={{ width: '56px', height: '56px' }}
              />
              <div>
                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.gray[600] }}>Team Total</div>
                <div className="text-4xl font-bold font-mono" style={{ color: colors.foreground }}>{teamTotals.away.total.toFixed(1)}</div>
                <div className="flex gap-3 text-sm mt-1">
                  <span style={{ color: 'rgb(29, 193, 0)' }}>O {teamTotals.away.overOdds.toFixed(2)}</span>
                  <span style={{ color: 'rgb(239, 45, 44)' }}>U {teamTotals.away.underOdds.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center border-l pl-4" style={{ borderColor: colors.gray[800] }}>
              <p className="text-base leading-relaxed" style={{ color: '#D1D5DB' }}>
                <strong style={{ color: colors.foreground }}>{data.awayTeam.name.split(' ').pop()}</strong> à <strong style={{ color: colors.foreground }}>{teamTotals.away.total.toFixed(1)} pts</strong> — {teamTotals.away.total > atlAvg ? 'au-dessus' : 'en-dessous'} de la moyenne ({atlAvg.toFixed(1)}).
              </p>
              <p className="text-sm mt-1" style={{ color: colors.gray[500] }}>
                <strong style={{ color: atlOverCount >= 4 ? 'rgb(29, 193, 0)' : 'rgb(239, 45, 44)' }}>{atlOverCount}/{atlTeamTotalHistory.length} OVER</strong> cette ligne récemment.
              </p>
            </div>
          </div>

          {/* CHA Team Total */}
          <div
            className="p-4 rounded-xl flex gap-4 overflow-hidden min-w-0"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                src={`https://cdn.nba.com/logos/nba/${teamTotals.home.teamId}/global/L/logo.svg`}
                alt={teamTotals.home.abbr}
                style={{ width: '56px', height: '56px' }}
              />
              <div>
                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.gray[600] }}>Team Total</div>
                <div className="text-4xl font-bold font-mono" style={{ color: colors.foreground }}>{teamTotals.home.total.toFixed(1)}</div>
                <div className="flex gap-3 text-sm mt-1">
                  <span style={{ color: 'rgb(29, 193, 0)' }}>O {teamTotals.home.overOdds.toFixed(2)}</span>
                  <span style={{ color: 'rgb(239, 45, 44)' }}>U {teamTotals.home.underOdds.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center border-l pl-4" style={{ borderColor: colors.gray[800] }}>
              <p className="text-base leading-relaxed" style={{ color: '#D1D5DB' }}>
                <strong style={{ color: colors.foreground }}>{data.homeTeam.name.split(' ').pop()}</strong> à <strong style={{ color: colors.foreground }}>{teamTotals.home.total.toFixed(1)} pts</strong> — proche de la moyenne ({chaAvg.toFixed(1)}).
              </p>
              <p className="text-sm mt-1" style={{ color: colors.gray[500] }}>
                <strong style={{ color: chaOverCount >= 4 ? 'rgb(29, 193, 0)' : 'rgb(239, 45, 44)' }}>{chaOverCount}/{chaTeamTotalHistory.length} OVER</strong> — marché équilibré.
              </p>
            </div>
          </div>
        </div>

        {/* RANGÉE 2 : Curseurs historiques */}
        <div
          className="grid grid-cols-2 gap-4 flex-1"
          style={{
            opacity: showCursors ? 1 : 0,
            transform: showCursors ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease-out',
          }}
        >
          {/* CURSEUR ATL */}
          <div
            className="p-4 rounded-xl flex flex-col overflow-hidden min-w-0"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={`https://cdn.nba.com/logos/nba/${teamTotals.away.teamId}/global/L/logo.svg`}
                  alt={teamTotals.away.abbr}
                  style={{ width: '32px', height: '32px' }}
                />
                <span className="font-bold" style={{ color: colors.foreground }}>Historique {data.awayTeam.abbreviation}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-bold" style={{ color: '#D1D5DB' }}>{atlAvg.toFixed(1)}</span>
                <span className="text-sm ml-2" style={{ color: colors.gray[600] }}>moy.</span>
              </div>
            </div>
            <p className="text-sm mb-3" style={{ color: colors.gray[500] }}>
              Chaque point = un match récent. La ligne blanche = seuil de <strong style={{ color: colors.foreground }}>{teamTotals.away.total.toFixed(1)}</strong> pts.
            </p>

            {/* Curseur */}
            <div className="relative flex-1 min-h-[80px]">
              <div
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 rounded-full"
                style={{ backgroundColor: colors.gray[800] }}
              />
              {atlTeamTotalHistory.map((game, idx) => {
                const values = atlTeamTotalHistory.map(g => g.total || 0)
                const min = Math.min(...values) - 3
                const max = Math.max(...values) + 3
                const pos = (((game.total || 0) - min) / (max - min)) * 100
                const isOver = (game.total || 0) >= teamTotals.away.total
                return (
                  <div
                    key={idx}
                    className="absolute top-1/2 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      left: `${Math.min(Math.max(pos, 6), 94)}%`,
                      width: '40px',
                      height: '40px',
                      backgroundColor: isOver ? 'rgb(29, 193, 0)' : 'rgb(239, 45, 44)',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'white',
                    }}
                    title={`vs ${(game as { opp?: string; opponent?: string }).opp || (game as { opp?: string; opponent?: string }).opponent}: ${game.total}`}
                  >
                    {(game.total || 0).toFixed(0)}
                  </div>
                )
              })}
              {(() => {
                const values = atlTeamTotalHistory.map(g => g.total || 0)
                const min = Math.min(...values) - 3
                const max = Math.max(...values) + 3
                const pos = ((teamTotals.away.total - min) / (max - min)) * 100
                return (
                  <div
                    className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-0.5 flex-1 rounded" style={{ backgroundColor: colors.foreground }} />
                    <span
                      className="text-xs font-mono font-bold whitespace-nowrap px-2 py-0.5 rounded"
                      style={{ color: colors.background, backgroundColor: colors.foreground }}
                    >
                      {teamTotals.away.total.toFixed(1)}
                    </span>
                    <div className="w-0.5 flex-1 rounded" style={{ backgroundColor: colors.foreground }} />
                  </div>
                )
              })()}
            </div>
          </div>

          {/* CURSEUR CHA */}
          <div
            className="p-4 rounded-xl flex flex-col overflow-hidden min-w-0"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={`https://cdn.nba.com/logos/nba/${teamTotals.home.teamId}/global/L/logo.svg`}
                  alt={teamTotals.home.abbr}
                  style={{ width: '32px', height: '32px' }}
                />
                <span className="font-bold" style={{ color: colors.foreground }}>Historique {data.homeTeam.abbreviation}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-bold" style={{ color: '#D1D5DB' }}>{chaAvg.toFixed(1)}</span>
                <span className="text-sm ml-2" style={{ color: colors.gray[600] }}>moy.</span>
              </div>
            </div>
            <p className="text-sm mb-3" style={{ color: colors.gray[500] }}>
              Chaque point = un match récent. La ligne blanche = seuil de <strong style={{ color: colors.foreground }}>{teamTotals.home.total.toFixed(1)}</strong> pts.
            </p>

            {/* Curseur */}
            <div className="relative flex-1 min-h-[80px]">
              <div
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 rounded-full"
                style={{ backgroundColor: colors.gray[800] }}
              />
              {chaTeamTotalHistory.map((game, idx) => {
                const values = chaTeamTotalHistory.map(g => g.total || 0)
                const min = Math.min(...values) - 3
                const max = Math.max(...values) + 3
                const pos = (((game.total || 0) - min) / (max - min)) * 100
                const isOver = (game.total || 0) >= teamTotals.home.total
                return (
                  <div
                    key={idx}
                    className="absolute top-1/2 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      left: `${Math.min(Math.max(pos, 6), 94)}%`,
                      width: '40px',
                      height: '40px',
                      backgroundColor: isOver ? 'rgb(29, 193, 0)' : 'rgb(239, 45, 44)',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'white',
                    }}
                    title={`vs ${(game as { opp?: string; opponent?: string }).opp || (game as { opp?: string; opponent?: string }).opponent}: ${game.total}`}
                  >
                    {(game.total || 0).toFixed(0)}
                  </div>
                )
              })}
              {(() => {
                const values = chaTeamTotalHistory.map(g => g.total || 0)
                const min = Math.min(...values) - 3
                const max = Math.max(...values) + 3
                const pos = ((teamTotals.home.total - min) / (max - min)) * 100
                return (
                  <div
                    className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-0.5 flex-1 rounded" style={{ backgroundColor: colors.foreground }} />
                    <span
                      className="text-xs font-mono font-bold whitespace-nowrap px-2 py-0.5 rounded"
                      style={{ color: colors.background, backgroundColor: colors.foreground }}
                    >
                      {teamTotals.home.total.toFixed(1)}
                    </span>
                    <div className="w-0.5 flex-1 rounded" style={{ backgroundColor: colors.foreground }} />
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

        {/* RANGÉE 3 : Total du match combiné */}
        {mainLine.total !== null ? (
          <div
            className="p-5 rounded-xl flex items-center justify-between"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.gray[800]}`,
              opacity: showCursors ? 1 : 0,
              transition: 'opacity 0.5s ease-out 0.2s',
            }}
          >
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.gray[600] }}>Total du Match</div>
                <div className="text-5xl font-bold font-mono" style={{ color: colors.foreground }}>{mainLine.total}</div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgb(29, 193, 0)' }}>Over</div>
                  <div className="text-3xl font-bold font-mono" style={{ color: colors.foreground }}>{mainLine.overOdds.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgb(239, 45, 44)' }}>Under</div>
                  <div className="text-3xl font-bold font-mono" style={{ color: colors.foreground }}>{mainLine.underOdds.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-xl pl-8 border-l" style={{ borderColor: colors.gray[800] }}>
              <p className="text-lg leading-relaxed" style={{ color: '#D1D5DB' }}>
                La ligne combinée à <strong style={{ color: colors.foreground }}>{mainLine.total} points</strong> est l'une des plus élevées de la soirée NBA. Les Team Totals additionnés donnent <strong style={{ color: colors.foreground }}>{(teamTotals.away.total + teamTotals.home.total).toFixed(1)} points</strong> — {teamTotals.away.total + teamTotals.home.total > mainLine.total ? 'légèrement au-dessus' : 'en-dessous'} de cette ligne.
              </p>
            </div>
            <div className="flex items-center gap-3 pl-6">
              <span className="text-xs uppercase tracking-wider" style={{ color: colors.gray[600] }}>Scroll</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: colors.gray[600] }}>
                <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        ) : (
          <div
            className="p-5 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.gray[800]}`,
              opacity: showCursors ? 1 : 0,
              transition: 'opacity 0.5s ease-out 0.2s',
            }}
          >
            <p className="text-lg" style={{ color: colors.gray[500] }}>
              Ligne de marché non disponible pour ce match
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// SÉQUENCE 2 : ACCROCHE
// ============================================
function SequenceAccroche({
  data,
  narrative,
  isLoading,
}: {
  data: StorytellingData
  narrative?: AccrocheNarrative
  isLoading?: boolean
}) {
  const trendResults = data.trend.recentResults.length > 0
    ? data.trend.recentResults
    : [
        { type: 'over' as const, diff: 18 },
        { type: 'over' as const, diff: 5 },
        { type: 'over' as const, diff: 12 },
        { type: 'under' as const, diff: -4 },
        { type: 'over' as const, diff: 8 },
      ]

  // Default text for fallback
  const defaultContext = `${data.awayTeam.name.split(' ').pop()} (${data.awayTeam.ppg} pts/match) se déplace chez ${data.homeTeam.name.split(' ').pop()} (${data.homeTeam.ppg} pts/match). Sur leurs ${trendResults.length} derniers matchs combinés, le Over est passé ${data.trend.overCount} fois sur ${trendResults.length}.`
  const defaultReflection = data.betting.total !== null
    ? `Avec une ligne à ${data.betting.total}, les bookmakers anticipent-ils correctement ce duel offensif ?`
    : `Comment évaluer ce duel offensif sans ligne de marché disponible ?`

  return (
    <SequenceContent
      contextText={
        isLoading ? (
          <div className="h-16 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        ) : narrative?.context ? (
          <StreamingNarrative text={narrative.context} />
        ) : (
          defaultContext
        )
      }
      reflectionQuestion={
        isLoading ? (
          <div className="h-6 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '80%' }} />
        ) : narrative?.reflection ? (
          <StreamingNarrative text={narrative.reflection} />
        ) : (
          defaultReflection
        )
      }
    >
      <div className="flex flex-col items-center justify-center h-full gap-8">
        <MatchupHeader
          awayTeam={data.awayTeam.abbreviation}
          homeTeam={data.homeTeam.abbreviation}
          line={data.betting.total !== null ? data.betting.total.toString() : 'N/A'}
          lineType="O/U"
        />

        <div className="w-full max-w-md">
          <h3
            className="text-sm uppercase tracking-wider mb-3 text-center"
            style={{ color: colors.gray[500] }}
          >
            Tendance récente ({trendResults.length} matchs)
          </h3>
          <TrendBar results={trendResults} />
        </div>
      </div>
    </SequenceContent>
  )
}

// ============================================
// SÉQUENCE 3 : SCORING OFFENSIF COMBINÉ
// ============================================
function SequenceScoringCombined({
  data,
  narrative,
  isLoading,
}: {
  data: StorytellingData
  narrative?: ScoringNarrative
  isLoading?: boolean
}) {
  // Convert scoring history to chart data format
  const atlChartData = data.awayTeam.scoringHistory.map(g => ({
    label: g.opponent,
    value: g.points,
  }))

  const chaChartData = data.homeTeam.scoringHistory.map(g => ({
    label: g.opponent,
    value: g.points,
  }))

  const atlStats = {
    ppg: data.awayTeam.ppg,
    fgPct: `${data.awayTeam.fgPct.toFixed(1)}%`,
    threePct: `${data.awayTeam.threePct.toFixed(1)}%`,
    pace: data.awayTeam.pace.toFixed(1),
    teamTotal: data.awayTeam.teamTotal || data.awayTeam.ppg,
  }

  const chaStats = {
    ppg: data.homeTeam.ppg,
    fgPct: `${data.homeTeam.fgPct.toFixed(1)}%`,
    threePct: `${data.homeTeam.threePct.toFixed(1)}%`,
    pace: data.homeTeam.pace.toFixed(1),
    teamTotal: data.homeTeam.teamTotal || data.homeTeam.ppg,
  }

  // Default title for fallback
  const defaultTitle = 'Scoring Offensif · Saison 2024-25'

  return (
    <div className="h-full w-full flex flex-col px-8 py-4 gap-3 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <div
          className="inline-block px-3 py-1.5 rounded-full text-xs uppercase tracking-widest mb-2"
          style={{ backgroundColor: colors.gray[900], color: colors.gray[400] }}
        >
          {isLoading ? (
            <span className="animate-pulse">Génération...</span>
          ) : narrative?.title ? (
            narrative.title
          ) : (
            defaultTitle
          )}
        </div>
        <h2 className="text-2xl font-bold" style={{ color: colors.foreground }}>
          {data.awayTeam.abbreviation} @ {data.homeTeam.abbreviation} — Attaques comparées
        </h2>
      </div>

      {/* Away Team Row */}
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* Left: Text + Stats */}
        <div className="w-1/2 min-w-0 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={`https://cdn.nba.com/logos/nba/${data.awayTeam.teamId}/global/L/logo.svg`}
              alt={data.awayTeam.abbreviation}
              className="w-16 h-16"
            />
            <div>
              <div className="text-3xl font-bold" style={{ color: colors.foreground }}>
                {atlStats.ppg} <span className="text-lg font-normal" style={{ color: colors.gray[500] }}>pts/match</span>
              </div>
              <div className="text-sm" style={{ color: colors.gray[400] }}>
                {data.awayTeam.offensiveRank}{getOrdinalSuffix(data.awayTeam.offensiveRank)} attaque de la ligue · Pace {atlStats.pace}
              </div>
            </div>
          </div>
          <p className="text-base leading-relaxed" style={{ color: '#D1D5DB' }}>
            {isLoading ? (
              <span className="block h-12 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            ) : narrative?.analysis ? (
              <StreamingNarrative text={narrative.analysis} />
            ) : (
              <>
                <strong style={{ color: colors.foreground }}>{data.awayTeam.name.split(' ').pop()}</strong> score en moyenne{' '}
                <strong style={{ color: colors.foreground }}>{atlStats.ppg} points</strong> par match.
                Tempo élevé et jeu offensif.
              </>
            )}
          </p>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-xl font-bold font-mono" style={{ color: colors.foreground }}>{atlStats.fgPct}</div>
              <div className="text-xs uppercase" style={{ color: colors.gray[500] }}>FG%</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold font-mono" style={{ color: colors.foreground }}>{atlStats.threePct}</div>
              <div className="text-xs uppercase" style={{ color: colors.gray[500] }}>3P%</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold font-mono" style={{ color: colors.foreground }}>{atlStats.pace}</div>
              <div className="text-xs uppercase" style={{ color: colors.gray[500] }}>Pace</div>
            </div>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="w-1/2 min-w-0 overflow-hidden">
          {atlChartData.length > 0 ? (
            <BarChart
              data={atlChartData}
              threshold={atlStats.teamTotal}
              colorMode="threshold"
              showGrid
              label="Points"
            />
          ) : (
            <div className="h-full flex items-center justify-center" style={{ color: colors.gray[500] }}>
              No scoring data available
            </div>
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="flex-shrink-0 border-t" style={{ borderColor: colors.gray[800] }} />

      {/* Home Team Row */}
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* Left: Text + Stats */}
        <div className="w-1/2 min-w-0 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={`https://cdn.nba.com/logos/nba/${data.homeTeam.teamId}/global/L/logo.svg`}
              alt={data.homeTeam.abbreviation}
              className="w-16 h-16"
            />
            <div>
              <div className="text-3xl font-bold" style={{ color: colors.foreground }}>
                {chaStats.ppg} <span className="text-lg font-normal" style={{ color: colors.gray[500] }}>pts/match</span>
              </div>
              <div className="text-sm" style={{ color: colors.gray[400] }}>
                {data.homeTeam.offensiveRank}{getOrdinalSuffix(data.homeTeam.offensiveRank)} attaque de la ligue · Pace {chaStats.pace}
              </div>
            </div>
          </div>
          <p className="text-base leading-relaxed" style={{ color: '#D1D5DB' }}>
            <strong style={{ color: colors.foreground }}>{data.homeTeam.name.split(' ').pop()}</strong> affiche{' '}
            <strong style={{ color: colors.foreground }}>{chaStats.ppg} points</strong> de moyenne.
            {data.homeTeam.defensiveRank >= 25 && (
              <> La défense reste un point faible ({data.homeTeam.defensiveRank}{getOrdinalSuffix(data.homeTeam.defensiveRank)} DRTG).</>
            )}
          </p>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-xl font-bold font-mono" style={{ color: colors.foreground }}>{chaStats.fgPct}</div>
              <div className="text-xs uppercase" style={{ color: colors.gray[500] }}>FG%</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold font-mono" style={{ color: colors.foreground }}>{chaStats.threePct}</div>
              <div className="text-xs uppercase" style={{ color: colors.gray[500] }}>3P%</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold font-mono" style={{ color: colors.foreground }}>{chaStats.pace}</div>
              <div className="text-xs uppercase" style={{ color: colors.gray[500] }}>Pace</div>
            </div>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="w-1/2 min-w-0 overflow-hidden">
          {chaChartData.length > 0 ? (
            <BarChart
              data={chaChartData}
              threshold={chaStats.teamTotal}
              colorMode="threshold"
              showGrid
              label="Points"
            />
          ) : (
            <div className="h-full flex items-center justify-center" style={{ color: colors.gray[500] }}>
              No scoring data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SÉQUENCE 4 : COMBINÉ
// ============================================
function SequenceCombine({
  data,
  narrative,
  isLoading,
}: {
  data: StorytellingData
  narrative?: CombinedNarrative
  isLoading?: boolean
}) {
  const h2hData = data.h2h.games.length > 0
    ? data.h2h.games.map(g => ({
        label: new Date(g.date).toLocaleDateString('fr-FR', { month: 'short' }),
        value: g.totalPoints,
      }))
    : [
        { label: 'Jan', value: 235 },
        { label: 'Mar', value: 232 },
        { label: 'Avr', value: 228 },
        { label: 'Nov', value: 230 },
        { label: 'Dec', value: 234 },
      ]

  const avgTotal = data.h2h.avgTotal || 231.3
  const hasLine = data.betting.total !== null
  const diffVsLine = hasLine ? data.projectedTotal - data.betting.total! : 0

  // Default texts for fallback
  const defaultTitle = 'Dynamique Combinée'
  const defaultContext = `Ces deux équipes combinent pour un pace projeté de ${data.projectedPace} possessions par match. Leurs ${data.h2h.games.length > 0 ? data.h2h.games.length : 5} dernières confrontations ont produit en moyenne ${avgTotal.toFixed(1)} points${hasLine && diffVsLine > 0 ? `, soit +${diffVsLine.toFixed(1)} au-dessus de la ligne actuelle` : ''}.`

  return (
    <SequenceContent
      title={
        isLoading ? (
          <span className="animate-pulse">Génération...</span>
        ) : narrative?.title ? (
          narrative.title
        ) : (
          defaultTitle
        )
      }
      contextText={
        isLoading ? (
          <div className="h-16 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        ) : narrative?.context ? (
          <StreamingNarrative text={narrative.context} />
        ) : (
          defaultContext
        )
      }
    >
      <div className="space-y-8">
        {/* Historique H2H */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: colors.gray[900],
            border: `1px solid ${colors.gray[800]}`,
          }}
        >
          <h4
            className="text-sm uppercase tracking-wider mb-4"
            style={{ color: colors.gray[500] }}
          >
            Historique des confrontations (scoring combiné)
          </h4>
          <AnimatedChart
            data={h2hData}
            threshold={data.betting.total ?? undefined}
            height={160}
          />
          <div
            className="mt-4 text-sm text-center"
            style={{ color: colors.gray[400] }}
          >
            OVER: {data.h2h.overCount} · UNDER: {data.h2h.underCount} · Moyenne: {avgTotal.toFixed(1)} pts
          </div>
        </div>

        {/* Projections */}
        <div className="grid grid-cols-2 gap-6">
          <AnalysisStatCard
            value={data.projectedPace.toFixed(1)}
            label="PACE PROJETÉ"
            size="lg"
          />
          <AnalysisStatCard
            value={data.projectedTotal.toFixed(1)}
            label="TOTAL PROJETÉ"
            variation={hasLine ? `${diffVsLine > 0 ? '+' : ''}${diffVsLine.toFixed(1)} vs ligne` : undefined}
            variationType={diffVsLine > 0 ? 'positive' : 'negative'}
            size="lg"
          />
        </div>

        {/* AI-Generated Insight */}
        {(narrative?.insight || isLoading) && (
          <div
            className="p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: colors.gray[600],
            }}
          >
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.gray[500] }}>
              💡 Insight Clé
            </div>
            <p className="text-base" style={{ color: '#D1D5DB' }}>
              {isLoading ? (
                <span className="block h-6 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              ) : (
                <StreamingNarrative text={narrative!.insight} />
              )}
            </p>
          </div>
        )}
      </div>
    </SequenceContent>
  )
}

// ============================================
// SÉQUENCE 5 : OPPONENT DEFENSE
// ============================================
function SequenceOpponent({
  data,
  narrative,
  isLoading,
}: {
  data: StorytellingData
  narrative?: DefenseNarrative
  isLoading?: boolean
}) {
  // Prepare defense charts data
  const homeDefenseData = data.homeTeam.pointsAllowedLast5.length > 0
    ? data.homeTeam.pointsAllowedLast5.map((g, idx) => ({
        label: `G-${data.homeTeam.pointsAllowedLast5.length - idx}`,
        value: g.pointsAllowed,
      }))
    : [
        { label: 'G-5', value: 122 },
        { label: 'G-4', value: 118 },
        { label: 'G-3', value: 124 },
        { label: 'G-2', value: 116 },
        { label: 'G-1', value: 119 },
      ]

  const awayDefenseData = data.awayTeam.pointsAllowedLast5.length > 0
    ? data.awayTeam.pointsAllowedLast5.map((g, idx) => ({
        label: `G-${data.awayTeam.pointsAllowedLast5.length - idx}`,
        value: g.pointsAllowed,
      }))
    : [
        { label: 'G-5', value: 118 },
        { label: 'G-4', value: 120 },
        { label: 'G-3', value: 115 },
        { label: 'G-2', value: 122 },
        { label: 'G-1', value: 117 },
      ]

  // Default texts for fallback
  const defaultTitle = 'Défenses Adverses · Points Concédés'
  const defaultContext = `${data.awayTeam.name.split(' ').pop()} fait face à une défense de ${data.homeTeam.name.split(' ').pop()} qui concède ${data.homeTeam.pointsAllowed.toFixed(1)} pts de moyenne (${data.homeTeam.defensiveRank}${getOrdinalSuffix(data.homeTeam.defensiveRank)} de la ligue). De leur côté, ${data.homeTeam.name.split(' ').pop()} affrontera une défense de ${data.awayTeam.name.split(' ').pop()} qui concède ${data.awayTeam.pointsAllowed.toFixed(1)} pts.`

  return (
    <SequenceContent
      title={
        isLoading ? (
          <span className="animate-pulse">Génération...</span>
        ) : narrative?.title ? (
          narrative.title
        ) : (
          defaultTitle
        )
      }
      contextText={
        isLoading ? (
          <div className="h-16 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        ) : narrative?.context ? (
          <StreamingNarrative text={narrative.context} />
        ) : (
          defaultContext
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Home DEF */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: colors.gray[900],
            border: `1px solid ${colors.gray[800]}`,
          }}
        >
          <h4
            className="text-sm uppercase tracking-wider mb-4"
            style={{ color: colors.gray[500] }}
          >
            {data.homeTeam.abbreviation} · Points concédés
          </h4>
          <AnimatedChart
            data={homeDefenseData}
            height={140}
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <AnalysisStatCard
              value={data.homeTeam.pointsAllowed.toFixed(1)}
              label="Moyenne"
              size="sm"
            />
            <AnalysisStatCard
              value={`${data.homeTeam.defensiveRank}${getOrdinalSuffix(data.homeTeam.defensiveRank)}`}
              label="Rang DEF"
              variationType={data.homeTeam.defensiveRank >= 25 ? 'negative' : 'neutral'}
              size="sm"
            />
          </div>
        </div>

        {/* Away DEF */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: colors.gray[900],
            border: `1px solid ${colors.gray[800]}`,
          }}
        >
          <h4
            className="text-sm uppercase tracking-wider mb-4"
            style={{ color: colors.gray[500] }}
          >
            {data.awayTeam.abbreviation} · Points concédés
          </h4>
          <AnimatedChart
            data={awayDefenseData}
            height={140}
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <AnalysisStatCard
              value={data.awayTeam.pointsAllowed.toFixed(1)}
              label="Moyenne"
              size="sm"
            />
            <AnalysisStatCard
              value={`${data.awayTeam.defensiveRank}${getOrdinalSuffix(data.awayTeam.defensiveRank)}`}
              label="Rang DEF"
              variationType={data.awayTeam.defensiveRank >= 25 ? 'negative' : 'neutral'}
              size="sm"
            />
          </div>
        </div>

        {/* AI-Generated Edge Analysis */}
        {(narrative?.edge || isLoading) && (
          <div
            className="p-4 rounded-lg border-l-4 mt-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: colors.gray[600],
            }}
          >
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.gray[500] }}>
              🛡️ Avantage Défensif
            </div>
            <p className="text-base" style={{ color: '#D1D5DB' }}>
              {isLoading ? (
                <span className="block h-6 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              ) : (
                <StreamingNarrative text={narrative!.edge} />
              )}
            </p>
          </div>
        )}
      </div>
    </SequenceContent>
  )
}

// ============================================
// SÉQUENCE 6 : PRÉDICTION ML
// ============================================
function SequenceML({
  data,
  narrative,
  isLoading,
}: {
  data: StorytellingData
  narrative?: MLPredictionNarrative
  isLoading?: boolean
}) {
  const ml = data.mlPrediction
  if (!ml) return null

  const modelsAgree = Math.abs(ml.logisticProb - ml.xgboostProb) < 10
  const isHighConfidence = ml.confidence >= 58
  const hasPositiveEV = ml.expectedValue > 0

  // Colors based on prediction
  const predictionColor = ml.prediction === 'OVER' ? 'rgb(29, 193, 0)' : 'rgb(239, 45, 44)'
  const confidenceColor = isHighConfidence ? 'rgb(29, 193, 0)' : colors.gray[400]
  const evColor = hasPositiveEV ? 'rgb(29, 193, 0)' : 'rgb(239, 45, 44)'

  // Default texts for fallback
  const defaultTitle = 'Prédiction Machine Learning'
  const defaultAnalysis = `Le modèle prédit ${ml.prediction} avec ${ml.confidence}% de confiance. ${modelsAgree ? 'Les deux modèles (Logistique et XGBoost) sont en accord.' : 'Légère divergence entre les modèles.'}`

  return (
    <SequenceContent
      title={
        isLoading ? (
          <span className="animate-pulse">Analyse ML en cours...</span>
        ) : narrative?.title ? (
          narrative.title
        ) : (
          defaultTitle
        )
      }
      contextText={
        isLoading ? (
          <div className="h-16 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        ) : narrative?.analysis ? (
          <StreamingNarrative text={narrative.analysis} />
        ) : (
          defaultAnalysis
        )
      }
    >
      <div className="space-y-6">
        {/* Main Prediction Card */}
        <div
          className="p-8 rounded-xl text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${predictionColor}`,
          }}
        >
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: colors.gray[500] }}>
            🤖 Prédiction ML
          </div>
          <div
            className="text-6xl font-bold font-mono mb-4"
            style={{ color: predictionColor }}
          >
            {ml.prediction}
          </div>
          <div className="text-lg" style={{ color: colors.gray[400] }}>
            Ligne: <span className="font-mono font-bold" style={{ color: colors.foreground }}>{ml.line}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Confidence */}
          <div
            className="p-5 rounded-lg text-center"
            style={{
              backgroundColor: colors.gray[900],
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.gray[500] }}>
              Confiance
            </div>
            <div
              className="text-3xl font-bold font-mono"
              style={{ color: confidenceColor }}
            >
              {ml.confidence}%
            </div>
            {isHighConfidence && (
              <div className="text-xs mt-2 px-2 py-1 rounded-full inline-block" style={{ backgroundColor: 'rgba(29, 193, 0, 0.2)', color: 'rgb(29, 193, 0)' }}>
                🔥 High Confidence
              </div>
            )}
          </div>

          {/* Expected Value */}
          <div
            className="p-5 rounded-lg text-center"
            style={{
              backgroundColor: colors.gray[900],
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.gray[500] }}>
              Expected Value
            </div>
            <div
              className="text-3xl font-bold font-mono"
              style={{ color: evColor }}
            >
              {hasPositiveEV ? '+' : ''}{ml.expectedValue}%
            </div>
            <div className="text-xs mt-2" style={{ color: colors.gray[500] }}>
              {hasPositiveEV ? 'Valeur positive' : 'Valeur négative'}
            </div>
          </div>

          {/* Model Agreement */}
          <div
            className="p-5 rounded-lg text-center"
            style={{
              backgroundColor: colors.gray[900],
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.gray[500] }}>
              Accord Modèles
            </div>
            <div
              className="text-3xl font-bold"
              style={{ color: modelsAgree ? 'rgb(29, 193, 0)' : 'rgb(255, 193, 7)' }}
            >
              {modelsAgree ? '✓' : '~'}
            </div>
            <div className="text-xs mt-2" style={{ color: colors.gray[500] }}>
              {modelsAgree ? 'Consensus' : 'Divergence'}
            </div>
          </div>
        </div>

        {/* Model Probabilities */}
        <div
          className="p-5 rounded-lg"
          style={{
            backgroundColor: colors.gray[900],
            border: `1px solid ${colors.gray[800]}`,
          }}
        >
          <div className="text-xs uppercase tracking-wider mb-4" style={{ color: colors.gray[500] }}>
            Probabilités par Modèle
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* Logistic Regression */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: colors.gray[400] }}>Régression Logistique</span>
                <span className="font-mono font-bold" style={{ color: colors.foreground }}>{ml.logisticProb}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.gray[800] }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${ml.logisticProb}%`,
                    backgroundColor: ml.logisticProb >= 50 ? 'rgb(29, 193, 0)' : 'rgb(239, 45, 44)',
                  }}
                />
              </div>
            </div>

            {/* XGBoost */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: colors.gray[400] }}>XGBoost</span>
                <span className="font-mono font-bold" style={{ color: colors.foreground }}>{ml.xgboostProb}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.gray[800] }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${ml.xgboostProb}%`,
                    backgroundColor: ml.xgboostProb >= 50 ? 'rgb(29, 193, 0)' : 'rgb(239, 45, 44)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        {(narrative?.analysis || isLoading) && (
          <div
            className="p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: predictionColor,
            }}
          >
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.gray[500] }}>
              🧠 Analyse ML
            </div>
            <p className="text-base" style={{ color: '#D1D5DB' }}>
              {isLoading ? (
                <span className="block h-6 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              ) : (
                <StreamingNarrative text={narrative!.analysis} />
              )}
            </p>
          </div>
        )}
      </div>
    </SequenceContent>
  )
}

// ============================================
// SÉQUENCE 7 : SYNTHÈSE
// ============================================
function SequenceSynthese({
  data,
  narrative,
  isLoading,
  onRegenerate,
  isGenerating,
}: {
  data: StorytellingData
  narrative?: SynthesisNarrative
  isLoading?: boolean
  onRegenerate?: () => void
  isGenerating?: boolean
}) {
  // Generate dynamic factors based on data (used as fallback)
  const overFactors: string[] = []
  const underFactors: string[] = []

  // H2H trend
  if (data.h2h.overCount > data.h2h.underCount) {
    overFactors.push(`H2H: ${data.h2h.overCount}-${data.h2h.underCount} OVER récent`)
  } else if (data.h2h.underCount > data.h2h.overCount) {
    underFactors.push(`H2H: ${data.h2h.underCount}-${data.h2h.overCount} UNDER récent`)
  }

  // Recent trend
  if (data.trend.overCount >= 3) {
    overFactors.push(`${data.awayTeam.abbreviation}+${data.homeTeam.abbreviation}: ${data.trend.overCount}-${data.trend.underCount} OVER sur ${data.trend.recentResults.length} matchs`)
  } else if (data.trend.underCount >= 3) {
    underFactors.push(`${data.awayTeam.abbreviation}+${data.homeTeam.abbreviation}: ${data.trend.underCount}-${data.trend.overCount} UNDER sur ${data.trend.recentResults.length} matchs`)
  }

  // Pace
  if (data.projectedPace >= 102) {
    overFactors.push(`Pace élevé (${data.projectedPace})`)
  } else if (data.projectedPace <= 98) {
    underFactors.push(`Pace lent (${data.projectedPace})`)
  }

  // Defense rankings
  if (data.homeTeam.defensiveRank >= 25) {
    overFactors.push(`${data.homeTeam.abbreviation} DEF faible (${data.homeTeam.pointsAllowed.toFixed(1)} pts)`)
  }
  if (data.awayTeam.defensiveRank >= 25) {
    overFactors.push(`${data.awayTeam.abbreviation} DEF faible (${data.awayTeam.pointsAllowed.toFixed(1)} pts)`)
  }
  if (data.homeTeam.defensiveRank <= 10) {
    underFactors.push(`${data.homeTeam.abbreviation} DEF solide (${data.homeTeam.defensiveRank}${getOrdinalSuffix(data.homeTeam.defensiveRank)})`)
  }
  if (data.awayTeam.defensiveRank <= 10) {
    underFactors.push(`${data.awayTeam.abbreviation} DEF solide (${data.awayTeam.defensiveRank}${getOrdinalSuffix(data.awayTeam.defensiveRank)})`)
  }

  // Rest factors
  if (data.rest.isBackToBack.away && data.rest.isBackToBack.home) {
    overFactors.push('Double back-to-back : défenses fatiguées')
  } else if (data.rest.isBackToBack.away) {
    underFactors.push(`${data.awayTeam.abbreviation} en back-to-back (fatigue)`)
  } else if (data.rest.isBackToBack.home) {
    underFactors.push(`${data.homeTeam.abbreviation} en back-to-back (fatigue)`)
  }

  if (data.rest.restAdvantage === 'away' && data.rest.awayRestDays >= 3) {
    overFactors.push(`${data.awayTeam.abbreviation} bien reposé (${data.rest.awayRestDays}j)`)
  } else if (data.rest.restAdvantage === 'home' && data.rest.homeRestDays >= 3) {
    overFactors.push(`${data.homeTeam.abbreviation} bien reposé (${data.rest.homeRestDays}j)`)
  }

  // Team totals combined vs line
  const combinedTeamTotals = (data.awayTeam.teamTotal || data.awayTeam.ppg) + (data.homeTeam.teamTotal || data.homeTeam.ppg)
  if (data.betting.total !== null) {
    if (combinedTeamTotals > data.betting.total) {
      overFactors.push(`Team Totals combinés > ligne (${combinedTeamTotals.toFixed(1)} vs ${data.betting.total})`)
    } else {
      underFactors.push(`Team Totals combinés < ligne (${combinedTeamTotals.toFixed(1)} vs ${data.betting.total})`)
    }

    // Line height
    if (data.betting.total >= 235) {
      underFactors.push(`Ligne élevée (${data.betting.total})`)
    }
  }

  // Calculate distribution percentage based on factors
  const totalFactors = overFactors.length + underFactors.length
  const overPercent = totalFactors > 0 ? Math.round((overFactors.length / totalFactors) * 100) : 50

  const hasLine = data.betting.total !== null

  // Default texts for fallback
  const defaultTitle = `Synthèse · ${data.awayTeam.abbreviation} @ ${data.homeTeam.abbreviation}${hasLine ? ` · O/U ${data.betting.total!}` : ''}`
  const defaultContext = `Cette confrontation réunit ${data.awayTeam.name.split(' ').pop()} (${data.awayTeam.ppg} pts/m) et ${data.homeTeam.name.split(' ').pop()} (${data.homeTeam.ppg} pts/m). Les Team Totals combinés (${combinedTeamTotals.toFixed(1)} pts) suggèrent ${hasLine && combinedTeamTotals > data.betting.total! ? 'un match à scoring élevé' : 'un match équilibré'}.`
  const defaultReflection = hasLine ? `Avant de conclure : la ligne à ${data.betting.total!} est-elle correctement calibrée pour ce duel offensif ?` : `Quelle devrait être la ligne idéale pour ce duel offensif ?`

  return (
    <SequenceContent
      title={
        isLoading ? (
          <span className="animate-pulse">Génération de la synthèse...</span>
        ) : narrative?.title ? (
          narrative.title
        ) : (
          defaultTitle
        )
      }
      contextText={
        isLoading ? (
          <div className="h-16 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        ) : narrative?.context ? (
          <StreamingNarrative text={narrative.context} />
        ) : (
          defaultContext
        )
      }
      reflectionQuestion={
        isLoading ? (
          <div className="h-6 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '80%' }} />
        ) : narrative?.reflection ? (
          <StreamingNarrative text={narrative.reflection} />
        ) : (
          defaultReflection
        )
      }
    >
      <div className="space-y-6">
        {/* AI Verdict Section */}
        {(narrative || isLoading) && (
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${colors.gray[700]}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold" style={{ color: colors.foreground }}>
                🎯 Verdict IA
              </h4>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isGenerating ? colors.gray[800] : 'rgba(255, 255, 255, 0.1)',
                    color: isGenerating ? colors.gray[600] : colors.foreground,
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isGenerating ? '⏳ Génération...' : '🔄 Régénérer'}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-12 w-28 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <div className="h-12 w-20 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                </div>
                <div className="space-y-2">
                  <div className="h-5 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '90%' }} />
                  <div className="h-5 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '75%' }} />
                  <div className="h-5 rounded animate-pulse" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '80%' }} />
                </div>
              </div>
            ) : narrative?.verdict ? (
              <div className="space-y-4">
                <VerdictBadge
                  verdict={narrative.verdict}
                  confidence={narrative.confidence}
                />
                <div className="mt-4">
                  <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.gray[500] }}>
                    Raisonnement
                  </div>
                  <ReasoningList reasons={narrative.reasoning} />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Facteurs (fallback data-driven analysis) */}
        <FactorsList
          overFactors={overFactors.length > 0 ? overFactors : ['Données insuffisantes']}
          underFactors={underFactors.length > 0 ? underFactors : ['Données insuffisantes']}
        />

        {/* Distribution */}
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: colors.gray[900],
            border: `1px solid ${colors.gray[800]}`,
          }}
        >
          <DistributionBar overPercent={overPercent} />
          <div className="mt-4">
            <ConfidenceIndicator
              percent={narrative?.confidence ?? Math.min(80, 50 + data.h2h.games.length * 5 + data.trend.recentResults.length * 3)}
              label={narrative ? "Confiance IA" : "Confiance données"}
            />
          </div>
        </div>
      </div>
    </SequenceContent>
  )
}

// ============================================
// SÉQUENCE : REST DAYS (Repos)
// ============================================
function SequenceRest({ data }: { data: StorytellingData }) {
  const [showContent, setShowContent] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const { rest } = data

  // Format last game date
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  // Get rest quality label
  const getRestLabel = (days: number): { label: string; color: string } => {
    if (days === 0) return { label: 'Back-to-Back', color: 'rgb(239, 45, 44)' }
    if (days === 1) return { label: 'Peu de repos', color: 'rgb(255, 193, 7)' }
    if (days === 2) return { label: 'Normal', color: colors.gray[400] }
    if (days >= 3) return { label: 'Bien reposé', color: 'rgb(29, 193, 0)' }
    return { label: `${days} jours`, color: colors.gray[400] }
  }

  const awayRestInfo = getRestLabel(rest.awayRestDays)
  const homeRestInfo = getRestLabel(rest.homeRestDays)

  // Determine advantage text
  const getAdvantageText = () => {
    if (rest.restAdvantage === 'away') {
      return `${data.awayTeam.abbreviation} a l'avantage du repos (+${rest.awayRestDays - rest.homeRestDays} jours)`
    } else if (rest.restAdvantage === 'home') {
      return `${data.homeTeam.abbreviation} a l'avantage du repos (+${rest.homeRestDays - rest.awayRestDays} jours)`
    }
    return 'Repos équivalent pour les deux équipes'
  }

  // Impact on totals analysis
  const getRestImpact = () => {
    const impacts: string[] = []

    if (rest.isBackToBack.away && rest.isBackToBack.home) {
      impacts.push('Double back-to-back : fatigue généralisée, défenses souvent moins intenses')
    } else if (rest.isBackToBack.away) {
      impacts.push(`${data.awayTeam.abbreviation} en back-to-back : possible baisse de régime offensif`)
    } else if (rest.isBackToBack.home) {
      impacts.push(`${data.homeTeam.abbreviation} en back-to-back : possible baisse de régime offensif`)
    }

    if (rest.restAdvantage === 'away' && rest.awayRestDays >= 3) {
      impacts.push(`${data.awayTeam.abbreviation} bien reposé peut exploiter une défense fatiguée`)
    } else if (rest.restAdvantage === 'home' && rest.homeRestDays >= 3) {
      impacts.push(`${data.homeTeam.abbreviation} bien reposé à domicile : avantage significatif`)
    }

    return impacts.length > 0 ? impacts : ['Aucun impact notable du repos sur ce match']
  }

  return (
    <SequenceContent
      title="Analyse du Repos"
      contextText={
        <span>
          Le facteur repos peut influencer significativement les performances offensives et défensives.
          Les équipes en back-to-back montrent généralement une baisse de -3 à -5 points en moyenne.
        </span>
      }
    >
      <div
        className="space-y-6"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease-out',
        }}
      >
        {/* Rest Cards Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Away Team Rest */}
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={`https://cdn.nba.com/logos/nba/${data.awayTeam.teamId}/global/L/logo.svg`}
                alt={data.awayTeam.abbreviation}
                className="w-14 h-14"
              />
              <div>
                <div className="text-sm uppercase tracking-wider" style={{ color: colors.gray[500] }}>
                  Visiteur
                </div>
                <div className="text-xl font-bold" style={{ color: colors.foreground }}>
                  {data.awayTeam.abbreviation}
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="text-5xl font-bold font-mono"
                style={{ color: awayRestInfo.color }}
              >
                {rest.awayRestDays}
              </span>
              <span className="text-lg" style={{ color: colors.gray[500] }}>
                jour{rest.awayRestDays !== 1 ? 's' : ''} de repos
              </span>
            </div>

            <div
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${awayRestInfo.color}20`,
                color: awayRestInfo.color,
              }}
            >
              {awayRestInfo.label}
            </div>

            <div className="mt-4 text-sm" style={{ color: colors.gray[500] }}>
              Dernier match: <span style={{ color: colors.foreground }}>{formatDate(rest.awayLastGame)}</span>
            </div>
          </div>

          {/* Home Team Rest */}
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.gray[800]}`,
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={`https://cdn.nba.com/logos/nba/${data.homeTeam.teamId}/global/L/logo.svg`}
                alt={data.homeTeam.abbreviation}
                className="w-14 h-14"
              />
              <div>
                <div className="text-sm uppercase tracking-wider" style={{ color: colors.gray[500] }}>
                  Local
                </div>
                <div className="text-xl font-bold" style={{ color: colors.foreground }}>
                  {data.homeTeam.abbreviation}
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="text-5xl font-bold font-mono"
                style={{ color: homeRestInfo.color }}
              >
                {rest.homeRestDays}
              </span>
              <span className="text-lg" style={{ color: colors.gray[500] }}>
                jour{rest.homeRestDays !== 1 ? 's' : ''} de repos
              </span>
            </div>

            <div
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${homeRestInfo.color}20`,
                color: homeRestInfo.color,
              }}
            >
              {homeRestInfo.label}
            </div>

            <div className="mt-4 text-sm" style={{ color: colors.gray[500] }}>
              Dernier match: <span style={{ color: colors.foreground }}>{formatDate(rest.homeLastGame)}</span>
            </div>
          </div>
        </div>

        {/* Rest Advantage Banner */}
        <div
          className="p-5 rounded-xl flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${colors.gray[800]}`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: colors.gray[800] }}
            >
              {rest.restAdvantage === 'even' ? '⚖️' : '💪'}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.gray[500] }}>
                Avantage Repos
              </div>
              <div className="text-lg font-medium" style={{ color: colors.foreground }}>
                {getAdvantageText()}
              </div>
            </div>
          </div>

          {rest.restAdvantage !== 'even' && (
            <div className="flex items-center gap-3">
              <img
                src={`https://cdn.nba.com/logos/nba/${rest.restAdvantage === 'away' ? data.awayTeam.teamId : data.homeTeam.teamId}/global/L/logo.svg`}
                alt=""
                className="w-10 h-10"
                style={{ filter: 'grayscale(0%)' }}
              />
            </div>
          )}
        </div>

        {/* Impact Analysis */}
        <div
          className="p-5 rounded-xl"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${colors.gray[800]}`,
          }}
        >
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: colors.gray[500] }}>
            🔍 Impact sur les Totaux
          </div>
          <ul className="space-y-2">
            {getRestImpact().map((impact, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-base"
                style={{ color: '#D1D5DB' }}
              >
                <span style={{ color: colors.gray[600] }}>•</span>
                {impact}
              </li>
            ))}
          </ul>
        </div>

        {/* Back-to-Back Warning */}
        {(rest.isBackToBack.away || rest.isBackToBack.home) && (
          <div
            className="p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: 'rgba(239, 45, 44, 0.1)',
              borderColor: 'rgb(239, 45, 44)',
            }}
          >
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'rgb(239, 45, 44)' }}>
              ⚠️ Alerte Back-to-Back
            </div>
            <p className="text-sm" style={{ color: '#D1D5DB' }}>
              {rest.isBackToBack.away && rest.isBackToBack.home ? (
                <>Les deux équipes jouent un back-to-back — situation rare avec fatigue mutuelle.</>
              ) : rest.isBackToBack.away ? (
                <><strong style={{ color: colors.foreground }}>{data.awayTeam.name}</strong> joue le deuxième match d'un back-to-back en déplacement — facteur de fatigue majeur.</>
              ) : (
                <><strong style={{ color: colors.foreground }}>{data.homeTeam.name}</strong> joue le deuxième match d'un back-to-back à domicile.</>
              )}
            </p>
          </div>
        )}
      </div>
    </SequenceContent>
  )
}

// Helper function for ordinal suffix
function getOrdinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return 'e'
  const lastDigit = n % 10
  if (lastDigit === 1) return 're'
  return 'e'
}
