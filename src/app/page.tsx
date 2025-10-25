import GamesPage from '@/components/games-page'
import {
  getPSTTimeOfLatestGame,
  getAllGamesOnPSTDate,
} from '@/server/db/queries'
import { cacheLife, cacheTag } from 'next/cache'

export default async function Home() {
  'use cache'
  cacheLife('days')
  cacheTag('/')

  const pstTimeOfLatestGame = await getPSTTimeOfLatestGame()
  const games = pstTimeOfLatestGame
    ? await getAllGamesOnPSTDate(pstTimeOfLatestGame)
    : []

  return <GamesPage pstDate={pstTimeOfLatestGame} games={games} />
}
