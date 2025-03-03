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
      <DialogContent className="max-w-md overflow-hidden rounded-2xl border-0 p-0 shadow-lg dark:border dark:border-white/5">
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
          {/* Header with player info */}
          <div className="team-splash relative h-56 overflow-hidden">
            {/* Team logo watermark */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-10">
              <Image
                src={`https://cdn.nba.com/logos/nba/${playerTeam.teamId}/global/L/logo.svg`}
                alt={`${playerTeam.abbreviation} logo`}
                width={300}
                height={300}
                className="scale-[2] object-contain"
                priority
              />
            </div>

            {/* Player image */}
            <div className="absolute right-0 bottom-0 flex h-48 items-end">
              <Image
                src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${playerStat.player.playerId}.png`}
                alt={`${playerStat.player.playerName} headshot`}
                className="h-full w-auto object-contain drop-shadow-lg"
                width={1040}
                height={760}
                priority
              />
            </div>

            {/* Player info */}
            <div className="absolute bottom-0 left-0 z-10 p-5 text-white">
              <div className="mb-1 flex items-center space-x-2">
                <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
                  #{playerStat.player.jerseyNum || ''}
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight drop-shadow-md">
                {playerStat.player.playerName}
              </h2>

              <div className="mt-1 text-sm font-medium opacity-80">
                {playerStat.player.position || 'Position N/A'} •{' '}
                {playerStat.player.height || 'Height N/A'}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Game context bar */}
          <div className="flex items-center justify-between bg-black px-5 py-3 text-white">
            <div className="flex items-center">
              <TeamLogo
                teamId={gameWithTeams.awayTeam.teamId}
                teamAbbr={gameWithTeams.awayTeam.abbreviation}
                size="xs"
                shape="pill"
                logoPosition="left"
              />
              <span className="mx-4 font-mono text-sm font-bold">
                {gameWithTeams.game.awayScore}-{gameWithTeams.game.homeScore}
              </span>
              <TeamLogo
                teamId={gameWithTeams.homeTeam.teamId}
                teamAbbr={gameWithTeams.homeTeam.abbreviation}
                size="xs"
                shape="pill"
                logoPosition="right"
              />
            </div>

            <div className="flex items-center">
              <span className="mr-2 text-xs text-neutral-400">
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

          {/* Stats content - all in one section */}
          <div className="bg-neutral-50 p-5 dark:bg-neutral-900">
            {/* Key stats */}
            <div className="mb-3 grid grid-cols-3 gap-3">
              <StatCard
                label="PTS"
                value={playerStat.points || 0}
                size="large"
                className="stat-card-splash text-white [&_[data-slot='label']]:text-white/70"
              />
              <StatCard
                label="REB"
                value={playerStat.rebounds || 0}
                size="large"
              />
              <StatCard
                label="AST"
                value={playerStat.assists || 0}
                size="large"
              />
            </div>
            {/* Secondary stats */}
            <div className="mb-3 grid grid-cols-4 gap-3">
              <StatCard
                label="MIN"
                value={trimIntervalToMinsSecs(
                  playerStat.minutesPlayed ?? '00:00'
                )}
              />
              <StatCard label="STL" value={playerStat.steals || 0} />
              <StatCard label="BLK" value={playerStat.blocks || 0} />
              <StatCard label="TO" value={playerStat.turnovers || 0} />
            </div>

            {/* Shooting stats */}
            <div className="mb-3 rounded-xl bg-white p-4 shadow-sm dark:border dark:border-white/5 dark:bg-neutral-800">
              <h3 className="mb-3 text-xs font-bold text-neutral-500 uppercase dark:text-neutral-400">
                Shooting
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <ShootingStatBar
                  label="FG"
                  made={playerStat.fieldGoalsMade || 0}
                  attempted={playerStat.fieldGoalsAttempted || 0}
                />
                <ShootingStatBar
                  label="3PT"
                  made={playerStat.threePointersMade || 0}
                  attempted={playerStat.threePointersAttempted || 0}
                />
                <ShootingStatBar
                  label="FT"
                  made={playerStat.freeThrowsMade || 0}
                  attempted={playerStat.freeThrowsAttempted || 0}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Modern stat card component
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
      <div className="flex flex-col items-center justify-center bg-black/5 p-3">
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

// Shooting stat bar component
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
    <div className="flex flex-col">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </span>

        {attempted > 0 ? (
          <span className="font-mono text-sm font-bold">
            {formatPercentage(made, attempted)}%
          </span>
        ) : (
          <span className="font-mono text-sm font-bold">-</span>
        )}
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
      <div className="mt-1 text-right text-xs text-neutral-500 dark:text-neutral-400">
        {made}/{attempted}
      </div>
    </div>
  )
}

// Team logo component
function TeamLogo({
  teamId,
  teamAbbr,
  size = 'normal',
  shape = 'circle',
  logoPosition = 'left',
}: {
  teamId: number
  teamAbbr: string
  size?: 'xs' | 'normal' | 'large'
  shape?: 'circle' | 'pill'
  logoPosition?: 'left' | 'right'
}) {
  // Set dimensions based on size
  const dimensions = {
    xs: { width: 24, height: 24 },
    normal: { width: 40, height: 40 },
    large: { width: 64, height: 64 },
  }

  const { width, height } = dimensions[size]

  // Use the NBA CDN for team logos
  const logoUrl = `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`

  // Determine padding classes based on shape and logo position
  let paddingClasses = ''
  if (shape === 'pill') {
    paddingClasses = logoPosition === 'left' ? 'pl-0 pr-3' : 'pl-3 pr-0'
  }

  // For pill shape, we'll show the logo and team abbreviation
  if (shape === 'pill') {
    // Logo and text elements
    const logoElement = (
      <div className="flex items-center justify-center rounded-full bg-white/10 p-0.5">
        <Image
          src={logoUrl}
          alt={`${teamAbbr} logo`}
          width={size === 'xs' ? 20 : size === 'large' ? 32 : 24}
          height={size === 'xs' ? 20 : size === 'large' ? 32 : 24}
          className="object-contain"
        />
      </div>
    )

    const textElement = <span className="text-sm font-bold">{teamAbbr}</span>

    return (
      <div
        className={`flex items-center rounded-full bg-neutral-800 ${paddingClasses} `}
      >
        {logoPosition === 'left' ? (
          <>
            {logoElement}
            <span className="ml-1.5">{textElement}</span>
          </>
        ) : (
          <>
            <span className="mr-1.5">{textElement}</span>
            {logoElement}
          </>
        )}
      </div>
    )
  }

  // For circle shape, just show the logo
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full ${
        size === 'xs' ? 'h-6 w-6' : size === 'large' ? 'h-16 w-16' : 'h-10 w-10'
      } `}
    >
      <Image
        src={logoUrl}
        alt={`${teamAbbr} logo`}
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  )
}
