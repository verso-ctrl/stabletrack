import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ barnId: string; horseId: string; vaccinationId: string }> };

async function getVerified(barnId: string, horseId: string, vaccinationId: string) {
  return prisma.vaccination.findFirst({
    where: { id: vaccinationId, horseId },
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { barnId, horseId, vaccinationId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await getVerified(barnId, horseId, vaccinationId);
    if (!existing) return NextResponse.json({ error: 'Vaccination not found' }, { status: 404 });

    const body = await request.json();
    const { type, dateGiven, nextDueDate, veterinarian, notes } = body;

    const vaccination = await prisma.vaccination.update({
      where: { id: vaccinationId },
      data: {
        ...(type && { type }),
        ...(dateGiven && { dateGiven: new Date(dateGiven) }),
        ...(nextDueDate !== undefined && { nextDueDate: nextDueDate ? new Date(nextDueDate) : null }),
        ...(veterinarian !== undefined && { veterinarian }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ data: vaccination });
  } catch (error) {
    console.error('Error updating vaccination:', error);
    return NextResponse.json({ error: 'Failed to update vaccination' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { barnId, horseId, vaccinationId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await getVerified(barnId, horseId, vaccinationId);
    if (!existing) return NextResponse.json({ error: 'Vaccination not found' }, { status: 404 });

    await prisma.vaccination.delete({ where: { id: vaccinationId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vaccination:', error);
    return NextResponse.json({ error: 'Failed to delete vaccination' }, { status: 500 });
  }
}
