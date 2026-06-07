import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { insertGames } from './server/jobs/insert-games'

const startHandler = createStartHandler(defaultStreamHandler)

// `caches.default` is a Cloudflare-specific extension to the standard
// CacheStorage interface that the DOM lib also declares; cast once here.
const edgeCache = (caches as unknown as { default: Cache }).default

const CACHEABLE_PATHS = new Set(['/'])
const INSERT_GAMES_PATH = '/api/insert-games'
const POSTHOG_INGEST_PATH = '/ingest'
const POSTHOG_INGEST_ORIGIN = 'https://us.i.posthog.com'
const shouldUseEdgeCache = import.meta.env.PROD

type WorkerEnv = {
  DB: D1Database
  ASSETS: Fetcher
  CACHE_PURGE_ORIGIN?: string
  NBA_BOX_SCORE_URL?: string
  NBA_GAME_LOG_URL?: string
  NBA_SCOREBOARD_URL?: string
  PURGE_SECRET?: string
}

export default {
  async fetch(
    request: Request,
    workerEnv: WorkerEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url)

    if (isPostHogIngestPath(url.pathname)) {
      return handlePostHogIngest(request, url)
    }

    if (url.pathname === '/api/purge-cache' && request.method === 'POST') {
      return handlePurge(request, url, workerEnv)
    }

    if (url.pathname === INSERT_GAMES_PATH && request.method === 'POST') {
      return handleInsertGames(request, url, workerEnv)
    }

    if (
      shouldUseEdgeCache &&
      request.method === 'GET' &&
      CACHEABLE_PATHS.has(url.pathname)
    ) {
      return handleCachedGet(request, ctx)
    }

    return startHandler(request)
  },

  async scheduled(controller: ScheduledController, workerEnv: WorkerEnv) {
    await handleScheduled(controller, workerEnv)
  },
} satisfies ExportedHandler<WorkerEnv>

function handlePostHogIngest(request: Request, requestUrl: URL) {
  const path = requestUrl.pathname.slice(POSTHOG_INGEST_PATH.length) || '/'
  const url = new URL(path + requestUrl.search, POSTHOG_INGEST_ORIGIN)
  const headers = new Headers(request.headers)
  headers.delete('cookie')

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

async function handleCachedGet(request: Request, ctx: ExecutionContext) {
  const cache = edgeCache

  const cached = await cache.match(request)
  if (cached) {
    return new Response(cached.body, {
      status: cached.status,
      statusText: cached.statusText,
      headers: appendCacheHit(cached.headers, true),
    })
  }

  const response = await startHandler(request)

  if (
    response.ok &&
    response.headers.get('cache-control')?.includes('s-maxage')
  ) {
    const toCache = new Response(response.clone().body, response)
    ctx.waitUntil(cache.put(request, toCache))
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: appendCacheHit(response.headers, false),
  })
}

async function handlePurge(
  request: Request,
  requestUrl: URL,
  workerEnv: WorkerEnv
): Promise<Response> {
  const unauthorized = getUnauthorizedResponse(request, workerEnv)
  if (unauthorized) {
    return unauthorized
  }

  const origin = `${requestUrl.protocol}//${requestUrl.host}`
  const purged = await purgeCachedPaths(origin)

  return Response.json({ ok: true, purged })
}

async function handleInsertGames(
  request: Request,
  requestUrl: URL,
  workerEnv: WorkerEnv
) {
  const unauthorized = getUnauthorizedResponse(request, workerEnv)
  if (unauthorized) {
    return unauthorized
  }

  const date = requestUrl.searchParams.get('date') ?? undefined
  const gameIds = getGameIds(requestUrl)

  try {
    const result = await insertGames(workerEnv, { date, gameIds })
    const origin = `${requestUrl.protocol}//${requestUrl.host}`
    const purged = await purgeCachedPaths(origin)

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

function getUnauthorizedResponse(request: Request, workerEnv: WorkerEnv) {
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
  workerEnv: WorkerEnv
) {
  try {
    console.log('Scheduled NBA game insert started', {
      cron: controller.cron,
      scheduledTime: getScheduledTime(controller),
    })

    const result = await insertGames(workerEnv)
    const purged = await purgeCachedPaths(workerEnv.CACHE_PURGE_ORIGIN)
    console.log('Scheduled NBA game insert completed', { ...result, purged })
  } catch (error) {
    console.error('Scheduled NBA game insert failed', error)
    throw error
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

async function purgeCachedPaths(origin: string | undefined) {
  if (!origin) {
    console.warn('CACHE_PURGE_ORIGIN is not configured; skipping cache purge')
    return []
  }

  const cache = edgeCache
  const purged: string[] = []

  for (const path of CACHEABLE_PATHS) {
    const url = new URL(path, origin)
    const ok = await cache.delete(new Request(url))
    if (ok) purged.push(path)
  }

  return purged
}

function appendCacheHit(headers: Headers, hit: boolean): Headers {
  const out = new Headers(headers)
  if (hit) {
    out.set('x-fb-cache', 'HIT')
    return out
  }

  out.set('x-fb-cache', 'MISS')
  return out
}
