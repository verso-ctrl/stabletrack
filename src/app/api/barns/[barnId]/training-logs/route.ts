// API for training logs
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'training:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const horseId = searchParams.get('horseId')
    const trainerId = searchParams.get('trainerId')
    const type = searchParams.get('type')

    const logs = await prisma.trainingLog.findMany({
      where: { 
        barnId,
        ...(horseId && { horseId }),
        ...(trainerId && { trainerId }),
        ...(type && { type }),
      },
      include: {
        horse: {
          select: { id: true, barnName: true, profilePhotoUrl: true },
        },
        trainer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { date: 'desc' },
    })
    
    return NextResponse.json({ data: logs })
  } catch (error) {
    console.error('Error fetching training logs:', error)
    return NextResponse.json({ error: 'Failed to fetch training logs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'training:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()
    
    const log = await prisma.trainingLog.create({
      data: {
        barnId,
        horseId: body.horseId,
        trainerId: body.trainerId || user.id,
        date: new Date(body.date),
        duration: body.duration || 60,
        type: body.type || 'OTHER',
        focus: body.focus,
        goals: body.goals,
        exercises: body.exercises,
        rating: body.rating,
        notes: body.notes,
        nextSteps: body.nextSteps,
      },
      include: {
        horse: {
          select: { id: true, barnName: true, profilePhotoUrl: true },
        },
        trainer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })
    
    return NextResponse.json({ data: log })
  } catch (error) {
    console.error('Error creating training log:', error)
    return NextResponse.json({ error: 'Failed to create training log' }, { status: 500 })
  }
}
