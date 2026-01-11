import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/barns/[barnId]/health-checks - Log health check for a horse
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'dailycare:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Support both single check and bulk checks
    const checks = body.checks || [body];

    if (checks.length === 0) {
      return NextResponse.json({ error: 'At least one health check is required' }, { status: 400 });
    }

    const checkedBy = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const createdChecks = [];
    const horseNames: string[] = [];

    // Fetch all horses in one query to avoid N+1 problem
    const horseIds = checks.map((c: any) => c.horseId).filter(Boolean);
    const horses = await prisma.horse.findMany({
      where: {
        id: { in: horseIds },
        barnId: barnId
      },
    });

    const horsesMap = new Map(horses.map(h => [h.id, h]));

    for (const check of checks) {
      const {
        horseId,
        temperature,
        heartRate,
        respiratoryRate,
        overallCondition,
        appetite,
        manure,
        attitude,
        notes,
      } = check;

      if (!horseId) {
        continue; // Skip invalid entries
      }

      // Verify horse belongs to barn using pre-fetched map
      const horse = horsesMap.get(horseId);

      if (!horse) {
        continue; // Skip invalid horses
      }

      const healthCheck = await prisma.dailyHealthCheck.create({
        data: {
          horseId,
          temperature: temperature ? parseFloat(temperature) : null,
          heartRate: heartRate ? parseInt(heartRate) : null,
          respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
          overallCondition,
          appetite,
          manure,
          attitude,
          notes,
          checkedBy,
        },
      });

      createdChecks.push(healthCheck);
      horseNames.push(horse.barnName);
    }

    // Log activity
    if (createdChecks.length > 0) {
      await prisma.activityLog.create({
        data: {
          barnId: barnId,
          userId: user.id,
          type: 'HEALTH_CHECK_LOGGED',
          description: `Logged health check for ${horseNames.length} horse(s): ${horseNames.slice(0, 3).join(', ')}${horseNames.length > 3 ? '...' : ''}`,
          metadata: JSON.stringify({
            healthCheckIds: createdChecks.map(c => c.id),
            count: createdChecks.length
          }),
        },
      });
    }

    return NextResponse.json({
      data: createdChecks.length === 1 ? createdChecks[0] : createdChecks,
      count: createdChecks.length
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating health check:', error);
    return NextResponse.json({ error: 'Failed to create health check' }, { status: 500 });
  }
}

// GET recent health checks for the barn
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const horseId = searchParams.get('horseId');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '50');

    const healthChecks = await prisma.dailyHealthCheck.findMany({
      where: {
        horse: { barnId: barnId },
        ...(horseId && { horseId }),
        ...(date && {
          date: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
      include: {
        horse: {
          select: { id: true, barnName: true },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: healthChecks });
  } catch (error) {
    console.error('Error fetching health checks:', error);
    return NextResponse.json({ error: 'Failed to fetch health checks' }, { status: 500 });
  }
}
