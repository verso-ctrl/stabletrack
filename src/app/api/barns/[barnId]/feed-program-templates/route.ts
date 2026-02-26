import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, verifyBarnAccess } from '@/lib/auth';

// GET /api/barns/[barnId]/feed-program-templates - List all templates for barn
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

    const access = await verifyBarnAccess(user.id, barnId);
    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const templates = await prisma.feedProgramTemplate.findMany({
      where: { barnId },
      include: { items: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error('Error fetching feed program templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST /api/barns/[barnId]/feed-program-templates - Create a new template
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

    const access = await verifyBarnAccess(user.id, barnId);
    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, instructions, items } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one feed item is required' }, { status: 400 });
    }

    // Check for duplicate name
    const existing = await prisma.feedProgramTemplate.findUnique({
      where: { barnId_name: { barnId, name: name.trim() } },
    });
    if (existing) {
      return NextResponse.json({ error: 'A feeding plan with this name already exists' }, { status: 409 });
    }

    const template = await prisma.feedProgramTemplate.create({
      data: {
        barnId,
        name: name.trim(),
        instructions: instructions || null,
        items: {
          create: items.map((item: { feedName: string; amount: number; unit: string; feedingTime: string }) => ({
            feedName: item.feedName,
            amount: item.amount,
            unit: item.unit,
            feedingTime: item.feedingTime,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch (error) {
    console.error('Error creating feed program template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
