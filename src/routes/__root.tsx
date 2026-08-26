/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import geistSansUrl from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import geistMonoUrl from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url'
import appCss from '@/styles/globals.css?url'
import { PostHogProvider } from '@/components/posthog-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Fossil Beans' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/icon.png' },
      {
        rel: 'preload',
        href: geistSansUrl,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: geistMonoUrl,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        type: 'image/png',
        href: '/apple-touch-icon.png',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-x-hidden">
        <PostHogProvider>
          <TooltipProvider>
            <Outlet />
          </TooltipProvider>
        </PostHogProvider>
        <Scripts />
      </body>
    </html>
  )
}
