import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  type HomeGame,
  type HomePlayer,
  type HomePlayerStat,
  type HomeTeam,
} from '@/lib/home-data'
import { trimIntervalToMinsSecs } from '@/lib/trim-interval'
import { formatShootingPercentage } from '@/lib/format-percentage'
import { formatPstShortDate } from '@/lib/format-date'
import { getTeamColors } from '@/lib/team-colors'
import { cn } from '@/lib/utils'

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}

export default function PlayerDialog({
  onClose,
  playerStat,
  game,
}: {
  onClose: () => void
  playerStat: HomePlayerStat
  game: HomeGame
}) {
  const onOpenChange = (open: boolean) => {
    if (open) return
    onClose()
  }

  const playerTeam = getPlayerTeam(game, playerStat.teamId)
  const teamColors = getTeamColors(playerTeam.abbreviation)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(28rem,100%-1rem)] rounded-2xl p-0 shadow-lg [clip-path:inset(0_round_1rem)] dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/10">
        <div className="sr-only">
          <DialogTitle>{playerStat.player.playerName}</DialogTitle>
          <DialogDescription>
            Stats for {playerStat.player.playerName}
          </DialogDescription>
        </div>

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
          <GameBar game={game} />

          <div className="flex flex-col gap-2 bg-neutral-50 p-2 sm:gap-3 sm:p-5 dark:bg-neutral-900">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatCard
                label="Pts"
                value={playerStat.points ?? 0}
                size="large"
                className="stat-card-splash text-white **:data-[slot='label']:text-white/70 dark:border-0 dark:outline-1 dark:-outline-offset-1 dark:outline-white/20 [&>div]:bg-black/5"
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
                value={trimIntervalToMinsSecs(playerStat.minutesSeconds ?? 0)}
              />
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm sm:gap-3 sm:p-4 dark:bg-neutral-800 dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/10">
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

function PlayerHeader({
  player,
  team,
}: {
  player: HomePlayer
  team: HomeTeam
}) {
  return (
    <div className="team-splash relative h-48 sm:h-56">
      <div className="pointer-events-none absolute inset-0 grid place-content-center overflow-hidden opacity-10">
        <img
          src={`https://cdn.nba.com/logos/nba/${team.teamId}/global/L/logo.svg`}
          alt={`${team.abbreviation} logo`}
          className="absolute inset-0 h-full w-full scale-[2] object-contain"
        />
      </div>

      <img
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

        <div className="text-sm font-medium opacity-80">{team.teamName}</div>
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
    </div>
  )
}

function GameBar({ game }: { game: HomeGame }) {
  const gameDate = formatPstShortDate(game.gameTime)

  return (
    <div className="flex items-center justify-between bg-black px-2 py-3 text-white sm:px-5">
      <div className="flex items-center gap-1 sm:gap-3">
        <TeamPill team={game.awayTeam} logoPosition="left" />
        <span className="font-mono text-sm font-bold">
          {game.awayScore}-{game.homeScore}
        </span>
        <TeamPill team={game.homeTeam} logoPosition="right" />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs text-neutral-400">{gameDate}</span>
        {game.gameStatus && (
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-[0.625rem] font-bold tracking-wider text-neutral-300 uppercase">
            {game.gameStatus}
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
        'overflow-hidden rounded-xl bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/10',
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
  const percentage = formatShootingPercentage(made, attempted)
  const barWidth = getShootingBarWidth(made, attempted)
  const barMinWidth = made > 0 ? '4px' : '0'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </span>

        <span className="font-mono text-sm font-bold">{percentage}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="shooting-stat-bar h-full rounded-full opacity-90"
          style={{
            width: barWidth,
            minWidth: barMinWidth,
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
  team: HomeTeam
  logoPosition: 'left' | 'right'
}) {
  const logoCircle = (
    <div className="pointer-events-none relative size-6 shrink-0 rounded-full bg-white/10 p-0.5">
      <img
        src={`https://cdn.nba.com/logos/nba/${team.teamId}/global/L/logo.svg`}
        alt={`${team.teamName} logo`}
        className="absolute inset-0 h-full w-full object-contain"
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

function getPlayerTeam(game: HomeGame, playerTeamId: number): HomeTeam {
  if (game.homeTeam.teamId === playerTeamId) return game.homeTeam

  return game.awayTeam
}

function getShootingBarWidth(made: number, attempted: number) {
  if (attempted <= 0) return '0%'

  return `${(made / attempted) * 100}%`
}
