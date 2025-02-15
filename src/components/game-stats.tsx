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
      <div className="flex flex-col gap-8">
        <hr />

        <h2 className="text-2xl font-bold">
          {game.homeTeam.teamName}{' '}
          <span className="font-mono font-normal">
            {game.game.homeScore}-{game.game.awayScore}
          </span>{' '}
          {game.awayTeam.teamName}
        </h2>

        <StatsTable stats={stats} onPlayerClicked={onPlayerClicked} />
      </div>

      {selectedPlayer && (
        <PlayerDialog
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  )
}
