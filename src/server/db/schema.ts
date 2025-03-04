import { sql } from 'drizzle-orm'
import {
  varchar,
  integer,
  interval,
  pgTableCreator,
  primaryKey,
  timestamp,
  uuid,
  customType,
  text,
  index,
  smallint,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

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
  homeScore: smallint().default(0).notNull(),
  awayScore: smallint().default(0).notNull(),
  gameStatus: varchar({ length: 100 }), // ex: 'Final', 'Q1 8:59'
  period: smallint(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Game = typeof games.$inferSelect
export type GameInsert = typeof games.$inferInsert

export const players = createTable('players', {
  playerId: integer().primaryKey().notNull(),
  playerName: varchar({ length: 100 }).notNull(),
  jerseyNum: varchar({ length: 10 }),
  // GABE-TODO: position and height need to come from another api call. not yet implemented.
  position: varchar({ length: 10 }),
  height: varchar({ length: 100 }),
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
      .references(() => games.gameId, { onDelete: 'cascade' }),
    playerId: integer()
      .notNull()
      .references(() => players.playerId),
    teamId: integer()
      .notNull()
      .references(() => teams.teamId),
    minutesPlayed: interval().default('PT00M00.00S'),
    points: smallint(),
    rebounds: smallint(),
    assists: smallint(),
    steals: smallint(),
    blocks: smallint(),
    fieldGoalsMade: smallint(),
    fieldGoalsAttempted: smallint(),
    threePointersMade: smallint(),
    threePointersAttempted: smallint(),
    freeThrowsMade: smallint(),
    freeThrowsAttempted: smallint(),
    turnovers: smallint(),
    fouls: smallint(),
    plusMinus: smallint(),
    espnPoints: smallint(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({
      name: 'player_stats_pk',
      columns: [table.gameId, table.playerId],
    }),

    // Partial index for filtering
    index('idx_player_stats_minutes_epoch')
      .on(table.gameId)
      .where(sql`EXTRACT(epoch FROM ${table.minutesPlayed}) > 0`),

    // Ordering index for sorting
    index('idx_player_stats_order').on(
      sql`${table.espnPoints} DESC`,
      sql`${table.minutesPlayed} DESC`,
      table.playerId
    ),
  ]
)

export type PlayerStats = typeof playerStats.$inferSelect
export type PlayerStatsInsert = typeof playerStats.$inferInsert

const bytea = customType<{
  data: Buffer
  default: false
}>({
  dataType() {
    return 'bytea'
  },
})

export const apiKeys = createTable('api_keys', {
  id: uuid().defaultRandom().primaryKey(),
  consumerName: varchar({ length: 100 }).notNull().unique(),
  encryptedKey: bytea().notNull(),
  iv: bytea().notNull(),
  keyHash: text().unique(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  expiresAt: timestamp({ withTimezone: true }),
  revokedAt: timestamp({ withTimezone: true }),
})

export const gamesRelations = relations(games, ({ one }) => ({
  homeTeam: one(teams, {
    fields: [games.homeTeamId],
    references: [teams.teamId],
  }),
  awayTeam: one(teams, {
    fields: [games.awayTeamId],
    references: [teams.teamId],
  }),
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
