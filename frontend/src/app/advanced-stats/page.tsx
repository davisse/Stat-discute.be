export const dynamic = 'force-dynamic'

import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, TrendingUp, Users, Zap } from 'lucide-react'
import {
  getCurrentSeason,
  getUsageLeaders,
  getEfficiencyLeaders,
  getTeammateAbsenceImpact,
  getTeamsList
} from '@/lib/queries'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { UsageLeadersTable } from './UsageLeadersTable'
import { EfficiencyLeadersTable } from './EfficiencyLeadersTable'
import { AbsenceImpactSection } from './AbsenceImpactSection'

export default async function AdvancedStatsPage() {
  const currentSeason = await getCurrentSeason()

  const [usageLeaders, efficiencyLeaders, teams] = await Promise.all([
    getUsageLeaders(5, 30),
    getEfficiencyLeaders(5, 30),
    getTeamsList()
  ])

  return (
    <AppLayout>
      <div className="space-y-8 px-4 pb-12">
        {/* Header */}
        <div className="border-b border-white/10 pb-4">
          <Breadcrumb items={[{ label: 'Advanced Stats' }]} />
          <div className="flex items-center gap-3 mt-2">
            <Activity className="h-8 w-8 text-purple-500" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Advanced Stats</h1>
              <p className="text-gray-400 mt-1">
                Usage rates, efficiency metrics, and absence impact for {currentSeason}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Highest Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usageLeaders[0] && (
                <>
                  <p className="text-2xl font-bold text-white">{usageLeaders[0].full_name}</p>
                  <p className="text-sm text-gray-400">
                    {usageLeaders[0].avg_usage}% USG | {usageLeaders[0].ppg} PPG
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Most Efficient (TS%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {efficiencyLeaders[0] && (
                <>
                  <p className="text-2xl font-bold text-white">{efficiencyLeaders[0].full_name}</p>
                  <p className="text-sm text-gray-400">
                    {(efficiencyLeaders[0].avg_ts * 100).toFixed(1)}% TS | {efficiencyLeaders[0].ppg} PPG
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Players Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{usageLeaders.length}</p>
              <p className="text-sm text-gray-400">With 5+ games played</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Leaders */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-500" />
              Usage Rate Leaders
            </CardTitle>
            <CardDescription className="text-gray-400">
              Players with highest usage rates (min. 5 games)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsageLeadersTable data={usageLeaders} />
          </CardContent>
        </Card>

        {/* Efficiency Leaders */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Efficiency Leaders (True Shooting %)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Most efficient scorers with 15%+ usage rate (min. 5 games)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EfficiencyLeadersTable data={efficiencyLeaders} />
          </CardContent>
        </Card>

        {/* Absence Impact Analyzer */}
        <AbsenceImpactSection teams={teams} />

        {/* Methodology */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Advanced Stats Glossary</CardTitle>
            <CardDescription className="text-gray-400">
              Understanding the metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2 text-white">Usage Rate (USG%)</h4>
                <p className="text-sm text-gray-400">
                  Percentage of team plays used by a player while on court.
                  Higher = more ball-dominant. League average is ~20%.
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2 text-white">True Shooting % (TS%)</h4>
                <code className="text-sm bg-gray-700 px-2 py-1 rounded block text-gray-300">
                  TS% = PTS / (2 * (FGA + 0.44 * FTA))
                </code>
                <p className="text-xs text-gray-400 mt-2">
                  Most comprehensive shooting efficiency metric. League average ~57%.
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2 text-white">Effective FG% (eFG%)</h4>
                <code className="text-sm bg-gray-700 px-2 py-1 rounded block text-gray-300">
                  eFG% = (FGM + 0.5 * 3PM) / FGA
                </code>
                <p className="text-xs text-gray-400 mt-2">
                  Adjusts FG% for the extra value of 3-pointers.
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2 text-white">Absence Impact</h4>
                <p className="text-sm text-gray-400">
                  How a player&apos;s usage and production changes when a teammate is out.
                  Useful for props betting when stars are injured.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
