import GamesPage from '@/components/games-page'
import {
  getPSTTimeOfLatestGame,
  getAllGamesOnPSTDate,
  getGamePlayerStats,
} from '@/server/db/queries'

// 12 hour ssr cache
export const revalidate = 43200

export async function generateStaticParams() {
  return []
}

export default async function Home() {
  console.time('[Index] Total render time')

  console.time('[Index] getPSTTimeOfLatestGame')
  const pstTimeOfLatestGame = await getPSTTimeOfLatestGame()
  console.timeEnd('[Index] getPSTTimeOfLatestGame')

  console.time('[Index] getAllGamesOnPSTDate')
  const games = pstTimeOfLatestGame
    ? await getAllGamesOnPSTDate(pstTimeOfLatestGame)
    : []
  console.timeEnd('[Index] getAllGamesOnPSTDate')

  console.log(`[Index] Found ${games.length} games for ${pstTimeOfLatestGame}`)

  // Fetch all game stats in parallel
  console.time('[Index] getAllGameStats (parallel)')
  const statsPromises = games.map((game) => getGamePlayerStats(game.gameId))
  const statsArrays = await Promise.all(statsPromises)
  console.timeEnd('[Index] getAllGameStats (parallel)')

  // Create a map of gameId -> stats for easy lookup
  const gameStats = new Map(
    games.map((game, index) => [game.gameId, statsArrays[index]!])
  )

  console.log(`[Index] Fetched stats for ${gameStats.size} games`)

  const result = (
    <GamesPage
      pstDate={pstTimeOfLatestGame}
      games={games}
      gameStats={gameStats}
    />
  )

  console.timeEnd('[Index] Total render time')
  return result
}
