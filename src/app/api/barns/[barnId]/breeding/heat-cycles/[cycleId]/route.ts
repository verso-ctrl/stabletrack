import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceFeatureAccess } from '@/lib/tier-validation';

type Params = { params: Promise<{ barnId: string; cycleId: string }> };

// GET /api/barns/[barnId]/breeding/heat-cycles/[cycleId]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { barnId, cycleId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const cycle = await prisma.heatCycle.findFirst({
      where: { id: cycleId, barnId },
      include: { horse: { select: { id: true, barnName: true, profilePhotoUrl: true } } },
    });

    if (!cycle) return NextResponse.json({ error: 'Heat cycle not found' }, { status: 404 });
    return NextResponse.json({ data: cycle });
  } catch (error) {
    console.error('Error fetching heat cycle:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch heat cycle';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/barns/[barnId]/breeding/heat-cycles/[cycleId]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { barnId, cycleId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const existing = await prisma.heatCycle.findFirst({ where: { id: cycleId, barnId } });
    if (!existing) return NextResponse.json({ error: 'Heat cycle not found' }, { status: 404 });

    const body = await request.json();
    const { endDate, intensity, signs, notes, cycleLength } = body;

    const updateData: Record<string, unknown> = {};
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (intensity !== undefined) updateData.intensity = intensity;
    if (signs !== undefined) updateData.signs = signs;
    if (notes !== undefined) updateData.notes = notes;
    if (cycleLength !== undefined) {
      updateData.cycleLength = cycleLength;
      // Recompute predicted next date
      const predicted = new Date(existing.startDate);
      predicted.setDate(predicted.getDate() + cycleLength);
      updateData.predictedNextDate = predicted;
    }

    const cycle = await prisma.heatCycle.update({
      where: { id: cycleId },
      data: updateData,
      include: { horse: { select: { id: true, barnName: true, profilePhotoUrl: true } } },
    });

    return NextResponse.json({ data: cycle });
  } catch (error) {
    console.error('Error updating heat cycle:', error);
    const message = error instanceof Error ? error.message : 'Failed to update heat cycle';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/barns/[barnId]/breeding/heat-cycles/[cycleId]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { barnId, cycleId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const existing = await prisma.heatCycle.findFirst({ where: { id: cycleId, barnId } });
    if (!existing) return NextResponse.json({ error: 'Heat cycle not found' }, { status: 404 });

    await prisma.heatCycle.delete({ where: { id: cycleId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting heat cycle:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete heat cycle';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
