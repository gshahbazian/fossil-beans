'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import PlayerDialog from '@/components/player-dialog'
import { type GamePlayerStat, type GameWithTeams } from '@/server/db/queries'
import StatsTable from '@/components/stats-table'

export default function GameStats({
  game,
  stats,
}: {
  game: GameWithTeams
  stats: GamePlayerStat[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayerStat | null>(
    null
  )
  const onPlayerClicked = useCallback((player: GamePlayerStat) => {
    setSelectedPlayer(player)
    setIsOpen(true)
  }, [])

  const headerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!headerRef.current) return

    // GABE: this isnt working correctly if the page starts scrolled to the bottom and you scroll up
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
    intersectionObserver.observe(headerRef.current)

    return () => {
      intersectionObserver.disconnect()
    }
  }, [headerRef])

  return (
    <div className="relative col-span-full grid grid-cols-subgrid gap-y-8">
      <hr className="col-[2]" />

      <div
        ref={headerRef}
        className="bg-background border-background sticky -top-0.5 z-2 col-span-full grid grid-cols-subgrid data-stuck:border-b data-stuck:shadow-sm sm:relative sm:top-auto sm:z-auto data-stuck:sm:border-none data-stuck:sm:shadow-none dark:border-neutral-900"
      >
        <div className="col-[2] flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">
            {game.awayTeam.abbreviation}{' '}
            <span className="font-mono font-normal">
              {game.game.awayScore}-{game.game.homeScore}
            </span>{' '}
            {game.homeTeam.abbreviation}
          </h2>

          <span className="font-mono text-sm font-medium">
            {game.game.gameStatus}
          </span>
        </div>
      </div>

      <div className="col-[2]">
        <StatsTable stats={stats} onPlayerClicked={onPlayerClicked} />
      </div>

      {selectedPlayer && (
        <PlayerDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          playerStat={selectedPlayer}
          gameWithTeams={game}
        />
      )}
    </div>
  )
}
