import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ barnId: string }>;
};

// GET /api/barns/[barnId]/stalls - List all stalls with current horse
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

    const stalls = await prisma.stall.findMany({
      where: { barnId },
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
      orderBy: [{ section: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ data: stalls });
  } catch (error) {
    console.error('Error fetching stalls:', error);
    return NextResponse.json({ error: 'Failed to fetch stalls' }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/stalls - Create a new stall
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
    const { name, section } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const stallSection = section || 'Main Barn';

    // Check if stall with same name already exists in the same section
    const existing = await prisma.stall.findUnique({
      where: {
        barnId_section_name: { barnId, section: stallSection, name },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A stall named "${name}" already exists in ${stallSection}` },
        { status: 400 }
      );
    }

    const stall = await prisma.stall.create({
      data: {
        barnId,
        name,
        section: stallSection,
      },
    });

    return NextResponse.json({ data: { ...stall, horse: null } });
  } catch (error) {
    console.error('Error creating stall:', error);
    return NextResponse.json({ error: 'Failed to create stall' }, { status: 500 });
  }
}

// PUT /api/barns/[barnId]/stalls - Update a stall
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
    const { id, name, section } = body;

    if (!id) {
      return NextResponse.json({ error: 'Stall ID is required' }, { status: 400 });
    }

    // Verify stall belongs to barn
    const existing = await prisma.stall.findFirst({
      where: { id, barnId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
    }

    const newName = name || existing.name;
    const newSection = section !== undefined ? (section || 'Main Barn') : existing.section;

    // Check if another stall with the same name exists in the same section
    if (newName !== existing.name || newSection !== existing.section) {
      const duplicate = await prisma.stall.findFirst({
        where: {
          barnId,
          section: newSection,
          name: newName,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `A stall named "${newName}" already exists in ${newSection}` },
          { status: 400 }
        );
      }
    }

    const stall = await prisma.stall.update({
      where: { id },
      data: {
        name: newName,
        section: newSection,
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
    });

    return NextResponse.json({ data: stall });
  } catch (error) {
    console.error('Error updating stall:', error);
    return NextResponse.json({ error: 'Failed to update stall' }, { status: 500 });
  }
}

// DELETE /api/barns/[barnId]/stalls - Delete a stall
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barnId } = await context.params;
    const { searchParams } = new URL(req.url);
    const stallId = searchParams.get('id');

    if (!stallId) {
      return NextResponse.json({ error: 'Stall ID is required' }, { status: 400 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Verify stall belongs to barn
    const existing = await prisma.stall.findFirst({
      where: { id: stallId, barnId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
    }

    // Remove any horse assignment first
    await prisma.horse.updateMany({
      where: { stallId },
      data: { stallId: null, stall: null },
    });

    await prisma.stall.delete({
      where: { id: stallId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stall:', error);
    return NextResponse.json({ error: 'Failed to delete stall' }, { status: 500 });
  }
}

// PATCH /api/barns/[barnId]/stalls - Assign/unassign horse to stall
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
    const { stallId, horseId, action } = body;

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
      // Remove horse from stall
      await prisma.horse.update({
        where: { id: horseId },
        data: { stallId: null, stall: null },
      });

      return NextResponse.json({ success: true, message: 'Horse removed from stall' });
    }

    if (!stallId) {
      return NextResponse.json({ error: 'Stall ID is required' }, { status: 400 });
    }

    // Verify stall belongs to barn
    const stall = await prisma.stall.findFirst({
      where: { id: stallId, barnId },
      include: { horse: true },
    });

    if (!stall) {
      return NextResponse.json({ error: 'Stall not found' }, { status: 404 });
    }

    // Check if stall is already occupied
    if (stall.horse && stall.horse.id !== horseId) {
      return NextResponse.json(
        { error: `This stall is already occupied by ${stall.horse.barnName}` },
        { status: 400 }
      );
    }

    // Remove horse from any existing stall
    if (horse.stallId && horse.stallId !== stallId) {
      await prisma.horse.update({
        where: { id: horseId },
        data: { stallId: null, stall: null },
      });
    }

    // Assign horse to new stall
    await prisma.horse.update({
      where: { id: horseId },
      data: { stallId, stall: stall.name },
    });

    return NextResponse.json({ success: true, message: 'Horse assigned to stall' });
  } catch (error) {
    console.error('Error updating horse assignment:', error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}
