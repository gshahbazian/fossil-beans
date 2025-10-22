import {
  getAllGamesOnPSTDate,
  getPSTTimeOfLatestGame,
  getPSTTimeOfLatestGameBefore,
  getGamePlayerStats,
} from '@/server/db/queries'
import GamesPage from '@/components/games-page'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

// 24 hour ssr cache
export const revalidate = 86400

export async function generateStaticParams() {
  return []
}

export const metadata: Metadata = {
  title: 'Yesterday on Fossil Beans',
}

export default async function YesterdayPage() {
  const pstTimeOfLatestGame = await getPSTTimeOfLatestGame()
  if (!pstTimeOfLatestGame) notFound()

  const pstTimeOfLatestGameBefore =
    await getPSTTimeOfLatestGameBefore(pstTimeOfLatestGame)

  const games = pstTimeOfLatestGameBefore
    ? await getAllGamesOnPSTDate(pstTimeOfLatestGameBefore)
    : []

  // Fetch all game stats in parallel
  const statsPromises = games.map((game) => getGamePlayerStats(game.gameId))
  const statsArrays = await Promise.all(statsPromises)

  // Create a map of gameId -> stats for easy lookup
  const gameStats = new Map(
    games.map((game, index) => [game.gameId, statsArrays[index]!])
  )

  return (
    <GamesPage
      pstDate={pstTimeOfLatestGameBefore}
      games={games}
      gameStats={gameStats}
    />
  )
}
