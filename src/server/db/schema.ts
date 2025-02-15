import {
  varchar,
  integer,
  interval,
  pgTableCreator,
  primaryKey,
  timestamp,
} from 'drizzle-orm/pg-core'

// https://orm.drizzle.team/docs/goodies#multi-project-schema
export const createTable = pgTableCreator((name) => `fossil-beans_${name}`)

export const teams = createTable('teams', {
  teamId: integer().primaryKey().notNull(),
  teamName: varchar({ length: 100 }).notNull().unique(),
  abbreviation: varchar({ length: 10 }).notNull().unique(),
})

export type Team = typeof teams.$inferSelect

export const games = createTable('games', {
  gameId: varchar({ length: 100 }).primaryKey().notNull(),
  gameTime: timestamp({ withTimezone: true }).notNull(),
  homeTeamId: integer()
    .notNull()
    .references(() => teams.teamId),
  awayTeamId: integer()
    .notNull()
    .references(() => teams.teamId),
  homeScore: integer().default(0).notNull(),
  awayScore: integer().default(0).notNull(),
})

export type Game = typeof games.$inferSelect

export const players = createTable('players', {
  playerId: integer().primaryKey().notNull(),
  playerName: varchar({ length: 100 }).notNull(),
  teamId: integer()
    .notNull()
    .references(() => teams.teamId),
})

export type Player = typeof players.$inferSelect

export const playerStats = createTable(
  'player_stats',
  {
    gameId: varchar({ length: 100 })
      .notNull()
      .references(() => games.gameId),
    playerId: integer()
      .notNull()
      .references(() => players.playerId),
    teamId: integer()
      .notNull()
      .references(() => teams.teamId),
    minutesPlayed: interval().default('PT00M00.00S'),
    points: integer(),
    rebounds: integer(),
    assists: integer(),
    steals: integer(),
    blocks: integer(),
    fieldGoalsMade: integer(),
    fieldGoalsAttempted: integer(),
    threePointersMade: integer(),
    threePointersAttempted: integer(),
    freeThrowsMade: integer(),
    freeThrowsAttempted: integer(),
    turnovers: integer(),
    fouls: integer(),
    plusMinus: integer(),
  },
  (table) => [
    primaryKey({
      name: 'player_stats_pk',
      columns: [table.gameId, table.playerId],
    }),
  ]
)

export type PlayerStats = typeof playerStats.$inferSelect
