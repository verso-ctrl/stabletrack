import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceFeatureAccess, enforceHorseLimit } from '@/lib/tier-validation';

// GET /api/barns/[barnId]/breeding/foalings
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

    const foalings = await prisma.foalingRecord.findMany({
      where: {
        barnId,
        ...(mareId && { mareId }),
      },
      include: {
        mare: { select: { id: true, barnName: true, profilePhotoUrl: true } },
        foal: { select: { id: true, barnName: true, profilePhotoUrl: true } },
        breedingRecord: {
          select: {
            stallion: { select: { id: true, barnName: true } },
            externalStallion: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { actualDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: foalings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch foaling records';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    console.error('Error fetching foalings:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/breeding/foalings - Record a foaling (auto-creates foal Horse if outcome=LIVE)
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
    const { breedingRecordId, actualDate, foalSex, foalColor, foalName, birthWeight, outcome, complications, veterinarian, notes } = body;

    if (!breedingRecordId || !actualDate) {
      return NextResponse.json({ error: 'Breeding record and actual date are required' }, { status: 400 });
    }

    // Fetch the breeding record with mare and stallion info
    const breedingRecord = await prisma.breedingRecord.findFirst({
      where: { id: breedingRecordId, barnId },
      include: {
        mare: true,
        stallion: true,
        externalStallion: true,
        foalingRecord: true,
      },
    });

    if (!breedingRecord) {
      return NextResponse.json({ error: 'Breeding record not found' }, { status: 404 });
    }

    if (breedingRecord.foalingRecord) {
      return NextResponse.json({ error: 'A foaling record already exists for this breeding' }, { status: 409 });
    }

    const foalingOutcome = outcome || 'LIVE';
    let foalId: string | null = null;

    // Auto-create foal Horse if outcome is LIVE
    if (foalingOutcome === 'LIVE') {
      await enforceHorseLimit(barnId);

      const foalHorse = await prisma.horse.create({
        data: {
          barnId,
          barnName: foalName || `${breedingRecord.mare.barnName}'s Foal`,
          breed: breedingRecord.mare.breed,
          color: foalColor || null,
          dateOfBirth: new Date(actualDate),
          sex: foalSex || null,
          status: 'ACTIVE',
          sireId: breedingRecord.stallionId || null,
          damId: breedingRecord.mareId,
          ownerName: breedingRecord.mare.ownerName,
          ownerEmail: breedingRecord.mare.ownerEmail,
          ownerPhone: breedingRecord.mare.ownerPhone,
        },
      });

      foalId = foalHorse.id;
    }

    // Create the foaling record
    const foalingRecord = await prisma.foalingRecord.create({
      data: {
        barnId,
        breedingRecordId,
        mareId: breedingRecord.mareId,
        foalId,
        dueDate: breedingRecord.estimatedDueDate,
        actualDate: new Date(actualDate),
        foalSex: foalSex || null,
        foalColor: foalColor || null,
        foalName: foalName || null,
        birthWeight: birthWeight ? parseFloat(birthWeight) : null,
        outcome: foalingOutcome,
        complications: complications || null,
        veterinarian: veterinarian || null,
        notes: notes || null,
      },
      include: {
        mare: { select: { id: true, barnName: true } },
        foal: { select: { id: true, barnName: true, profilePhotoUrl: true } },
        breedingRecord: {
          select: {
            stallion: { select: { id: true, barnName: true } },
            externalStallion: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Update breeding record status to FOALED
    await prisma.breedingRecord.update({
      where: { id: breedingRecordId },
      data: { status: 'FOALED' },
    });

    // Log activity
    const description = foalingOutcome === 'LIVE'
      ? `Foal "${foalName || 'unnamed'}" born to ${breedingRecord.mare.barnName}`
      : `Foaling recorded for ${breedingRecord.mare.barnName} (${foalingOutcome.toLowerCase()})`;

    await prisma.activityLog.create({
      data: {
        barnId,
        userId: user.id,
        type: 'FOALING_RECORDED',
        description,
        metadata: JSON.stringify({
          foalingRecordId: foalingRecord.id,
          foalId,
          mareId: breedingRecord.mareId,
          outcome: foalingOutcome,
        }),
      },
    });

    return NextResponse.json({ data: foalingRecord }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record foaling';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    if (message.includes('Horse limit')) return NextResponse.json({ error: message }, { status: 403 });
    console.error('Error recording foaling:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
