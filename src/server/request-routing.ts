/** Keep this allowlist in sync when adding TanStack page routes. */
export function getUnknownRouteResponse(pathname: string) {
  if (pathname === '/') return
  if (pathname.startsWith('/_serverFn/')) return

  return new Response('Not Found', {
    status: 404,
    headers: {
      'Cache-Control': 'no-store',
      'Cloudflare-CDN-Cache-Control': 'no-store',
    },
  })
}
