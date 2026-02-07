import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission, getClientAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/barns/[barnId]/horses/[horseId] - Get horse details
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
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check if user is a client and verify they have access to this specific horse
    const clientAccess = await getClientAccess(user.id, barnId);
    const isMember = await prisma.barnMember.findUnique({
      where: { userId_barnId: { userId: user.id, barnId } },
    });
    
    if (clientAccess && !isMember) {
      // Client can only view their assigned horses
      const hasHorseAccess = clientAccess.horses.some((h: { horseId: string }) => h.horseId === horseId);
      if (!hasHorseAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    const horse = await prisma.horse.findUnique({
      where: {
        id: horseId,
        barnId: barnId,
      },
      include: {
        stallRelation: true,
        feedProgram: {
          include: {
            items: {
              include: {
                feedType: true,
                supplement: true,
              },
            },
          },
        },
        weightRecords: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        medications: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'desc' },
        },
        healthRecords: {
          orderBy: { date: 'desc' },
          take: 5,
          include: {
            attachments: true,
          },
        },
        vaccinations: {
          orderBy: { dateGiven: 'desc' },
          take: 20,
        },
        events: {
          where: {
            status: 'SCHEDULED',
            scheduledDate: { gte: new Date() },
          },
          orderBy: { scheduledDate: 'asc' },
          take: 5,
        },
        photos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
          take: 30,
        },
        notes: {
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: 10,
        },
      },
    });
    
    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }
    
    // Add computed fields
    const response = {
      ...horse,
      currentWeight: horse.weightRecords[0]?.weightLbs || null,
      age: horse.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(horse.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null,
      stallName: horse.stall || horse.stallRelation?.name || null,
      // Map weight records to expected format
      weights: horse.weightRecords.map(w => ({
        id: w.id,
        date: w.date,
        weight: w.weightLbs,
        bodyScore: w.bodyCondition,
        notes: w.notes,
      })),
      // Map medications to expected format
      activeMedications: horse.medications,
      // Map health records
      recentHealthRecords: horse.healthRecords,
      // Map events
      upcomingEvents: horse.events,
    };
    
    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Error fetching horse:', error);
    return NextResponse.json(
      { error: 'Failed to fetch horse' },
      { status: 500 }
    );
  }
}

// PATCH /api/barns/[barnId]/horses/[horseId] - Update horse
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string }> }
) {
  try {
    const { barnId, horseId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:write');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Remove fields that shouldn't be updated directly
    const { id, barnId: _, createdAt, updatedAt, ...updateData } = body;
    
    // Handle date conversion
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    
    const horse = await prisma.horse.update({
      where: {
        id: horseId,
        barnId: barnId,
      },
      data: updateData,
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'HORSE_UPDATED',
        description: `Updated ${horse.barnName}'s profile`,
        userId: user.id,
        barnId: barnId,
        metadata: JSON.stringify({ horseId: horse.id, changes: Object.keys(updateData) }),
      },
    });
    
    return NextResponse.json({ data: horse });
  } catch (error) {
    console.error('Error updating horse:', error);
    return NextResponse.json(
      { error: 'Failed to update horse' },
      { status: 500 }
    );
  }
}

// DELETE /api/barns/[barnId]/horses/[horseId] - Delete horse
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string; horseId: string }> }
) {
  try {
    const { barnId, horseId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:delete');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get horse name before deleting
    const horse = await prisma.horse.findUnique({
      where: { id: horseId },
      select: { barnName: true },
    });
    
    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }
    
    await prisma.horse.delete({
      where: {
        id: horseId,
        barnId: barnId,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'HORSE_DELETED',
        description: `Removed ${horse.barnName} from the barn`,
        userId: user.id,
        barnId: barnId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting horse:', error);
    return NextResponse.json(
      { error: 'Failed to delete horse' },
      { status: 500 }
    );
  }
}
