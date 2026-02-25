import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/barns/[barnId]/horses/[horseId]/health - Get health records
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
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:read');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // Verify horse belongs to this barn to prevent cross-barn access
    const horse = await prisma.horse.findUnique({
      where: { id: horseId, barnId },
      select: { id: true },
    });
    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }

    const where: any = { horseId: horseId };
    if (type) {
      where.type = type;
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where,
      include: {
        attachments: true,
      },
      orderBy: { date: 'desc' },
    });
    
    return NextResponse.json({ data: healthRecords });
  } catch (error) {
    console.error('Error fetching health records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health records' },
      { status: 500 }
    );
  }
}

// POST /api/barns/[barnId]/horses/[horseId]/health - Create health record
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
    
    // Verify horse belongs to barn
    const horse = await prisma.horse.findUnique({
      where: {
        id: horseId,
        barnId: barnId,
      },
      select: { barnName: true },
    });
    
    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const {
      type,
      date,
      provider,
      diagnosis,
      treatment,
      findings,
      followUpDate,
      cost,
      cogginsExpiry,
      notes,
    } = body;
    
    if (!type || !date) {
      return NextResponse.json(
        { error: 'Type and date are required' },
        { status: 400 }
      );
    }
    
    const healthRecord = await prisma.healthRecord.create({
      data: {
        horseId: horseId,
        type,
        date: new Date(date),
        provider: provider || null,
        diagnosis: diagnosis || null,
        treatment: treatment || null,
        findings: findings || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        cost: cost != null ? Math.max(0, parseFloat(cost) || 0) : null,
        cogginsExpiry: cogginsExpiry ? new Date(cogginsExpiry) : null,
        followUpNotes: notes || null,
      },
      include: {
        attachments: true,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'HEALTH_RECORD_ADDED',
        description: `Added ${type.toLowerCase().replace(/_/g, ' ')} record for ${horse.barnName}`,
        userId: user.id,
        barnId: barnId,
        metadata: JSON.stringify({ horseId: horseId, healthRecordId: healthRecord.id }),
      },
    });
    
    return NextResponse.json({ data: healthRecord });
  } catch (error) {
    console.error('Error creating health record:', error);
    return NextResponse.json(
      { error: 'Failed to create health record' },
      { status: 500 }
    );
  }
}
