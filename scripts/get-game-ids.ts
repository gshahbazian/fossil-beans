const NBA_GAME_LOG_URL = 'https://stats.nba.com/stats/leaguegamelog'
const NBA_HEADERS = {
  accept: 'application/json, text/plain, */*',
  origin: 'https://www.nba.com',
  referer: 'https://www.nba.com/',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
}

type ResultSet = {
  name: string
  headers: string[]
  rowSet: unknown[][]
}

type LeagueGameLog = {
  resultSets: ResultSet[]
}

type GameLogEntry = {
  GAME_ID: string
}

const dateArg = process.argv[2]
if (!dateArg) {
  console.error('Usage: tsx scripts/get-game-ids.ts YYYY-MM-DD')
  process.exit(1)
}

const gameIds = await fetchGameIdsForDate(dateArg)
process.stdout.write(gameIds.join(','))

export {}

async function fetchGameIdsForDate(date: string) {
  assertDateString(date)

  const url = new URL(process.env.NBA_GAME_LOG_URL ?? NBA_GAME_LOG_URL)
  url.search = new URLSearchParams({
    Counter: '1000',
    DateFrom: formatGameLogDate(date),
    DateTo: formatGameLogDate(date),
    Direction: 'DESC',
    ISTRound: '',
    LeagueID: '00',
    PlayerOrTeam: 'T',
    Season: '2025-26',
    SeasonType: 'Regular Season',
    Sorter: 'DATE',
  }).toString()

  const response = await fetch(url, {
    headers: NBA_HEADERS,
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch NBA game log: ${response.status}`)
  }

  const data = (await response.json()) as LeagueGameLog
  return Array.from(new Set(parseGameLog(data).map((game) => game.GAME_ID)))
}

function parseGameLog(data: LeagueGameLog) {
  const resultSet = data.resultSets.find((set) => set.name === 'LeagueGameLog')
  if (!resultSet) {
    throw new Error('LeagueGameLog result set not found')
  }

  return resultSet.rowSet.map((row) => {
    const entry: Record<string, unknown> = {}
    for (const [index, header] of resultSet.headers.entries()) {
      entry[header] = row[index]
    }
    return entry as GameLogEntry
  })
}

function formatGameLogDate(date: string) {
  const parsed = new Date(`${date}T12:00:00-07:00`)
  return parsed.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'America/Los_Angeles',
  })
}

function assertDateString(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return

  throw new Error(`Invalid date "${date}". Expected YYYY-MM-DD.`)
}
