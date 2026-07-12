import { useCallback, useEffect, useRef, useState } from 'react'
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
  const headerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0]) return
        const intersectionRatio = entries[0].intersectionRatio

        entries[0].target.toggleAttribute(
          'data-stuck',
          intersectionRatio < 1 && intersectionRatio > 0
        )
      },
      { threshold: [1] }
    )
    intersectionObserver.observe(header)

    return () => {
      intersectionObserver.disconnect()
    }
  }, [])

  return (
    <div className="relative col-span-full grid grid-cols-subgrid gap-y-8">
      <hr className="col-2" />

      <div
        ref={headerRef}
        className="bg-background border-background sticky -top-0.5 z-2 col-span-full grid grid-cols-subgrid data-stuck:border-b data-stuck:shadow-sm sm:relative sm:top-auto sm:z-auto data-stuck:sm:border-none data-stuck:sm:shadow-none dark:border-neutral-900"
      >
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
