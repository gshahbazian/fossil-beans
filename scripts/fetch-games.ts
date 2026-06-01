/**
 * Fetches today's NBA box scores (or for a specific date) and emits SQL
 * (INSERT/UPSERT statements) on stdout that can be piped into
 * `wrangler d1 execute`.
 *
 * Usage:
 *   tsx scripts/fetch-games.ts                   # today
 *   tsx scripts/fetch-games.ts --date 2025-01-15 # specific PST date
 */
import {
  BoxScore,
  ForbiddenError,
  fetchBoxScore,
} from './lib/nba/box-scores'
import { fetchGames } from './lib/nba/game-log'
import { fetchTodayScoreboard } from './lib/nba/today-scoreboard'

const args = process.argv.slice(2)
const dateArgIdx = args.indexOf('--date')
const dateArg = dateArgIdx >= 0 ? args[dateArgIdx + 1] : undefined

async function main() {
  const gameIds = dateArg
    ? await gameIdsForDate(new Date(`${dateArg}T12:00:00-08:00`))
    : await gameIdsForToday()

  const settled = await Promise.allSettled(gameIds.map(fetchBoxScore))
  const boxScores: BoxScore[] = []
  for (const r of settled) {
    if (r.status === 'fulfilled') {
      boxScores.push(r.value)
    } else if (!(r.reason instanceof ForbiddenError)) {
      throw r.reason
    } else {
      console.error(r.reason)
    }
  }

  if (boxScores.length === 0) {
    console.error('No games found')
    return
  }

  const out: string[] = []
  out.push('BEGIN TRANSACTION;')

  for (const bs of boxScores) {
    out.push(gameUpsertSql(bs))
  }
  for (const bs of boxScores) {
    out.push(...playerUpsertSqls(bs))
  }
  for (const bs of boxScores) {
    out.push(...playerStatsUpsertSqls(bs))
  }

  out.push('COMMIT;')
  process.stdout.write(out.join('\n') + '\n')
}

async function gameIdsForDate(date: Date) {
  const games = await fetchGames(date)
  return Array.from(new Set(games.map((g) => g.GAME_ID)))
}

async function gameIdsForToday() {
  const sb = await fetchTodayScoreboard()
  return Array.from(new Set(sb.scoreboard.games.map((g) => g.gameId)))
}

function gameUpsertSql(bs: BoxScore): string {
  const gameTime = new Date(bs.game.gameTimeUTC)
  const gameTimeMs = gameTime.getTime()
  const pstDate = formatPSTDate(gameTime)
  const now = Date.now()

  return `INSERT INTO games (game_id, game_time, pst_date, home_team_id, away_team_id, home_score, away_score, game_status, period, updated_at) VALUES (${sqlString(bs.game.gameId)}, ${gameTimeMs}, ${sqlString(pstDate)}, ${bs.game.homeTeam.teamId}, ${bs.game.awayTeam.teamId}, ${bs.game.homeTeam.score}, ${bs.game.awayTeam.score}, ${sqlString(bs.game.gameStatusText)}, ${bs.game.period}, ${now}) ON CONFLICT(game_id) DO UPDATE SET game_time=excluded.game_time, pst_date=excluded.pst_date, home_team_id=excluded.home_team_id, away_team_id=excluded.away_team_id, home_score=excluded.home_score, away_score=excluded.away_score, game_status=excluded.game_status, period=excluded.period, updated_at=excluded.updated_at;`
}

function playerUpsertSqls(bs: BoxScore): string[] {
  const rows: string[] = []
  for (const tp of [bs.game.homeTeam, bs.game.awayTeam]) {
    for (const p of tp.players) {
      rows.push(
        `INSERT INTO players (player_id, team_id, player_name, jersey_num) VALUES (${p.personId}, ${tp.teamId}, ${sqlString(p.name)}, ${sqlString(p.jerseyNum)}) ON CONFLICT(player_id) DO UPDATE SET team_id=excluded.team_id, player_name=excluded.player_name, jersey_num=excluded.jersey_num;`
      )
    }
  }
  return rows
}

function playerStatsUpsertSqls(bs: BoxScore): string[] {
  const rows: string[] = []
  const now = Date.now()
  for (const tp of [bs.game.homeTeam, bs.game.awayTeam]) {
    for (const p of tp.players) {
      const s = p.statistics
      rows.push(
        `INSERT INTO player_stats (game_id, player_id, team_id, minutes_seconds, points, rebounds, assists, steals, blocks, field_goals_made, field_goals_attempted, three_pointers_made, three_pointers_attempted, free_throws_made, free_throws_attempted, turnovers, fouls, plus_minus, espn_points, updated_at) VALUES (${sqlString(bs.game.gameId)}, ${p.personId}, ${tp.teamId}, ${parseMinutesToSeconds(s.minutes)}, ${s.points}, ${s.reboundsTotal}, ${s.assists}, ${s.steals}, ${s.blocks}, ${s.fieldGoalsMade}, ${s.fieldGoalsAttempted}, ${s.threePointersMade}, ${s.threePointersAttempted}, ${s.freeThrowsMade}, ${s.freeThrowsAttempted}, ${s.turnovers}, ${s.foulsPersonal}, ${s.plusMinusPoints}, ${calculateEspnPoints(s)}, ${now}) ON CONFLICT(game_id, player_id) DO UPDATE SET team_id=excluded.team_id, minutes_seconds=excluded.minutes_seconds, points=excluded.points, rebounds=excluded.rebounds, assists=excluded.assists, steals=excluded.steals, blocks=excluded.blocks, field_goals_made=excluded.field_goals_made, field_goals_attempted=excluded.field_goals_attempted, three_pointers_made=excluded.three_pointers_made, three_pointers_attempted=excluded.three_pointers_attempted, free_throws_made=excluded.free_throws_made, free_throws_attempted=excluded.free_throws_attempted, turnovers=excluded.turnovers, fouls=excluded.fouls, plus_minus=excluded.plus_minus, espn_points=excluded.espn_points, updated_at=excluded.updated_at;`
      )
    }
  }
  return rows
}

function calculateEspnPoints(
  s: BoxScore['game']['homeTeam']['players'][number]['statistics']
): number {
  return (
    s.points +
    s.threePointersMade +
    s.fieldGoalsMade * 2 +
    s.freeThrowsMade +
    s.fieldGoalsAttempted * -1 +
    s.freeThrowsAttempted * -1 +
    s.reboundsTotal +
    s.assists * 2 +
    s.steals * 4 +
    s.blocks * 4 +
    s.turnovers * -2
  )
}

/** Parses ISO 8601 duration like "PT34M59.00S" into total integer seconds. */
function parseMinutesToSeconds(iso: string | undefined | null): number {
  if (!iso) return 0
  const m = iso.match(/^PT(?:(\d+)M)?(?:([\d.]+)S)?$/)
  if (!m) return 0
  const minutes = m[1] ? parseInt(m[1], 10) : 0
  const seconds = m[2] ? Math.round(parseFloat(m[2])) : 0
  return minutes * 60 + seconds
}

function formatPSTDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const y = parts.find((p) => p.type === 'year')!.value
  const mo = parts.find((p) => p.type === 'month')!.value
  const d = parts.find((p) => p.type === 'day')!.value
  return `${y}-${mo}-${d}`
}

function sqlString(v: string | null | undefined): string {
  if (v === null || v === undefined) return 'NULL'
  return "'" + v.replace(/'/g, "''") + "'"
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
