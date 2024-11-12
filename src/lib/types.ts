export type BoxScore = {
  id: string
  name: string
  team: string
  mins: number
  pts: number
  threePt: number
  reb: number
  ast: number
  stl: number
  blk: number
  fgPct: number
  fgAttempts: number
  ftPct: number
  ftAttempts: number
  to: number
}

export type Game = {
  homeTeam: string
  homeScore: BoxScore[]

  visitorTeam: string
  visitorScore: BoxScore[]
}

export type OnPlayerClicked = (player: BoxScore) => void
