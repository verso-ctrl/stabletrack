import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/barns/[barnId]/horses/[horseId]/vaccinations
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

    // Verify horse belongs to this barn to prevent cross-barn access
    const horse = await prisma.horse.findUnique({
      where: { id: horseId, barnId },
      select: { id: true },
    });
    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }

    const vaccinations = await prisma.vaccination.findMany({
      where: { horseId: horseId },
      orderBy: { dateGiven: 'desc' },
    });

    return NextResponse.json({ data: vaccinations });
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    return NextResponse.json({ error: 'Failed to fetch vaccinations' }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/horses/[horseId]/vaccinations
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
      type,
      customType,
      dateGiven,
      nextDueDate,
      veterinarian,
      administeredBy,
      manufacturer,
      lotNumber,
      notes,
    } = body;

    if (!type || !dateGiven) {
      return NextResponse.json(
        { error: 'Vaccination type and date given are required' },
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

    const vaccination = await prisma.vaccination.create({
      data: {
        horseId: horseId,
        type,
        customType,
        dateGiven: new Date(dateGiven),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        veterinarian: veterinarian || administeredBy || null,
        manufacturer: manufacturer || null,
        lotNumber,
        notes,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'VACCINATION_RECORDED',
        description: `Recorded ${type} vaccination for ${horse.barnName}`,
        metadata: JSON.stringify({ vaccinationId: vaccination.id, horseId: horseId }),
      },
    });

    return NextResponse.json({ data: vaccination }, { status: 201 });
  } catch (error) {
    console.error('Error creating vaccination:', error);
    return NextResponse.json({ error: 'Failed to create vaccination' }, { status: 500 });
  }
}
