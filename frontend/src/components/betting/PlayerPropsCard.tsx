'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, BarChart, User } from 'lucide-react'

interface PlayerProp {
  playerId: string
  playerName: string
  market: string
  line: number
  overOdds: string
  underOdds: string
}

interface PlayerPropsCardProps {
  playerProps: PlayerProp[] | null | undefined
}

export default function PlayerPropsCard({ playerProps }: PlayerPropsCardProps) {
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

  const getMarketIcon = (market: string) => {
    if (market.toLowerCase().includes('point')) return '🏀'
    if (market.toLowerCase().includes('rebound')) return '📊'
    if (market.toLowerCase().includes('assist')) return '🎯'
    if (market.toLowerCase().includes('3 point')) return '🎪'
    if (market.toLowerCase().includes('steal')) return '🥷'
    if (market.toLowerCase().includes('block')) return '🛡️'
    return '📈'
  }

  if (!playerProps || playerProps.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            Player Props
          </CardTitle>
          <CardDescription>
            Individual player performances
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center">
            <BarChart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {!playerProps ? 'Select a game to view player props' : 'No player props available for this game'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group props by player
  const propsByPlayer = playerProps.reduce((acc, prop) => {
    if (!acc[prop.playerName]) {
      acc[prop.playerName] = []
    }
    acc[prop.playerName].push(prop)
    return acc
  }, {} as Record<string, PlayerProp[]>)

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-600" />
          Player Props
        </CardTitle>
        <CardDescription>
          Individual player performances • {Object.keys(propsByPlayer).length} players available
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {Object.entries(propsByPlayer).slice(0, 8).map(([playerName, props]) => (
            <div key={playerName} className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-sm">{playerName}</h4>
                <span className="text-xs text-muted-foreground">({props.length} props)</span>
              </div>
              <div className="space-y-2">
                {props.slice(0, 3).map((prop, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-background rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{getMarketIcon(prop.market)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{prop.market}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center px-3 py-1 bg-primary/10 rounded">
                        <p className="text-lg font-bold">{prop.line}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-0.5">O</p>
                          <p className={`font-mono font-medium ${getOddsColor(prop.overOdds)}`}>
                            {formatOdds(prop.overOdds)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground mb-0.5">U</p>
                          <p className={`font-mono font-medium ${getOddsColor(prop.underOdds)}`}>
                            {formatOdds(prop.underOdds)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {props.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{props.length - 3} more props
                  </p>
                )}
              </div>
            </div>
          ))}
          {Object.keys(propsByPlayer).length > 8 && (
            <div className="text-center py-3 border-t">
              <p className="text-sm text-muted-foreground">
                +{Object.keys(propsByPlayer).length - 8} more players with props available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}