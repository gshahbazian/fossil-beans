import { sql, relations } from 'drizzle-orm'
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
  index,
} from 'drizzle-orm/sqlite-core'

export const teams = sqliteTable('teams', {
  teamId: integer('team_id').primaryKey().notNull(),
  teamName: text('team_name').notNull().unique(),
  abbreviation: text('abbreviation').notNull().unique(),
})

export type Team = typeof teams.$inferSelect

export const games = sqliteTable(
  'games',
  {
    gameId: text('game_id').primaryKey().notNull(),
    gameTime: integer('game_time', { mode: 'timestamp_ms' }).notNull(),
    pstDate: text('pst_date').notNull(),
    homeTeamId: integer('home_team_id')
      .notNull()
      .references(() => teams.teamId),
    awayTeamId: integer('away_team_id')
      .notNull()
      .references(() => teams.teamId),
    homeScore: integer('home_score').default(0).notNull(),
    awayScore: integer('away_score').default(0).notNull(),
    gameStatus: text('game_status'),
    period: integer('period'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index('idx_games_pst_date').on(t.pstDate)]
)

export type GameInsert = typeof games.$inferInsert

export const players = sqliteTable('players', {
  playerId: integer('player_id').primaryKey().notNull(),
  playerName: text('player_name').notNull(),
  jerseyNum: text('jersey_num'),
  position: text('position'),
  height: text('height'),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.teamId),
})

export type PlayerInsert = typeof players.$inferInsert

export const playerStats = sqliteTable(
  'player_stats',
  {
    gameId: text('game_id')
      .notNull()
      .references(() => games.gameId, { onDelete: 'cascade' }),
    playerId: integer('player_id')
      .notNull()
      .references(() => players.playerId),
    teamId: integer('team_id')
      .notNull()
      .references(() => teams.teamId),
    minutesSeconds: integer('minutes_seconds').default(0),
    points: integer('points'),
    rebounds: integer('rebounds'),
    assists: integer('assists'),
    steals: integer('steals'),
    blocks: integer('blocks'),
    fieldGoalsMade: integer('field_goals_made'),
    fieldGoalsAttempted: integer('field_goals_attempted'),
    threePointersMade: integer('three_pointers_made'),
    threePointersAttempted: integer('three_pointers_attempted'),
    freeThrowsMade: integer('free_throws_made'),
    freeThrowsAttempted: integer('free_throws_attempted'),
    turnovers: integer('turnovers'),
    fouls: integer('fouls'),
    plusMinus: integer('plus_minus'),
    espnPoints: integer('espn_points'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    primaryKey({
      name: 'player_stats_pk',
      columns: [t.gameId, t.playerId],
    }),
    index('idx_player_stats_order').on(
      sql`${t.espnPoints} DESC`,
      sql`${t.minutesSeconds} DESC`,
      t.playerId
    ),
  ]
)

export type PlayerStatsInsert = typeof playerStats.$inferInsert

export const gamesRelations = relations(games, ({ one, many }) => ({
  homeTeam: one(teams, {
    fields: [games.homeTeamId],
    references: [teams.teamId],
  }),
  awayTeam: one(teams, {
    fields: [games.awayTeamId],
    references: [teams.teamId],
  }),
  stats: many(playerStats),
}))

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  game: one(games, {
    fields: [playerStats.gameId],
    references: [games.gameId],
  }),
  player: one(players, {
    fields: [playerStats.playerId],
    references: [players.playerId],
  }),
  team: one(teams, {
    fields: [playerStats.teamId],
    references: [teams.teamId],
  }),
}))
