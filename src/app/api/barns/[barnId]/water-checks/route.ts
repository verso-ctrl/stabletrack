import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// We'll store water checks in FeedLog with a special feedingTime value
// Or we can create a simple in-memory/JSON storage for demo

// POST /api/barns/[barnId]/water-checks - Log water checks for multiple horses
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
    const { checks, notes } = body;

    // checks is an array of { horseId, waterLevel, waterQuality, refilled }
    if (!checks || !Array.isArray(checks) || checks.length === 0) {
      return NextResponse.json({ error: 'No checks provided' }, { status: 400 });
    }

    const loggedBy = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const now = new Date();

    // Store water checks as feed logs with feedingTime='WATER'
    const createdLogs = await prisma.feedLog.createMany({
      data: checks.map((check: { horseId: string; waterLevel: string; waterQuality: string; refilled: boolean }) => ({
        horseId: check.horseId,
        feedingTime: 'WATER',
        amountEaten: check.waterLevel,
        notes: `Quality: ${check.waterQuality}${check.refilled ? ', Refilled' : ''}${notes ? `. ${notes}` : ''}`,
        loggedAt: now,
        loggedBy,
      })),
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'WATER_CHECKED',
        description: `Logged water check for ${checks.length} horse(s)`,
        metadata: JSON.stringify({ count: checks.length }),
      },
    });

    return NextResponse.json({ data: { count: createdLogs.count } }, { status: 201 });
  } catch (error) {
    console.error('Error creating water checks:', error);
    return NextResponse.json({ error: 'Failed to create water checks' }, { status: 500 });
  }
}

// GET recent water checks for the barn
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

    const waterChecks = await prisma.feedLog.findMany({
      where: {
        horse: { barnId: barnId },
        feedingTime: 'WATER',
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

    return NextResponse.json({ data: waterChecks });
  } catch (error) {
    console.error('Error fetching water checks:', error);
    return NextResponse.json({ error: 'Failed to fetch water checks' }, { status: 500 });
  }
}
