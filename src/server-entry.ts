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

export default {
  async fetch(
    request: Request,
    _env: unknown,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/purge-cache' && request.method === 'POST') {
      return handlePurge(request, url)
    }

    if (request.method === 'GET' && CACHEABLE_PATHS.has(url.pathname)) {
      return handleCachedGet(request, ctx)
    }

    return startHandler(request)
  },
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

  if (response.ok && response.headers.get('cache-control')?.includes('s-maxage')) {
    const toCache = new Response(response.clone().body, response)
    ctx.waitUntil(cache.put(request, toCache))
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: appendCacheHit(response.headers, false),
  })
}

async function handlePurge(request: Request, requestUrl: URL): Promise<Response> {
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
  out.set('x-fb-cache', hit ? 'HIT' : 'MISS')
  return out
}
