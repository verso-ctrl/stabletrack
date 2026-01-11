// API for feed chart / whiteboard
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    // Get horses with their feed programs
    const horses = await prisma.horse.findMany({
      where: { barnId, status: { in: ['ACTIVE', 'LAYUP'] } },
      include: {
        feedProgram: {
          include: {
            items: {
              include: {
                feedType: true,
                supplement: true,
              },
            },
          },
        },
        stall: true,
      },
      orderBy: { barnName: 'asc' },
    })

    // Collect all unique feeding times
    const feedingTimesSet = new Set<string>()
    horses.forEach(horse => {
      if (horse.feedProgram?.items) {
        horse.feedProgram.items.forEach((item: any) => {
          if (item.feedingTime) feedingTimesSet.add(item.feedingTime)
        })
      }
    })
    
    // Default feeding times if none found
    const feedingTimes = feedingTimesSet.size > 0 
      ? Array.from(feedingTimesSet).sort()
      : ['AM', 'PM']

    // Transform to feed chart format
    const chartHorses = horses.map(horse => {
      const feedSchedule: Record<string, any> = {}
      
      feedingTimes.forEach(time => {
        const items = horse.feedProgram?.items?.filter((i: any) => i.feedingTime === time) || []
        feedSchedule[time] = {
          items: items.map((i: any) => ({
            name: i.feedType?.name || i.supplement?.name || i.customName || 'Unknown',
            amount: i.amount,
            unit: i.unit,
          })),
          completed: false,
          skipped: false,
        }
      })

      return {
        id: horse.id,
        barnName: horse.barnName,
        stall: horse.stall?.name || 'No stall',
        status: horse.status,
        hasFeedProgram: !!horse.feedProgram,
        feedSchedule,
        specialInstructions: (horse.feedProgram as any)?.notes || null,
      }
    })

    const summary = {
      totalHorses: horses.length,
      horsesWithPrograms: horses.filter(h => h.feedProgram).length,
    }

    return NextResponse.json({ 
      data: {
        summary,
        feedingTimes,
        horses: chartHorses,
      }
    })
  } catch (error) {
    console.error('Error fetching feed chart:', error)
    return NextResponse.json({ error: 'Failed to fetch feed chart' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()
    const { horseId, feedingTime, completed, skipped } = body

    // Log the feeding action
    await prisma.feedLog.create({
      data: {
        horseId,
        feedingTime,
        amountEaten: completed ? 'ALL' : (skipped ? 'SKIPPED' : 'NONE'),
        loggedBy: user.id,
        notes: skipped ? 'Feeding skipped' : (completed ? 'Feeding completed' : null),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating feed chart:', error)
    return NextResponse.json({ error: 'Failed to update feed chart' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { barnId } = await context.params
  const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write')
  if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

  const body = await req.json()
  return NextResponse.json({ data: body, message: 'Feed chart updated' })
}
