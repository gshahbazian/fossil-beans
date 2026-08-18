import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST as string | undefined
const DEFAULT_POSTHOG_HOST = '/ingest'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
      // Opt into PostHog's current default behaviour. Most relevant here:
      // `capture_pageview` becomes 'history_change', so the SDK captures the
      // initial pageview plus every History API navigation on its own, and
      // `capture_pageleave` follows it. Also strips URL hashes from captured
      // URLs and injects PostHog's external scripts into <head> so they do not
      // disturb SSR hydration.
      defaults: '2026-06-25',
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
