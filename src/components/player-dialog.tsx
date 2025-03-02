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
import { X } from 'lucide-react'

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
  
  // Calculate field goal and free throw percentages for display
  const fgPercentage = player.fieldGoalsAttempted && player.fieldGoalsAttempted > 0
    ? Math.round((player.fieldGoalsMade || 0) / player.fieldGoalsAttempted * 100)
    : 0
    
  const ftPercentage = player.freeThrowsAttempted && player.freeThrowsAttempted > 0
    ? Math.round((player.freeThrowsMade || 0) / player.freeThrowsAttempted * 100)
    : 0
    
  // Calculate 3-point percentage
  const threePointPercentage = player.threePointersAttempted && player.threePointersAttempted > 0
    ? Math.round((player.threePointersMade || 0) / player.threePointersAttempted * 100)
    : 0

  // Player image URL for both the main image and the background
  const playerImageUrl = `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.playerId}.png`

  // Cast player to extended type to access additional properties
  const extendedPlayer = player as ExtendedPlayerStat

  // For simplicity, just use the home team colors since we don't have reliable team ID matching
  const playerTeam = gameWithTeams.homeTeam
  const opposingTeam = gameWithTeams.awayTeam
  
  // Get team colors with default fallback
  const teamColors = getTeamColors(playerTeam.abbreviation)
  const primaryColor = teamColors?.primary || '#17408B'
  const secondaryColor = teamColors?.secondary || '#C9082A'

  // Create gradient for header only, remove subtle gradient
  const headerGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-lg [&>button]:hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Player Stats: {player.playerName}</DialogTitle>
          <DialogDescription>Stats for {player.playerName}</DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex flex-col">
          {/* Header with player info */}
          <div 
            className="relative h-56 overflow-hidden"
            style={{
              background: headerGradient,
              marginBottom: '-1px', /* Ensure no gap between elements */
            }}
          >
            {/* Custom close button with improved visibility */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-5 z-50 rounded-full p-2 bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Team logo watermark */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
              <div className="opacity-10">
                <Image 
                  src={`https://cdn.nba.com/logos/nba/${getTeamIdFromAbbr(playerTeam.abbreviation)}/global/L/logo.svg`}
                  alt={`${playerTeam.abbreviation} logo`}
                  width={300}
                  height={300}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            {/* Player image */}
            <div className="absolute bottom-0 right-0 h-48 flex items-end">
              <Image
                src={playerImageUrl}
                alt={`${player.playerName} headshot`}
                className="h-full w-auto object-contain drop-shadow-lg"
                width={260}
                height={190}
                priority
              />
            </div>
            
            {/* Player info */}
            <div className="absolute bottom-0 left-0 p-5 text-white z-10">
              <div className="flex items-center space-x-2 mb-1">
                <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium">
                  #{extendedPlayer.jerseyNum || '00'}
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
            className="bg-neutral-900 text-white px-5 py-3 flex justify-between items-center"
            style={{ marginTop: '-1px' }} /* Ensure no gap between elements */
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
                <span className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 uppercase text-[10px] font-bold tracking-wider">
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
                size="large"
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
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm mb-3">
              <h3 className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 mb-3">
                Shooting
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <ShootingStatBar 
                  label="FG" 
                  made={player.fieldGoalsMade || 0} 
                  attempted={player.fieldGoalsAttempted || 0} 
                  percentage={fgPercentage}
                  color={primaryColor}
                  useGradient={false}
                />
                <ShootingStatBar 
                  label="3PT" 
                  made={player.threePointersMade || 0} 
                  attempted={player.threePointersAttempted || 0} 
                  percentage={threePointPercentage}
                  color={primaryColor}
                  useGradient={false}
                />
                <ShootingStatBar 
                  label="FT" 
                  made={player.freeThrowsMade || 0} 
                  attempted={player.freeThrowsAttempted || 0} 
                  percentage={ftPercentage}
                  color={primaryColor}
                  useGradient={false}
                />
              </div>
            </div>
            
            {/* Additional stats in a clean grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
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
              
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
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
  size = "normal"
}: {
  label: string
  value: React.ReactNode
  subValue?: string | null
  bgGradient?: string
  size?: "normal" | "large"
}) {
  const hasBg = !!bgGradient
  
  return (
    <div 
      className={`
        rounded-xl overflow-hidden shadow-sm
        ${hasBg ? 'text-white' : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'}
      `}
      style={hasBg ? { backgroundColor: bgGradient } : {}}
    >
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
  useGradient = false
}: {
  label: string
  made: number
  attempted: number
  percentage: number
  color: string
  useGradient?: boolean
}) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-sm font-mono font-bold">{percentage}%</span>
      </div>
      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full opacity-80"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
            minWidth: made > 0 ? '4px' : '0'
          }}
        />
      </div>
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
  
  return teamIds[abbr] || '1610612747'; // Default to Lakers if not found
}

// Helper function to get team colors (placeholder)
function getTeamColors(teamAbbr: string) {
  // This is just a placeholder that assigns colors based on team abbreviation
  const colorMap: Record<string, {primary: string, secondary: string, accent: string}> = {
    // Eastern Conference
    'ATL': {primary: '#E03A3E', secondary: '#C1D32F', accent: '#26282A'},
    'BOS': {primary: '#007A33', secondary: '#BA9653', accent: '#963821'},
    'BKN': {primary: '#000000', secondary: '#FFFFFF', accent: '#777D84'},
    'CHA': {primary: '#1D1160', secondary: '#00788C', accent: '#A1A1A4'},
    'CHI': {primary: '#CE1141', secondary: '#000000', accent: '#FFFFFF'},
    'CLE': {primary: '#860038', secondary: '#041E42', accent: '#FDBB30'},
    'DET': {primary: '#C8102E', secondary: '#1D42BA', accent: '#BEC0C2'},
    'IND': {primary: '#002D62', secondary: '#FDBB30', accent: '#BEC0C2'},
    'MIA': {primary: '#98002E', secondary: '#F9A01B', accent: '#000000'},
    'MIL': {primary: '#00471B', secondary: '#EEE1C6', accent: '#0077C0'},
    'NYK': {primary: '#006BB6', secondary: '#F58426', accent: '#BEC0C2'},
    'ORL': {primary: '#0077C0', secondary: '#C4CED4', accent: '#000000'},
    'PHI': {primary: '#006BB6', secondary: '#ED174C', accent: '#002B5C'},
    'TOR': {primary: '#CE1141', secondary: '#000000', accent: '#A1A1A4'},
    'WAS': {primary: '#002B5C', secondary: '#E31837', accent: '#C4CED4'},
    
    // Western Conference
    'DAL': {primary: '#00538C', secondary: '#002B5E', accent: '#B8C4CA'},
    'DEN': {primary: '#0E2240', secondary: '#FEC524', accent: '#8B2131'},
    'GSW': {primary: '#1D428A', secondary: '#FFC72C', accent: '#26282A'},
    'HOU': {primary: '#CE1141', secondary: '#000000', accent: '#C4CED4'},
    'LAC': {primary: '#C8102E', secondary: '#1D428A', accent: '#BEC0C2'},
    'LAL': {primary: '#552583', secondary: '#FDB927', accent: '#000000'},
    'MEM': {primary: '#5D76A9', secondary: '#12173F', accent: '#F5B112'},
    'MIN': {primary: '#0C2340', secondary: '#236192', accent: '#78BE20'},
    'NOP': {primary: '#0C2340', secondary: '#C8102E', accent: '#85714D'},
    'OKC': {primary: '#007AC1', secondary: '#EF3B24', accent: '#002D62'},
    'PHX': {primary: '#1D1160', secondary: '#E56020', accent: '#000000'},
    'POR': {primary: '#E03A3E', secondary: '#000000', accent: '#FFFFFF'},
    'SAC': {primary: '#5A2D81', secondary: '#63727A', accent: '#000000'},
    'SAS': {primary: '#C4CED4', secondary: '#000000', accent: '#EF426F'},
    'UTA': {primary: '#002B5C', secondary: '#00471B', accent: '#F9A01B'},
    
    // Default fallback
    'DEFAULT': {primary: '#17408B', secondary: '#C9082A', accent: '#17408B'},
  }
  
  return colorMap[teamAbbr] || colorMap['DEFAULT']
}
