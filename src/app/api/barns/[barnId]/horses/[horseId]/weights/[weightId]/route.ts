import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ barnId: string; horseId: string; weightId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { barnId, horseId, weightId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.weightRecord.findFirst({ where: { id: weightId, horseId } });
    if (!existing) return NextResponse.json({ error: 'Weight record not found' }, { status: 404 });

    const body = await request.json();
    const { weight, bodyScore, date, notes } = body;

    const record = await prisma.weightRecord.update({
      where: { id: weightId },
      data: {
        ...(weight && { weightLbs: weight }),
        ...(bodyScore !== undefined && { bodyCondition: bodyScore ? Math.round(bodyScore) : null }),
        ...(date && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error('Error updating weight record:', error);
    return NextResponse.json({ error: 'Failed to update weight record' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { barnId, horseId, weightId } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:write');
    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.weightRecord.findFirst({ where: { id: weightId, horseId } });
    if (!existing) return NextResponse.json({ error: 'Weight record not found' }, { status: 404 });

    await prisma.weightRecord.delete({ where: { id: weightId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting weight record:', error);
    return NextResponse.json({ error: 'Failed to delete weight record' }, { status: 500 });
  }
}
