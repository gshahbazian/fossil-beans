/**
 * Cache cacheable, server-rendered routes for five minutes in browsers and one
 * day at Cloudflare's edge. Cloudflare may serve stale responses for one week
 * while it revalidates them in the background.
 */
export const PRODUCTION_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300',
  'Cloudflare-CDN-Cache-Control':
    'public, max-age=86400, stale-while-revalidate=604800',
}
