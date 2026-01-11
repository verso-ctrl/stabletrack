// Stub API for iCal calendar feed
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  const { barnId } = await context.params
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }

  // Generate a basic iCal feed
  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//StableTrack//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:StableTrack - Willowbrook Farm
BEGIN:VEVENT
DTSTART:${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Farrier Visit - All Horses
DESCRIPTION:Regular farrier appointment
UID:${barnId}-event-001@stabletrack.app
END:VEVENT
END:VCALENDAR`

  return new NextResponse(icalContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="stabletrack.ics"',
    },
  })
}
