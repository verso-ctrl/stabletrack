import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceFeatureAccess } from '@/lib/tier-validation';

type Params = { params: Promise<{ barnId: string; foalingId: string }> };

// GET /api/barns/[barnId]/breeding/foalings/[foalingId]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { barnId, foalingId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const foaling = await prisma.foalingRecord.findFirst({
      where: { id: foalingId, barnId },
      include: {
        mare: { select: { id: true, barnName: true, profilePhotoUrl: true } },
        foal: { select: { id: true, barnName: true, profilePhotoUrl: true } },
        breedingRecord: {
          include: {
            stallion: { select: { id: true, barnName: true } },
            externalStallion: { select: { id: true, name: true, studFarm: true } },
          },
        },
      },
    });

    if (!foaling) return NextResponse.json({ error: 'Foaling record not found' }, { status: 404 });
    return NextResponse.json({ data: foaling });
  } catch (error) {
    console.error('Error fetching foaling record:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch foaling record';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/barns/[barnId]/breeding/foalings/[foalingId]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { barnId, foalingId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const existing = await prisma.foalingRecord.findFirst({ where: { id: foalingId, barnId } });
    if (!existing) return NextResponse.json({ error: 'Foaling record not found' }, { status: 404 });

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.foalName !== undefined) updateData.foalName = body.foalName || null;
    if (body.foalSex !== undefined) updateData.foalSex = body.foalSex || null;
    if (body.foalColor !== undefined) updateData.foalColor = body.foalColor || null;
    if (body.birthWeight !== undefined) updateData.birthWeight = body.birthWeight ? parseFloat(body.birthWeight) : null;
    if (body.complications !== undefined) updateData.complications = body.complications || null;
    if (body.veterinarian !== undefined) updateData.veterinarian = body.veterinarian || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    const foaling = await prisma.foalingRecord.update({
      where: { id: foalingId },
      data: updateData,
      include: {
        mare: { select: { id: true, barnName: true } },
        foal: { select: { id: true, barnName: true, profilePhotoUrl: true } },
      },
    });

    return NextResponse.json({ data: foaling });
  } catch (error) {
    console.error('Error updating foaling record:', error);
    const message = error instanceof Error ? error.message : 'Failed to update foaling record';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/barns/[barnId]/breeding/foalings/[foalingId]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { barnId, foalingId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const existing = await prisma.foalingRecord.findFirst({ where: { id: foalingId, barnId } });
    if (!existing) return NextResponse.json({ error: 'Foaling record not found' }, { status: 404 });

    // Reset the breeding record status back to CONFIRMED_PREGNANT
    await prisma.breedingRecord.update({
      where: { id: existing.breedingRecordId },
      data: { status: 'CONFIRMED_PREGNANT' },
    });

    // Delete foaling record (does NOT delete the auto-created foal Horse)
    await prisma.foalingRecord.delete({ where: { id: foalingId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting foaling record:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete foaling record';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
