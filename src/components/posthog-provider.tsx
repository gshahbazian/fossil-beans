import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST as string | undefined

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST ?? 'https://us.i.posthog.com',
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
    let url = window.location.origin + pathname
    if (search) url += search.startsWith('?') ? search : `?${search}`
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, search, posthog])

  return null
}
