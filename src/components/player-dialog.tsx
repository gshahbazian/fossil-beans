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
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

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
  const playerImageUrl = `https://cdn.nba.com/headshots/nba/latest/260x190/${player.playerId}.png`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl">
        <VisuallyHidden.Root>
          <DialogDescription>Stats for {player.playerName}</DialogDescription>
        </VisuallyHidden.Root>

        {/* Header with player info */}
        <div className="relative overflow-hidden">
          {/* Blurred background image */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 scale-110 blur-2xl opacity-60 bg-center bg-cover"
              style={{ 
                backgroundImage: `url(${playerImageUrl})`,
                backgroundPosition: 'center 30%',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              }}
            />
            {/* Overlay to enhance contrast and readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
          </div>
          
          {/* Player image with transparent background - positioned at bottom */}
          <div className="relative flex justify-center h-56 z-10 pt-12 pb-1">
            <div className="absolute bottom-0 h-36">
              <Image
                src={playerImageUrl}
                alt={`${player.playerName} headshot`}
                className="w-auto h-full object-contain object-bottom filter drop-shadow-lg"
                width={195}
                height={142}
                priority
              />
            </div>
          </div>
          
          {/* Player name and close button */}
          <DialogHeader className="absolute top-0 left-0 right-0 z-20 p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white drop-shadow-md">
                {player.playerName}
              </DialogTitle>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 bg-black/20 text-white hover:bg-black/40 hover:text-white backdrop-blur-sm"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>
        </div>

        {/* Bento-style grid for stats */}
        <div className="py-1 px-4">
          {/* Key stats in bento grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <BentoStat 
              label="PTS" 
              value={player.points} 
              className="bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-sm"
              size="large"
            />
            <BentoStat 
              label="REB" 
              value={player.rebounds} 
              className="bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-sm"
              size="large"
            />
            <BentoStat 
              label="AST" 
              value={player.assists} 
              className="bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-sm"
              size="large"
            />
          </div>
          
          {/* Two vertical cards side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Game activity stats card */}
            <div className="bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl p-4 border border-black/5 dark:border-white/5">
              <h3 className="text-xs font-semibold mb-3 text-neutral-500 dark:text-neutral-400 uppercase">Game Activity</h3>
              <div className="grid grid-cols-1 gap-y-3">
                <StatItem label="Minutes" value={trimmedMinutes} />
                <StatItem label="Steals" value={player.steals} />
                <StatItem label="Blocks" value={player.blocks} />
                <StatItem label="Turnovers" value={player.turnovers} />
              </div>
            </div>
            
            {/* Shooting stats card */}
            <div className="bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl p-4 border border-black/5 dark:border-white/5">
              <h3 className="text-xs font-semibold mb-3 text-neutral-500 dark:text-neutral-400 uppercase">Shooting</h3>
              <div className="grid grid-cols-1 gap-y-3">
                <StatItem 
                  label="Field Goals" 
                  value={`${player.fieldGoalsMade || 0}/${player.fieldGoalsAttempted || 0}`} 
                  subValue={fgPercentage > 0 ? `${fgPercentage}%` : null} 
                />
                <StatItem 
                  label="Free Throws" 
                  value={`${player.freeThrowsMade || 0}/${player.freeThrowsAttempted || 0}`} 
                  subValue={ftPercentage > 0 ? `${ftPercentage}%` : null} 
                />
                <StatItem 
                  label="3-Pointers" 
                  value={`${player.threePointersMade || 0}/${player.threePointersAttempted || 0}`} 
                  subValue={threePointPercentage > 0 ? `${threePointPercentage}%` : null}
                />
                <StatItem 
                  label="3PT Efficiency" 
                  value={player.threePointersAttempted && player.threePointersAttempted > 0 
                    ? `${threePointPercentage}%` 
                    : '0%'} 
                  subValue={player.threePointersMade && player.threePointersMade > 0 
                    ? `${player.threePointersMade} made` 
                    : player.threePointersAttempted && player.threePointersAttempted > 0 
                      ? '0 made' 
                      : null}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Game info footer */}
        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <div className="flex flex-row justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold">
                {gameWithTeams.awayTeam.abbreviation}
                <span className="font-mono font-normal mx-1">
                  {gameWithTeams.game.awayScore}-{gameWithTeams.game.homeScore}
                </span>
                {gameWithTeams.homeTeam.abbreviation}
              </span>
              {gameWithTeams.game.gameStatus && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {gameWithTeams.game.gameStatus}
                </span>
              )}
            </div>

            <span className="text-neutral-500 dark:text-neutral-400">
              {gameWithTeams.game.gameTime.toLocaleString('en-US', {
                day: 'numeric',
                month: 'numeric',
                year: '2-digit',
                timeZone: 'America/Los_Angeles',
              })}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Bento-style stat component
function BentoStat({
  label,
  value,
  subValue = null,
  className = "",
  size = "normal"
}: {
  label: string
  value: React.ReactNode
  subValue?: string | null
  className?: string
  size?: "normal" | "large"
}) {
  return (
    <div className={`flex flex-col justify-center items-center p-3 rounded-xl border border-black/5 dark:border-white/5 ${className}`}>
      <span className={`font-mono font-bold ${size === "large" ? "text-3xl" : "text-xl"}`}>
        {value || '0'}
      </span>
      {subValue && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {subValue}
        </span>
      )}
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
        {label}
      </span>
    </div>
  )
}

// Stat item for horizontal cards
function StatItem({
  label,
  value,
  subValue = null,
}: {
  label: string
  value: React.ReactNode
  subValue?: string | null
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
      <div className="flex items-baseline">
        <span className="font-mono text-sm font-semibold">{value || '0'}</span>
        {subValue && (
          <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
            {subValue}
          </span>
        )}
      </div>
    </div>
  )
}
