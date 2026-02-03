import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ barnId: string }>;
};

// GET /api/barns/[barnId]/paddocks - List all paddocks with current horses
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barnId } = await context.params;

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const paddocks = await prisma.paddock.findMany({
      where: { barnId },
      include: {
        turnouts: {
          where: {
            endTime: null, // Only active turnouts
          },
          include: {
            horse: {
              select: {
                id: true,
                barnName: true,
                profilePhotoUrl: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform data to include horse count
    const data = paddocks.map((paddock) => ({
      ...paddock,
      horses: paddock.turnouts.map((t) => t.horse),
      horseCount: paddock.turnouts.length,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching paddocks:', error);
    return NextResponse.json({ error: 'Failed to fetch paddocks' }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/paddocks - Create a new paddock
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barnId } = await context.params;

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await req.json();
    const { name, acreage, maxHorses } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if paddock with name already exists
    const existing = await prisma.paddock.findUnique({
      where: {
        barnId_name: { barnId, name },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A paddock with this name already exists' },
        { status: 400 }
      );
    }

    const paddock = await prisma.paddock.create({
      data: {
        barnId,
        name,
        acreage: acreage ? parseFloat(acreage) : null,
        maxHorses: maxHorses ? parseInt(maxHorses) : null,
      },
    });

    return NextResponse.json({
      data: { ...paddock, horses: [], horseCount: 0 },
    });
  } catch (error) {
    console.error('Error creating paddock:', error);
    return NextResponse.json({ error: 'Failed to create paddock' }, { status: 500 });
  }
}

// PUT /api/barns/[barnId]/paddocks - Update a paddock
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barnId } = await context.params;

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, acreage, maxHorses } = body;

    if (!id) {
      return NextResponse.json({ error: 'Paddock ID is required' }, { status: 400 });
    }

    // Verify paddock belongs to barn
    const existing = await prisma.paddock.findFirst({
      where: { id, barnId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Paddock not found' }, { status: 404 });
    }

    const paddock = await prisma.paddock.update({
      where: { id },
      data: {
        name: name || existing.name,
        acreage: acreage !== undefined ? (acreage ? parseFloat(acreage) : null) : existing.acreage,
        maxHorses: maxHorses !== undefined ? (maxHorses ? parseInt(maxHorses) : null) : existing.maxHorses,
      },
      include: {
        turnouts: {
          where: { endTime: null },
          include: {
            horse: {
              select: {
                id: true,
                barnName: true,
                profilePhotoUrl: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        ...paddock,
        horses: paddock.turnouts.map((t) => t.horse),
        horseCount: paddock.turnouts.length,
      },
    });
  } catch (error) {
    console.error('Error updating paddock:', error);
    return NextResponse.json({ error: 'Failed to update paddock' }, { status: 500 });
  }
}

// DELETE /api/barns/[barnId]/paddocks - Delete a paddock
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barnId } = await context.params;
    const { searchParams } = new URL(req.url);
    const paddockId = searchParams.get('id');

    if (!paddockId) {
      return NextResponse.json({ error: 'Paddock ID is required' }, { status: 400 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Verify paddock belongs to barn
    const existing = await prisma.paddock.findFirst({
      where: { id: paddockId, barnId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Paddock not found' }, { status: 404 });
    }

    // End all active turnouts first
    await prisma.horseTurnout.updateMany({
      where: { paddockId, endTime: null },
      data: { endTime: new Date() },
    });

    await prisma.paddock.delete({
      where: { id: paddockId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting paddock:', error);
    return NextResponse.json({ error: 'Failed to delete paddock' }, { status: 500 });
  }
}

// PATCH /api/barns/[barnId]/paddocks - Assign/unassign horse to paddock
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barnId } = await context.params;

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await req.json();
    const { paddockId, horseId, action } = body;

    if (!horseId) {
      return NextResponse.json({ error: 'Horse ID is required' }, { status: 400 });
    }

    // Verify horse belongs to barn
    const horse = await prisma.horse.findFirst({
      where: { id: horseId, barnId },
    });

    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }

    if (action === 'remove') {
      // End any active turnout for this horse
      await prisma.horseTurnout.updateMany({
        where: { horseId, endTime: null },
        data: { endTime: new Date() },
      });

      return NextResponse.json({ success: true, message: 'Horse removed from pasture' });
    }

    if (!paddockId) {
      return NextResponse.json({ error: 'Paddock ID is required' }, { status: 400 });
    }

    // Verify paddock belongs to barn
    const paddock = await prisma.paddock.findFirst({
      where: { id: paddockId, barnId },
    });

    if (!paddock) {
      return NextResponse.json({ error: 'Paddock not found' }, { status: 404 });
    }

    // Check max horses limit
    if (paddock.maxHorses) {
      const currentCount = await prisma.horseTurnout.count({
        where: { paddockId, endTime: null },
      });

      if (currentCount >= paddock.maxHorses) {
        return NextResponse.json(
          { error: `This pasture is at capacity (${paddock.maxHorses} horses max)` },
          { status: 400 }
        );
      }
    }

    // End any existing turnout for this horse
    await prisma.horseTurnout.updateMany({
      where: { horseId, endTime: null },
      data: { endTime: new Date() },
    });

    // Create new turnout
    await prisma.horseTurnout.create({
      data: {
        horseId,
        paddockId,
      },
    });

    return NextResponse.json({ success: true, message: 'Horse assigned to pasture' });
  } catch (error) {
    console.error('Error updating horse assignment:', error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}
