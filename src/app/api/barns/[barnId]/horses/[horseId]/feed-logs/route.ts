import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/barns/[barnId]/horses/[horseId]/feed-logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string }> }
) {
  try {
    const { barnId, horseId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));
    const date = searchParams.get('date');

    const feedLogs = await prisma.feedLog.findMany({
      where: {
        horseId: horseId,
        ...(date && {
          loggedAt: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
      include: {
        feedType: true,
      },
      orderBy: { loggedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: feedLogs });
  } catch (error) {
    console.error('Error fetching feed logs:', error);
    return NextResponse.json({ error: 'Failed to fetch feed logs' }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/horses/[horseId]/feed-logs
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string }> }
) {
  try {
    const { barnId, horseId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'dailycare:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { feedingTime, amountEaten, notes, loggedAt } = body;

    // Verify horse belongs to barn
    const horse = await prisma.horse.findFirst({
      where: { id: horseId, barnId: barnId },
    });

    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }

    const feedLog = await prisma.feedLog.create({
      data: {
        horseId: horseId,
        feedingTime: feedingTime || 'AM',
        amountEaten: amountEaten || 'ALL',
        notes,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        loggedBy: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      },
    });

    return NextResponse.json({ data: feedLog }, { status: 201 });
  } catch (error) {
    console.error('Error creating feed log:', error);
    return NextResponse.json({ error: 'Failed to create feed log' }, { status: 500 });
  }
}
