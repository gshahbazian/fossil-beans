import { db } from '@/server/db/index'
import {
  playerStats,
  players,
  teams,
  games,
  type Team,
  type Game,
} from '@/server/db/schema'
import { eq, desc } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

export type GameWithTeams = {
  game: Game
  homeTeam: Team
  awayTeam: Team
}

export async function getAllTodayGames(): Promise<GameWithTeams[]> {
  const homeTeamAlias = alias(teams, 'homeTeam')
  const awayTeamAlias = alias(teams, 'awayTeam')

  return await db
    .select({
      game: games,
      homeTeam: homeTeamAlias,
      awayTeam: awayTeamAlias,
    })
    .from(games)
    .innerJoin(homeTeamAlias, eq(games.homeTeamId, homeTeamAlias.teamId))
    .innerJoin(awayTeamAlias, eq(games.awayTeamId, awayTeamAlias.teamId))
    // .where(eq(games.gameDate, sql`CURRENT_DATE`))
    .orderBy(desc(games.gameDate))
}

export type GamePlayerStat = {
  teamName: string
  playerId: number
  playerName: string
  minutesPlayed: string | null
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
  fouls: number | null
  plusMinus: number | null
}

export async function getGamePlayerStats(
  gameId: number
): Promise<GamePlayerStat[]> {
  return await db
    .select({
      teamName: teams.teamName,
      playerId: players.playerId,
      playerName: players.playerName,
      minutesPlayed: playerStats.minutesPlayed,
      points: playerStats.points,
      rebounds: playerStats.rebounds,
      assists: playerStats.assists,
      steals: playerStats.steals,
      blocks: playerStats.blocks,
      fieldGoalsMade: playerStats.fieldGoalsMade,
      fieldGoalsAttempted: playerStats.fieldGoalsAttempted,
      threePointersMade: playerStats.threePointersMade,
      threePointersAttempted: playerStats.threePointersAttempted,
      freeThrowsMade: playerStats.freeThrowsMade,
      freeThrowsAttempted: playerStats.freeThrowsAttempted,
      turnovers: playerStats.turnovers,
      fouls: playerStats.fouls,
      plusMinus: playerStats.plusMinus,
    })
    .from(playerStats)
    .innerJoin(players, eq(playerStats.playerId, players.playerId))
    .innerJoin(teams, eq(playerStats.teamId, teams.teamId))
    .innerJoin(games, eq(playerStats.gameId, games.gameId))
    .where(eq(games.gameId, gameId))
    .orderBy(desc(playerStats.minutesPlayed), desc(players.playerName))
}
