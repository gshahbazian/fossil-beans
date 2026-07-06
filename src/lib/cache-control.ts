/**
 * Cache-Control for cacheable, server-rendered routes. The browser honors
 * `max-age`; Cloudflare's native Workers Cache (enabled in wrangler.jsonc) sits
 * in front of the Worker and honors `s-maxage` + `stale-while-revalidate`.
 */
export const PRODUCTION_CACHE_CONTROL =
  'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'
