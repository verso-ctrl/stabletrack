import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceFeatureAccess } from '@/lib/tier-validation';

// GET /api/barns/[barnId]/breeding/stats
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

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const sixtyDaysFromNow = new Date(now);
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      activeHeatCycles,
      predictedSoon,
      activePregnancies,
      upcomingDueDates,
      foalsThisYear,
    ] = await Promise.all([
      // Mares currently in heat (have start but no end date)
      prisma.heatCycle.count({
        where: {
          barnId,
          startDate: { lte: now },
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      }),
      // Mares with predicted heat within 3 days
      prisma.heatCycle.count({
        where: {
          barnId,
          predictedNextDate: { lte: threeDaysFromNow, gte: now },
        },
      }),
      // Active pregnancies
      prisma.breedingRecord.count({
        where: { barnId, status: 'CONFIRMED_PREGNANT' },
      }),
      // Due dates within next 60 days
      prisma.breedingRecord.count({
        where: {
          barnId,
          status: 'CONFIRMED_PREGNANT',
          estimatedDueDate: { lte: sixtyDaysFromNow, gte: now },
        },
      }),
      // Foals born this year
      prisma.foalingRecord.count({
        where: {
          barnId,
          outcome: 'LIVE',
          actualDate: { gte: startOfYear },
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        maresInHeat: activeHeatCycles + predictedSoon,
        activePregnancies,
        upcomingDueDates,
        foalsThisYear,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch breeding stats';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    console.error('Error fetching breeding stats:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
