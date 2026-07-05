/**
 * Edge Cache-Control for cacheable, server-rendered routes. Used both as the
 * route header (browser + framework) and by the Worker as the authoritative
 * header when it stores the response in `caches.default`.
 */
export const PRODUCTION_CACHE_CONTROL =
  'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'
