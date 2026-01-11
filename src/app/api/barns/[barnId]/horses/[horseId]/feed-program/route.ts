import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, verifyBarnAccess } from '@/lib/auth';

// GET /api/barns/[barnId]/horses/[horseId]/feed-program - Get feed program
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

    const feedProgram = await prisma.feedProgram.findUnique({
      where: { horseId: horseId },
      include: {
        items: {
          include: {
            feedType: true,
            supplement: true,
          },
        },
      },
    });

    return NextResponse.json({ data: feedProgram });
  } catch (error) {
    console.error('Error fetching feed program:', error);
    return NextResponse.json({ error: 'Failed to fetch feed program' }, { status: 500 });
  }
}

// PUT /api/barns/[barnId]/horses/[horseId]/feed-program - Update/create feed program
export async function PUT(
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
    const { name, instructions, items } = body;

    // Verify horse belongs to barn
    const horse = await prisma.horse.findFirst({
      where: { id: horseId, barnId: barnId },
    });

    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }

    // Check if feed program exists
    const existingProgram = await prisma.feedProgram.findUnique({
      where: { horseId: horseId },
    });

    let feedProgram;

    if (existingProgram) {
      // Delete existing items
      await prisma.feedProgramItem.deleteMany({
        where: { feedProgramId: existingProgram.id },
      });

      // Update program
      feedProgram = await prisma.feedProgram.update({
        where: { id: existingProgram.id },
        data: {
          name: name || null,
          instructions: instructions || null,
          items: {
            create: items?.map((item: any) => ({
              customName: item.feedName,
              amount: item.amount,
              unit: item.unit,
              feedingTime: item.feedingTime,
            })) || [],
          },
        },
        include: {
          items: {
            include: {
              feedType: true,
              supplement: true,
            },
          },
        },
      });
    } else {
      // Create new program
      feedProgram = await prisma.feedProgram.create({
        data: {
          horseId: horseId,
          name: name || null,
          instructions: instructions || null,
          items: {
            create: items?.map((item: any) => ({
              customName: item.feedName,
              amount: item.amount,
              unit: item.unit,
              feedingTime: item.feedingTime,
            })) || [],
          },
        },
        include: {
          items: {
            include: {
              feedType: true,
              supplement: true,
            },
          },
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        barnId: barnId,
        userId: user.id,
        type: 'FEED_PROGRAM_UPDATED',
        description: `Updated feed program for ${horse.barnName}`,
        metadata: JSON.stringify({ horseId: horseId }),
      },
    });

    return NextResponse.json({ data: feedProgram });
  } catch (error) {
    console.error('Error updating feed program:', error);
    return NextResponse.json({ error: 'Failed to update feed program' }, { status: 500 });
  }
}
