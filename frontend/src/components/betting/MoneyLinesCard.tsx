'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

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

interface MoneyLinesCardProps {
  game: GameOdds | null
}

export default function MoneyLinesCard({ game }: MoneyLinesCardProps) {
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

  const getSpreadColor = (spread: string) => {
    if (spread.startsWith('+')) return 'text-green-600 dark:text-green-400'
    if (spread.startsWith('-')) return 'text-red-600 dark:text-red-400'
    return 'text-gray-700 dark:text-gray-300'
  }

  if (!game) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            MoneyLines
          </CardTitle>
          <CardDescription>
            Straight-up winner odds
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a game to view moneyline odds
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          MoneyLines
        </CardTitle>
        <CardDescription>
          Straight-up winner odds
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Away Team Moneyline */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors">
            <div className="space-y-1">
              <p className="font-semibold text-lg">{game.awayTeam}</p>
              <p className="text-sm text-muted-foreground">Away Team</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getOddsColor(game.awayOdds.moneyline)}`}>
                {formatOdds(game.awayOdds.moneyline)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {(100 / parseFloat(game.awayOdds.moneyline)).toFixed(1)}% implied
              </p>
            </div>
          </div>

          {/* Home Team Moneyline */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors">
            <div className="space-y-1">
              <p className="font-semibold text-lg">{game.homeTeam}</p>
              <p className="text-sm text-muted-foreground">Home Team</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getOddsColor(game.homeOdds.moneyline)}`}>
                {formatOdds(game.homeOdds.moneyline)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {(100 / parseFloat(game.homeOdds.moneyline)).toFixed(1)}% implied
              </p>
            </div>
          </div>

          {/* Spread Info */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">POINT SPREAD</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{game.awayTeam.split(' ').pop()}</span>
                  <span className={`font-bold text-lg ${getSpreadColor(game.awayOdds.spread)}`}>
                    {game.awayOdds.spread}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-mono ${getOddsColor(game.awayOdds.spreadOdds)}`}>
                    {formatOdds(game.awayOdds.spreadOdds)}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{game.homeTeam.split(' ').pop()}</span>
                  <span className={`font-bold text-lg ${getSpreadColor(game.homeOdds.spread)}`}>
                    {game.homeOdds.spread}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-mono ${getOddsColor(game.homeOdds.spreadOdds)}`}>
                    {formatOdds(game.homeOdds.spreadOdds)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}