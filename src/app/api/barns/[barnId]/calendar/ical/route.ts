// iCal feed — disabled until ICAL_TOKEN_SECRET is configured
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'iCal feed is not available' },
    { status: 404 }
  )
}
