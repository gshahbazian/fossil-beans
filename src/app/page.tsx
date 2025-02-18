import GameStats from '@/components/game-stats'
import {
  getPSTTimeOfLatestGame,
  getAllGamesOnPSTDate,
  getGamePlayerStats,
  type GameWithTeams,
} from '@/server/db/queries'

// 12 hour ssr cache
export const revalidate = 43200
export const dynamicParams = false

const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

export default async function Home() {
  const pstTimeOfLatestGame = await getPSTTimeOfLatestGame()
  const games = pstTimeOfLatestGame
    ? await getAllGamesOnPSTDate(pstTimeOfLatestGame)
    : []

  return (
    <div className="mx-auto flex w-screen max-w-4xl flex-col gap-8 py-8">
      <main className="relative flex flex-col gap-8 px-4">
        <h2 className="text-3xl font-semibold">
          NBA Lines{' '}
          {pstTimeOfLatestGame && (
            <span className="font-normal text-neutral-400">
              {formatter.format(new Date(pstTimeOfLatestGame))}
            </span>
          )}
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
