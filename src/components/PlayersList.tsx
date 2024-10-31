import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function PlayersList() {
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
        <TableRow>
          <TableCell className="font-medium">Jayson Tatum</TableCell>
          <NumberCell>43:22</NumberCell>
          <NumberCell>23</NumberCell>
          <NumberCell>5</NumberCell>
          <NumberCell>8</NumberCell>
          <NumberCell>4</NumberCell>
          <NumberCell>5</NumberCell>
          <NumberCell>0</NumberCell>
          <NumberCell>40%</NumberCell>
          <NumberCell>80%</NumberCell>
          <NumberCell>3</NumberCell>
        </TableRow>
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
