import GameStats from '@/components/game-stats'
import {
  getAllTodayGames,
  getGamePlayerStats,
  type GameWithTeams,
} from '@/server/db/queries'

export default async function Home() {
  const games = await getAllTodayGames()

  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center gap-8 p-4 pb-8">
      <main className="row-start-2 flex flex-col gap-8">
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
