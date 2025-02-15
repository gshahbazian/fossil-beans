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
          <TableRow
            key={stat.playerName}
            onClick={() => onPlayerClicked(stat)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium">{stat.playerName}</TableCell>
            <NumberCell>{stat.minutesPlayed}</NumberCell>
            <NumberCell>{stat.points}</NumberCell>
            <NumberCell>{stat.threePointersMade}</NumberCell>
            <NumberCell>{stat.rebounds}</NumberCell>
            <NumberCell>{stat.assists}</NumberCell>
            <NumberCell>{stat.steals}</NumberCell>
            <NumberCell>{stat.blocks}</NumberCell>
            <NumberCell>
              {stat.fieldGoalsAttempted && stat.fieldGoalsAttempted > 0 && (
                <PercentageValue
                  numerator={stat.fieldGoalsMade ?? 0}
                  denominator={stat.fieldGoalsAttempted}
                />
              )}
            </NumberCell>
            <NumberCell>
              {stat.freeThrowsAttempted && stat.freeThrowsAttempted > 0 && (
                <PercentageValue
                  numerator={stat.freeThrowsMade ?? 0}
                  denominator={stat.freeThrowsAttempted}
                />
              )}
            </NumberCell>
            <NumberCell>{stat.turnovers}</NumberCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
  return `${((numerator / denominator) * 100).toFixed(2)}%`
}
