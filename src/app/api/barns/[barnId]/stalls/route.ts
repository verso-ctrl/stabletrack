import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-helpers';

// GET /api/barns/[barnId]/stalls - Get stalls for a barn
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

    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available') === 'true';

    // Build where clause
    const where: any = { barnId };

    // If availableOnly is true, only show stalls without horses
    if (availableOnly) {
      where.horse = null;
    }

    const stalls = await prisma.stall.findMany({
      where,
      select: {
        id: true,
        name: true,
        section: true,
        horse: {
          select: {
            id: true,
            barnName: true,
          },
        },
      },
      orderBy: [
        { section: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ data: stalls });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/barns/[barnId]/stalls - Create a new stall
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

    const hasPermission = await checkBarnPermission(user.id, barnId, 'facilities:write');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, section } = body;

    if (!name) {
      return NextResponse.json({ error: 'Stall name is required' }, { status: 400 });
    }

    // Check if stall name already exists in this barn
    const existing = await prisma.stall.findUnique({
      where: {
        barnId_name: {
          barnId,
          name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A stall with this name already exists' },
        { status: 400 }
      );
    }

    const stall = await prisma.stall.create({
      data: {
        barnId,
        name,
        section: section || null,
      },
    });

    return NextResponse.json({ data: stall });
  } catch (error) {
    return handleApiError(error);
  }
}
