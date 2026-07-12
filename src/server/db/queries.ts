import { getDb } from '@/server/db/index'
import { games, playerStats } from '@/server/db/schema'
import { type HomeGame } from '@/lib/home-data'
import { eq, desc, asc, gt } from 'drizzle-orm'

export async function getPSTDateOfLatestGame() {
  const db = getDb()
  const latestGame = await db.query.games.findFirst({
    columns: { pstDate: true },
    orderBy: desc(games.gameTime),
  })

  return latestGame?.pstDate
}

export async function getHomeGamesOnPSTDate(date: string): Promise<HomeGame[]> {
  const db = getDb()
  return await db.query.games.findMany({
    where: eq(games.pstDate, date),
    columns: {
      gameId: true,
      gameTime: true,
      homeScore: true,
      awayScore: true,
      gameStatus: true,
    },
    with: {
      homeTeam: {
        columns: {
          teamId: true,
          teamName: true,
          abbreviation: true,
        },
      },
      awayTeam: {
        columns: {
          teamId: true,
          teamName: true,
          abbreviation: true,
        },
      },
      stats: {
        where: gt(playerStats.minutesSeconds, 0),
        columns: {
          gameId: true,
          playerId: true,
          teamId: true,
          minutesSeconds: true,
          points: true,
          rebounds: true,
          assists: true,
          steals: true,
          blocks: true,
          fieldGoalsMade: true,
          fieldGoalsAttempted: true,
          threePointersMade: true,
          threePointersAttempted: true,
          freeThrowsMade: true,
          freeThrowsAttempted: true,
          turnovers: true,
        },
        with: {
          player: {
            columns: {
              playerId: true,
              playerName: true,
              jerseyNum: true,
            },
          },
        },
        orderBy: [
          desc(playerStats.espnPoints),
          desc(playerStats.minutesSeconds),
          playerStats.playerId,
        ],
      },
    },
    orderBy: asc(games.gameTime),
  })
}
