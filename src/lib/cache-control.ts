/**
 * Revalidate HTML in the browser on every visit so deployments cannot leave it
 * pointing at old client assets. Bound edge freshness to one minute even if an
 * insert's cache purge fails. Require foreground revalidation after expiry;
 * never hide refresh errors behind stale scores.
 */
export const PRODUCTION_CACHE_HEADERS = {
  'Cache-Control': 'no-cache',
  'Cloudflare-CDN-Cache-Control':
    'public, max-age=60, must-revalidate, stale-if-error=0',
}
