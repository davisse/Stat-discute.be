import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TeamCardProps {
  team: {
    full_name: string
    abbreviation: string
    wins: number
    losses: number
    win_pct: number
    points_avg: number
    points_allowed_avg: number
  }
}

export function TeamCard({ team }: TeamCardProps) {
  const isWinning = Number(team.win_pct) > 0.5
  const pointsAvg = typeof team.points_avg === 'string' ? team.points_avg : team.points_avg.toFixed(1)
  const pointsAllowedAvg = typeof team.points_allowed_avg === 'string' ? team.points_allowed_avg : team.points_allowed_avg.toFixed(1)
  const winPct = (Number(team.win_pct) * 100).toFixed(1)

  return (
    <Card className={cn('transition-all hover:shadow-lg', isWinning ? 'border-green-200' : 'border-red-200')}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{team.full_name}</span>
          <span className="text-sm font-mono text-muted-foreground">{team.abbreviation}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Record</p>
            <p className={cn('text-xl font-bold', isWinning ? 'text-green-600' : 'text-red-600')}>
              {team.wins}-{team.losses}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {winPct}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Points/Game</p>
            <p className="text-xl font-bold">{pointsAvg}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Allowed: {pointsAllowedAvg}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
