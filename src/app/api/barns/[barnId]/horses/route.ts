import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission, getClientAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/barns/[barnId]/horses - Get all horses in a barn
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check if user is a client (to filter horses)
    const clientAccess = await getClientAccess(user.id, barnId);
    const isClient = !!clientAccess && !await prisma.barnMember.findUnique({
      where: { userId_barnId: { userId: user.id, barnId } },
    });
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    // Build where clause
    const where: any = { barnId: barnId };
    
    // If client, only show their assigned horses
    if (isClient && clientAccess) {
      const clientHorseIds = clientAccess.horses.map((h: { horseId: string }) => h.horseId);
      where.id = { in: clientHorseIds };
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { barnName: { contains: search } },
        { registeredName: { contains: search } },
        { breed: { contains: search } },
      ];
    }
    
    // Get total count
    const total = await prisma.horse.count({ where });
    
    // Get horses
    const horses = await prisma.horse.findMany({
      where,
      include: {
        stall: {
          select: { name: true },
        },
        weightRecords: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { weightLbs: true },
        },
        medications: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
      },
      orderBy: { barnName: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    // Transform response
    const transformedHorses = horses.map((horse) => ({
      ...horse,
      stallName: horse.stall?.name || null,
      currentWeight: horse.weightRecords[0]?.weightLbs || null,
      activeMedicationCount: horse.medications.length,
      age: horse.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(horse.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null,
      stall: undefined,
      weightRecords: undefined,
      medications: undefined,
    }));
    
    return NextResponse.json({
      data: transformedHorses,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching horses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch horses' },
      { status: 500 }
    );
  }
}

// POST /api/barns/[barnId]/horses - Create a new horse
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check horse limit based on subscription
    const horseCount = await prisma.horse.count({
      where: { barnId: barnId },
    });
    
    const maxHorses = user.subscription?.maxHorses ?? 5;
    if (maxHorses !== -1 && horseCount >= maxHorses) {
      return NextResponse.json(
        { error: 'Horse limit reached. Please upgrade your subscription.' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      barnName,
      registeredName,
      breed,
      color,
      markings,
      dateOfBirth,
      sex,
      heightHands,
      microchipNumber,
      status,
      ownerName,
    } = body;
    
    if (!barnName) {
      return NextResponse.json(
        { error: 'Horse name is required' },
        { status: 400 }
      );
    }
    
    const horse = await prisma.horse.create({
      data: {
        barnId: barnId,
        barnName,
        registeredName,
        breed,
        color,
        markings,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        sex,
        heightHands,
        microchipNumber,
        status: status || 'ACTIVE',
        ownerName,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'HORSE_CREATED',
        description: `Added ${barnName} to the barn`,
        userId: user.id,
        barnId: barnId,
        metadata: JSON.stringify({ horseId: horse.id }),
      },
    });
    
    return NextResponse.json({ data: horse });
  } catch (error) {
    console.error('Error creating horse:', error);
    return NextResponse.json(
      { error: 'Failed to create horse' },
      { status: 500 }
    );
  }
}
