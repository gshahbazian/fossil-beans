import ClientPage from '@/app/ClientPage'
import { BoxScore, Game } from '@/lib/types'

const topLines: BoxScore[] = [
  {
    id: '1628369',
    name: 'Jayson Tatum',
    team: 'BOS',
    mins: 36,
    pts: 30,
    threePt: 2,
    reb: 8,
    ast: 4,
    stl: 1,
    blk: 1,
    fgPct: 50,
    fgAttempts: 20,
    ftPct: 100,
    ftAttempts: 10,
    to: 2,
  },
  {
    id: '1627759',
    name: 'Jaylen Brown',
    team: 'BOS',
    mins: 36,
    pts: 28,
    threePt: 3,
    reb: 6,
    ast: 4,
    stl: 2,
    blk: 0,
    fgPct: 45,
    fgAttempts: 20,
    ftPct: 100,
    ftAttempts: 10,
    to: 1,
  },
  {
    id: '203935',
    name: 'Marcus Smart',
    team: 'BOS',
    mins: 36,
    pts: 20,
    threePt: 4,
    reb: 4,
    ast: 10,
    stl: 3,
    blk: 0,
    fgPct: 50,
    fgAttempts: 10,
    ftPct: 100,
    ftAttempts: 10,
    to: 3,
  },
]

const game: Game = {
  homeTeam: 'BOS',
  homeScore: [
    {
      id: '1628369',
      name: 'Jayson Tatum',
      team: 'BOS',
      mins: 36,
      pts: 30,
      threePt: 2,
      reb: 8,
      ast: 4,
      stl: 1,
      blk: 1,
      fgPct: 50,
      fgAttempts: 20,
      ftPct: 100,
      ftAttempts: 10,
      to: 2,
    },
    {
      id: '1627759',
      name: 'Jaylen Brown',
      team: 'BOS',
      mins: 36,
      pts: 28,
      threePt: 3,
      reb: 6,
      ast: 4,
      stl: 2,
      blk: 0,
      fgPct: 45,
      fgAttempts: 20,
      ftPct: 100,
      ftAttempts: 10,
      to: 1,
    },
    {
      id: '203935',
      name: 'Marcus Smart',
      team: 'BOS',
      mins: 36,
      pts: 20,
      threePt: 4,
      reb: 4,
      ast: 10,
      stl: 3,
      blk: 0,
      fgPct: 50,
      fgAttempts: 10,
      ftPct: 100,
      ftAttempts: 10,
      to: 3,
    },
  ],

  visitorTeam: 'NYK',
  visitorScore: [
    {
      id: '203944',
      name: 'Julius Randle',
      team: 'NYK',
      mins: 36,
      pts: 25,
      threePt: 1,
      reb: 10,
      ast: 6,
      stl: 1,
      blk: 2,
      fgPct: 45,
      fgAttempts: 20,
      ftPct: 100,
      ftAttempts: 10,
      to: 3,
    },
    {
      id: '1629628',
      name: 'RJ Barrett',
      team: 'NYK',
      mins: 36,
      pts: 20,
      threePt: 2,
      reb: 6,
      ast: 4,
      stl: 1,
      blk: 0,
      fgPct: 45,
      fgAttempts: 20,
      ftPct: 100,
      ftAttempts: 10,
      to: 2,
    },
    {
      id: '201565',
      name: 'Derrick Rose',
      team: 'NYK',
      mins: 36,
      pts: 15,
      threePt: 1,
      reb: 4,
      ast: 6,
      stl: 2,
      blk: 0,
      fgPct: 50,
      fgAttempts: 10,
      ftPct: 100,
      ftAttempts: 10,
      to: 1,
    },
  ],
}

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center p-4 pb-8 gap-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2">
        <h1 className="text-4xl font-bold text-center">fossil beans</h1>

        <h2 className="text-2xl font-bold">top lines on 10/30</h2>
        <ClientPage topLines={topLines} games={[game]} />
      </main>
    </div>
  )
}
