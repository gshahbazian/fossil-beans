/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type GamePlayerStat } from '@/server/db/queries'

export default function PlayerDialog({
  player,
  onClose,
}: {
  player: GamePlayerStat
  onClose: () => void
}) {
  const onOpenChange = (open: boolean) => {
    if (open) return
    onClose()
  }

  return (
    <Dialog defaultOpen onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{player.playerName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center">
          <img
            src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.playerId}.png`}
            alt={`${player.playerName} headshot`}
            className="w-32"
          />
          <span>{player.points} Points</span>
          <span>{player.rebounds} Rebounds</span>
          <span>{player.assists} Assists</span>
          <span>{player.steals} Steals</span>
          <span>{player.blocks} Blocks</span>
          <span>{player.fieldGoalsMade} FG</span>
          <span>{player.freeThrowsMade} FT</span>
          <span>{player.turnovers} Turnovers</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
