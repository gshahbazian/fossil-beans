import { db } from '@/server/db/index'
import { playerStats, games } from '@/server/db/schema'
import { eq, desc, sql, asc, and } from 'drizzle-orm'

export async function getPSTTimeOfLatestGame() {
  const latestGame = await db.query.games.findFirst({
    extras: {
      pstTime: sql<string>`game_time AT TIME ZONE 'America/Los_Angeles'`.as(
        'pstTime'
      ),
    },
    columns: {},
    orderBy: desc(games.gameTime),
  })

  if (!latestGame) return undefined
  return latestGame.pstTime
}

export async function getPSTTimeOfLatestGameBefore(date: string) {
  const latestGame = await db.query.games.findFirst({
    where: sql`(game_time AT TIME ZONE 'America/Los_Angeles')::date < ${date}`,
    extras: {
      pstTime: sql<string>`game_time AT TIME ZONE 'America/Los_Angeles'`.as(
        'pstTime'
      ),
    },
    columns: {},
    orderBy: desc(games.gameTime),
  })

  if (!latestGame) return undefined
  return latestGame.pstTime
}

export type GameWithTeams = Awaited<
  ReturnType<typeof getAllGamesOnPSTDate>
>[number]

export async function getAllGamesOnPSTDate(date: string) {
  return await db.query.games.findMany({
    where: sql`${date} = (game_time AT TIME ZONE 'America/Los_Angeles')::date`,
    with: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: asc(games.gameTime),
  })
}

export type GamePlayerStat = Awaited<
  ReturnType<typeof getGamePlayerStats>
>[number]

export async function getGamePlayerStats(gameId: string) {
  return await db.query.playerStats.findMany({
    where: and(
      eq(playerStats.gameId, gameId),
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
