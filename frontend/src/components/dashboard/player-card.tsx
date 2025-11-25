import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

interface PlayerCardProps {
  title: string
  player: {
    full_name: string
    team_abbreviation: string
    value: number
    games_played: number
  }
}

export function PlayerCard({ title, player }: PlayerCardProps) {
  return (
    <Card className="border-2 hover:border-primary transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-2xl font-bold">{player.full_name}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{player.team_abbreviation}</span>
            <span className="font-semibold text-primary">{player.value.toFixed(1)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{player.games_played} games played</p>
        </div>
      </CardContent>
    </Card>
  )
}
