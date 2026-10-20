import assert from 'node:assert/strict'
import { test } from 'node:test'
import { purgeSiteCache, updateAndPurge } from '../src/server/cache-purge'

await test('reports success only after the database update and purge finish', async () => {
  const events: string[] = []
  const result = await updateAndPurge(
    async () => {
      events.push('update')
      return { upsertedGames: 1 }
    },
    {
      purge: async (options) => {
        assert.deepEqual(options, { purgeEverything: true })
        events.push('purge')
        return { success: true, errors: [] }
      },
    }
  )
  assert.deepEqual(events, ['update', 'purge'])
  assert.deepEqual(result, { upsertedGames: 1, purged: true })
})

await test('retries rejected purges and transport exceptions before succeeding', async () => {
  let attempts = 0
  const delays: number[] = []
  assert.equal(
    await purgeSiteCache(
      {
        purge: async () => {
          attempts++
          if (attempts === 1)
            return {
              success: false,
              errors: [{ code: 429, message: 'Rate limited' }],
            }
          if (attempts === 2) throw new Error('Connection lost')
          return { success: true, errors: [] }
        },
      },
      async (ms) => {
        delays.push(ms)
      }
    ),
    true
  )
  assert.equal(attempts, 3)
  assert.deepEqual(delays, [250, 500])
})

await test('permanent purge failure rejects after three attempts with provider details', async () => {
  let attempts = 0
  await assert.rejects(
    purgeSiteCache(
      {
        purge: async () => {
          attempts++
          return {
            success: false,
            errors: [{ code: 1000, message: 'Purge denied' }],
          }
        },
      },
      async () => {}
    ),
    (error: Error) => {
      assert.match(error.message, /failed after 3 attempts/)
      assert.match(String(error.cause), /Purge denied/)
      return true
    }
  )
  assert.equal(attempts, 3)
})

await test('failed invalidation cannot turn a committed update into a successful job', async () => {
  let updates = 0
  await assert.rejects(
    updateAndPurge(
      async () => {
        updates++
        return { upsertedGames: 1 }
      },
      {
        purge: async () => {
          throw new Error('Unavailable')
        },
      }
    ),
    /Data was updated, but cache invalidation failed/
  )
  assert.equal(updates, 1)
})

await test('a failed update is propagated without purging', async () => {
  await assert.rejects(
    updateAndPurge(
      async () => {
        throw new Error('D1 unavailable')
      },
      {
        purge: async () => {
          assert.fail('must not purge after failed update')
        },
      }
    ),
    /D1 unavailable/
  )
})
