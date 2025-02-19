import { verifyRequest } from '@/server/api-keys'
import { BoxScore, fetchBoxScore } from '@/server/nba/box-scores'
import { db } from '@/server/db'
import {
  GameInsert,
  games,
  players,
  playerStats,
  PlayerStatsInsert,
} from '@/server/db/schema'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { fetchGames } from '@/server/nba/game-log'
import { fetchTodayScoreboard } from '@/server/nba/today-scoreboard'

export async function GET(request: NextRequest) {
  const isValid = await verifyRequest(request)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 })
  }

  const dryRun = !!request.nextUrl.searchParams.get('dryRun')
  const dateParam = request.nextUrl.searchParams.get('date')

  let boxScores: BoxScore[] = []

  try {
    const gameIds = dateParam
      ? await gameIdsForDate(new Date(dateParam))
      : await gameIdsForToday()

    boxScores = await Promise.all(
      Array.from(gameIds).map((gameId) => fetchBoxScore(gameId))
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch box scores' },
      { status: 500 }
    )
  }

  if (boxScores.length === 0) {
    return NextResponse.json({ error: 'No games found' }, { status: 404 })
  }

  if (dryRun) {
    return NextResponse.json({ boxScores })
  }

  const gamesToInsert: GameInsert[] = boxScores.map((boxScore) => {
    return {
      gameId: boxScore.game.gameId,
      gameTime: new Date(boxScore.game.gameTimeUTC),
      homeTeamId: boxScore.game.homeTeam.teamId,
      awayTeamId: boxScore.game.awayTeam.teamId,
      homeScore: boxScore.game.homeTeam.score,
      awayScore: boxScore.game.awayTeam.score,
    }
  })
  await db
    .insert(games)
    .values(gamesToInsert)
    .onConflictDoUpdate({
      target: games.gameId,
      set: {
        gameTime: sql`excluded.game_time`,
        homeTeamId: sql`excluded.home_team_id`,
        awayTeamId: sql`excluded.away_team_id`,
        homeScore: sql`excluded.home_score`,
        awayScore: sql`excluded.away_score`,
      },
    })

  await Promise.all(boxScores.map(insertPlayersFromGame))
  await Promise.all(boxScores.map(insertPlayerStatsFromGame))

  revalidatePath('/')
  try {
    await fetch('https://fossil-beans.vercel.app/api/revalidate', {
      headers: request.headers,
    })
  } catch (error) {
    console.error(error)
  }

  return NextResponse.json({ success: true })
}

async function insertPlayersFromGame(boxScore: BoxScore) {
  const playersToInsert = [
    boxScore.game.homeTeam,
    boxScore.game.awayTeam,
  ].flatMap((tp) => {
    return tp.players.map((player) => {
      return {
        playerId: player.personId,
        teamId: tp.teamId,
        playerName: player.name,
      }
    })
  })

  if (playersToInsert.length === 0) {
    return
  }

  await db
    .insert(players)
    .values(playersToInsert)
    .onConflictDoUpdate({
      target: players.playerId,
      set: {
        teamId: sql`excluded.team_id`,
        playerName: sql`excluded.player_name`,
      },
    })
}

async function insertPlayerStatsFromGame(boxScore: BoxScore) {
  const playerStatsToInsert: PlayerStatsInsert[] = [
    boxScore.game.homeTeam,
    boxScore.game.awayTeam,
  ].flatMap((tp) => {
    return tp.players.map((player) => {
      return {
        gameId: boxScore.game.gameId,
        playerId: player.personId,
        teamId: boxScore.game.homeTeam.teamId,
        playerName: player.name,
        minutesPlayed: player.statistics.minutes,
        points: player.statistics.points,
        rebounds: player.statistics.reboundsTotal,
        assists: player.statistics.assists,
        steals: player.statistics.steals,
        blocks: player.statistics.blocks,
        fieldGoalsMade: player.statistics.fieldGoalsMade,
        fieldGoalsAttempted: player.statistics.fieldGoalsAttempted,
        threePointersMade: player.statistics.threePointersMade,
        threePointersAttempted: player.statistics.threePointersAttempted,
        freeThrowsMade: player.statistics.freeThrowsMade,
        freeThrowsAttempted: player.statistics.freeThrowsAttempted,
        turnovers: player.statistics.turnovers,
        fouls: player.statistics.foulsPersonal,
        plusMinus: player.statistics.plusMinusPoints,
      }
    })
  })

  if (playerStatsToInsert.length === 0) {
    return
  }

  await db
    .insert(playerStats)
    .values(playerStatsToInsert)
    .onConflictDoUpdate({
      target: [playerStats.gameId, playerStats.playerId],
      set: {
        teamId: sql`excluded.team_id`,
        minutesPlayed: sql`excluded.minutes_played`,
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
      },
    })
}

async function gameIdsForDate(date: Date) {
  const nbaGames = await fetchGames(date)

  const gameIds = new Set<string>()
  for (const game of nbaGames) {
    gameIds.add(game.GAME_ID)
  }

  return Array.from(gameIds)
}

async function gameIdsForToday() {
  const todayScoreboard = await fetchTodayScoreboard()
  const gameIds = new Set<string>()
  for (const game of todayScoreboard.scoreboard.games) {
    gameIds.add(game.gameId)
  }

  return Array.from(gameIds)
}
