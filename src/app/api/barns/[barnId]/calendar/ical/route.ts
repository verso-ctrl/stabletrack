// API for iCal calendar feed
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

type RouteContext = { params: Promise<{ barnId: string }> }

// Generate a deterministic token for a barn using a secret
function generateICalToken(barnId: string): string {
  const secret = process.env.ICAL_TOKEN_SECRET || process.env.CLERK_SECRET_KEY || 'barnkeep-ical-secret'
  return crypto.createHmac('sha256', secret).update(barnId).digest('hex').substring(0, 32)
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { barnId } = await context.params
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 })
  }

  // Validate token matches expected value for this barn
  const expectedToken = generateICalToken(barnId)
  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Verify barn exists
  const barn = await prisma.barn.findUnique({
    where: { id: barnId },
    select: { name: true },
  })

  if (!barn) {
    return NextResponse.json({ error: 'Barn not found' }, { status: 404 })
  }

  // Fetch actual events from the barn
  const events = await prisma.event.findMany({
    where: {
      barnId,
      scheduledDate: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
        lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // next 90 days
      },
    },
    include: {
      horse: { select: { barnName: true } },
    },
    orderBy: { scheduledDate: 'asc' },
    take: 200,
  })

  // Generate iCal content
  const vevents = events.map(event => {
    const start = new Date(event.scheduledDate)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour default
    const dtStart = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const dtEnd = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const summary = event.horse?.barnName
      ? `${event.title} - ${event.horse.barnName}`
      : event.title
    const description = event.description || ''

    return `BEGIN:VEVENT
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${summary.replace(/[,;\\]/g, ' ')}
DESCRIPTION:${description.replace(/[,;\\]/g, ' ').replace(/\n/g, '\\n')}
UID:${event.id}@barnkeep.com
END:VEVENT`
  }).join('\n')

  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BarnKeep//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:BarnKeep - ${barn.name}
${vevents}
END:VCALENDAR`

  return new NextResponse(icalContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="barnkeep.ics"',
    },
  })
}

// Export the token generator for use by the settings page
export { generateICalToken }
