/**
 * Revalidate HTML in the browser on every visit so deployments cannot leave it
 * pointing at old client assets. Cache at the edge for 30 minutes as a fallback;
 * successful imports purge sooner. Require foreground revalidation after expiry;
 * never hide refresh errors behind stale scores.
 */
export const PRODUCTION_CACHE_HEADERS = {
  'Cache-Control': 'no-cache',
  'Cloudflare-CDN-Cache-Control':
    'public, max-age=1800, must-revalidate, stale-if-error=0',
}
