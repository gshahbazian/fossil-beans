const NBA_GAME_LOG_URL = 'https://stats.nba.com/stats/leaguegamelog'
const NBA_FETCH_TIMEOUT_MS = 15_000
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

/**
 * Fetch the unique NBA game IDs played on a given PST date (YYYY-MM-DD) from
 * the league game log. Shared by the Worker insert job and the standalone
 * `scripts/get-game-ids.ts` seeding script.
 */
export async function fetchGameIdsForDate(
  date: string,
  options: { baseUrl?: string; timeoutMs?: number } = {}
) {
  assertDateString(date)

  const url = new URL(options.baseUrl ?? NBA_GAME_LOG_URL)
  url.search = new URLSearchParams({
    Counter: '1000',
    DateFrom: formatGameLogDate(date),
    DateTo: formatGameLogDate(date),
    Direction: 'DESC',
    ISTRound: '',
    LeagueID: '00',
    PlayerOrTeam: 'T',
    Season: getNbaSeason(date),
    SeasonType: 'Regular Season',
    Sorter: 'DATE',
  }).toString()

  const response = await fetch(url, {
    headers: NBA_HEADERS,
    signal: AbortSignal.timeout(options.timeoutMs ?? NBA_FETCH_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch NBA game log: ${response.status}`)
  }

  const data = (await response.json()) as LeagueGameLog
  return Array.from(new Set(parseGameLog(data).map((game) => game.GAME_ID)))
}

/**
 * NBA season label (e.g. "2025-26") for a PST calendar date. A season that
 * starts in October of year Y is labelled `${Y}-${(Y + 1) % 100}`, so dates
 * in Jan–Sep belong to the season that started the previous October.
 */
export function getNbaSeason(date: string) {
  const [year, month] = date.split('-').map(Number)
  const startYear = month >= 10 ? year : year - 1
  const endYear = (startYear + 1) % 100
  return `${startYear}-${endYear.toString().padStart(2, '0')}`
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
