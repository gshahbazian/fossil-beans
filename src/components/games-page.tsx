import GameStats from '@/components/game-stats'
import { type HomeGame } from '@/lib/home-data'
import { formatPstShortDate } from '@/lib/format-date'

export default function GamesPage({
  pstDate,
  games,
}: {
  pstDate?: string
  games: HomeGame[]
}) {
  return (
    <main className="grid w-screen grid-cols-[1fr_min(56rem,100%-1rem)_1fr] gap-x-2 gap-y-8 py-8">
      <h2 className="col-2 text-3xl font-semibold">
        NBA Lines{' '}
        {pstDate && (
          <span className="font-normal text-neutral-400">
            {formatPstShortDate(new Date(`${pstDate}T12:00:00Z`))}
          </span>
        )}
      </h2>

      {games.map((game) => (
        <GameStats key={game.gameId} game={game} stats={game.stats} />
      ))}
    </main>
  )
}
