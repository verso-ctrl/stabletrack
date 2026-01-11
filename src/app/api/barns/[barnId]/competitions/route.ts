// API for competitions
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission, getClientAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'competitions:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const horseId = searchParams.get('horseId')

    // Check if user is a client (to filter to their horses only)
    const clientAccess = await getClientAccess(user.id, barnId)
    const isClient = !!clientAccess && !await prisma.barnMember.findUnique({
      where: { userId_barnId: { userId: user.id, barnId } },
    })
    
    // Get client's horse IDs if client
    const clientHorseIds = isClient && clientAccess 
      ? clientAccess.horses.map((h: { horseId: string }) => h.horseId)
      : null

    const competitions = await prisma.competition.findMany({
      where: { 
        barnId,
        ...(horseId && { horseId }),
        // If client, only show their horses' competitions
        ...(clientHorseIds && { horseId: { in: clientHorseIds } }),
      },
      include: {
        horse: {
          select: { id: true, barnName: true, profilePhotoUrl: true },
        },
      },
      orderBy: { eventDate: 'desc' },
    })
    
    // Calculate stats for the response
    const stats = {
      totalShows: new Set(competitions.map(c => `${c.eventName}-${c.eventDate}`)).size,
      totalWins: competitions.filter(c => c.placing === 1).length,
      championships: competitions.filter(c => c.isChampion).length,
      totalPoints: competitions.reduce((sum, c) => sum + (c.points || 0), 0),
    }
    
    return NextResponse.json({ data: competitions, stats })
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'competitions:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()
    
    const competition = await prisma.competition.create({
      data: {
        barnId,
        horseId: body.horseId,
        riderId: body.riderId,
        eventName: body.eventName,
        eventDate: new Date(body.eventDate),
        location: body.location,
        organization: body.organization,
        className: body.className,
        division: body.division,
        placing: body.placing ? parseInt(body.placing) : null,
        entries: body.entries ? parseInt(body.entries) : null,
        score: body.score ? parseFloat(body.score) : null,
        points: body.points ? parseFloat(body.points) : null,
        prize: body.prize ? parseFloat(body.prize) : null,
        isChampion: body.isChampion ?? false,
        isReserve: body.isReserve ?? false,
        notes: body.notes,
      },
      include: {
        horse: {
          select: { id: true, barnName: true, profilePhotoUrl: true },
        },
      },
    })
    
    return NextResponse.json({ data: competition })
  } catch (error) {
    console.error('Error creating competition:', error)
    return NextResponse.json({ error: 'Failed to create competition' }, { status: 500 })
  }
}
