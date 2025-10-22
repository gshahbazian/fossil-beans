import GameStats from '@/components/game-stats'
import {
  type GameWithTeams,
  type GamePlayerStat,
} from '@/server/db/queries'

const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

export default function GamesPage({
  pstDate,
  games,
  gameStats,
}: {
  pstDate?: string
  games: GameWithTeams[]
  gameStats: Map<string, GamePlayerStat[]>
}) {
  return (
    <main className="grid w-screen grid-cols-[1fr_min(56rem,100%-1rem)_1fr] gap-x-2 gap-y-8 py-8">
      <h2 className="col-2 text-3xl font-semibold">
        NBA Lines{' '}
        {pstDate && (
          <span className="font-normal text-neutral-400">
            {formatter.format(new Date(pstDate))}
          </span>
        )}
      </h2>

      {games.map((game) => (
        <GameEntry
          key={game.gameId}
          game={game}
          stats={gameStats.get(game.gameId) ?? []}
        />
      ))}
    </main>
  )
}

function GameEntry({
  game,
  stats,
}: {
  game: GameWithTeams
  stats: GamePlayerStat[]
}) {
  // GABE: add a nice 'starting soon' here
  if (stats.length === 0) return null

  return <GameStats game={game} stats={stats} />
}
