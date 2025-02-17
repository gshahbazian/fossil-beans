import { verifyRequest } from '@/lib/api-keys'
import { fetchBoxScore } from '@/lib/nba/box-scores'
import { fetchGames } from '@/lib/nba/games'
import { Game } from '@/server/db/schema'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  const isValid = await verifyRequest(request)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 })
  }

  // GABE: currently testing with feb 13 games
  const feb13 = new Date('2025-02-13T00:00:00-08:00')

  const nbaGames = await fetchGames(feb13)
  const gameIds = new Set<string>()
  for (const game of nbaGames) {
    gameIds.add(game.GAME_ID)
  }

  const boxScores = await Promise.all(
    Array.from(gameIds).map((gameId) => fetchBoxScore(gameId))
  )

  const gameSummaries: Game[] = boxScores.map((boxScore) => {
    return {
      gameId: boxScore.game.gameId,
      gameTime: new Date(boxScore.game.gameTimeUTC),
      homeTeamId: boxScore.game.homeTeam.teamId,
      awayTeamId: boxScore.game.awayTeam.teamId,
      homeScore: boxScore.game.homeTeam.score,
      awayScore: boxScore.game.awayTeam.score,
    }
  })

  const firstGameFirstPlayer = boxScores[0]?.game.homeTeam.players[0]
  const slimPlayer = firstGameFirstPlayer
    ? SlimPlayerSchema.parse(firstGameFirstPlayer)
    : null

  return NextResponse.json({ success: true, gameSummaries, slimPlayer })
}

const SlimPlayerSchema = z.object({
  statistics: z.object({
    assists: z.number(),
    minutes: z.string(),
    points: z.number(),
    reboundsTotal: z.number(),
  }),
  name: z.string(),
})
