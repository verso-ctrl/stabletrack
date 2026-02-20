// Stub API for iCal calendar feed
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  const { barnId } = await context.params
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }

  // Fetch barn name for calendar title
  const barn = await prisma.barn.findUnique({
    where: { id: barnId },
    select: { name: true },
  })
  const barnName = barn?.name || 'My Farm'

  // Generate a basic iCal feed
  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BarnKeep//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:BarnKeep - ${barnName}
BEGIN:VEVENT
DTSTART:${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Farrier Visit - All Horses
DESCRIPTION:Regular farrier appointment
UID:${barnId}-event-001@barnkeep.com
END:VEVENT
END:VCALENDAR`

  return new NextResponse(icalContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="barnkeep.ics"',
    },
  })
}
