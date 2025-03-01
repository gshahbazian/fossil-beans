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
import { trimIntervalToMinsSecs } from '@/lib/trim-interval'

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

  const trimmedMinutes = trimIntervalToMinsSecs(player.minutesPlayed ?? '00:00')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            {gameWithTeams.game.gameStatus && (
              <span className="font-mono font-medium">
                {' '}
                / {gameWithTeams.game.gameStatus}
              </span>
            )}
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
