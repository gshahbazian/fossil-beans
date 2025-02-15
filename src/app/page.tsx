import GameStats from '@/components/game-stats'
import {
  getAllTodayGames,
  getGamePlayerStats,
  type GameWithTeams,
} from '@/server/db/queries'

// 12 hour ssr cache
export const revalidate = 43200
export const dynamicParams = false

export default async function Home() {
  const games = await getAllTodayGames()

  return (
    <div className="mx-auto flex w-screen max-w-4xl flex-col gap-8 py-8">
      <main className="flex flex-col gap-8 px-4">
        <h2 className="text-3xl font-semibold">Todays Games</h2>

        {games.map((game) => (
          <GameEntry key={game.game.gameId} game={game} />
        ))}
      </main>
    </div>
  )
}

async function GameEntry({ game }: { game: GameWithTeams }) {
  const stats = await getGamePlayerStats(game.game.gameId)

  return <GameStats game={game} stats={stats} />
}
