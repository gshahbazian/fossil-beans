'use client'

import { useCallback, useState } from 'react'
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
  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayerStat | null>(
    null
  )
  const onPlayerClicked = useCallback((player: GamePlayerStat) => {
    setSelectedPlayer(player)
  }, [])

  return (
    <>
      <div className="flex flex-col gap-8 overflow-x-hidden">
        <hr />

        <h2 className="text-2xl font-bold">
          {game.awayTeam.abbreviation}{' '}
          <span className="font-mono font-normal">
            {game.game.awayScore}-{game.game.homeScore}
          </span>{' '}
          {game.homeTeam.abbreviation}
        </h2>

        <StatsTable stats={stats} onPlayerClicked={onPlayerClicked} />
      </div>

      {selectedPlayer && (
        <PlayerDialog
          game={game}
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  )
}
