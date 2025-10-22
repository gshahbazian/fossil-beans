import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/server/api-keys'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const isValid = await verifyRequest(request)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 })
  }

  const path = request.nextUrl.searchParams.get('path') || '/'
  revalidatePath(path)
  // GABE: this re-caches the page for the next request
  redirect(path)
}
