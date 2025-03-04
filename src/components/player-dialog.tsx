import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { GameWithTeams, type GamePlayerStat } from '@/server/db/queries'
import Image from 'next/image'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { trimIntervalToMinsSecs } from '@/lib/trim-interval'
import { formatPercentage } from '@/lib/format-percentage'
import { getTeamColors } from '@/lib/team-colors'
import { cn } from '@/lib/utils'
import { Player } from '@/server/db/schema'
import { Team } from '@/server/db/schema'

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}

export default function PlayerDialog({
  isOpen,
  onClose,
  playerStat,
  gameWithTeams,
}: {
  isOpen: boolean
  onClose: () => void
  playerStat: GamePlayerStat
  gameWithTeams: GameWithTeams
}) {
  const onOpenChange = (open: boolean) => {
    if (open) return
    onClose()
  }

  const playerTeam =
    gameWithTeams.homeTeam.teamId === playerStat.teamId
      ? gameWithTeams.homeTeam
      : gameWithTeams.awayTeam

  const teamColors = getTeamColors(playerTeam.abbreviation)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(28rem,100%-1rem)] overflow-hidden rounded-2xl border-0 p-0 shadow-lg dark:border dark:border-white/5">
        <VisuallyHidden.Root>
          <DialogTitle>{playerStat.player.playerName}</DialogTitle>
          <DialogDescription>
            Stats for {playerStat.player.playerName}
          </DialogDescription>
        </VisuallyHidden.Root>

        <div
          className="flex flex-col"
          style={{
            '--team-primary': teamColors.primary,
            '--team-secondary': teamColors.secondary,
            '--team-dark-primary': teamColors.darkPrimary,
            '--team-dark-secondary': teamColors.darkSecondary,
          }}
        >
          <PlayerHeader player={playerStat.player} team={playerTeam} />
          <GameBar gameWithTeams={gameWithTeams} />

          <div className="flex flex-col gap-2 bg-neutral-50 p-2 sm:gap-3 sm:p-5 dark:bg-neutral-900">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatCard
                label="Pts"
                value={playerStat.points ?? 0}
                size="large"
                className="stat-card-splash text-white dark:border-0 dark:outline-1 dark:-outline-offset-1 dark:outline-white/20 [&_[data-slot='label']]:text-white/70 [&>div]:bg-black/5"
              />
              <StatCard
                label="Reb"
                value={playerStat.rebounds ?? 0}
                size="large"
              />
              <StatCard
                label="Ast"
                value={playerStat.assists ?? 0}
                size="large"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <StatCard label="Stl" value={playerStat.steals ?? 0} />
              <StatCard label="Blk" value={playerStat.blocks ?? 0} />
              <StatCard label="TO" value={playerStat.turnovers ?? 0} />
              <StatCard
                label="Min"
                value={trimIntervalToMinsSecs(
                  playerStat.minutesPlayed ?? '00:00'
                )}
              />
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm sm:gap-3 sm:p-4 dark:border dark:border-white/5 dark:bg-neutral-800">
              <span className="text-xs font-bold text-neutral-500 uppercase dark:text-neutral-400">
                Shooting
              </span>
              <div className="grid grid-cols-3 gap-3">
                <ShootingStatBar
                  label="Fg"
                  made={playerStat.fieldGoalsMade ?? 0}
                  attempted={playerStat.fieldGoalsAttempted ?? 0}
                />
                <ShootingStatBar
                  label="3pt"
                  made={playerStat.threePointersMade ?? 0}
                  attempted={playerStat.threePointersAttempted ?? 0}
                />
                <ShootingStatBar
                  label="Ft"
                  made={playerStat.freeThrowsMade ?? 0}
                  attempted={playerStat.freeThrowsAttempted ?? 0}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PlayerHeader({ player, team }: { player: Player; team: Team }) {
  return (
    <div className="team-splash relative h-48 sm:h-56">
      <div className="pointer-events-none absolute inset-0 grid place-content-center overflow-hidden opacity-10">
        <Image
          src={`https://cdn.nba.com/logos/nba/${team.teamId}/global/L/logo.svg`}
          alt={`${team.abbreviation} logo`}
          fill
          className="scale-[2] object-contain"
          unoptimized
        />
      </div>

      <Image
        src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.playerId}.png`}
        alt={`${player.playerName} headshot`}
        className="absolute right-0 bottom-0 w-54 object-contain sm:w-66"
        width={1040}
        height={760}
      />

      <div className="absolute bottom-0 left-0 z-10 flex flex-col items-start gap-1 p-3 text-white sm:p-5">
        {player.jerseyNum && (
          <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
            #{player.jerseyNum}
          </span>
        )}

        <h2 className="text-3xl font-bold tracking-tight drop-shadow-md">
          {player.playerName}
        </h2>

        <div className="text-sm font-medium opacity-80">
          {team.teamName}
          {/* GABE: we'll add pos/height later */}
          {/* {player.position || 'Position N/A'} • {player.height || 'Height N/A'} */}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  )
}

function GameBar({ gameWithTeams }: { gameWithTeams: GameWithTeams }) {
  return (
    <div className="flex items-center justify-between bg-black px-2 py-3 text-white sm:px-5">
      <div className="flex items-center gap-1 sm:gap-3">
        <TeamPill team={gameWithTeams.awayTeam} logoPosition="left" />
        <span className="font-mono text-sm font-bold">
          {gameWithTeams.game.awayScore}-{gameWithTeams.game.homeScore}
        </span>
        <TeamPill team={gameWithTeams.homeTeam} logoPosition="right" />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs text-neutral-400">
          {gameWithTeams.game.gameTime.toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            timeZone: 'America/Los_Angeles',
          })}
        </span>
        {gameWithTeams.game.gameStatus && (
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-[0.625rem] font-bold tracking-wider text-neutral-300 uppercase">
            {gameWithTeams.game.gameStatus}
          </span>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  size = 'normal',
  className,
}: {
  label: string
  value: React.ReactNode
  size?: 'normal' | 'large'
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl bg-white text-neutral-900 shadow-sm dark:border dark:border-white/5 dark:bg-neutral-800 dark:text-white',
        className
      )}
    >
      <div className="flex h-full w-full flex-col items-center justify-center p-3">
        <span
          className={cn(
            'font-mono font-bold',
            size === 'large' ? 'text-3xl' : 'text-xl'
          )}
        >
          {value}
        </span>
        <span
          className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400"
          data-slot="label"
        >
          {label}
        </span>
      </div>
    </div>
  )
}

function ShootingStatBar({
  label,
  made,
  attempted,
}: {
  label: string
  made: number
  attempted: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </span>

        <span className="font-mono text-sm font-bold">
          {attempted > 0 ? `${formatPercentage(made, attempted)}%` : '-'}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="shooting-stat-bar h-full rounded-full opacity-90"
          style={{
            width: `${attempted > 0 ? (made / attempted) * 100 : 0}%`,
            minWidth: made > 0 ? '4px' : '0',
          }}
        />
      </div>
      <div className="text-right text-xs text-neutral-500 dark:text-neutral-400">
        {made}/{attempted}
      </div>
    </div>
  )
}

function TeamPill({
  team,
  logoPosition,
}: {
  team: Team
  logoPosition: 'left' | 'right'
}) {
  const logoCircle = (
    <div className="pointer-events-none relative size-6 shrink-0 rounded-full bg-white/10 p-0.5">
      <Image
        src={`https://cdn.nba.com/logos/nba/${team.teamId}/global/L/logo.svg`}
        alt={`${team.teamName} logo`}
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  )

  return (
    <div
      className={cn(
        'flex flex-row items-center gap-1.5 rounded-full bg-neutral-800',
        logoPosition === 'left' ? 'pr-3' : 'pl-3'
      )}
    >
      {logoPosition === 'left' && logoCircle}
      <span className="text-sm font-bold">{team.abbreviation}</span>
      {logoPosition === 'right' && logoCircle}
    </div>
  )
}
