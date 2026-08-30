import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import GamesPage from '@/components/games-page'
import {
  getHomeGamesOnPSTDate,
  getPSTDateOfLatestGame,
} from '@/server/db/queries'
import { PRODUCTION_CACHE_HEADERS } from '@/lib/cache-control'
import { env } from '@/lib/env'

const loadHomeData = createServerFn().handler(async () => {
  const pstDate = await getPSTDateOfLatestGame()
  if (!pstDate) {
    return { pstDate: undefined, games: [] }
  }

  const games = await getHomeGamesOnPSTDate(pstDate)

  return {
    pstDate,
    games: games.filter((game) => game.stats.length > 0),
  }
})

export const Route = createFileRoute('/')({
  loader: () => loadHomeData(),
  component: HomePage,
  headers: () => getCacheHeaders(),
})

function HomePage() {
  const { pstDate, games } = Route.useLoaderData()
  return <GamesPage pstDate={pstDate} games={games} />
}

function getCacheHeaders() {
  if (!env.PROD) {
    return { 'Cache-Control': 'no-store' }
  }

  return PRODUCTION_CACHE_HEADERS
}
