import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { cache } from 'cloudflare:workers'
import { insertGames } from './server/jobs/insert-games'

const startHandler = createStartHandler(defaultStreamHandler)

const INSERT_GAMES_PATH = '/api/insert-games'
const POSTHOG_INGEST_PATH = '/ingest'
const POSTHOG_INGEST_ORIGIN = 'https://us.i.posthog.com'

// Edge caching is handled by Cloudflare's native Workers Cache (enabled via
// `cache` in wrangler.jsonc). It sits in front of this Worker and serves cached
// responses without running the Worker. Every response must therefore either
// provide an intentional cache policy or explicitly opt out of caching.
export default {
  async fetch(request: Request, workerEnv: Cloudflare.Env): Promise<Response> {
    const url = new URL(request.url)

    if (isPostHogIngestPath(url.pathname)) {
      const response = await handlePostHogIngest(request, url)
      return preventCaching(response)
    }

    if (url.pathname === '/api/purge-cache' && request.method === 'POST') {
      const response = await handlePurge(request, workerEnv)
      return preventCaching(response)
    }

    if (url.pathname === INSERT_GAMES_PATH && request.method === 'POST') {
      const response = await handleInsertGames(request, url, workerEnv)
      return preventCaching(response)
    }

    const response = await startHandler(request)
    return applyFrameworkCachePolicy(response)
  },

  async scheduled(controller: ScheduledController, workerEnv: Cloudflare.Env) {
    await handleScheduled(controller, workerEnv)
  },
} satisfies ExportedHandler<Cloudflare.Env>

function handlePostHogIngest(request: Request, requestUrl: URL) {
  const path = requestUrl.pathname.slice(POSTHOG_INGEST_PATH.length) || '/'
  const url = new URL(path + requestUrl.search, POSTHOG_INGEST_ORIGIN)
  const headers = new Headers(request.headers)
  headers.delete('cookie')

  // Forward the real client IP so PostHog derives geolocation from the visitor
  // rather than from Cloudflare's egress address. Cloudflare sets
  // `CF-Connecting-IP` on the inbound request; PostHog reads `X-Forwarded-For`.
  const clientIp = request.headers.get('cf-connecting-ip')
  if (clientIp) {
    headers.set('x-forwarded-for', clientIp)
  }

  return fetch(
    new Request(url, {
      body: request.body,
      duplex: 'half',
      headers,
      method: request.method,
      redirect: 'manual',
    } as RequestInit & { duplex: 'half' })
  )
}

function isPostHogIngestPath(pathname: string) {
  if (pathname === POSTHOG_INGEST_PATH) return true

  return pathname.startsWith(`${POSTHOG_INGEST_PATH}/`)
}

function applyFrameworkCachePolicy(response: Response) {
  if (response.status >= 400) return preventCaching(response)

  const hasCachePolicy =
    response.headers.has('cache-control') ||
    response.headers.has('cloudflare-cdn-cache-control')
  if (hasCachePolicy) return response

  return preventCaching(response)
}

function preventCaching(response: Response) {
  const noStoreResponse = new Response(response.body, response)
  noStoreResponse.headers.set('Cache-Control', 'no-store')
  noStoreResponse.headers.set('Cloudflare-CDN-Cache-Control', 'no-store')
  return noStoreResponse
}

async function handlePurge(
  request: Request,
  workerEnv: Cloudflare.Env
): Promise<Response> {
  const unauthorized = getUnauthorizedResponse(request, workerEnv)
  if (unauthorized) {
    return unauthorized
  }

  const purged = await purgeSiteCache()

  return Response.json({ ok: true, purged })
}

async function handleInsertGames(
  request: Request,
  requestUrl: URL,
  workerEnv: Cloudflare.Env
) {
  const unauthorized = getUnauthorizedResponse(request, workerEnv)
  if (unauthorized) {
    return unauthorized
  }

  const date = requestUrl.searchParams.get('date') ?? undefined
  const gameIds = getGameIds(requestUrl)

  try {
    const result = await insertGames(workerEnv, { date, gameIds })
    const purged = await purgeSiteCache()

    return Response.json({ ok: true, ...result, purged })
  } catch (error) {
    console.error('Manual NBA game insert failed', error)

    return Response.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

function getGameIds(requestUrl: URL) {
  const value = requestUrl.searchParams.get('gameIds')
  if (!value) return undefined

  return value.split(',').filter(Boolean)
}

function getUnauthorizedResponse(request: Request, workerEnv: Cloudflare.Env) {
  if (!workerEnv.PURGE_SECRET) {
    return Response.json(
      { error: 'Authenticated endpoint not configured' },
      { status: 503 }
    )
  }

  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${workerEnv.PURGE_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

async function handleScheduled(
  controller: ScheduledController,
  workerEnv: Cloudflare.Env
) {
  try {
    console.log('Scheduled NBA game insert started', {
      cron: controller.cron,
      scheduledTime: getScheduledTime(controller),
    })

    const result = await insertGames(workerEnv)
    const purged = await purgeSiteCache()
    console.log('Scheduled NBA game insert completed', { ...result, purged })
  } catch (error) {
    console.error('Scheduled NBA game insert failed', error)
    throw error
  }
}

/**
 * Invalidate this Worker's edge cache. The only response we mark cacheable is
 * the home page, so purging everything the Worker cached invalidates it. The
 * purge is global and needs no origin, so it works identically from the request
 * handlers and the cron.
 */
async function purgeSiteCache() {
  try {
    const result = await cache.purge({ purgeEverything: true })
    if (!result.success) {
      console.error('Cache purge reported errors', result.errors)
    }
    return result.success
  } catch (error) {
    // Local dev (miniflare) may not implement the purge API; never let a purge
    // failure break the insert that triggered it.
    console.warn('Cache purge skipped', error)
    return false
  }
}

function getScheduledTime(controller: ScheduledController) {
  if (!controller.scheduledTime) return undefined

  return new Date(controller.scheduledTime).toISOString()
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message

  return 'Unknown error'
}
