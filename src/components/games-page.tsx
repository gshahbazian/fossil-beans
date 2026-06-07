import GameStats from '@/components/game-stats'
import { type GamePlayerStat, type GameWithTeams } from '@/server/db/queries'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'America/Los_Angeles',
})

export default function GamesPage({
  pstDate,
  games,
}: {
  pstDate?: string
  games: Array<GameWithTeams & { stats: GamePlayerStat[] }>
}) {
  const gamesWithStats = games.filter((game) => game.stats.length > 0)

  return (
    <main className="grid w-screen grid-cols-[1fr_min(56rem,100%-1rem)_1fr] gap-x-2 gap-y-8 py-8">
      <h2 className="col-2 text-3xl font-semibold">
        NBA Lines{' '}
        {pstDate && (
          <span className="font-normal text-neutral-400">
            {dateFormatter.format(new Date(`${pstDate}T12:00:00Z`))}
          </span>
        )}
      </h2>

      {gamesWithStats.map((game) => (
        <GameStats key={game.gameId} game={game} stats={game.stats} />
      ))}
    </main>
  )
}
