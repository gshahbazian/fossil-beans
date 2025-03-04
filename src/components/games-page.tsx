import GameStats from '@/components/game-stats'
import { getGamePlayerStats, type GameWithTeams } from '@/server/db/queries'

const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

export default async function GamesPage({
  pstDate,
  games,
}: {
  pstDate?: string
  games: GameWithTeams[]
}) {
  return (
    <main className="grid w-screen grid-cols-[1fr_min(56rem,100%_-_1rem)_1fr] gap-x-2 gap-y-8 py-8">
      <h2 className="col-[2] text-3xl font-semibold">
        NBA Lines{' '}
        {pstDate && (
          <span className="font-normal text-neutral-400">
            {formatter.format(new Date(pstDate))}
          </span>
        )}
      </h2>

      {games.map((game) => (
        <GameEntry key={game.gameId} game={game} />
      ))}
    </main>
  )
}

async function GameEntry({ game }: { game: GameWithTeams }) {
  const stats = await getGamePlayerStats(game.gameId)

  // GABE: add a nice 'starting soon' here
  if (stats.length === 0) return null

  return <GameStats game={game} stats={stats} />
}
