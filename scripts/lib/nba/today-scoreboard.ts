type Meta = {
  version: number
  code: number
  request: string
  time: string
}

type PeriodScore = {
  period: number
  periodType: string
  score: number
}

type Team = {
  teamId: number
  teamName: string
  teamCity: string
  teamTricode: string
  score: number
  inBonus: string
  timeoutsRemaining: number
  periods: PeriodScore[]
}

type Game = {
  gameId: string
  gameTimeUTC: string
  gameEt: string
  gameCode: string
  gameStatusText: string
  gameStatus: number
  regulationPeriods: number
  period: number
  gameClock: string
  homeTeam: Team
  awayTeam: Team
}

type Scoreboard = {
  gameDate: string
  games: Game[]
}

export type TodayScoreboard = {
  meta: Meta
  scoreboard: Scoreboard
}

export async function fetchTodayScoreboard() {
  const url =
    process.env.NBA_SCOREBOARD_URL ??
    'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json'

  const res = await fetch(url, {
    headers: { referer: 'https://www.nba.com/' },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch today's scoreboard`)
  }

  return (await res.json()) as TodayScoreboard
}
