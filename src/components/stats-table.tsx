'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type GamePlayerStat } from '@/server/db/queries'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { trimIntervalToMinsSecs } from '@/lib/trim-interval'
import { formatPercentage } from '@/lib/format-percentage'

export default function StatsTable({
  stats,
  onPlayerClicked,
}: {
  stats: GamePlayerStat[]
  onPlayerClicked: (stat: GamePlayerStat) => void
}) {
  return (
    <Table>
      <TableHeader>
        <HeaderFooter />
      </TableHeader>
      <TableBody>
        {stats.map((stat) => (
          <StatRow
            key={stat.playerId}
            stat={stat}
            onPlayerClicked={onPlayerClicked}
          />
        ))}
      </TableBody>
      <TableFooter>
        <HeaderFooter hideName />
      </TableFooter>
    </Table>
  )
}

function HeaderFooter({ hideName = false }: { hideName?: boolean }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableHead className="bg-background sticky left-0 z-1">
        <span className="invisible truncate border-r font-medium" aria-hidden>
          Name
        </span>
        <span
          className={cn(
            'absolute top-0 right-0 bottom-0 left-0 flex items-center border-r px-2 font-medium',
            hideName && 'invisible'
          )}
        >
          Name
        </span>
      </TableHead>
      <TableHead className="text-right">Mins</TableHead>
      <TableHead className="text-right">Pts</TableHead>
      <TableHead className="text-right">3pt</TableHead>
      <TableHead className="text-right">Reb</TableHead>
      <TableHead className="text-right">Ast</TableHead>
      <TableHead className="text-right">Stl</TableHead>
      <TableHead className="text-right">Blk</TableHead>
      <TableHead className="text-right">Fg%</TableHead>
      <TableHead className="text-right">Ft%</TableHead>
      <TableHead className="text-right">TO</TableHead>
    </TableRow>
  )
}

function NumberCell({ children }: { children: React.ReactNode }) {
  return <TableCell className="text-right font-mono">{children}</TableCell>
}

function PercentageValue({
  numerator,
  denominator,
}: {
  numerator: number
  denominator: number
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{formatPercentage(numerator, denominator)}</span>
        </TooltipTrigger>
        <TooltipContent>
          <span>
            {numerator} / {denominator}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function StatRow({
  stat,
  onPlayerClicked,
}: {
  stat: GamePlayerStat
  onPlayerClicked: (stat: GamePlayerStat) => void
}) {
  return (
    <TableRow
      key={stat.player.playerId}
      onClick={() => onPlayerClicked(stat)}
      className="cursor-pointer [&_td]:h-9 [&_td]:py-0"
    >
      <TableCell className="sticky left-0 z-1 bg-neutral-50 dark:bg-neutral-900">
        <span className="invisible truncate border-r font-medium" aria-hidden>
          {stat.player.playerName}
        </span>
        <span className="absolute top-0 right-0 bottom-0 left-0 flex items-center border-r px-2 font-medium">
          {stat.player.playerName}
        </span>
      </TableCell>
      <NumberCell>
        {trimIntervalToMinsSecs(stat.minutesPlayed ?? '00:00')}
      </NumberCell>
      <NumberCell>{stat.points}</NumberCell>
      <NumberCell>{stat.threePointersMade}</NumberCell>
      <NumberCell>{stat.rebounds}</NumberCell>
      <NumberCell>{stat.assists}</NumberCell>
      <NumberCell>{stat.steals}</NumberCell>
      <NumberCell>{stat.blocks}</NumberCell>
      <NumberCell>
        {stat.fieldGoalsAttempted && stat.fieldGoalsAttempted > 0 ? (
          <PercentageValue
            numerator={stat.fieldGoalsMade ?? 0}
            denominator={stat.fieldGoalsAttempted}
          />
        ) : (
          <span>-</span>
        )}
      </NumberCell>
      <NumberCell>
        {stat.freeThrowsAttempted && stat.freeThrowsAttempted > 0 ? (
          <PercentageValue
            numerator={stat.freeThrowsMade ?? 0}
            denominator={stat.freeThrowsAttempted}
          />
        ) : (
          <span>-</span>
        )}
      </NumberCell>
      <NumberCell>{stat.turnovers}</NumberCell>
    </TableRow>
  )
}
