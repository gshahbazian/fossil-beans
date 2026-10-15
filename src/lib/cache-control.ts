/**
 * Revalidate HTML in the browser on every visit so deployments cannot leave it
 * pointing at old client assets. Cloudflare caches it for one day within the
 * deployed Worker version and may serve stale responses for one week while
 * revalidating them in the background.
 */
export const PRODUCTION_CACHE_HEADERS = {
  'Cache-Control': 'no-cache',
  'Cloudflare-CDN-Cache-Control':
    'public, max-age=86400, stale-while-revalidate=604800',
}
