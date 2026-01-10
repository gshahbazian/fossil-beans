import type { NextConfig } from 'next'

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.ts'

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        hostname: 'cdn.nba.com',
        pathname: '/headshots/nba/latest/**',
      },
      {
        hostname: 'cdn.nba.com',
        pathname: '/logos/nba/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/ph/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ph/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ph/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ]
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
}

export default nextConfig
