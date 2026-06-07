import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import GamesPage from '@/components/games-page'
import {
  getAllGamesOnPSTDate,
  getGamePlayerStats,
  getPSTDateOfLatestGame,
} from '@/server/db/queries'

const PRODUCTION_CACHE_CONTROL =
  'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'

const loadHomeData = createServerFn().handler(async () => {
  const pstDate = await getPSTDateOfLatestGame()
  if (!pstDate) {
    return { pstDate: undefined, games: [] }
  }

  const games = await getAllGamesOnPSTDate(pstDate)
  const gamesWithStats = await Promise.all(
    games.map(async (game) => ({
      ...game,
      stats: await getGamePlayerStats(game.gameId),
    }))
  )

  return { pstDate, games: gamesWithStats }
})

export const Route = createFileRoute('/')({
  loader: () => loadHomeData(),
  component: HomePage,
  headers: () => ({
    'Cache-Control': getCacheControlHeader(),
  }),
})

function HomePage() {
  const { pstDate, games } = Route.useLoaderData()
  return <GamesPage pstDate={pstDate} games={games} />
}

function getCacheControlHeader() {
  if (!import.meta.env.PROD) return 'no-store'

  return PRODUCTION_CACHE_CONTROL
}
