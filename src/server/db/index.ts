import { env } from '@/env'
import * as schema from '@/server/db/schema'
import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

/**
 * fossil-beans uses neon serverless db for postgres
 *
 * Docs for connecting drizzle to neon:
 * https://orm.drizzle.team/docs/connect-neon
 * https://neon.tech/docs/serverless/serverless-driver
 */

const connectionString = env.DATABASE_URL

if (env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = (host) => {
    const [protocol, port] =
      host === 'db.localtest.me' ? ['http', 4444] : ['https', 443]
    return `${protocol}://${host}:${port}/sql`
  }
}

const sql = neon(connectionString)
export const db = drizzle({
  client: sql,
  schema,
  casing: 'snake_case',
})
