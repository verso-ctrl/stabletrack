import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/barns/[barnId]/feed-logs - Batch create feed logs for multiple horses
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
    const { logs, feedingTime, notes } = body;

    // logs is an array of { horseId, amountEaten }
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ error: 'No logs provided' }, { status: 400 });
    }

    const loggedBy = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const now = new Date();

    const createdLogs = await prisma.feedLog.createMany({
      data: logs.map((log: { horseId: string; amountEaten: string }) => ({
        horseId: log.horseId,
        feedingTime: feedingTime || 'AM',
        amountEaten: log.amountEaten || 'ALL',
        notes,
        loggedAt: now,
        loggedBy,
      })),
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'FEED_LOGGED',
        description: `Logged ${feedingTime || 'AM'} feeding for ${logs.length} horse(s)`,
        metadata: JSON.stringify({ count: logs.length, feedingTime }),
      },
    });

    return NextResponse.json({ data: { count: createdLogs.count } }, { status: 201 });
  } catch (error) {
    console.error('Error creating batch feed logs:', error);
    return NextResponse.json({ error: 'Failed to create feed logs' }, { status: 500 });
  }
}

// GET recent feed logs for the barn
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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const feedLogs = await prisma.feedLog.findMany({
      where: {
        horse: { barnId: barnId },
        loggedAt: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        horse: {
          select: { id: true, barnName: true },
        },
      },
      orderBy: { loggedAt: 'desc' },
    });

    return NextResponse.json({ data: feedLogs });
  } catch (error) {
    console.error('Error fetching feed logs:', error);
    return NextResponse.json({ error: 'Failed to fetch feed logs' }, { status: 500 });
  }
}
