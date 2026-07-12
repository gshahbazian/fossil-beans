import { getDb } from '@/server/db/index'
import { games, playerStats } from '@/server/db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'

export async function getPSTDateOfLatestGame() {
  const db = getDb()
  const latestGame = await db.query.games.findFirst({
    columns: { pstDate: true },
    orderBy: desc(games.gameTime),
  })

  return latestGame?.pstDate
}

export type GameWithTeams = Awaited<
  ReturnType<typeof getAllGamesOnPSTDate>
>[number]

export async function getAllGamesOnPSTDate(date: string) {
  const db = getDb()
  return await db.query.games.findMany({
    where: eq(games.pstDate, date),
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
  const db = getDb()
  return await db.query.playerStats.findMany({
    where: sql`${playerStats.gameId} = ${gameId} AND ${playerStats.minutesSeconds} > 0`,
    with: {
      player: true,
    },
    orderBy: [
      desc(playerStats.espnPoints),
      desc(playerStats.minutesSeconds),
      playerStats.playerId,
    ],
  })
}
