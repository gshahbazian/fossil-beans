import { getAllTodayGames } from '@/server/db/queries'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const games = await getAllTodayGames()

  return NextResponse.json(games)
}
