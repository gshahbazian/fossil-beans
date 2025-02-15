'use client'
import {
  Table,
  TableBody,
  TableCell,
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
        <TableRow>
          <TableHead>Name</TableHead>
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
    </Table>
  )
}

function NumberCell({ children }: { children: React.ReactNode }) {
  return <TableCell className="text-right font-mono">{children}</TableCell>
}

const decimalFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

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
          <span>{decimalFormat.format((numerator / denominator) * 100)}</span>
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

// https://youmightnotneed.com/lodash/#trimStart
const trimStart = (str: string, c = '\\s') =>
  str.replace(new RegExp(`^([${c}]*)(.*)$`), '$2')

function StatRow({
  stat,
  onPlayerClicked,
}: {
  stat: GamePlayerStat
  onPlayerClicked: (stat: GamePlayerStat) => void
}) {
  const trimmedHoursOffMinutes = stat.minutesPlayed
    ? trimStart(stat.minutesPlayed, '00:')
    : '00:00'

  const trimmedMinutes = trimmedHoursOffMinutes.split('.')[0]

  return (
    <TableRow
      key={stat.playerName}
      onClick={() => onPlayerClicked(stat)}
      className="cursor-pointer"
    >
      <TableCell className="truncate font-medium">{stat.playerName}</TableCell>
      <NumberCell>{trimmedMinutes}</NumberCell>
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
