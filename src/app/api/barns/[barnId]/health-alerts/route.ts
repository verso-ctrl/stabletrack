import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, verifyBarnAccess } from '@/lib/auth';

// GET /api/barns/[barnId]/health-alerts - Get horses with health concerns
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

    const hasAccess = await verifyBarnAccess(user.id, barnId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Optimized: Get only the most recent check per horse using a subquery approach
    // First, get distinct horse IDs with recent checks
    const horsesWithRecentChecks = await prisma.dailyHealthCheck.findMany({
      where: {
        horse: { barnId },
        date: {
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000), // Last 48 hours
        },
      },
      select: {
        horseId: true,
        date: true,
      },
      orderBy: { date: 'desc' },
      distinct: ['horseId'],
      take: 50, // Limit to prevent large result sets
    });

    // Then fetch full details only for these specific checks
    const horseIds = horsesWithRecentChecks.map(h => h.horseId);
    const recentChecks = await prisma.dailyHealthCheck.findMany({
      where: {
        horseId: { in: horseIds },
        date: {
          in: horsesWithRecentChecks.map(h => h.date),
        },
      },
      include: {
        horse: {
          select: {
            id: true,
            barnName: true,
            profilePhotoUrl: true,
            status: true,
          },
        },
      },
    });

    // Convert to Map for unique checks
    const horseChecks = new Map();
    for (const check of recentChecks) {
      if (!horseChecks.has(check.horseId)) {
        horseChecks.set(check.horseId, check);
      }
    }

    // Filter for concerning conditions
    const alerts: any[] = [];
    horseChecks.forEach((check) => {
      const concerns: any[] = [];
      
      // Check overall condition
      if (check.overallCondition === 'Poor' || check.overallCondition === 'Critical') {
        concerns.push({
          type: 'condition',
          severity: check.overallCondition === 'Critical' ? 'critical' : 'warning',
          message: `Condition: ${check.overallCondition}`,
        });
      }
      
      // Check appetite
      if (check.appetite === 'Decreased' || check.appetite === 'None') {
        concerns.push({
          type: 'appetite',
          severity: check.appetite === 'None' ? 'critical' : 'warning',
          message: `Appetite: ${check.appetite}`,
        });
      }
      
      // Check attitude
      if (check.attitude === 'Depressed' || check.attitude === 'Dull') {
        concerns.push({
          type: 'attitude',
          severity: check.attitude === 'Depressed' ? 'critical' : 'warning',
          message: `Attitude: ${check.attitude}`,
        });
      }
      
      // Check manure
      if (check.manure === 'Diarrhea') {
        concerns.push({
          type: 'manure',
          severity: 'warning',
          message: `Manure: ${check.manure}`,
        });
      }

      if (concerns.length > 0) {
        alerts.push({
          horse: check.horse,
          checkDate: check.date,
          concerns,
          notes: check.notes,
          hasCritical: concerns.some(c => c.severity === 'critical'),
        });
      }
    });

    // Sort by severity (critical first) then by date
    alerts.sort((a, b) => {
      if (a.hasCritical && !b.hasCritical) return -1;
      if (!a.hasCritical && b.hasCritical) return 1;
      return new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime();
    });

    return NextResponse.json({ data: alerts });
  } catch (error) {
    console.error('Error fetching health alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health alerts' },
      { status: 500 }
    );
  }
}
