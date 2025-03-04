import { db } from '@/server/db/index'
import {
  playerStats,
  teams,
  games,
  type Team,
  type Game,
  Player,
  PlayerStats,
} from '@/server/db/schema'
import { eq, desc, sql, asc, and } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

export async function getPSTTimeOfLatestGame() {
  const latestGame = await db
    .select({
      pstTime: sql<string>`game_time AT TIME ZONE 'America/Los_Angeles'`,
    })
    .from(games)
    .orderBy(desc(games.gameTime))
    .limit(1)

  if (!latestGame[0]) return undefined
  return latestGame[0].pstTime
}

export async function getPSTTimeOfLatestGameBefore(date: string) {
  const latestGame = await db
    .select({
      pstTime: sql<string>`game_time AT TIME ZONE 'America/Los_Angeles'`,
    })
    .from(games)
    .where(sql`(game_time AT TIME ZONE 'America/Los_Angeles')::date < ${date}`)
    .orderBy(desc(games.gameTime))
    .limit(1)

  if (!latestGame[0]) return undefined
  return latestGame[0].pstTime
}

export type GameWithTeams = {
  game: Game
  homeTeam: Team
  awayTeam: Team
}

export async function getAllGamesOnPSTDate(
  date: string
): Promise<GameWithTeams[]> {
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
    .where(sql`${date} = (game_time AT TIME ZONE 'America/Los_Angeles')::date`)
    .orderBy(asc(games.gameTime))
}

export type GamePlayerStat = PlayerStats & {
  player: Player
}

export async function getGamePlayerStats(
  gameId: string
): Promise<GamePlayerStat[]> {
  return await db.query.playerStats.findMany({
    where: and(
      eq(games.gameId, gameId),
      sql`EXTRACT(epoch FROM minutes_played) > 0`
    ),
    with: {
      player: true,
    },
    orderBy: [
      desc(playerStats.espnPoints),
      desc(playerStats.minutesPlayed),
      playerStats.playerId,
    ],
  })
}
