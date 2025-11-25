import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ChartLine, Target, TrendingUp, AlertCircle, Trophy, Calculator, Brain } from 'lucide-react'
import { getCurrentSeason } from '@/lib/queries'
import OddsFetcher from '@/components/betting/OddsFetcher'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default async function BettingPage() {
  const currentSeason = await getCurrentSeason()

  const strategies = [
    {
      title: 'Rolling Average Total Model',
      difficulty: 'Easy',
      winRate: '55-58%',
      expectedEdge: '3-5%',
      icon: ChartLine,
      color: 'blue',
      description: 'Simple 3-game averages for O/U predictions',
      keyPoints: [
        'Track team scoring averages over last 3 games',
        'Compare to bookmaker totals',
        'Bet when 6+ points edge identified'
      ]
    },
    {
      title: 'Player Impact Quantification',
      difficulty: 'Medium',
      winRate: '56-59%',
      expectedEdge: '4-6%',
      icon: Trophy,
      color: 'green',
      description: 'Calculate team performance with/without key players',
      keyPoints: [
        'Quantify star player impact on team performance',
        'Exploit bookmaker under-adjustments',
        'Monitor injury reports for opportunities'
      ]
    },
    {
      title: 'Rest & Fatigue Model',
      difficulty: 'Easy',
      winRate: '54-57%',
      expectedEdge: '3-4%',
      icon: Target,
      color: 'orange',
      description: 'Quantify cumulative fatigue and travel impact',
      keyPoints: [
        'Track rest days between games',
        'Calculate travel distance impact',
        'Back-to-back game adjustments'
      ]
    },
    {
      title: 'Multi-Factor Composite',
      difficulty: 'Hard',
      winRate: '57-60%',
      expectedEdge: '5-8%',
      icon: Brain,
      color: 'purple',
      description: 'Combined analysis using multiple edge indicators',
      keyPoints: [
        'Weight strategies by reliability',
        'Composite scores increase win rate',
        'Highest ROI potential'
      ]
    }
  ]

  const quickStats = [
    { label: 'Expected ROI', value: '3-7%', description: 'Professional level returns' },
    { label: 'Spread Win Rate', value: '54-56%', description: 'Breakeven: 52.4%' },
    { label: 'O/U Win Rate', value: '55-57%', description: 'Totals betting edge' },
    { label: 'Player Props', value: '56-58%', description: 'Best edge opportunity' }
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
      {/* Breadcrumb Navigation and Header */}
      <div className="border-b pb-4">
        <Breadcrumb
          items={[
            { label: 'Betting Dashboard' }
          ]}
        />
        <div className="flex items-center gap-3 mt-2">
          <DollarSign className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Betting Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Statistical edges and betting strategies for the {currentSeason} NBA season
            </p>
          </div>
        </div>
      </div>

      {/* Live Odds Section */}
      <Card>
        <CardHeader>
          <CardTitle>Live Betting Odds</CardTitle>
          <CardDescription>
            Fetch current NBA game odds, spreads, totals, and player props
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OddsFetcher />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Box */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg">Responsible Gambling Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            These strategies are for educational and analytical purposes. Only bet in jurisdictions where legal,
            use licensed sportsbooks, set strict bankroll limits, and never chase losses. Gambling should be
            entertainment, not a primary income source.
          </p>
        </CardContent>
      </Card>

      {/* Strategies Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Betting Strategies</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calculator className="h-4 w-4" />
            <span>9 Advanced Statistical Models Available</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {strategies.map((strategy) => {
            const Icon = strategy.icon
            const bgColor = {
              blue: 'bg-blue-100',
              green: 'bg-green-100',
              orange: 'bg-orange-100',
              purple: 'bg-purple-100'
            }[strategy.color]
            const iconColor = {
              blue: 'text-blue-600',
              green: 'text-green-600',
              orange: 'text-orange-600',
              purple: 'text-purple-600'
            }[strategy.color]

            return (
              <Card key={strategy.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                      <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      strategy.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      strategy.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {strategy.difficulty}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{strategy.title}</CardTitle>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className="font-semibold">{strategy.winRate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Edge</p>
                      <p className="font-semibold">{strategy.expectedEdge}</p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {strategy.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Implementation Phases */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Roadmap</CardTitle>
          <CardDescription>
            Phased approach to building your betting edge system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold">Phase 1: Foundation (Week 1-2)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start with high ROI, easy implementation strategies: Rolling Averages, Player Impact, Rest/Fatigue
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold">Phase 2: Expansion (Week 3-4)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add medium complexity strategies: Pace & Possession, Home/Away Splits, Player Props
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold">Phase 3: Advanced (Week 5-6)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Implement complex models: Rebounding Differential, 3PT Regression, Multi-Factor Composite
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Available Data & Resources</CardTitle>
          <CardDescription>
            Comprehensive betting analysis framework and data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Strategy Documents</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• 9 detailed strategy guides</li>
                <li>• SQL implementation queries</li>
                <li>• Python analysis scripts</li>
                <li>• Performance tracking templates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Live Data Sources</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Real-time NBA game stats</li>
                <li>• Player performance metrics</li>
                <li>• Team analytics & trends</li>
                <li>• Bookmaker line movements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">JSON Market Mappings</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• ps3838.com data structure</li>
                <li>• Player props locations</li>
                <li>• Alternative lines parsing</li>
                <li>• Multi-bookmaker integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}