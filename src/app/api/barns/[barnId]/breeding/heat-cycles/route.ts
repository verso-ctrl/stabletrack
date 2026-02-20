import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceFeatureAccess } from '@/lib/tier-validation';

// GET /api/barns/[barnId]/breeding/heat-cycles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const { searchParams } = new URL(request.url);
    const mareId = searchParams.get('mareId');
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));

    const cycles = await prisma.heatCycle.findMany({
      where: {
        barnId,
        ...(mareId && { horseId: mareId }),
      },
      include: {
        horse: { select: { id: true, barnName: true, profilePhotoUrl: true } },
      },
      orderBy: { startDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: cycles });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch heat cycles';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    console.error('Error fetching heat cycles:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/breeding/heat-cycles
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const body = await request.json();
    const { horseId, startDate, endDate, intensity, signs, notes } = body;

    if (!horseId || !startDate) {
      return NextResponse.json({ error: 'Horse ID and start date are required' }, { status: 400 });
    }

    // Verify horse belongs to barn and is a mare/filly
    const horse = await prisma.horse.findFirst({
      where: { id: horseId, barnId },
    });
    if (!horse) return NextResponse.json({ error: 'Horse not found' }, { status: 404 });

    // Calculate cycle length from previous cycles
    const previousCycles = await prisma.heatCycle.findMany({
      where: { horseId, barnId },
      orderBy: { startDate: 'desc' },
      take: 3,
    });

    let cycleLength = 21;
    if (previousCycles.length >= 2) {
      const gaps: number[] = [];
      for (let i = 0; i < previousCycles.length - 1; i++) {
        const gap = Math.round(
          (previousCycles[i].startDate.getTime() - previousCycles[i + 1].startDate.getTime()) /
          (1000 * 60 * 60 * 24)
        );
        if (gap > 0 && gap < 60) gaps.push(gap);
      }
      if (gaps.length > 0) {
        cycleLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
      }
    }

    const start = new Date(startDate);
    const predictedNextDate = new Date(start);
    predictedNextDate.setDate(predictedNextDate.getDate() + cycleLength);

    const cycle = await prisma.heatCycle.create({
      data: {
        barnId,
        horseId,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        intensity: intensity || null,
        signs: Array.isArray(signs) ? signs : [],
        notes: notes || null,
        cycleLength,
        predictedNextDate,
      },
      include: {
        horse: { select: { id: true, barnName: true, profilePhotoUrl: true } },
      },
    });

    // Create task reminder 2 days before predicted next heat
    const reminderDate = new Date(predictedNextDate);
    reminderDate.setDate(reminderDate.getDate() - 2);
    if (reminderDate > new Date()) {
      await prisma.task.create({
        data: {
          barnId,
          horseId,
          title: `${horse.barnName} - Heat cycle expected`,
          description: `Predicted heat cycle starting around ${predictedNextDate.toLocaleDateString()}. Watch for signs.`,
          dueDate: reminderDate,
          priority: 'MEDIUM',
          status: 'PENDING',
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        barnId,
        userId: user.id,
        type: 'HEAT_CYCLE_LOGGED',
        description: `Logged heat cycle for ${horse.barnName}`,
        metadata: JSON.stringify({ cycleId: cycle.id, horseId }),
      },
    });

    return NextResponse.json({ data: cycle }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to log heat cycle';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    console.error('Error logging heat cycle:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
