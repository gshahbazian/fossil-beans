import { env } from '@/env'
import { storeApiKey } from '@/lib/api-keys'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  if (env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  const { consumerName } = await req.json()
  const apiKey = await storeApiKey(consumerName)
  return NextResponse.json({ apiKey })
}
