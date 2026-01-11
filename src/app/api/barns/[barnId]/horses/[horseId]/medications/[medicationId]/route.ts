import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single medication
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string; medicationId: string }> }
) {
  try {
    const { barnId, horseId, medicationId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const medication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        horseId: horseId,
      },
      include: {
        logs: {
          orderBy: { givenAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!medication) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
    }

    return NextResponse.json({ data: medication });
  } catch (error) {
    console.error('Error fetching medication:', error);
    return NextResponse.json({ error: 'Failed to fetch medication' }, { status: 500 });
  }
}

// PATCH - Update medication or log a dose
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string; medicationId: string }> }
) {
  try {
    const { barnId, medicationId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    if (body.action === 'log') {
      const { givenAt, skipped, skipReason, notes } = body;
      
      const log = await prisma.medicationLog.create({
        data: {
          medicationId,
          givenAt: givenAt ? new Date(givenAt) : new Date(),
          givenBy: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          skipped: skipped || false,
          skipReason,
          notes,
        },
      });

      return NextResponse.json({ data: log });
    }

    const { name, dosage, frequency, route, prescribingVet, endDate, status, isControlled, refillsRemaining, pharmacy, instructions } = body;

    const medication = await prisma.medication.update({
      where: { id: medicationId },
      data: {
        ...(name && { name }),
        ...(dosage && { dosage }),
        ...(frequency && { frequency }),
        ...(route && { route }),
        ...(prescribingVet !== undefined && { prescribingVet }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status && { status }),
        ...(isControlled !== undefined && { isControlled }),
        ...(refillsRemaining !== undefined && { refillsRemaining: parseInt(refillsRemaining) }),
        ...(pharmacy !== undefined && { pharmacy }),
        ...(instructions !== undefined && { instructions }),
      },
    });

    return NextResponse.json({ data: medication });
  } catch (error) {
    console.error('Error updating medication:', error);
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 });
  }
}

// DELETE medication
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string; medicationId: string }> }
) {
  try {
    const { barnId, medicationId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.medication.delete({
      where: { id: medicationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 });
  }
}
