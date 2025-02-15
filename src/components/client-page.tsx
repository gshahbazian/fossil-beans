'use client'

import { useCallback, useState } from 'react'
import GameEntry from '@/components/game-entry'
import PlayersList from '@/components/players-list'
import { type BoxScore, type Game } from '@/lib/types'
import PlayerDialog from '@/components/player-dialog'

export default function ClientPage({
  topLines,
  games,
}: {
  topLines: BoxScore[]
  games: Game[]
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<BoxScore | null>(null)
  const onPlayerClicked = useCallback((player: BoxScore) => {
    setSelectedPlayer(player)
  }, [])

  return (
    <>
      <PlayersList scores={topLines} onPlayerClicked={onPlayerClicked} />

      {games.map((game) => (
        <GameEntry
          key={game.homeTeam}
          game={game}
          onPlayerClicked={onPlayerClicked}
        />
      ))}

      {selectedPlayer && (
        <PlayerDialog
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  )
}
