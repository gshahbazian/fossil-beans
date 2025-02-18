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
    <>
      <div className="flex flex-col gap-8">
        <hr />

        <div
          ref={headerRef}
          className="bg-background group sticky -top-0.5 z-2 sm:relative sm:top-auto sm:z-auto"
        >
          {/* Hacks to get the shadow to be wider than the div, but not x-scroll the page */}
          <div className="border-background pointer-events-none absolute -right-4 -bottom-3 -left-4 h-3 overflow-x-hidden border-t opacity-0 transition-opacity group-data-stuck:opacity-100 sm:hidden dark:border-neutral-900">
            <div className="absolute -top-2 -right-4 -left-4 h-2 shadow-md" />
          </div>

          <h2 className="text-2xl font-bold">
            {game.awayTeam.abbreviation}{' '}
            <span className="font-mono font-normal">
              {game.game.awayScore}-{game.game.homeScore}
            </span>{' '}
            {game.homeTeam.abbreviation}
          </h2>
        </div>

        <StatsTable stats={stats} onPlayerClicked={onPlayerClicked} />
      </div>

      {selectedPlayer && (
        <PlayerDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          player={selectedPlayer}
          gameWithTeams={game}
        />
      )}
    </>
  )
}
