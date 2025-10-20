import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { attachDatabasePool } from '@vercel/functions'
import { env } from '@/env'
import * as schema from './schema'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

// Pool drainer for serverless environments
// https://vercel.com/blog/the-real-serverless-compute-to-database-connection-problem-solved
attachDatabasePool(pool)

export const db = drizzle({
  client: pool,
  schema,
  casing: 'snake_case',
})
