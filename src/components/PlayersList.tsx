'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BoxScore, OnPlayerClicked } from '@/lib/types'

export default function PlayersList({
  scores,
  onPlayerClicked,
}: {
  scores: BoxScore[]
  onPlayerClicked: OnPlayerClicked
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
        {scores.map((score) => (
          <TableRow
            key={score.name}
            onClick={() => onPlayerClicked(score)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium">{score.name}</TableCell>
            <NumberCell>{score.mins}</NumberCell>
            <NumberCell>{score.pts}</NumberCell>
            <NumberCell>{score.threePt}</NumberCell>
            <NumberCell>{score.reb}</NumberCell>
            <NumberCell>{score.ast}</NumberCell>
            <NumberCell>{score.stl}</NumberCell>
            <NumberCell>{score.blk}</NumberCell>
            <NumberCell>{score.fgPct}%</NumberCell>
            <NumberCell>{score.ftPct}%</NumberCell>
            <NumberCell>{score.to}</NumberCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function NumberCell({ children }: { children: React.ReactNode }) {
  return (
    <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
      {children}
    </TableCell>
  )
}
