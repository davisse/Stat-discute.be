'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface TeamOdds {
  spread: string
  spreadOdds: string
  moneyline: string
  total: string
  overOdds: string
  underOdds: string
}

interface GameOdds {
  gameId: string
  homeTeam: string
  awayTeam: string
  startTime: string
  homeOdds: TeamOdds
  awayOdds: TeamOdds
}

interface TotalsCardProps {
  game: GameOdds | null
}

export default function TotalsCard({ game }: TotalsCardProps) {
  const formatOdds = (odds: string) => {
    const value = parseFloat(odds)
    if (isNaN(value)) return odds
    return value.toFixed(3)
  }

  const getOddsColor = (odds: string) => {
    const value = parseFloat(odds)
    if (value >= 2.1) return 'text-green-600 dark:text-green-400 font-semibold'
    if (value >= 1.95) return 'text-blue-600 dark:text-blue-400'
    if (value >= 1.85) return 'text-gray-700 dark:text-gray-300'
    return 'text-red-600 dark:text-red-400'
  }

  if (!game) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Totals & Over/Under
          </CardTitle>
          <CardDescription>
            Game and team total points
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a game to view totals
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Totals & Over/Under
        </CardTitle>
        <CardDescription>
          Game and team total points
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Game Total - Main Focus */}
          <div className="p-6 bg-primary/5 rounded-xl border-2 border-primary/20">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Game Total Points</h4>
            <p className="text-5xl font-bold text-center mb-4">{game.homeOdds.total}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                <p className="text-xs font-medium text-muted-foreground mb-1">OVER</p>
                <p className={`text-2xl font-bold ${getOddsColor(game.homeOdds.overOdds)}`}>
                  {formatOdds(game.homeOdds.overOdds)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(100 / parseFloat(game.homeOdds.overOdds)).toFixed(1)}% implied
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors cursor-pointer">
                <p className="text-xs font-medium text-muted-foreground mb-1">UNDER</p>
                <p className={`text-2xl font-bold ${getOddsColor(game.homeOdds.underOdds)}`}>
                  {formatOdds(game.homeOdds.underOdds)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(100 / parseFloat(game.homeOdds.underOdds)).toFixed(1)}% implied
                </p>
              </div>
            </div>
          </div>

          {/* Team Totals */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">TEAM TOTALS (ESTIMATED)</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{game.awayTeam}</span>
                  <span className="text-sm text-muted-foreground">Away</span>
                </div>
                <span className="text-lg font-semibold">
                  ~{(parseFloat(game.homeOdds.total) / 2 - Math.abs(parseFloat(game.awayOdds.spread)) / 2).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{game.homeTeam}</span>
                  <span className="text-sm text-muted-foreground">Home</span>
                </div>
                <span className="text-lg font-semibold">
                  ~{(parseFloat(game.homeOdds.total) / 2 + Math.abs(parseFloat(game.homeOdds.spread)) / 2).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Expected Pace</p>
              <p className="text-sm font-semibold">Standard</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Market Movement</p>
              <p className="text-sm font-semibold">Stable</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Historical Average</p>
              <p className="text-sm font-semibold">~230</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Line Movement</p>
              <p className="text-sm font-semibold text-green-600">+2.5</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}