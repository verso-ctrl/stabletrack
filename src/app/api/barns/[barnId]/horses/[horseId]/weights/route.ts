import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, verifyBarnAccess } from '@/lib/auth';

// GET /api/barns/[barnId]/horses/[horseId]/weights - Get weight history
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

    const access = await verifyBarnAccess(user.id, barnId);
    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const weights = await prisma.weightRecord.findMany({
      where: { horseId: horseId },
      orderBy: { date: 'desc' },
      take: 20,
    });

    return NextResponse.json({ data: weights });
  } catch (error) {
    console.error('Error fetching weights:', error);
    return NextResponse.json({ error: 'Failed to fetch weights' }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/horses/[horseId]/weights - Log new weight
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

    const access = await verifyBarnAccess(user.id, barnId);
    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { weight, bodyScore, date, notes } = body;

    if (!weight) {
      return NextResponse.json({ error: 'Weight is required' }, { status: 400 });
    }

    // Verify horse belongs to barn
    const horse = await prisma.horse.findFirst({
      where: { id: horseId, barnId: barnId },
    });

    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }

    const weightRecord = await prisma.weightRecord.create({
      data: {
        horseId: horseId,
        weightLbs: weight,
        bodyCondition: bodyScore ? Math.round(bodyScore) : null,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    });

    return NextResponse.json({ data: weightRecord }, { status: 201 });
  } catch (error) {
    console.error('Error logging weight:', error);
    return NextResponse.json({ error: 'Failed to log weight' }, { status: 500 });
  }
}
