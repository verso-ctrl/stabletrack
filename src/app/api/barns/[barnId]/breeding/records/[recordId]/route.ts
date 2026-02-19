import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceFeatureAccess } from '@/lib/tier-validation';

type Params = { params: Promise<{ barnId: string; recordId: string }> };

// GET /api/barns/[barnId]/breeding/records/[recordId]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { barnId, recordId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const record = await prisma.breedingRecord.findFirst({
      where: { id: recordId, barnId },
      include: {
        mare: { select: { id: true, barnName: true, profilePhotoUrl: true } },
        stallion: { select: { id: true, barnName: true } },
        externalStallion: { select: { id: true, name: true, studFarm: true } },
        foalingRecord: true,
      },
    });

    if (!record) return NextResponse.json({ error: 'Breeding record not found' }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch breeding record';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/barns/[barnId]/breeding/records/[recordId]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { barnId, recordId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const existing = await prisma.breedingRecord.findFirst({
      where: { id: recordId, barnId },
      include: { mare: { select: { barnName: true } } },
    });
    if (!existing) return NextResponse.json({ error: 'Breeding record not found' }, { status: 404 });

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.veterinarian !== undefined) updateData.veterinarian = body.veterinarian || null;
    if (body.facility !== undefined) updateData.facility = body.facility || null;
    if (body.cost !== undefined) updateData.cost = body.cost ? parseFloat(body.cost) : null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.pregnancyCheckDate !== undefined) updateData.pregnancyCheckDate = body.pregnancyCheckDate ? new Date(body.pregnancyCheckDate) : null;
    if (body.pregnancyCheckResult !== undefined) updateData.pregnancyCheckResult = body.pregnancyCheckResult || null;
    if (body.estimatedDueDate !== undefined) updateData.estimatedDueDate = body.estimatedDueDate ? new Date(body.estimatedDueDate) : null;

    const record = await prisma.breedingRecord.update({
      where: { id: recordId },
      data: updateData,
      include: {
        mare: { select: { id: true, barnName: true, profilePhotoUrl: true } },
        stallion: { select: { id: true, barnName: true } },
        externalStallion: { select: { id: true, name: true, studFarm: true } },
      },
    });

    // Create foaling prep tasks when confirmed pregnant
    if (body.status === 'CONFIRMED_PREGNANT' && record.estimatedDueDate) {
      const dueDate = new Date(record.estimatedDueDate);
      const reminders = [
        { daysBefore: 30, title: 'Foaling prep - 30 days out', priority: 'LOW' },
        { daysBefore: 14, title: 'Foaling prep - 2 weeks out', priority: 'MEDIUM' },
        { daysBefore: 7, title: 'Foaling watch - 1 week out', priority: 'HIGH' },
      ];

      for (const reminder of reminders) {
        const taskDate = new Date(dueDate);
        taskDate.setDate(taskDate.getDate() - reminder.daysBefore);
        if (taskDate > new Date()) {
          await prisma.task.create({
            data: {
              barnId,
              horseId: record.mareId,
              title: `${existing.mare.barnName} - ${reminder.title}`,
              description: `Estimated due date: ${dueDate.toLocaleDateString()}`,
              dueDate: taskDate,
              priority: reminder.priority,
              status: 'PENDING',
            },
          });
        }
      }
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update breeding record';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/barns/[barnId]/breeding/records/[recordId]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { barnId, recordId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await enforceFeatureAccess(barnId, 'breedingManagement');

    const existing = await prisma.breedingRecord.findFirst({
      where: { id: recordId, barnId },
      include: { foalingRecord: true },
    });
    if (!existing) return NextResponse.json({ error: 'Breeding record not found' }, { status: 404 });

    if (existing.foalingRecord) {
      return NextResponse.json(
        { error: 'Cannot delete: this breeding record has a foaling record' },
        { status: 409 }
      );
    }

    await prisma.breedingRecord.delete({ where: { id: recordId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete breeding record';
    if (message.includes('not available')) return NextResponse.json({ error: message }, { status: 403 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
