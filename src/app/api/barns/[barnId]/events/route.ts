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
    } else if (barnMember) {
      // Filter by assignment for non-owner/manager roles
      const role = barnMember.role;
      if (role !== 'OWNER' && role !== 'MANAGER') {
        // TRAINER, CARETAKER, etc. only see assigned events OR unassigned events
        where.OR = [
          { assignedToId: user.id },
          { assignedToId: null }
        ];
      }

      if (horseId) {
        where.horseId = horseId;
      }
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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100');
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
          horses: {
            take: 10, // Limit horses per event
            include: {
              horse: {
                select: {
                  id: true,
                  barnName: true,
                  profilePhotoUrl: true,
                },
              },
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          reminders: {
            take: 5, // Limit reminders per event
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
      assignedToId,
    } = validatedData;

    // Support both single horseId and multiple horseIds
    const targetHorseIds = horseIds || (horseId ? [horseId] : null);

    // Calculate cost distribution if specified
    const totalCost = cost ? (typeof cost === 'string' ? parseFloat(cost) : cost) : 0;
    const costPerHorse = targetHorseIds && targetHorseIds.length > 0
      ? totalCost / targetHorseIds.length
      : 0;

    // Create a single event with associated horses via EventHorse junction table
    const event = await prisma.event.create({
      data: {
        barnId: barnId,
        horseId: targetHorseIds && targetHorseIds.length === 1 ? targetHorseIds[0] : null, // For backward compatibility
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
        totalCost,
        costPerHorse,
        notes,
        isRecurring: isRecurring || false,
        recurringRule,
        assignedToId: assignedToId || null,
        // Create EventHorse entries for each selected horse
        horses: targetHorseIds && targetHorseIds.length > 0 ? {
          create: targetHorseIds.map((hId: string) => ({
            horseId: hId,
            cost: costPerHorse,
          })),
        } : undefined,
      },
      include: {
        horse: {
          select: {
            barnName: true,
            profilePhotoUrl: true,
          },
        },
        horses: {
          include: {
            horse: {
              select: {
                id: true,
                barnName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
