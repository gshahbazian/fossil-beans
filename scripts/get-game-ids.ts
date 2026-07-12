import { fetchGameIdsForDate } from '../src/server/nba/game-log'

const dateArg = process.argv[2]
if (!dateArg) {
  console.error('Usage: tsx scripts/get-game-ids.ts YYYY-MM-DD')
  process.exit(1)
}

const gameIds = await fetchGameIdsForDate(dateArg, {
  baseUrl: process.env.NBA_GAME_LOG_URL,
})
process.stdout.write(gameIds.join(','))

export {}
