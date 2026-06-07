import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'

const startHandler = createStartHandler(defaultStreamHandler)

// `caches.default` is a Cloudflare-specific extension to the standard
// CacheStorage interface that the DOM lib also declares; cast once here.
const edgeCache = (caches as unknown as { default: Cache }).default

const CACHEABLE_PATHS = new Set(['/'])
const POSTHOG_INGEST_PATH = '/ingest'
const POSTHOG_INGEST_ORIGIN = 'https://us.i.posthog.com'
const shouldUseEdgeCache = import.meta.env.PROD

export default {
  async fetch(
    request: Request,
    _env: unknown,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url)

    if (isPostHogIngestPath(url.pathname)) {
      return handlePostHogIngest(request, url)
    }

    if (url.pathname === '/api/purge-cache' && request.method === 'POST') {
      return handlePurge(request, url)
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
}

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
  requestUrl: URL
): Promise<Response> {
  const secret = (env as { PURGE_SECRET?: string }).PURGE_SECRET
  if (!secret) {
    return Response.json(
      { error: 'Purge endpoint not configured' },
      { status: 503 }
    )
  }

  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cache = edgeCache
  const origin = `${requestUrl.protocol}//${requestUrl.host}`
  const purged: string[] = []
  for (const path of CACHEABLE_PATHS) {
    const url = origin + path
    const ok = await cache.delete(new Request(url))
    if (ok) purged.push(path)
  }

  return Response.json({ ok: true, purged })
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
