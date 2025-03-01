import GamesPage from '@/components/games-page'
import {
  getPSTTimeOfLatestGame,
  getAllGamesOnPSTDate,
} from '@/server/db/queries'

// 12 hour ssr cache
export const revalidate = 43200
export const dynamic = 'force-static'

export default async function Home() {
  const pstTimeOfLatestGame = await getPSTTimeOfLatestGame()
  const games = pstTimeOfLatestGame
    ? await getAllGamesOnPSTDate(pstTimeOfLatestGame)
    : []

  return <GamesPage pstDate={pstTimeOfLatestGame} games={games} />
}
