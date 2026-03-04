import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission, getClientAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { eventSchema } from '@/lib/validations';
import { validateRequest, handleApiError, rateLimit, getClientIdentifier } from '@/lib/api-helpers';

// GET /api/barns/[barnId]/events - Get events for a barn
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const { success, remaining } = rateLimit(clientId, 100, 60000);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      );
    }

    const { barnId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hasPermission = await checkBarnPermission(user.id, barnId, 'events:read');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check if user is a client (to filter events to their horses only)
    const clientAccess = await getClientAccess(user.id, barnId);
    const barnMember = await prisma.barnMember.findUnique({
      where: { userId_barnId: { userId: user.id, barnId } },
    });
    const isClientOnly = clientAccess && !barnMember;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const horseId = searchParams.get('horseId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = { barnId: barnId };

    // Clients can only see events for their horses
    if (isClientOnly && clientAccess) {
      const clientHorseIds = clientAccess.horses.map((h: { horseId: string }) => h.horseId);
      where.horseId = { in: clientHorseIds };
    } else if (horseId) {
      where.horseId = horseId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) {
        where.scheduledDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledDate.lte = new Date(endDate);
      }
    }
    
    // Add pagination to prevent loading too many events at once
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100') || 100));
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          horse: {
            select: {
              barnName: true,
              profilePhotoUrl: true,
            },
          },
          reminders: {
            take: 5,
          },
        },
        orderBy: { scheduledDate: 'asc' },
        take: limit,
        skip,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/barns/[barnId]/events - Create a new event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const { success, remaining } = rateLimit(clientId, 30, 60000); // Stricter limit for writes

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      );
    }

    const { barnId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'events:write');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate request body
    const validatedData = await validateRequest(request, eventSchema);

    const {
      horseId,
      horseIds,
      type,
      customType,
      title,
      description,
      scheduledDate,
      providerName,
      providerPhone,
      farrierWork,
      dewormProduct,
      cost,
      notes,
      isRecurring,
      recurringRule,
    } = validatedData;

    // Support both single horseId and multiple horseIds
    const targetHorseIds = horseIds || (horseId ? [horseId] : null);

    // Use the first horseId for the event's horseId field
    const eventHorseId = targetHorseIds && targetHorseIds.length > 0 ? targetHorseIds[0] : null;

    // cost arrives in cents (Int) from the form
    const costInt = cost ? Math.round(typeof cost === 'number' ? cost : parseFloat(cost)) : null;

    const event = await prisma.event.create({
      data: {
        barnId: barnId,
        horseId: eventHorseId,
        type,
        customType,
        title,
        description,
        scheduledDate: new Date(scheduledDate),
        status: 'SCHEDULED',
        providerName,
        providerPhone,
        farrierWork,
        dewormProduct,
        cost: costInt,
        notes,
        isRecurring: isRecurring || false,
        recurringRule,
      },
      include: {
        horse: {
          select: {
            barnName: true,
            profilePhotoUrl: true,
          },
        },
        reminders: true,
      },
    });

    // Log activity
    const horseCount = targetHorseIds ? targetHorseIds.length : 0;
    const activityDescription = horseCount > 0
      ? `Scheduled "${title}" for ${horseCount} horse${horseCount > 1 ? 's' : ''}`
      : `Scheduled "${title}" (barn-wide)`;

    await prisma.activityLog.create({
      data: {
        type: 'EVENT_CREATED',
        description: activityDescription,
        userId: user.id,
        barnId: barnId,
        metadata: JSON.stringify({
          eventId: event.id,
          horseCount,
        }),
      },
    });

    return NextResponse.json({ data: event });
  } catch (error) {
    return handleApiError(error);
  }
}
