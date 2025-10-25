import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/server/api-keys'

export async function GET(request: NextRequest) {
  const isValid = await verifyRequest(request)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 })
  }

  const path = request.nextUrl.searchParams.get('path') || '/'
  revalidateTag(path, 'max')
  return NextResponse.json({ success: true })
}
