import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST as string | undefined
const DEFAULT_POSTHOG_HOST = '/ingest'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
      capture_pageview: false,
      capture_pageleave: true,
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const search = useRouterState({ select: (s) => s.location.searchStr })
  const posthog = usePostHog()

  useEffect(() => {
    if (typeof window === 'undefined' || !posthog) return

    posthog.capture('$pageview', {
      $current_url: getPageViewUrl(pathname, search),
    })
  }, [pathname, search, posthog])

  return null
}

function getPageViewUrl(pathname: string, search: string) {
  const origin = window.location.origin
  if (!search) return origin + pathname
  if (search.startsWith('?')) return origin + pathname + search

  return `${origin}${pathname}?${search}`
}
