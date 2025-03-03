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
import { IBM_Plex_Mono } from 'next/font/google'

// Extended type to handle properties we're using that might not be in the original type
interface ExtendedPlayerStat extends GamePlayerStat {
  teamId?: string;
  jerseyNum?: string;
  position?: string;
  height?: string;
  plusMinus?: number;
}

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
  
  // Calculate field goal and free throw percentages for display with one decimal place
  const fgPercentage = player.fieldGoalsAttempted && player.fieldGoalsAttempted > 0
    ? ((player.fieldGoalsMade || 0) / player.fieldGoalsAttempted * 100).toFixed(1)
    : "0.0"
    
  const ftPercentage = player.freeThrowsAttempted && player.freeThrowsAttempted > 0
    ? ((player.freeThrowsMade || 0) / player.freeThrowsAttempted * 100).toFixed(1)
    : "0.0"
    
  // Calculate 3-point percentage with one decimal place
  const threePointPercentage = player.threePointersAttempted && player.threePointersAttempted > 0
    ? ((player.threePointersMade || 0) / player.threePointersAttempted * 100).toFixed(1)
    : "0.0"

  // Cast player to extended type to access additional properties
  const extendedPlayer = player as ExtendedPlayerStat

  // For simplicity, just use the home team colors since we don't have reliable team ID matching
  const playerTeam = gameWithTeams.homeTeam
  const opposingTeam = gameWithTeams.awayTeam
  
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
  const darkModeStyle = {
    '--primary-color': darkPrimaryColor,
    '--secondary-color': darkSecondaryColor,
  } as React.CSSProperties

  // Player image URL
  const playerImageUrl = `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.playerId}.png`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden rounded-2xl border-0 dark:border dark:border-white/5 shadow-lg"
      >
        <VisuallyHidden.Root>
          <DialogTitle>Player Stats: {player.playerName}</DialogTitle>
          <DialogDescription>Stats for {player.playerName}</DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex flex-col">
          {/* Header with player info */}
          <div 
            className="relative h-56 overflow-hidden dark:[&>*]:dark-mode-colors"
            style={headerStyle}
          >
            <style jsx>{`
              .dark-mode-colors {
                --primary-color: ${darkPrimaryColor};
                --secondary-color: ${darkSecondaryColor};
              }
            `}</style>
            {/* Team logo watermark */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-10">
              <Image 
                src={`https://cdn.nba.com/logos/nba/${getTeamIdFromAbbr(playerTeam.abbreviation)}/global/L/logo.svg`}
                alt={`${playerTeam.abbreviation} logo`}
                width={300}
                height={300}
                className="object-contain scale-[2]"
                priority
              />
            </div>
            
            {/* Player image */}
            <div className="absolute bottom-0 right-0 h-48 flex items-end">
              <Image
                src={playerImageUrl}
                alt={`${player.playerName} headshot`}
                className="h-full w-auto object-contain drop-shadow-lg"
                width={1040}
                height={760}
                priority
              />
            </div>
            
            {/* Player info */}
            <div className="absolute bottom-0 left-0 p-5 text-white z-10">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium">
                  #{extendedPlayer.jerseyNum || ''}
                </span>
                <span className="text-sm font-medium">{playerTeam.abbreviation}</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight drop-shadow-md">
                {player.playerName}
              </h2>
              <div className="text-sm font-medium opacity-80 mt-1">
                {extendedPlayer.position || 'Position N/A'} • {extendedPlayer.height || 'Height N/A'}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Game context bar */}
          <div 
            className="bg-black text-white px-5 py-3 flex justify-between items-center"
          >
            <div className="flex items-center">
              <TeamLogo teamAbbr={gameWithTeams.awayTeam.abbreviation} size="xs" shape="pill" logoPosition="left" />
              <span className="font-mono font-bold mx-4 text-sm">
                {gameWithTeams.game.awayScore}-{gameWithTeams.game.homeScore}
              </span>
              <TeamLogo teamAbbr={gameWithTeams.homeTeam.abbreviation} size="xs" shape="pill" logoPosition="right" />
            </div>
            
            <div className="flex items-center">
              <span className="text-neutral-400 mr-2 text-xs">
                {gameWithTeams.game.gameTime.toLocaleString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  timeZone: 'America/Los_Angeles',
                })}
              </span>
              {gameWithTeams.game.gameStatus && (
                <span className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 uppercase text-[0.625rem] font-bold tracking-wider">
                  {gameWithTeams.game.gameStatus}
                </span>
              )}
            </div>
          </div>

          {/* Stats content - all in one section */}
          <div className="p-5 bg-neutral-50 dark:bg-neutral-900">
            {/* Key stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatCard 
                label="PTS" 
                value={player.points || 0} 
                bgGradient={primaryColor}
                darkBgGradient={darkPrimaryColor}
                size="large"
                useGradient={true}
              />
              <StatCard 
                label="REB" 
                value={player.rebounds || 0} 
                size="large"
              />
              <StatCard 
                label="AST" 
                value={player.assists || 0} 
                size="large"
              />
            </div>
            
            {/* Secondary stats */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <StatCard label="MIN" value={trimmedMinutes} />
              <StatCard label="STL" value={player.steals || 0} />
              <StatCard label="BLK" value={player.blocks || 0} />
              <StatCard label="TO" value={player.turnovers || 0} />
            </div>
            
            {/* Shooting stats */}
            <div className="bg-white dark:bg-neutral-800 dark:border dark:border-white/5 rounded-xl p-4 shadow-sm mb-3">
              <h3 className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 mb-3">
                Shooting
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <ShootingStatBar 
                  label="FG" 
                  made={player.fieldGoalsMade || 0} 
                  attempted={player.fieldGoalsAttempted || 0} 
                  percentage={parseFloat(fgPercentage)}
                  color={primaryColor}
                  darkColor={darkPrimaryColor}
                  useGradient={true}
                />
                <ShootingStatBar 
                  label="3PT" 
                  made={player.threePointersMade || 0} 
                  attempted={player.threePointersAttempted || 0} 
                  percentage={parseFloat(threePointPercentage)}
                  color={primaryColor}
                  darkColor={darkPrimaryColor}
                  useGradient={true}
                />
                <ShootingStatBar 
                  label="FT" 
                  made={player.freeThrowsMade || 0} 
                  attempted={player.freeThrowsAttempted || 0} 
                  percentage={parseFloat(ftPercentage)}
                  color={primaryColor}
                  darkColor={darkPrimaryColor}
                  useGradient={true}
                />
              </div>
            </div>
            
            {/* Additional stats in a clean grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-neutral-800 dark:border dark:border-white/5 rounded-xl p-4 shadow-sm">
                <h3 className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 mb-3">
                  Field Goals
                </h3>
                <div className="space-y-2">
                  <StatRow 
                    label="Made" 
                    value={player.fieldGoalsMade || 0} 
                  />
                  <StatRow 
                    label="Attempted" 
                    value={player.fieldGoalsAttempted || 0} 
                  />
                  <StatRow 
                    label="Percentage" 
                    value={`${fgPercentage}%`} 
                    highlight
                  />
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 dark:border dark:border-white/5 rounded-xl p-4 shadow-sm">
                <h3 className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 mb-3">
                  3-Pointers
                </h3>
                <div className="space-y-2">
                  <StatRow 
                    label="Made" 
                    value={player.threePointersMade || 0} 
                  />
                  <StatRow 
                    label="Attempted" 
                    value={player.threePointersAttempted || 0} 
                  />
                  <StatRow 
                    label="Percentage" 
                    value={`${threePointPercentage}%`} 
                    highlight
                  />
                </div>
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
  size = "normal",
  useGradient = false
}: {
  label: string
  value: React.ReactNode
  subValue?: string | null
  bgGradient?: string
  darkBgGradient?: string
  size?: "normal" | "large"
  useGradient?: boolean
}) {
  const hasBg = !!bgGradient
  
  // Create gradient variables for both light and dark modes
  const lightGradient = hasBg && useGradient ? 
    `linear-gradient(120deg, ${bgGradient} 0%, color-mix(in oklch, ${bgGradient}, white 25%) 100%)` : 
    undefined;
  
  const darkGradient = hasBg && useGradient && darkBgGradient ? 
    `linear-gradient(120deg, ${darkBgGradient} 0%, color-mix(in oklch, ${darkBgGradient}, white 35%) 100%)` : 
    undefined;
  
  return (
    <div 
      className={`
        rounded-xl overflow-hidden shadow-sm
        ${hasBg ? 'text-white' : 'bg-white dark:bg-neutral-800 dark:border dark:border-white/5 text-neutral-900 dark:text-white'}
      `}
      style={hasBg ? { 
        background: useGradient && lightGradient ? lightGradient : bgGradient,
        '--dark-bg-gradient': darkBgGradient,
        '--dark-gradient': darkGradient
      } as React.CSSProperties : {}}
      data-has-dark-bg={hasBg && !!darkBgGradient ? 'true' : undefined}
      data-use-gradient={useGradient ? 'true' : 'false'}
    >
      <style jsx>{`
        /* For solid color in dark mode */
        [data-has-dark-bg="true"]:is(.dark [data-has-dark-bg="true"]) {
          background-color: var(--dark-bg-gradient);
        }
        
        /* For gradient in dark mode */
        [data-has-dark-bg="true"][data-use-gradient="true"]:is(.dark [data-has-dark-bg="true"][data-use-gradient="true"]) {
          background: var(--dark-gradient) !important;
        }
      `}</style>
      <div className={`
        flex flex-col items-center justify-center p-3
        ${hasBg ? 'bg-black/5' : ''}
      `}>
        <span className={`font-mono font-bold ${size === "large" ? "text-3xl" : "text-xl"}`}>
          {value}
        </span>
        {subValue && (
          <span className={`text-xs mt-0.5 ${hasBg ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'}`}>
            {subValue}
          </span>
        )}
        <span className={`text-xs font-medium mt-1 ${hasBg ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'}`}>
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
  useGradient = false
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
  const lightGradient = `linear-gradient(90deg, ${color} 0%, color-mix(in oklch, ${color}, white 20%) 100%)`;
  
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-sm font-mono font-bold">{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full opacity-90"
          style={{ 
            width: `${percentage}%`, 
            background: useGradient ? lightGradient : color,
            minWidth: made > 0 ? '4px' : '0',
            '--dark-color': darkColor,
            '--dark-gradient': `linear-gradient(90deg, ${darkColor} 0%, color-mix(in oklch, ${darkColor}, white 30%) 100%)`
          } as React.CSSProperties}
          data-dark-color="true"
          data-use-gradient={useGradient ? "true" : "false"}
        />
      </div>
      <style jsx>{`
        /* Apply dark mode gradient */
        [data-dark-color="true"]:is(.dark [data-dark-color="true"]) {
          background: var(--dark-gradient) !important;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        
        /* For non-gradient mode in dark mode, use solid color */
        [data-dark-color="true"][data-use-gradient="false"]:is(.dark [data-dark-color="true"][data-use-gradient="false"]) {
          background: var(--dark-color) !important;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
      <div className="text-xs text-right mt-1 text-neutral-500 dark:text-neutral-400">
        {made}/{attempted}
      </div>
    </div>
  )
}

// Stat row component for clean display of label/value pairs
function StatRow({
  label,
  value,
  highlight = false
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className={`font-mono ${highlight ? 'font-bold text-base' : 'text-sm'}`}>{value}</span>
    </div>
  )
}

// Team logo component
function TeamLogo({ 
  teamAbbr, 
  size = "normal",
  shape = "circle",
  logoPosition = "left"
}: { 
  teamAbbr: string
  size?: "xs" | "normal" | "large"
  shape?: "circle" | "pill"
  logoPosition?: "left" | "right"
}) {
  // Get the team ID from the abbreviation
  const teamId = getTeamIdFromAbbr(teamAbbr);
  
  // Set dimensions based on size
  const dimensions = {
    xs: { width: 24, height: 24 },
    normal: { width: 40, height: 40 },
    large: { width: 64, height: 64 }
  };
  
  const { width, height } = dimensions[size];
  
  // Use the NBA CDN for team logos
  const logoUrl = `https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`;
  
  // Determine padding classes based on shape and logo position
  let paddingClasses = "";
  if (shape === "pill") {
    paddingClasses = logoPosition === "left" 
      ? "pl-0 pr-3"
      : "pl-3 pr-0";
  }
  
  // For pill shape, we'll show the logo and team abbreviation
  if (shape === "pill") {
    // Logo and text elements
    const logoElement = (
      <div className="flex items-center justify-center rounded-full bg-white/10 p-0.5">
        <Image 
          src={logoUrl}
          alt={`${teamAbbr} logo`}
          width={size === "xs" ? 20 : size === "large" ? 32 : 24}
          height={size === "xs" ? 20 : size === "large" ? 32 : 24}
          className="object-contain"
        />
      </div>
    );
    
    const textElement = (
      <span className="font-bold text-sm">{teamAbbr}</span>
    );
    
    return (
      <div className={`
        flex items-center bg-neutral-800 rounded-full
        ${paddingClasses}
      `}>
        {logoPosition === "left" ? (
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
    );
  }
  
  // For circle shape, just show the logo
  return (
    <div className={`
      flex items-center justify-center overflow-hidden rounded-full
      ${size === "xs" ? "w-6 h-6" :
        size === "large" ? "w-16 h-16" : 
        "w-10 h-10"}
    `}>
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

// Helper function to get team ID from abbreviation
function getTeamIdFromAbbr(abbr: string): string {
  // NBA team IDs mapping
  const teamIds: Record<string, string> = {
    'ATL': '1610612737',
    'BOS': '1610612738',
    'BKN': '1610612751',
    'CHA': '1610612766',
    'CHI': '1610612741',
    'CLE': '1610612739',
    'DAL': '1610612742',
    'DEN': '1610612743',
    'DET': '1610612765',
    'GSW': '1610612744',
    'HOU': '1610612745',
    'IND': '1610612754',
    'LAC': '1610612746',
    'LAL': '1610612747',
    'MEM': '1610612763',
    'MIA': '1610612748',
    'MIL': '1610612749',
    'MIN': '1610612750',
    'NOP': '1610612740',
    'NYK': '1610612752',
    'OKC': '1610612760',
    'ORL': '1610612753',
    'PHI': '1610612755',
    'PHX': '1610612756',
    'POR': '1610612757',
    'SAC': '1610612758',
    'SAS': '1610612759',
    'TOR': '1610612761',
    'UTA': '1610612762',
    'WAS': '1610612764',
  };
  
  return teamIds[abbr] || '';
}

// Team colors using OKLCH color space for better P3 display
function getTeamColors(teamAbbr: string) {
  // Helper function to create dark mode variants with appropriate adjustments
  const adjustForDarkMode = (color: string): string => {
    // Parse the OKLCH color to get components
    const match = color.match(/oklch\(([0-9.]+) ([0-9.]+) ([0-9.]+)\)/);
    if (!match || match.length < 4) return color;
    
    const lightness = Number(match[1]);
    const chroma = Number(match[2]);
    const hue = Number(match[3]);
    
    if (isNaN(lightness) || isNaN(chroma) || isNaN(hue)) return color;
    
    // For dark purples and blues (hue between 240-300), reduce chroma and increase lightness
    if (hue >= 240 && hue <= 300) {
      // Desaturate and lighten dark purples and blues
      return `oklch(${Math.min(lightness + 0.2, 0.9)} ${Math.max(chroma - 0.05, 0.1)} ${hue})`;
    }
    
    // For other colors, just increase lightness slightly
    return `oklch(${Math.min(lightness + 0.1, 0.9)} ${chroma} ${hue})`;
  };

  const colorMap: Record<string, {
    primary: string, 
    secondary: string, 
    accent: string,
    darkPrimary: string,
    darkSecondary: string,
    darkAccent: string
  }> = {
    // Eastern Conference
    'ATL': {
      primary: 'oklch(0.55 0.25 30)', 
      secondary: 'oklch(0.8 0.15 120)', 
      accent: 'oklch(0.2 0.02 240)',
      darkPrimary: 'oklch(0.65 0.25 30)', 
      darkSecondary: 'oklch(0.85 0.15 120)', 
      darkAccent: 'oklch(0.7 0.1 30)'
    },
    'BOS': {
      primary: 'oklch(0.45 0.18 150)', 
      secondary: 'oklch(0.7 0.1 80)', 
      accent: 'oklch(0.4 0.2 30)',
      darkPrimary: 'oklch(0.6 0.15 150)', 
      darkSecondary: 'oklch(0.75 0.1 80)', 
      darkAccent: 'oklch(0.65 0.2 30)'
    },
    'BKN': {
      primary: 'oklch(0.1 0.01 240)', 
      secondary: 'oklch(0.98 0.01 240)', 
      accent: 'oklch(0.6 0.02 240)',
      darkPrimary: 'oklch(0.3 0.01 240)', 
      darkSecondary: 'oklch(0.9 0.01 240)', 
      darkAccent: 'oklch(0.8 0.05 240)'
    },
    'CHA': {
      primary: 'oklch(0.3 0.2 280)', 
      secondary: 'oklch(0.5 0.18 200)', 
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.5 0.15 280)', 
      darkSecondary: 'oklch(0.6 0.15 200)', 
      darkAccent: 'oklch(0.8 0.02 240)'
    },
    'CHI': {
      primary: 'oklch(0.5 0.25 25)', 
      secondary: 'oklch(0.1 0.01 240)', 
      accent: 'oklch(0.98 0.01 240)',
      darkPrimary: 'oklch(0.6 0.25 25)', 
      darkSecondary: 'oklch(0.3 0.01 240)', 
      darkAccent: 'oklch(0.9 0.01 240)'
    },
    'CLE': {
      primary: 'oklch(0.4 0.25 25)', 
      secondary: 'oklch(0.25 0.2 260)', 
      accent: 'oklch(0.8 0.15 80)',
      darkPrimary: 'oklch(0.5 0.25 25)', 
      darkSecondary: 'oklch(0.45 0.15 260)', 
      darkAccent: 'oklch(0.85 0.15 80)'
    },
    'DET': {
      primary: 'oklch(0.5 0.25 25)', 
      secondary: 'oklch(0.4 0.2 260)', 
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.6 0.25 25)', 
      darkSecondary: 'oklch(0.5 0.15 260)', 
      darkAccent: 'oklch(0.8 0.02 240)'
    },
    'IND': {
      primary: 'oklch(0.3 0.2 260)', 
      secondary: 'oklch(0.8 0.15 80)', 
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.5 0.15 260)', 
      darkSecondary: 'oklch(0.85 0.15 80)', 
      darkAccent: 'oklch(0.8 0.02 240)'
    },
    'MIA': {
      primary: 'oklch(0.4 0.25 25)', 
      secondary: 'oklch(0.7 0.15 60)', 
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.5 0.25 25)', 
      darkSecondary: 'oklch(0.75 0.15 60)', 
      darkAccent: 'oklch(0.7 0.1 60)'
    },
    'MIL': {
      primary: 'oklch(0.35 0.18 150)', 
      secondary: 'oklch(0.9 0.05 80)', 
      accent: 'oklch(0.5 0.2 220)',
      darkPrimary: 'oklch(0.5 0.15 150)', 
      darkSecondary: 'oklch(0.95 0.05 80)', 
      darkAccent: 'oklch(0.65 0.15 220)'
    },
    'NYK': {
      primary: 'oklch(0.5 0.2 220)', 
      secondary: 'oklch(0.7 0.15 60)', 
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.6 0.15 220)', 
      darkSecondary: 'oklch(0.75 0.15 60)', 
      darkAccent: 'oklch(0.8 0.02 240)'
    },
    'ORL': {
      primary: 'oklch(0.5 0.2 220)', 
      secondary: 'oklch(0.8 0.02 240)', 
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.6 0.15 220)', 
      darkSecondary: 'oklch(0.9 0.02 240)', 
      darkAccent: 'oklch(0.7 0.1 220)'
    },
    'PHI': {
      primary: 'oklch(0.5 0.2 220)', 
      secondary: 'oklch(0.5 0.25 25)', 
      accent: 'oklch(0.3 0.2 260)',
      darkPrimary: 'oklch(0.6 0.15 220)', 
      darkSecondary: 'oklch(0.6 0.25 25)', 
      darkAccent: 'oklch(0.5 0.15 260)'
    },
    'TOR': {
      primary: 'oklch(0.5 0.25 25)', 
      secondary: 'oklch(0.1 0.01 240)', 
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.6 0.25 25)', 
      darkSecondary: 'oklch(0.3 0.01 240)', 
      darkAccent: 'oklch(0.8 0.02 240)'
    },
    'WAS': {
      primary: 'oklch(0.3 0.2 260)', 
      secondary: 'oklch(0.5 0.25 25)', 
      accent: 'oklch(0.8 0.02 240)',
      darkPrimary: 'oklch(0.5 0.15 260)', 
      darkSecondary: 'oklch(0.6 0.25 25)', 
      darkAccent: 'oklch(0.9 0.02 240)'
    },
    
    // Western Conference
    'DAL': {
      primary: 'oklch(0.45 0.2 220)', 
      secondary: 'oklch(0.3 0.2 260)', 
      accent: 'oklch(0.75 0.05 240)',
      darkPrimary: 'oklch(0.6 0.15 220)', 
      darkSecondary: 'oklch(0.5 0.15 260)', 
      darkAccent: 'oklch(0.85 0.05 240)'
    },
    'DEN': {
      primary: 'oklch(0.25 0.15 260)', 
      secondary: 'oklch(0.8 0.15 80)', 
      accent: 'oklch(0.4 0.25 25)',
      darkPrimary: 'oklch(0.45 0.1 260)', 
      darkSecondary: 'oklch(0.85 0.15 80)', 
      darkAccent: 'oklch(0.5 0.25 25)'
    },
    'GSW': {
      primary: 'oklch(0.45 0.2 240)', 
      secondary: 'oklch(0.8 0.15 80)', 
      accent: 'oklch(0.2 0.02 240)',
      darkPrimary: 'oklch(0.6 0.15 240)', 
      darkSecondary: 'oklch(0.85 0.15 80)', 
      darkAccent: 'oklch(0.7 0.1 80)'
    },
    'HOU': {
      primary: 'oklch(0.5 0.25 25)', 
      secondary: 'oklch(0.1 0.01 240)', 
      accent: 'oklch(0.8 0.02 240)',
      darkPrimary: 'oklch(0.6 0.25 25)', 
      darkSecondary: 'oklch(0.3 0.01 240)', 
      darkAccent: 'oklch(0.9 0.02 240)'
    },
    'LAC': {
      primary: 'oklch(0.5 0.25 25)', 
      secondary: 'oklch(0.45 0.2 240)', 
      accent: 'oklch(0.7 0.02 240)',
      darkPrimary: 'oklch(0.6 0.25 25)', 
      darkSecondary: 'oklch(0.6 0.15 240)', 
      darkAccent: 'oklch(0.8 0.02 240)'
    },
    'LAL': {
      primary: 'oklch(0.4 0.2 300)', 
      secondary: 'oklch(0.75 0.15 80)', 
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.55 0.15 300)', 
      darkSecondary: 'oklch(0.8 0.15 80)', 
      darkAccent: 'oklch(0.7 0.1 80)'
    },
    'MEM': {
      primary: 'oklch(0.6 0.1 260)', 
      secondary: 'oklch(0.2 0.15 260)', 
      accent: 'oklch(0.7 0.15 80)',
      darkPrimary: 'oklch(0.7 0.1 260)', 
      darkSecondary: 'oklch(0.4 0.1 260)', 
      darkAccent: 'oklch(0.75 0.15 80)'
    },
    'MIN': {
      primary: 'oklch(0.25 0.15 260)', 
      secondary: 'oklch(0.45 0.2 220)', 
      accent: 'oklch(0.6 0.15 140)',
      darkPrimary: 'oklch(0.45 0.1 260)', 
      darkSecondary: 'oklch(0.6 0.15 220)', 
      darkAccent: 'oklch(0.7 0.15 140)'
    },
    'NOP': {
      primary: 'oklch(0.25 0.15 260)', 
      secondary: 'oklch(0.5 0.25 25)', 
      accent: 'oklch(0.6 0.1 80)',
      darkPrimary: 'oklch(0.45 0.1 260)', 
      darkSecondary: 'oklch(0.6 0.25 25)', 
      darkAccent: 'oklch(0.7 0.1 80)'
    },
    'OKC': {
      primary: 'oklch(0.5 0.2 220)', 
      secondary: 'oklch(0.5 0.25 25)', 
      accent: 'oklch(0.3 0.2 260)',
      darkPrimary: 'oklch(0.6 0.15 220)', 
      darkSecondary: 'oklch(0.6 0.25 25)', 
      darkAccent: 'oklch(0.5 0.15 260)'
    },
    'PHX': {
      primary: 'oklch(0.3 0.2 280)', 
      secondary: 'oklch(0.6 0.2 40)', 
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.5 0.15 280)', 
      darkSecondary: 'oklch(0.7 0.2 40)', 
      darkAccent: 'oklch(0.75 0.15 40)'
    },
    'POR': {
      primary: 'oklch(0.5 0.25 25)', 
      secondary: 'oklch(0.1 0.01 240)', 
      accent: 'oklch(0.98 0.01 240)',
      darkPrimary: 'oklch(0.6 0.25 25)', 
      darkSecondary: 'oklch(0.3 0.01 240)', 
      darkAccent: 'oklch(0.9 0.01 240)'
    },
    'SAC': {
      primary: 'oklch(0.4 0.2 300)', 
      secondary: 'oklch(0.6 0.05 240)', 
      accent: 'oklch(0.1 0.01 240)',
      darkPrimary: 'oklch(0.55 0.15 300)', 
      darkSecondary: 'oklch(0.7 0.05 240)', 
      darkAccent: 'oklch(0.7 0.1 300)'
    },
    'SAS': {
      primary: 'oklch(0.8 0.02 240)', 
      secondary: 'oklch(0.1 0.01 240)', 
      accent: 'oklch(0.6 0.25 350)',
      darkPrimary: 'oklch(0.9 0.02 240)', 
      darkSecondary: 'oklch(0.3 0.01 240)', 
      darkAccent: 'oklch(0.7 0.2 350)'
    },
    'UTA': {
      primary: 'oklch(0.3 0.2 260)', 
      secondary: 'oklch(0.35 0.18 150)', 
      accent: 'oklch(0.7 0.15 60)',
      darkPrimary: 'oklch(0.5 0.15 260)', 
      darkSecondary: 'oklch(0.5 0.15 150)', 
      darkAccent: 'oklch(0.75 0.15 60)'
    },
    
    // Default fallback
    'DEFAULT': {
      primary: 'oklch(0.45 0.2 240)', 
      secondary: 'oklch(0.5 0.25 25)', 
      accent: 'oklch(0.45 0.2 240)',
      darkPrimary: 'oklch(0.6 0.15 240)', 
      darkSecondary: 'oklch(0.6 0.25 25)', 
      darkAccent: 'oklch(0.6 0.15 240)'
    },
  };
  
  // Get team colors with fallback to DEFAULT
  const team = colorMap[teamAbbr] || colorMap['DEFAULT'];
  
  // TypeScript needs reassurance about the type
  const safeTeam = team as NonNullable<typeof team>;
  
  // Return the team colors with adjusted dark mode variants
  return {
    ...safeTeam,
    darkPrimary: adjustForDarkMode(safeTeam.darkPrimary),
    darkSecondary: adjustForDarkMode(safeTeam.darkSecondary),
    darkAccent: adjustForDarkMode(safeTeam.darkAccent)
  };
}
