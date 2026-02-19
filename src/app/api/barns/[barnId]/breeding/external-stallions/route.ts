import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceFeatureAccess } from '@/lib/tier-validation';

// GET /api/barns/[barnId]/breeding/external-stallions
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

    const stallions = await prisma.externalStallion.findMany({
      where: { barnId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: stallions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch external stallions';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/breeding/external-stallions
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
    const { name, registrationNumber, breed, color, studFarm, studFarmLocation, contactName, contactPhone, contactEmail, fee, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Stallion name is required' }, { status: 400 });
    }

    const stallion = await prisma.externalStallion.create({
      data: {
        barnId,
        name,
        registrationNumber: registrationNumber || null,
        breed: breed || null,
        color: color || null,
        studFarm: studFarm || null,
        studFarmLocation: studFarmLocation || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        fee: fee ? parseFloat(fee) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ data: stallion }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create external stallion';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    if (message.includes('Unique constraint')) return NextResponse.json({ error: 'A stallion with that name already exists' }, { status: 409 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
