import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type GamePlayerStat } from '@/server/db/queries'
import Image from 'next/image'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

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
        <VisuallyHidden.Root>
          <DialogDescription>Stats for {player.playerName}</DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex flex-col items-center">
          <Image
            src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.playerId}.png`}
            alt={`${player.playerName} headshot`}
            className="w-32"
            width={260}
            height={190}
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
