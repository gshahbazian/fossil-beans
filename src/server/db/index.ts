import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { attachDatabasePool } from '@vercel/functions'
import { env } from '@/env'
import * as schema from './schema'

const connectionUrl = new URL(env.DATABASE_URL)
connectionUrl.searchParams.set('sslmode', 'verify-full')

const pool = new Pool({
  connectionString: connectionUrl.toString(),
})

// Pool drainer for serverless environments
// https://vercel.com/blog/the-real-serverless-compute-to-database-connection-problem-solved
attachDatabasePool(pool)

export const db = drizzle({
  client: pool,
  schema,
  casing: 'snake_case',
})
