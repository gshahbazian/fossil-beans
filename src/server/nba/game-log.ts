type Parameters = {
  LeagueID: string
  Season: string
  SeasonType: string
  PlayerOrTeam: string
  Counter: number
  Sorter: string
  Direction: string
  DateFrom: string
  DateTo: string
}

type GameLogEntry = {
  SEASON_ID: string
  TEAM_ID: number
  TEAM_ABBREVIATION: string
  TEAM_NAME: string
  GAME_ID: string
  GAME_DATE: string
  MATCHUP: string
  WL: string
  MIN: number
  FGM: number
  FGA: number
  FG_PCT: number
  FG3M: number
  FG3A: number
  FG3_PCT: number
  FTM: number
  FTA: number
  FT_PCT: number
  OREB: number
  DREB: number
  REB: number
  AST: number
  STL: number
  BLK: number
  TOV: number
  PF: number
  PTS: number
  PLUS_MINUS: number
  VIDEO_AVAILABLE: number
}

type ResultSet = {
  name: string
  headers: string[]
  rowSet: unknown[][]
}

type LeagueGameLog = {
  resource: string
  parameters: Parameters
  resultSets: ResultSet[]
}

function parseGameLog(jsonData: LeagueGameLog): GameLogEntry[] {
  const resultSet = jsonData.resultSets.find(
    (set: ResultSet) => set.name === 'LeagueGameLog'
  )
  if (!resultSet) {
    throw new Error('LeagueGameLog result set not found')
  }

  const headers = resultSet.headers
  const rowSet = resultSet.rowSet

  return rowSet.map((row) => {
    const entry: Record<string, unknown> = {}
    headers.forEach((header: string, index: number) => {
      entry[header] = row[index]
    })
    return entry as GameLogEntry
  })
}

export async function fetchGames(date: Date) {
  const encodedDate = encodeURIComponent(
    date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'America/Los_Angeles',
    })
  )

  const res = await fetch(
    `https://stats.nba.com/stats/leaguegamelog?Counter=1000&DateFrom=${encodedDate}&DateTo=${encodedDate}&Direction=DESC&ISTRound=&LeagueID=00&PlayerOrTeam=T&Season=2024-25&SeasonType=Regular%20Season&Sorter=DATE`,
    {
      referrer: 'https://www.nba.com/',
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch game logs`)
  }

  const data = await res.json()
  return parseGameLog(data)
}
