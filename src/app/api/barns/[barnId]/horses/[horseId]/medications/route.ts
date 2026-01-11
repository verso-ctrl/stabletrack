import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/barns/[barnId]/horses/[horseId]/medications
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
    const status = searchParams.get('status');

    const medications = await prisma.medication.findMany({
      where: {
        horseId: horseId,
        ...(status && { status }),
      },
      include: {
        logs: {
          orderBy: { givenAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ data: medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/horses/[horseId]/medications
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

    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      dosage,
      frequency,
      route,
      prescribingVet,
      startDate,
      endDate,
      isControlled,
      refillsRemaining,
      pharmacy,
      instructions,
    } = body;

    if (!name || !dosage || !frequency) {
      return NextResponse.json(
        { error: 'Name, dosage, and frequency are required' },
        { status: 400 }
      );
    }

    // Verify horse belongs to barn
    const horse = await prisma.horse.findFirst({
      where: { id: horseId, barnId: barnId },
    });

    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }

    const medication = await prisma.medication.create({
      data: {
        horseId: horseId,
        name,
        dosage,
        frequency,
        route: route || 'ORAL',
        prescribingVet,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isControlled: isControlled || false,
        refillsRemaining: refillsRemaining ? parseInt(refillsRemaining) : null,
        pharmacy,
        instructions,
        status: 'ACTIVE',
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'MEDICATION_ADDED',
        description: `Added medication ${name} for ${horse.barnName}`,
        metadata: JSON.stringify({ medicationId: medication.id, horseId: horseId }),
      },
    });

    return NextResponse.json({ data: medication }, { status: 201 });
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 });
  }
}
