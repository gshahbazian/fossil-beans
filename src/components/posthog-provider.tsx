import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { env } from '@/lib/env'
import { useMountEffect } from '@/hooks/use-mount-effect'

const DEFAULT_POSTHOG_HOST = '/ingest'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useMountEffect(() => {
    if (!env.VITE_POSTHOG_KEY) return

    posthog.init(env.VITE_POSTHOG_KEY, {
      api_host: env.VITE_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
      // Opt into PostHog's current default behaviour. Most relevant here:
      // `capture_pageview` becomes 'history_change', so the SDK captures the
      // initial pageview plus every History API navigation on its own, and
      // `capture_pageleave` follows it. Also strips URL hashes from captured
      // URLs and injects PostHog's external scripts into <head> so they do not
      // disturb SSR hydration. Later snapshots prefer the shared cookie over
      // stale localStorage identity, and capture sanitized JSON-LD in replay.
      defaults: '2026-08-30',
    })
  })

  return <PHProvider client={posthog}>{children}</PHProvider>
}
