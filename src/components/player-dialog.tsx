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

  const trimmedMinutes = trimIntervalToMinsSecs(
    playerStat.minutesPlayed ?? '00:00'
  )

  // Calculate field goal and free throw percentages for display with one decimal place
  const fgPercentage =
    playerStat.fieldGoalsAttempted && playerStat.fieldGoalsAttempted > 0
      ? (
          ((playerStat.fieldGoalsMade || 0) / playerStat.fieldGoalsAttempted) *
          100
        ).toFixed(1)
      : '0.0'

  const ftPercentage =
    playerStat.freeThrowsAttempted && playerStat.freeThrowsAttempted > 0
      ? (
          ((playerStat.freeThrowsMade || 0) / playerStat.freeThrowsAttempted) *
          100
        ).toFixed(1)
      : '0.0'

  // Calculate 3-point percentage with one decimal place
  const threePointPercentage =
    playerStat.threePointersAttempted && playerStat.threePointersAttempted > 0
      ? (
          ((playerStat.threePointersMade || 0) /
            playerStat.threePointersAttempted) *
          100
        ).toFixed(1)
      : '0.0'

  const playerTeam =
    gameWithTeams.homeTeam.teamId === playerStat.teamId
      ? gameWithTeams.homeTeam
      : gameWithTeams.awayTeam

  // Get team colors with P3 color fallback
  const teamColors = getTeamColors(playerTeam.abbreviation)
  const primaryColor = teamColors?.primary || 'oklch(0.5 0.2 240)'
  const secondaryColor = teamColors?.secondary || 'oklch(0.6 0.25 30)'
  const darkPrimaryColor = teamColors?.darkPrimary || 'oklch(0.55 0.2 240)'
  const darkSecondaryColor = teamColors?.darkSecondary || 'oklch(0.65 0.25 30)'

  // Create gradient for header with dark mode variation
  const headerGradient = `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`
  const headerStyle = {
    background: headerGradient,
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
  } as React.CSSProperties

  // Add dark mode CSS variables
  // const darkModeStyle = {
  //   '--primary-color': darkPrimaryColor,
  //   '--secondary-color': darkSecondaryColor,
  // } as React.CSSProperties

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl border-0 p-0 shadow-lg dark:border dark:border-white/5">
        <VisuallyHidden.Root>
          <DialogTitle>{playerStat.player.playerName}</DialogTitle>
          <DialogDescription>
            Stats for {playerStat.player.playerName}
          </DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex flex-col">
          {/* Header with player info */}
          <div
            className="dark:[&>*]:dark-mode-colors relative h-56 overflow-hidden"
            style={headerStyle}
          >
            <style jsx>{`
              .dark-mode-colors {
                --primary-color: ${darkPrimaryColor};
                --secondary-color: ${darkSecondaryColor};
              }
            `}</style>

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
                bgGradient={primaryColor}
                darkBgGradient={darkPrimaryColor}
                size="large"
                useGradient={true}
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
              <StatCard label="MIN" value={trimmedMinutes} />
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
                  percentage={parseFloat(fgPercentage)}
                  color={primaryColor}
                  darkColor={darkPrimaryColor}
                  useGradient={true}
                />
                <ShootingStatBar
                  label="3PT"
                  made={playerStat.threePointersMade || 0}
                  attempted={playerStat.threePointersAttempted || 0}
                  percentage={parseFloat(threePointPercentage)}
                  color={primaryColor}
                  darkColor={darkPrimaryColor}
                  useGradient={true}
                />
                <ShootingStatBar
                  label="FT"
                  made={playerStat.freeThrowsMade || 0}
                  attempted={playerStat.freeThrowsAttempted || 0}
                  percentage={parseFloat(ftPercentage)}
                  color={primaryColor}
                  darkColor={darkPrimaryColor}
                  useGradient={true}
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
  subValue,
  bgGradient,
  darkBgGradient,
  size = 'normal',
  useGradient = false,
}: {
  label: string
  value: React.ReactNode
  subValue?: string | null
  bgGradient?: string
  darkBgGradient?: string
  size?: 'normal' | 'large'
  useGradient?: boolean
}) {
  const hasBg = !!bgGradient

  // Create gradient variables for both light and dark modes
  const lightGradient =
    hasBg && useGradient
      ? `linear-gradient(120deg, ${bgGradient} 0%, color-mix(in oklch, ${bgGradient}, white 25%) 100%)`
      : undefined

  const darkGradient =
    hasBg && useGradient && darkBgGradient
      ? `linear-gradient(120deg, ${darkBgGradient} 0%, color-mix(in oklch, ${darkBgGradient}, white 35%) 100%)`
      : undefined

  return (
    <div
      className={`overflow-hidden rounded-xl shadow-sm ${hasBg ? 'text-white' : 'bg-white text-neutral-900 dark:border dark:border-white/5 dark:bg-neutral-800 dark:text-white'} `}
      style={
        hasBg
          ? ({
              background:
                useGradient && lightGradient ? lightGradient : bgGradient,
              '--dark-bg-gradient': darkBgGradient,
              '--dark-gradient': darkGradient,
            } as React.CSSProperties)
          : {}
      }
      data-has-dark-bg={hasBg && !!darkBgGradient ? 'true' : undefined}
      data-use-gradient={useGradient ? 'true' : 'false'}
    >
      <style jsx>{`
        /* For solid color in dark mode */
        [data-has-dark-bg='true']:is(.dark [data-has-dark-bg='true']) {
          background-color: var(--dark-bg-gradient);
        }

        /* For gradient in dark mode */
        [data-has-dark-bg='true'][data-use-gradient='true']:is(
            .dark [data-has-dark-bg='true'][data-use-gradient='true']
          ) {
          background: var(--dark-gradient) !important;
        }
      `}</style>
      <div
        className={`flex flex-col items-center justify-center p-3 ${hasBg ? 'bg-black/5' : ''} `}
      >
        <span
          className={`font-mono font-bold ${size === 'large' ? 'text-3xl' : 'text-xl'}`}
        >
          {value}
        </span>
        {subValue && (
          <span
            className={`mt-0.5 text-xs ${hasBg ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'}`}
          >
            {subValue}
          </span>
        )}
        <span
          className={`mt-1 text-xs font-medium ${hasBg ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'}`}
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
  percentage,
  color,
  darkColor,
  useGradient = false,
}: {
  label: string
  made: number
  attempted: number
  percentage: number
  color: string
  darkColor: string
  useGradient?: boolean
}) {
  // Create gradient variables for both light and dark modes
  const lightGradient = `linear-gradient(90deg, ${color} 0%, color-mix(in oklch, ${color}, white 20%) 100%)`

  return (
    <div className="flex flex-col">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        <span className="font-mono text-sm font-bold">
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="h-full rounded-full opacity-90"
          style={
            {
              width: `${percentage}%`,
              background: useGradient ? lightGradient : color,
              minWidth: made > 0 ? '4px' : '0',
              '--dark-color': darkColor,
              '--dark-gradient': `linear-gradient(90deg, ${darkColor} 0%, color-mix(in oklch, ${darkColor}, white 30%) 100%)`,
            } as React.CSSProperties
          }
          data-dark-color="true"
          data-use-gradient={useGradient ? 'true' : 'false'}
        />
      </div>
      <style jsx>{`
        /* Apply dark mode gradient */
        [data-dark-color='true']:is(.dark [data-dark-color='true']) {
          background: var(--dark-gradient) !important;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        /* For non-gradient mode in dark mode, use solid color */
        [data-dark-color='true'][data-use-gradient='false']:is(
            .dark [data-dark-color='true'][data-use-gradient='false']
          ) {
          background: var(--dark-color) !important;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
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

// Team colors using OKLCH color space for better P3 display
function getTeamColors(teamAbbr: string) {
  // Helper function to create dark mode variants with appropriate adjustments
  const adjustForDarkMode = (color: string): string => {
    // Parse the OKLCH color to get components
    const match = color.match(/oklch\(([0-9.]+) ([0-9.]+) ([0-9.]+)\)/)
    if (!match || match.length < 4) return color

    const lightness = Number(match[1])
    const chroma = Number(match[2])
    const hue = Number(match[3])

    if (isNaN(lightness) || isNaN(chroma) || isNaN(hue)) return color

    // For dark purples and blues (hue between 240-300), reduce chroma and increase lightness
    if (hue >= 240 && hue <= 300) {
      // Desaturate and lighten dark purples and blues
      return `oklch(${Math.min(lightness + 0.2, 0.9)} ${Math.max(chroma - 0.05, 0.1)} ${hue})`
    }

    // For other colors, just increase lightness slightly
    return `oklch(${Math.min(lightness + 0.1, 0.9)} ${chroma} ${hue})`
  }

  const colorMap: Record<
    string,
    {
      primary: string
      secondary: string
      accent: string
      darkPrimary: string
      darkSecondary: string
      darkAccent: string
    }
  > = {
    // Eastern Conference
    ATL: {
      primary: 'oklch(0.55 0.25 30)',
      secondary: 'oklch(0.8 0.15 120)',
      accent: 'oklch(0.2 0.02 240)',
      darkPrimary: 'oklch(0.65 0.25 30)',
      darkSecondary: 'oklch(0.85 0.15 120)',
      darkAccent: 'oklch(0.7 0.1 30)',
    },
    BOS: {
      primary: 'oklch(0.45 0.18 150)',
      secondary: 'oklch(0.7 0.1 80)',
      accent: 'oklch(0.4 0.2 30)',
      darkPrimary: 'oklch(0.6 0.15 150)',
      darkSecondary: 'oklch(0.75 0.1 80)',
      darkAccent: 'oklch(0.65 0.2 30)',
    },
    BKN: {
      primary: 'oklch(0.1 0.01 240)',
      secondary: 'oklch(0.98 0.01 240)',
      accent: 'oklch(0.6 0.02 240)',
      darkPrimary: 'oklch(0.3 0.01 240)',
      darkSecondary: 'oklch(0.9 0.01 240)',
      darkAccent: 'oklch(0.8 0.05 240)',
    },
    CHA: {
      primary: 'oklch(0.3 0.2 280)',
      secondary: 'oklch(0.5 0.18 200)',
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.5 0.15 280)',
      darkSecondary: 'oklch(0.6 0.15 200)',
      darkAccent: 'oklch(0.8 0.02 240)',
    },
    CHI: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.1 0.01 240)',
      accent: 'oklch(0.98 0.01 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.3 0.01 240)',
      darkAccent: 'oklch(0.9 0.01 240)',
    },
    CLE: {
      primary: 'oklch(0.4 0.25 25)',
      secondary: 'oklch(0.25 0.2 260)',
      accent: 'oklch(0.8 0.15 80)',
      darkPrimary: 'oklch(0.5 0.25 25)',
      darkSecondary: 'oklch(0.45 0.15 260)',
      darkAccent: 'oklch(0.85 0.15 80)',
    },
    DET: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.4 0.2 260)',
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.5 0.15 260)',
      darkAccent: 'oklch(0.8 0.02 240)',
    },
    IND: {
      primary: 'oklch(0.3 0.2 260)',
      secondary: 'oklch(0.8 0.15 80)',
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.5 0.15 260)',
      darkSecondary: 'oklch(0.85 0.15 80)',
      darkAccent: 'oklch(0.8 0.02 240)',
    },
    MIA: {
      primary: 'oklch(0.4 0.25 25)',
      secondary: 'oklch(0.7 0.15 60)',
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.5 0.25 25)',
      darkSecondary: 'oklch(0.75 0.15 60)',
      darkAccent: 'oklch(0.7 0.1 60)',
    },
    MIL: {
      primary: 'oklch(0.35 0.18 150)',
      secondary: 'oklch(0.9 0.05 80)',
      accent: 'oklch(0.5 0.2 220)',
      darkPrimary: 'oklch(0.5 0.15 150)',
      darkSecondary: 'oklch(0.95 0.05 80)',
      darkAccent: 'oklch(0.65 0.15 220)',
    },
    NYK: {
      primary: 'oklch(0.5 0.2 220)',
      secondary: 'oklch(0.7 0.15 60)',
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.75 0.15 60)',
      darkAccent: 'oklch(0.8 0.02 240)',
    },
    ORL: {
      primary: 'oklch(0.5 0.2 220)',
      secondary: 'oklch(0.8 0.02 240)',
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.9 0.02 240)',
      darkAccent: 'oklch(0.7 0.1 220)',
    },
    PHI: {
      primary: 'oklch(0.5 0.2 220)',
      secondary: 'oklch(0.5 0.25 25)',
      accent: 'oklch(0.3 0.2 260)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.6 0.25 25)',
      darkAccent: 'oklch(0.5 0.15 260)',
    },
    TOR: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.1 0.01 240)',
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.3 0.01 240)',
      darkAccent: 'oklch(0.8 0.02 240)',
    },
    WAS: {
      primary: 'oklch(0.3 0.2 260)',
      secondary: 'oklch(0.5 0.25 25)',
      accent: 'oklch(0.8 0.02 240)',
      darkPrimary: 'oklch(0.5 0.15 260)',
      darkSecondary: 'oklch(0.6 0.25 25)',
      darkAccent: 'oklch(0.9 0.02 240)',
    },

    // Western Conference
    DAL: {
      primary: 'oklch(0.45 0.2 220)',
      secondary: 'oklch(0.3 0.2 260)',
      accent: 'oklch(0.75 0.05 240)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.5 0.15 260)',
      darkAccent: 'oklch(0.85 0.05 240)',
    },
    DEN: {
      primary: 'oklch(0.25 0.15 260)',
      secondary: 'oklch(0.8 0.15 80)',
      accent: 'oklch(0.4 0.25 25)',
      darkPrimary: 'oklch(0.45 0.1 260)',
      darkSecondary: 'oklch(0.85 0.15 80)',
      darkAccent: 'oklch(0.5 0.25 25)',
    },
    GSW: {
      primary: 'oklch(0.45 0.2 240)',
      secondary: 'oklch(0.8 0.15 80)',
      accent: 'oklch(0.2 0.02 240)',
      darkPrimary: 'oklch(0.6 0.15 240)',
      darkSecondary: 'oklch(0.85 0.15 80)',
      darkAccent: 'oklch(0.7 0.1 80)',
    },
    HOU: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.1 0.01 240)',
      accent: 'oklch(0.8 0.02 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.3 0.01 240)',
      darkAccent: 'oklch(0.9 0.02 240)',
    },
    LAC: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.45 0.2 240)',
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.6 0.15 240)',
      darkAccent: 'oklch(0.8 0.02 240)',
    },
    LAL: {
      primary: 'oklch(0.4 0.2 300)',
      secondary: 'oklch(0.75 0.15 80)',
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.55 0.15 300)',
      darkSecondary: 'oklch(0.8 0.15 80)',
      darkAccent: 'oklch(0.7 0.1 80)',
    },
    MEM: {
      primary: 'oklch(0.6 0.1 260)',
      secondary: 'oklch(0.2 0.15 260)',
      accent: 'oklch(0.7 0.15 80)',
      darkPrimary: 'oklch(0.7 0.1 260)',
      darkSecondary: 'oklch(0.4 0.1 260)',
      darkAccent: 'oklch(0.75 0.15 80)',
    },
    MIN: {
      primary: 'oklch(0.25 0.15 260)',
      secondary: 'oklch(0.45 0.2 220)',
      accent: 'oklch(0.6 0.15 140)',
      darkPrimary: 'oklch(0.45 0.1 260)',
      darkSecondary: 'oklch(0.6 0.15 220)',
      darkAccent: 'oklch(0.7 0.15 140)',
    },
    NOP: {
      primary: 'oklch(0.25 0.15 260)',
      secondary: 'oklch(0.5 0.25 25)',
      accent: 'oklch(0.6 0.1 80)',
      darkPrimary: 'oklch(0.45 0.1 260)',
      darkSecondary: 'oklch(0.6 0.25 25)',
      darkAccent: 'oklch(0.7 0.1 80)',
    },
    OKC: {
      primary: 'oklch(0.5 0.2 220)',
      secondary: 'oklch(0.5 0.25 25)',
      accent: 'oklch(0.3 0.2 260)',
      darkPrimary: 'oklch(0.6 0.15 220)',
      darkSecondary: 'oklch(0.6 0.25 25)',
      darkAccent: 'oklch(0.5 0.15 260)',
    },
    PHX: {
      primary: 'oklch(0.3 0.2 280)',
      secondary: 'oklch(0.6 0.2 40)',
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.5 0.15 280)',
      darkSecondary: 'oklch(0.7 0.2 40)',
      darkAccent: 'oklch(0.75 0.15 40)',
    },
    POR: {
      primary: 'oklch(0.5 0.25 25)',
      secondary: 'oklch(0.1 0.01 240)',
      accent: 'oklch(0.98 0.01 240)',
      darkPrimary: 'oklch(0.6 0.25 25)',
      darkSecondary: 'oklch(0.3 0.01 240)',
      darkAccent: 'oklch(0.9 0.01 240)',
    },
    SAC: {
      primary: 'oklch(0.4 0.2 300)',
      secondary: 'oklch(0.6 0.05 240)',
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.55 0.15 300)',
      darkSecondary: 'oklch(0.7 0.05 240)',
      darkAccent: 'oklch(0.7 0.1 300)',
    },
    SAS: {
      primary: 'oklch(0.8 0.02 240)',
      secondary: 'oklch(0.1 0.01 240)',
      accent: 'oklch(0.6 0.25 350)',
      darkPrimary: 'oklch(0.9 0.02 240)',
      darkSecondary: 'oklch(0.3 0.01 240)',
      darkAccent: 'oklch(0.7 0.2 350)',
    },
    UTA: {
      primary: 'oklch(0.3 0.2 260)',
      secondary: 'oklch(0.35 0.18 150)',
      accent: 'oklch(0.7 0.15 60)',
      darkPrimary: 'oklch(0.5 0.15 260)',
      darkSecondary: 'oklch(0.5 0.15 150)',
      darkAccent: 'oklch(0.75 0.15 60)',
    },

    // Default fallback
    DEFAULT: {
      primary: 'oklch(0.45 0.2 240)',
      secondary: 'oklch(0.5 0.25 25)',
      accent: 'oklch(0.45 0.2 240)',
      darkPrimary: 'oklch(0.6 0.15 240)',
      darkSecondary: 'oklch(0.6 0.25 25)',
      darkAccent: 'oklch(0.6 0.15 240)',
    },
  }

  // Get team colors with fallback to DEFAULT
  const team = colorMap[teamAbbr] || colorMap['DEFAULT']

  // TypeScript needs reassurance about the type
  const safeTeam = team as NonNullable<typeof team>

  // Return the team colors with adjusted dark mode variants
  return {
    ...safeTeam,
    darkPrimary: adjustForDarkMode(safeTeam.darkPrimary),
    darkSecondary: adjustForDarkMode(safeTeam.darkSecondary),
    darkAccent: adjustForDarkMode(safeTeam.darkAccent),
  }
}
