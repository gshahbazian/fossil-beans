import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/server/db/schema'
import { games, playerStats, players } from '@/server/db/schema'
import { fetchGameIdsForDate } from '@/server/nba/game-log'

const NBA_LIVE_DATA_URL =
  'https://nba-prod-us-east-1-mediaops-stats.s3.amazonaws.com/NBA/liveData'
const NBA_BOX_SCORE_URL = `${NBA_LIVE_DATA_URL}/boxscore`
const NBA_SCOREBOARD_URL = `${NBA_LIVE_DATA_URL}/scoreboard/todaysScoreboard_00.json`
const NBA_HEADERS = {
  accept: 'application/json, text/plain, */*',
  origin: 'https://www.nba.com',
  referer: 'https://www.nba.com/',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
}
const GAME_INSERT_CHUNK_SIZE = 8
const NBA_FETCH_TIMEOUT_MS = 15_000
const PLAYER_INSERT_CHUNK_SIZE = 20
const PLAYER_STATS_INSERT_CHUNK_SIZE = 4

type InsertGamesEnv = {
  DB: D1Database
  NBA_BOX_SCORE_URL?: string
  NBA_GAME_LOG_URL?: string
  NBA_SCOREBOARD_URL?: string
}

type InsertGamesOptions = {
  date?: string
  gameIds?: string[]
}

type ScoreboardGame = {
  gameId: string
}

type TodayScoreboard = {
  scoreboard: {
    games: ScoreboardGame[]
  }
}

type PlayerStatLine = {
  assists: number
  blocks: number
  fieldGoalsAttempted: number
  fieldGoalsMade: number
  foulsPersonal: number
  freeThrowsAttempted: number
  freeThrowsMade: number
  minutes: string
  plusMinusPoints: number
  points: number
  reboundsTotal: number
  steals: number
  threePointersAttempted: number
  threePointersMade: number
  turnovers: number
}

type Player = {
  personId: number
  jerseyNum: string
  statistics: PlayerStatLine
  name: string
}

type Team = {
  teamId: number
  score: number
  players: Player[]
}

type BoxScore = {
  game: {
    gameId: string
    gameTimeUTC: string
    gameStatusText: string
    period: number
    homeTeam: Team
    awayTeam: Team
  }
}

type GameInsert = typeof games.$inferInsert
type PlayerInsert = typeof players.$inferInsert
type PlayerStatsInsert = typeof playerStats.$inferInsert

export type InsertGamesResult = {
  date?: string
  scoreboardGames: number
  upsertedGames: number
  upsertedPlayers: number
  upsertedPlayerStats: number
  skippedGames: string[]
  failedGames: string[]
}

class ForbiddenError extends Error {
  constructor(gameId: string) {
    super(`Forbidden: ${gameId}`)
    this.name = 'ForbiddenError'
  }
}

export async function insertGames(
  env: InsertGamesEnv,
  options: InsertGamesOptions = {}
) {
  const gameIds = await getGameIds(env, options)
  const result = await fetchBoxScores(env, gameIds)

  if (result.boxScores.length > 0) {
    await upsertBoxScores(env.DB, result.boxScores)
  }

  const playerCount = countUniquePlayers(result.boxScores)
  const playerStatsCount = result.boxScores.reduce(
    (count, boxScore) => count + getPlayerEntries(boxScore).length,
    0
  )

  return {
    date: options.date,
    scoreboardGames: gameIds.length,
    upsertedGames: result.boxScores.length,
    upsertedPlayers: playerCount,
    upsertedPlayerStats: playerStatsCount,
    skippedGames: result.skippedGames,
    failedGames: result.failedGames,
  } satisfies InsertGamesResult
}

async function getGameIds(env: InsertGamesEnv, options: InsertGamesOptions) {
  if (options.gameIds?.length) {
    return Array.from(new Set(options.gameIds))
  }

  if (options.date) {
    return await fetchGameIdsForDate(options.date, {
      baseUrl: env.NBA_GAME_LOG_URL,
      timeoutMs: NBA_FETCH_TIMEOUT_MS,
    })
  }

  return await fetchTodayGameIds(env)
}

