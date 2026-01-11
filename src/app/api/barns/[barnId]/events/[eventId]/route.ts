// API route for individual event operations
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'

type RouteContext = { params: Promise<{ barnId: string; eventId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, eventId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'events:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const event = await prisma.event.findFirst({
      where: { id: eventId, barnId },
      include: {
        horse: { select: { id: true, barnName: true } },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ data: event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, eventId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'events:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()
    const { title, description, type, scheduledDate, completedDate, allDay, horseId, status, location } = body

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        type,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        completedDate: completedDate ? new Date(completedDate) : undefined,
        horseId,
        status,
      },
      include: {
        horse: { select: { id: true, barnName: true } },
      },
    })

    return NextResponse.json({ data: event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, eventId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'events:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    await prisma.event.delete({ where: { id: eventId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
