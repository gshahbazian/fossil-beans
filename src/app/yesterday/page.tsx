import {
  getAllGamesOnPSTDate,
  getPSTTimeOfLatestGame,
  getPSTTimeOfLatestGameBefore,
} from '@/server/db/queries'
import GamesPage from '@/components/games-page'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { cacheLife, cacheTag } from 'next/cache'

export const metadata: Metadata = {
  title: 'Yesterday on Fossil Beans',
}

export default async function YesterdayPage() {
  'use cache'
  cacheLife('days')
  cacheTag('/yesterday')

  const pstTimeOfLatestGame = await getPSTTimeOfLatestGame()
  if (!pstTimeOfLatestGame) notFound()

  const pstTimeOfLatestGameBefore =
    await getPSTTimeOfLatestGameBefore(pstTimeOfLatestGame)

  const games = pstTimeOfLatestGameBefore
    ? await getAllGamesOnPSTDate(pstTimeOfLatestGameBefore)
    : []

  return <GamesPage pstDate={pstTimeOfLatestGameBefore} games={games} />
}
