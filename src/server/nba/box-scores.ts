type Meta = {
  version: number
  code: number
  request: string
  time: string
}

type Arena = {
  arenaId: number
  arenaName: string
  arenaCity: string
  arenaState: string
  arenaCountry: string
  arenaTimezone: string
}

type Official = {
  personId: number
  name: string
  nameI: string
  firstName: string
  familyName: string
  jerseyNum: string
  assignment: string
}

type PeriodScore = {
  period: number
  periodType: string
  score: number
}

type Statistics = {
  assists: number
  blocks: number
  blocksReceived: number
  fieldGoalsAttempted: number
  fieldGoalsMade: number
  fieldGoalsPercentage: number
  foulsOffensive: number
  foulsDrawn: number
  foulsPersonal: number
  foulsTechnical: number
  freeThrowsAttempted: number
  freeThrowsMade: number
  freeThrowsPercentage: number
  minus: number
  minutes: string
  minutesCalculated: string
  plus: number
  plusMinusPoints: number
  points: number
  pointsFastBreak: number
  pointsInThePaint: number
  pointsSecondChance: number
  reboundsDefensive: number
  reboundsOffensive: number
  reboundsTotal: number
  steals: number
  threePointersAttempted: number
  threePointersMade: number
  threePointersPercentage: number
  turnovers: number
  twoPointersAttempted: number
  twoPointersMade: number
  twoPointersPercentage: number
}

type Player = {
  status: string
  order: number
  personId: number
  jerseyNum: string
  position?: string
  starter: string
  oncourt: string
  played: string
  statistics: Statistics
  name: string
  nameI: string
  firstName: string
  familyName: string
  notPlayingReason?: string
  notPlayingDescription?: string
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
  players: Player[]
  statistics: TeamStatistics
}

type TeamStatistics = {
  assists: number
  assistsTurnoverRatio: number
  benchPoints: number
  biggestLead: number
  biggestLeadScore: string
  biggestScoringRun: number
  biggestScoringRunScore: string
  blocks: number
  blocksReceived: number
  fastBreakPointsAttempted: number
  fastBreakPointsMade: number
  fastBreakPointsPercentage: number
  fieldGoalsAttempted: number
  fieldGoalsEffectiveAdjusted: number
  fieldGoalsMade: number
  fieldGoalsPercentage: number
  foulsOffensive: number
  foulsDrawn: number
  foulsPersonal: number
  foulsTeam: number
  foulsTechnical: number
  foulsTeamTechnical: number
  freeThrowsAttempted: number
  freeThrowsMade: number
  freeThrowsPercentage: number
  leadChanges: number
  minutes: string
  minutesCalculated: string
  points: number
  pointsAgainst: number
  pointsFastBreak: number
  pointsFromTurnovers: number
  pointsInThePaint: number
  pointsInThePaintAttempted: number
  pointsInThePaintMade: number
  pointsInThePaintPercentage: number
  pointsSecondChance: number
  reboundsDefensive: number
  reboundsOffensive: number
  reboundsPersonal: number
  reboundsTeam: number
  reboundsTeamDefensive: number
  reboundsTeamOffensive: number
  reboundsTotal: number
  secondChancePointsAttempted: number
  secondChancePointsMade: number
  secondChancePointsPercentage: number
  steals: number
  threePointersAttempted: number
  threePointersMade: number
  threePointersPercentage: number
  timeLeading: string
  timesTied: number
  trueShootingAttempts: number
  trueShootingPercentage: number
  turnovers: number
  turnoversTeam: number
  turnoversTotal: number
  twoPointersAttempted: number
  twoPointersMade: number
  twoPointersPercentage: number
}

type Game = {
  gameId: string
  gameTimeLocal: string
  gameTimeUTC: string
  gameTimeHome: string
  gameTimeAway: string
  gameEt: string
  duration: number
  gameCode: string
  gameStatusText: string
  gameStatus: number
  regulationPeriods: number
  period: number
  gameClock: string
  attendance: number
  sellout: string
  arena: Arena
  officials: Official[]
  homeTeam: Team
  awayTeam: Team
}

export type BoxScore = {
  meta: Meta
  game: Game
}

export class ForbiddenError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export async function fetchBoxScore(gameId: string) {
  const res = await fetch(
    `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${gameId}.json`,
    {
      referrer: 'https://www.nba.com/',
    }
  )

  if (!res.ok) {
    if (res.status === 403) {
      // NBA API returns 403 when the game is not yet started
      throw new ForbiddenError(`Forbidden: ${gameId}`)
    }

    throw new Error(`Failed to fetch box score for game ${gameId}`)
  }

  const data = await res.json()
  return data as BoxScore
}
