import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GameWithTeams, type GamePlayerStat } from '@/server/db/queries'
import Image from 'next/image'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { trimStart } from '@/lib/trim-start'
import { useRef } from 'react'
import { toPng } from 'html-to-image'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Share, XIcon } from 'lucide-react'

export default function PlayerDialog({
  isOpen,
  onClose,
  player,
  gameWithTeams,
}: {
  isOpen: boolean
  onClose: () => void
  player: GamePlayerStat
  gameWithTeams: GameWithTeams
}) {
  const onOpenChange = (open: boolean) => {
    if (open) return
    onClose()
  }

  const trimmedMinutes = player.minutesPlayed
    ? trimStart(player.minutesPlayed, '00:').split('.')[0]
    : '00:00'

  const contentDiv = useRef<HTMLDivElement>(null)

  const onShareClicked = async () => {
    if (!contentDiv.current) return

    const image = await toPng(contentDiv.current, {
      includeQueryParams: true,
    })

    // Convert Data URL to Blob
    const response = await fetch(image)
    const blob = await response.blob()

    // Create a File object
    const file = new File([blob], 'image.png', { type: 'image/png' })

    // Check if sharing is supported
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      console.error('Sharing not supported on this device.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-clip p-0">
        <div ref={contentDiv} className="bg-background grid gap-4 p-6">
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
          </div>

          <div className="flex flex-row flex-wrap justify-center gap-x-2 gap-y-2">
            <StatBlock label="Pts" value={player.points} />
            <StatBlock label="Reb" value={player.rebounds} />
            <StatBlock label="Ast" value={player.assists} />
            <StatBlock label="Stl" value={player.steals} />
            <StatBlock label="Blk" value={player.blocks} />
            <StatBlock label="3pt" value={player.threePointersMade} />
            <StatBlock
              label="Fg"
              value={`${player.fieldGoalsMade}/${player.fieldGoalsAttempted}`}
            />
            <StatBlock
              label="Ft"
              value={`${player.freeThrowsMade}/${player.freeThrowsAttempted}`}
            />
            <StatBlock label="TO" value={player.turnovers} />
            <StatBlock label="Mins" value={trimmedMinutes} />
          </div>

          <div className="flex flex-row justify-between pt-2 text-xs">
            <span className="font-bold">
              {gameWithTeams.awayTeam.abbreviation}{' '}
              <span className="font-mono font-normal">
                {gameWithTeams.game.awayScore}-{gameWithTeams.game.homeScore}
              </span>{' '}
              {gameWithTeams.homeTeam.abbreviation}
            </span>

            <span>
              {gameWithTeams.game.gameTime.toLocaleString('en-US', {
                day: 'numeric',
                month: 'numeric',
                year: '2-digit',
                timeZone: 'America/Los_Angeles',
              })}
            </span>
          </div>
        </div>

        <div className="absolute top-2 right-2 flex flex-row gap-2 rounded-xs text-neutral-400 outline-0">
          {navigator && typeof navigator.canShare === 'function' && (
            <button
              onClick={onShareClicked}
              className="grid size-5 cursor-pointer place-items-center rounded-xs text-neutral-400 outline-0"
            >
              <Share className="size-3" />
              <span className="sr-only">Share</span>
            </button>
          )}

          <DialogPrimitive.Close className="grid size-5 cursor-pointer place-items-center rounded-xs text-neutral-400 outline-0">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StatBlock({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex w-20 flex-col items-center rounded bg-neutral-100 p-2 dark:bg-neutral-800">
      <span className="font-mono text-sm font-bold">{value}</span>
      <span className="text-xs">{label}</span>
    </div>
  )
}