async function fetchTodayGameIds(env: InsertGamesEnv) {
  const response = await fetchNba(
    env.NBA_SCOREBOARD_URL ?? NBA_SCOREBOARD_URL,
    {
      headers: NBA_HEADERS,
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch NBA scoreboard: ${response.status}`)
  }

  const data = (await response.json()) as TodayScoreboard
  return Array.from(new Set(data.scoreboard.games.map((game) => game.gameId)))
}

async function fetchBoxScores(env: InsertGamesEnv, gameIds: string[]) {
  const settled = await Promise.allSettled(
    gameIds.map((gameId) => fetchBoxScore(env, gameId))
  )
  const boxScores: BoxScore[] = []
  const skippedGames: string[] = []
  const failedGames: string[] = []

  for (const [index, result] of settled.entries()) {
    const gameId = gameIds[index]

    if (result.status === 'fulfilled') {
      boxScores.push(result.value)
      continue
    }

    if (result.reason instanceof ForbiddenError) {
      skippedGames.push(gameId)
      continue
    }

    failedGames.push(gameId)
    console.error(result.reason)
  }

  return { boxScores, skippedGames, failedGames }
}

async function fetchBoxScore(env: InsertGamesEnv, gameId: string) {
  const baseUrl = env.NBA_BOX_SCORE_URL ?? NBA_BOX_SCORE_URL
  const response = await fetchNba(`${baseUrl}/boxscore_${gameId}.json`, {
    headers: NBA_HEADERS,
  })

  if (response.status === 403) {
    throw new ForbiddenError(gameId)
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch NBA box score for ${gameId}: ${response.status}`
    )
  }

  return (await response.json()) as BoxScore
}

function fetchNba(input: RequestInfo | URL, init: RequestInit) {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(NBA_FETCH_TIMEOUT_MS),
  })
}

async function upsertBoxScores(dbBinding: D1Database, boxScores: BoxScore[]) {
  const db = drizzle(dbBinding, { schema, casing: 'snake_case' })
  const now = new Date()
  const gameRows = boxScores.map((boxScore) => getGameRow(boxScore, now))
  const playerRows = getPlayerRows(boxScores)
  const playerStatsRows = getPlayerStatsRows(boxScores, now)

  for (const chunk of chunkRows(gameRows, GAME_INSERT_CHUNK_SIZE)) {
    await db
      .insert(games)
      .values(chunk)
      .onConflictDoUpdate({
        target: games.gameId,
        set: {
          gameTime: sql`excluded.game_time`,
          pstDate: sql`excluded.pst_date`,
          homeTeamId: sql`excluded.home_team_id`,
          awayTeamId: sql`excluded.away_team_id`,
          homeScore: sql`excluded.home_score`,
          awayScore: sql`excluded.away_score`,
          gameStatus: sql`excluded.game_status`,
          period: sql`excluded.period`,
          updatedAt: sql`excluded.updated_at`,
        },
      })
  }

  for (const chunk of chunkRows(playerRows, PLAYER_INSERT_CHUNK_SIZE)) {
    await db
      .insert(players)
      .values(chunk)
      .onConflictDoUpdate({
        target: players.playerId,
        set: {
          teamId: sql`excluded.team_id`,
          playerName: sql`excluded.player_name`,
          jerseyNum: sql`excluded.jersey_num`,
        },
      })
  }

  for (const chunk of chunkRows(
    playerStatsRows,
    PLAYER_STATS_INSERT_CHUNK_SIZE
  )) {
    await db
      .insert(playerStats)
      .values(chunk)
      .onConflictDoUpdate({
        target: [playerStats.gameId, playerStats.playerId],
        set: {
          teamId: sql`excluded.team_id`,
          minutesSeconds: sql`excluded.minutes_seconds`,
          points: sql`excluded.points`,
          rebounds: sql`excluded.rebounds`,
          assists: sql`excluded.assists`,
          steals: sql`excluded.steals`,
          blocks: sql`excluded.blocks`,
          fieldGoalsMade: sql`excluded.field_goals_made`,
          fieldGoalsAttempted: sql`excluded.field_goals_attempted`,
          threePointersMade: sql`excluded.three_pointers_made`,
          threePointersAttempted: sql`excluded.three_pointers_attempted`,
          freeThrowsMade: sql`excluded.free_throws_made`,
          freeThrowsAttempted: sql`excluded.free_throws_attempted`,
          turnovers: sql`excluded.turnovers`,
          fouls: sql`excluded.fouls`,
          plusMinus: sql`excluded.plus_minus`,
          espnPoints: sql`excluded.espn_points`,
          updatedAt: sql`excluded.updated_at`,
        },
      })
  }
}

