import GamesPage from '@/components/games-page'
import {
  getPSTTimeOfLatestGame,
  getAllGamesOnPSTDate,
} from '@/server/db/queries'

// 12 hour ssr cache
export const revalidate = 43200
export const dynamic = 'force-dynamic' // TEMP: Testing if ISR is causing 20s delay

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

  const result = <GamesPage pstDate={pstTimeOfLatestGame} games={games} />

  console.timeEnd('[Index] Total render time')
  return result
}
