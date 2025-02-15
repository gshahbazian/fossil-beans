/* eslint-disable @next/next/no-img-element */
import { type BoxScore } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function PlayerDialog({
  player,
  onClose,
}: {
  player: BoxScore
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
          <DialogTitle>{player.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center">
          <img
            src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`}
            alt={`${player.name} headshot`}
            className="w-32"
          />
          <span>{player.pts} Points</span>
          <span>{player.reb} Rebounds</span>
          <span>{player.ast} Assists</span>
          <span>{player.stl} Steals</span>
          <span>{player.blk} Blocks</span>
          <span>{player.fgPct}% FG</span>
          <span>{player.ftPct}% FT</span>
          <span>{player.to} Turnovers</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
