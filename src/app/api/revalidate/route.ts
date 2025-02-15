import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
  revalidatePath('/')
  return NextResponse.json({ success: true })
}
