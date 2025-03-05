import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  console.log(
    'REQ',
    req.nextUrl.pathname,
    JSON.stringify([...req.headers].filter(([k]) => k.startsWith('x-')))
  )
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/yesterday'],
}
