import { useCallback, useState } from 'react'
import PlayerDialog from '@/components/player-dialog'
import { type HomeGame, type HomePlayerStat } from '@/lib/home-data'
import StatsTable from '@/components/stats-table'
import { usePostHog } from 'posthog-js/react'

export default function GameStats({
  game,
  stats,
}: {
  game: HomeGame
  stats: HomePlayerStat[]
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<HomePlayerStat | null>(
    null
  )

  const posthog = usePostHog()

  const onPlayerClicked = useCallback(
    (player: HomePlayerStat) => {
      setSelectedPlayer(player)

      posthog?.capture('player_clicked', {
        player_name: player.player.playerName,
        game_id: player.gameId,
      })
    },
    [posthog]
  )

  return (
    <div className="relative col-span-full grid grid-cols-subgrid gap-y-8">
      <hr className="col-2" />

      <div className="bg-background [container-type:scroll-state] sticky top-0 z-2 col-span-full grid grid-cols-subgrid sm:relative sm:top-auto sm:z-auto">
        <div className="border-background col-span-full grid grid-cols-subgrid dark:border-neutral-900 [@container_scroll-state(stuck:_top)]:border-b [@container_scroll-state(stuck:_top)]:shadow-sm">
          <div className="col-2 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">
              {game.awayTeam.abbreviation}{' '}
              <span className="font-mono font-normal">
                {game.awayScore}-{game.homeScore}
              </span>{' '}
              {game.homeTeam.abbreviation}
            </h2>

            <span className="font-mono text-sm font-medium">
              {game.gameStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="col-2">
        <StatsTable stats={stats} onPlayerClicked={onPlayerClicked} />
      </div>

      {selectedPlayer && (
        <PlayerDialog
          onClose={() => setSelectedPlayer(null)}
          playerStat={selectedPlayer}
          game={game}
        />
      )}
    </div>
  )
}
