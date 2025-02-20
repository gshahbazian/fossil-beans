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
    <main className="grid w-screen grid-cols-[1fr_min(56rem,calc(100%_-_1rem))_1fr] gap-x-2 gap-y-8 py-8">
      <h2 className="col-[2] text-3xl font-semibold">
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
  )
}

async function GameEntry({ game }: { game: GameWithTeams }) {
  const stats = await getGamePlayerStats(game.game.gameId)

  return <GameStats game={game} stats={stats} />
}
