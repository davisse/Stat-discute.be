import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gauge, TrendingUp, Target, Activity, Calculator, Info, Zap } from 'lucide-react'
import {
  getCurrentSeason,
  getTeamPaceRankings,
  getPaceCorrelations,
  getMatchupTypeStats,
  getPaceScoringScatterData,
  getTeamsList
} from '@/lib/queries'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { PaceRankingsTable } from './PaceRankingsTable'
import { MatchupTypesTable } from './MatchupTypesTable'
import HeadToHeadAnalyzer from './HeadToHeadAnalyzer'

export default async function PaceAnalysisPage() {
  const currentSeason = await getCurrentSeason()

  const [paceRankings, correlations, matchupTypes, scatterData, teams] = await Promise.all([
    getTeamPaceRankings(),
    getPaceCorrelations(),
    getMatchupTypeStats(),
    getPaceScoringScatterData(),
    getTeamsList()
  ])

  // Helper to safely format numbers (handles PostgreSQL numeric type)
  const safeNum = (val: number | string | null | undefined): number => {
    if (val === null || val === undefined) return 0
    const num = typeof val === 'string' ? parseFloat(val) : val
    return isNaN(num) ? 0 : num
  }

  // Calculate league averages
  const leagueAvgPace = paceRankings.length > 0
    ? paceRankings.reduce((sum, t) => sum + safeNum(t.pace), 0) / paceRankings.length
    : 0
  const leagueAvgTotal = paceRankings.length > 0
    ? paceRankings.reduce((sum, t) => sum + safeNum(t.avg_total), 0) / paceRankings.length
    : 0

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b pb-4">
          <Breadcrumb items={[{ label: 'Pace-Scoring Analysis' }]} />
          <div className="flex items-center gap-3 mt-2">
            <Gauge className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Pace-Scoring Analysis</h1>
              <p className="text-muted-foreground mt-1">
                Understanding the relationship between pace and game totals for {currentSeason}
              </p>
            </div>
          </div>
        </div>

        {/* Key Insight Alert */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Key Finding</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <strong>Pace × Offensive Rating</strong> explains <strong>{(safeNum(correlations.pace_x_ortg_vs_total) * 100).toFixed(1)}%</strong> of
              game total variance. The formula <code className="bg-white px-1 rounded">Total = Pace × ORTG / 50</code> nearly
              perfectly predicts game totals when using in-game stats.
            </p>
          </CardContent>
        </Card>

        {/* Head-to-Head Analyzer */}
        <HeadToHeadAnalyzer teams={teams} />

        {/* Correlation Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Pace → Team PPG
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{(safeNum(correlations.pace_vs_ppg) * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">R² = {(safeNum(correlations.pace_vs_ppg) ** 2 * 100).toFixed(1)}% (Weak)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Combined Pace → Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{(safeNum(correlations.pace_vs_total) * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">R² = {(safeNum(correlations.pace_vs_total) ** 2 * 100).toFixed(1)}% (Moderate)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Offensive Rating → Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{(safeNum(correlations.ortg_vs_total) * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">R² = {(safeNum(correlations.ortg_vs_total) ** 2 * 100).toFixed(1)}% (Strong)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Pace × ORTG → Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">{(safeNum(correlations.pace_x_ortg_vs_total) * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">R² = {(safeNum(correlations.pace_x_ortg_vs_total) ** 2 * 100).toFixed(1)}% (Perfect)</p>
            </CardContent>
          </Card>
        </div>

        {/* Matchup Type Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Matchup Type Impact on Totals
            </CardTitle>
            <CardDescription>
              How different pace matchups affect game totals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MatchupTypesTable data={matchupTypes} />
          </CardContent>
        </Card>

        {/* Team Pace Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Team Pace Rankings with Scoring Data
            </CardTitle>
            <CardDescription>
              All 30 teams ranked by pace with comprehensive scoring metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaceRankingsTable
              data={paceRankings}
              leagueAvgPace={leagueAvgPace}
              leagueAvgTotal={leagueAvgTotal}
            />
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card>
          <CardHeader>
            <CardTitle>Methodology & Formula</CardTitle>
            <CardDescription>
              Understanding the pace-scoring relationship
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Pace Definition</h4>
                <code className="text-sm bg-white px-2 py-1 rounded block">
                  Pace = Possessions per 48 minutes
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Possessions = FGA + 0.44×FTA - OREB + TOV
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Total Prediction Formula</h4>
                <code className="text-sm bg-white px-2 py-1 rounded block">
                  Total = Combined Pace × Combined ORTG / 50
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  R² = {(safeNum(correlations.pace_x_ortg_vs_total) ** 2 * 100).toFixed(1)}% correlation with actual totals
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Key Insights for Betting</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">1.</span>
                  <span><strong>SLOW vs SLOW</strong> games are the most predictable (lowest variance) - best for confident UNDER bets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">2.</span>
                  <span><strong>FAST vs FAST</strong> games have high totals but HIGH variance - riskier for O/U betting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">3.</span>
                  <span><strong>MISMATCH</strong> games trend UNDER - the slow team controls pace more than expected</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600">4.</span>
                  <span>Individual team pace poorly predicts their own scoring (efficiency matters more)</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Recent Games Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
            <CardDescription>
              Based on {scatterData.length} games analyzed in {currentSeason}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold">{scatterData.length}</p>
                <p className="text-sm text-muted-foreground">Games Analyzed</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold">{leagueAvgPace.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">League Avg Pace</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold">{leagueAvgTotal.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">League Avg Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
