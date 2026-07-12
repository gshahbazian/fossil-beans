export type HomeTeam = {
  teamId: number
  teamName: string
  abbreviation: string
}

export type HomePlayer = {
  playerId: number
  playerName: string
  jerseyNum: string | null
}

export type HomePlayerStat = {
  gameId: string
  playerId: number
  teamId: number
  minutesSeconds: number | null
  points: number | null
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  fieldGoalsMade: number | null
  fieldGoalsAttempted: number | null
  threePointersMade: number | null
  threePointersAttempted: number | null
  freeThrowsMade: number | null
  freeThrowsAttempted: number | null
  turnovers: number | null
  player: HomePlayer
}

export type HomeGame = {
  gameId: string
  gameTime: Date
  homeScore: number
  awayScore: number
  gameStatus: string | null
  homeTeam: HomeTeam
  awayTeam: HomeTeam
  stats: HomePlayerStat[]
}
