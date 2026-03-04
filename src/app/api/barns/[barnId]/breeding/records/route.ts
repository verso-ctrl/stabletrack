import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceFeatureAccess } from '@/lib/tier-validation';

// GET /api/barns/[barnId]/breeding/records
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
    const stallionId = searchParams.get('stallionId');
    const status = searchParams.get('status');
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));

    const records = await prisma.breedingRecord.findMany({
      where: {
        barnId,
        ...(mareId && { mareId }),
        ...(stallionId && { stallionId }),
        ...(status && { status }),
      },
      include: {
        mare: { select: { id: true, barnName: true, profilePhotoUrl: true } },
        stallion: { select: { id: true, barnName: true } },
        externalStallion: { select: { id: true, name: true, studFarm: true } },
        foalingRecord: { select: { id: true, actualDate: true, foalName: true, outcome: true, foalId: true } },
      },
      orderBy: { breedingDate: 'desc' },
      take: limit,
    });

    // Parse pregnancyChecks JSON string to array
    const data = records.map(r => ({
      ...r,
      pregnancyChecks: r.pregnancyChecks
        ? (() => { try { return JSON.parse(r.pregnancyChecks!); } catch { return []; } })()
        : [],
    }));

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch breeding records';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    console.error('Error fetching breeding records:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/breeding/records
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
    const { mareId, stallionId, externalStallionId, breedingDate, breedingType, veterinarian, facility, cost, notes } = body;

    if (!mareId || !breedingDate || !breedingType) {
      return NextResponse.json({ error: 'Mare, breeding date, and breeding type are required' }, { status: 400 });
    }

    if (!stallionId && !externalStallionId) {
      return NextResponse.json({ error: 'Either an internal stallion or external stallion is required' }, { status: 400 });
    }

    if (stallionId && externalStallionId) {
      return NextResponse.json({ error: 'Provide either an internal or external stallion, not both' }, { status: 400 });
    }

    // Verify mare belongs to barn
    const mare = await prisma.horse.findFirst({ where: { id: mareId, barnId } });
    if (!mare) return NextResponse.json({ error: 'Mare not found' }, { status: 404 });

    // Verify stallion if internal
    if (stallionId) {
      const stallion = await prisma.horse.findFirst({ where: { id: stallionId, barnId } });
      if (!stallion) return NextResponse.json({ error: 'Stallion not found' }, { status: 404 });
    }

    // Verify external stallion
    if (externalStallionId) {
      const ext = await prisma.externalStallion.findFirst({ where: { id: externalStallionId, barnId } });
      if (!ext) return NextResponse.json({ error: 'External stallion not found' }, { status: 404 });
    }

    // Calculate estimated due date (340 days from breeding)
    const date = new Date(breedingDate);
    const estimatedDueDate = new Date(date);
    estimatedDueDate.setDate(estimatedDueDate.getDate() + 340);

    const record = await prisma.breedingRecord.create({
      data: {
        barnId,
        mareId,
        stallionId: stallionId || null,
        externalStallionId: externalStallionId || null,
        breedingDate: date,
        breedingType,
        veterinarian: veterinarian || null,
        facility: facility || null,
        estimatedDueDate,
        cost: cost ? Math.max(0, parseFloat(cost) || 0) : null,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        mare: { select: { id: true, barnName: true, profilePhotoUrl: true } },
        stallion: { select: { id: true, barnName: true } },
        externalStallion: { select: { id: true, name: true, studFarm: true } },
      },
    });

    // Create pregnancy check reminder at 14 days
    const checkDate = new Date(date);
    checkDate.setDate(checkDate.getDate() + 14);
    if (checkDate > new Date()) {
      await prisma.task.create({
        data: {
          barnId,
          horseId: mareId,
          title: `${mare.barnName} - Schedule pregnancy check`,
          description: `Bred on ${date.toLocaleDateString()}. Schedule ultrasound at 14-16 days post-breeding.`,
          dueDate: checkDate,
          priority: 'HIGH',
          status: 'PENDING',
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        barnId,
        userId: user.id,
        type: 'BREEDING_RECORDED',
        description: `Recorded ${breedingType} breeding for ${mare.barnName}`,
        metadata: JSON.stringify({ recordId: record.id, mareId }),
      },
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create breeding record';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    console.error('Error creating breeding record:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
