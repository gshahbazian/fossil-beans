import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import * as schema from './schema'

export function getDb() {
  return getDbFrom(env.DB)
}

export function getDbFrom(binding: D1Database) {
  return drizzle(binding, {
    schema,
    casing: 'snake_case',
  })
}

export type DB = ReturnType<typeof getDb>
