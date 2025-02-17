import GameStats from '@/components/game-stats'
import {
  getGamePlayerStats,
  getGamesOnDate,
  type GameWithTeams,
} from '@/server/db/queries'

// 12 hour ssr cache
export const revalidate = 43200
export const dynamicParams = false

export default async function Home() {
  // GABE: in the future we should get the day of the latest
  // game from the db as the source of current day truth
  const games = await getGamesOnDate('2025-02-13')

  return (
    <div className="mx-auto flex w-screen max-w-4xl flex-col gap-8 py-8">
      <main className="relative flex flex-col gap-8 px-4">
        <h2 className="text-3xl font-semibold">
          NBA Lines <span className="font-normal text-neutral-400">Feb 13</span>
        </h2>

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
