type PurgeCache = Pick<CacheContext, 'purge'>

/** A successful mutation is not complete until its entrypoint cache is purged. */
export async function updateAndPurge<T>(
  update: () => Promise<T>,
  cache: PurgeCache | undefined
) {
  const result = await update()
  try {
    await purgeSiteCache(cache)
  } catch (cause) {
    throw new Error('Data was updated, but cache invalidation failed', {
      cause,
    })
  }
  return { ...result, purged: true as const }
}

export async function purgeSiteCache(
  cache: PurgeCache | undefined,
  wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
): Promise<true> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (!cache)
        throw new Error(
          'Worker cache API is unavailable on this execution context'
        )
      const result = await cache.purge({ purgeEverything: true })
      if (!result.success) {
        throw new Error(
          `Cache purge rejected: ${JSON.stringify(result.errors)}`
        )
      }
      console.log('Worker cache purge accepted', {
        attempt,
        entrypoint: 'default',
      })
      return true
    } catch (cause) {
      console.error('Worker cache purge attempt failed', { attempt, cause })
      if (attempt === 3) {
        throw new Error('Worker cache purge failed after 3 attempts', { cause })
      }
      await wait(250 * attempt)
    }
  }
  throw new Error('Worker cache purge did not complete')
}
