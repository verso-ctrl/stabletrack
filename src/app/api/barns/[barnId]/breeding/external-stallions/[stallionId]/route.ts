import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceFeatureAccess } from '@/lib/tier-validation';

type Params = { params: Promise<{ barnId: string; stallionId: string }> };

// GET /api/barns/[barnId]/breeding/external-stallions/[stallionId]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { barnId, stallionId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const stallion = await prisma.externalStallion.findFirst({
      where: { id: stallionId, barnId },
      include: {
        breedingRecords: {
          include: { mare: { select: { id: true, barnName: true } } },
          orderBy: { breedingDate: 'desc' },
        },
      },
    });

    if (!stallion) return NextResponse.json({ error: 'External stallion not found' }, { status: 404 });
    return NextResponse.json({ data: stallion });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch external stallion';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/barns/[barnId]/breeding/external-stallions/[stallionId]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { barnId, stallionId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const existing = await prisma.externalStallion.findFirst({ where: { id: stallionId, barnId } });
    if (!existing) return NextResponse.json({ error: 'External stallion not found' }, { status: 404 });

    const body = await request.json();
    const stallion = await prisma.externalStallion.update({
      where: { id: stallionId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.registrationNumber !== undefined && { registrationNumber: body.registrationNumber || null }),
        ...(body.breed !== undefined && { breed: body.breed || null }),
        ...(body.color !== undefined && { color: body.color || null }),
        ...(body.studFarm !== undefined && { studFarm: body.studFarm || null }),
        ...(body.studFarmLocation !== undefined && { studFarmLocation: body.studFarmLocation || null }),
        ...(body.contactName !== undefined && { contactName: body.contactName || null }),
        ...(body.contactPhone !== undefined && { contactPhone: body.contactPhone || null }),
        ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail || null }),
        ...(body.fee !== undefined && { fee: body.fee ? parseFloat(body.fee) : null }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
      },
    });

    return NextResponse.json({ data: stallion });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update external stallion';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/barns/[barnId]/breeding/external-stallions/[stallionId]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { barnId, stallionId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const existing = await prisma.externalStallion.findFirst({ where: { id: stallionId, barnId } });
    if (!existing) return NextResponse.json({ error: 'External stallion not found' }, { status: 404 });

    // Check if any breeding records reference this stallion
    const records = await prisma.breedingRecord.count({ where: { externalStallionId: stallionId } });
    if (records > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${records} breeding record(s) reference this stallion` },
        { status: 409 }
      );
    }

    await prisma.externalStallion.delete({ where: { id: stallionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete external stallion';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