function getGameRow(boxScore: BoxScore, updatedAt: Date): GameInsert {
  const gameTime = new Date(boxScore.game.gameTimeUTC)

  return {
    gameId: boxScore.game.gameId,
    gameTime,
    pstDate: formatPSTDate(gameTime),
    homeTeamId: boxScore.game.homeTeam.teamId,
    awayTeamId: boxScore.game.awayTeam.teamId,
    homeScore: boxScore.game.homeTeam.score,
    awayScore: boxScore.game.awayTeam.score,
    gameStatus: boxScore.game.gameStatusText,
    period: boxScore.game.period,
    updatedAt,
  }
}

function getPlayerRows(boxScores: BoxScore[]) {
  const rowsByPlayerId = new Map<number, PlayerInsert>()

  for (const boxScore of boxScores) {
    for (const { team, player } of getPlayerEntries(boxScore)) {
      rowsByPlayerId.set(player.personId, {
        playerId: player.personId,
        teamId: team.teamId,
        playerName: player.name,
        jerseyNum: player.jerseyNum,
      })
    }
  }

  return Array.from(rowsByPlayerId.values())
}

function getPlayerStatsRows(boxScores: BoxScore[], updatedAt: Date) {
  const rows: PlayerStatsInsert[] = []

  for (const boxScore of boxScores) {
    for (const { team, player } of getPlayerEntries(boxScore)) {
      const stats = player.statistics
      rows.push({
        gameId: boxScore.game.gameId,
        playerId: player.personId,
        teamId: team.teamId,
        minutesSeconds: parseMinutesToSeconds(stats.minutes),
        points: stats.points,
        rebounds: stats.reboundsTotal,
        assists: stats.assists,
        steals: stats.steals,
        blocks: stats.blocks,
        fieldGoalsMade: stats.fieldGoalsMade,
        fieldGoalsAttempted: stats.fieldGoalsAttempted,
        threePointersMade: stats.threePointersMade,
        threePointersAttempted: stats.threePointersAttempted,
        freeThrowsMade: stats.freeThrowsMade,
        freeThrowsAttempted: stats.freeThrowsAttempted,
        turnovers: stats.turnovers,
        fouls: stats.foulsPersonal,
        plusMinus: stats.plusMinusPoints,
        espnPoints: calculateEspnPoints(stats),
        updatedAt,
      })
    }
  }

  return rows
}

function getPlayerEntries(boxScore: BoxScore) {
  return [
    ...boxScore.game.homeTeam.players.map((player) => ({
      team: boxScore.game.homeTeam,
      player,
    })),
    ...boxScore.game.awayTeam.players.map((player) => ({
      team: boxScore.game.awayTeam,
      player,
    })),
  ]
}

function countUniquePlayers(boxScores: BoxScore[]) {
  const playerIds = new Set<number>()

  for (const boxScore of boxScores) {
    for (const { player } of getPlayerEntries(boxScore)) {
      playerIds.add(player.personId)
    }
  }

  return playerIds.size
}

function calculateEspnPoints(stats: PlayerStatLine) {
  return (
    stats.points +
    stats.threePointersMade +
    stats.fieldGoalsMade * 2 +
    stats.freeThrowsMade +
    stats.fieldGoalsAttempted * -1 +
    stats.freeThrowsAttempted * -1 +
    stats.reboundsTotal +
    stats.assists * 2 +
    stats.steals * 4 +
    stats.blocks * 4 +
    stats.turnovers * -2
  )
}

function parseMinutesToSeconds(iso: string | undefined | null) {
  if (!iso) return 0

  const match = iso.match(/^PT(?:(\d+)M)?(?:([\d.]+)S)?$/)
  if (!match) return 0

  const minutes = match[1] ? parseInt(match[1], 10) : 0
  const seconds = match[2] ? Math.round(parseFloat(match[2])) : 0
  return minutes * 60 + seconds
}

function formatPSTDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')!.value
  const month = parts.find((part) => part.type === 'month')!.value
  const day = parts.find((part) => part.type === 'day')!.value
  return `${year}-${month}-${day}`
}

function chunkRows<T>(rows: T[], size: number) {
  const chunks: T[][] = []

  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size))
  }

  return chunks
}
