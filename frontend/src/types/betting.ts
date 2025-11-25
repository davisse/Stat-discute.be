export interface TeamOdds {
  spread: string
  spreadOdds: string
  moneyline: string
  total: string
  overOdds: string
  underOdds: string
}

export interface PlayerProp {
  player_name: string
  stat_type: 'Points' | 'Rebounds' | 'Assists' | '3 Point FG' | 'Pts+Rebs+Asts'
  line: number
  over_odds: number
  under_odds: number
}

export interface GameOdds {
  gameId: string
  homeTeam: string
  awayTeam: string
  startTime: string
  homeOdds: TeamOdds
  awayOdds: TeamOdds
  playerProps?: PlayerProp[]
}
