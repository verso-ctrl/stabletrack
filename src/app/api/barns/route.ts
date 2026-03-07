import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';

// GET /api/barns - Get user's barns (as member AND client)
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get barns where user is ACTIVE member
    const memberships = await prisma.barnMember.findMany({
      where: { 
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        barn: {
          include: {
            _count: {
              select: {
                horses: true,
                members: {
                  where: { status: 'ACTIVE' },
                },
              },
            },
          },
        },
      },
    });
    
    // Get barns where user is a client (linked by userId or email)
    const clientProfiles = await prisma.client.findMany({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email },
        ],
        portalEnabled: true,
      },
      include: {
        barn: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            address: true,
            city: true,
            state: true,
            phone: true,
            email: true,
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
      },
    });
    
    // Auto-link client profiles that matched by email (single batch update)
    const unlinkedClientIds = clientProfiles.filter(p => !p.userId).map(p => p.id);
    if (unlinkedClientIds.length > 0) {
      await prisma.client.updateMany({
        where: { id: { in: unlinkedClientIds } },
        data: { userId: user.id },
      });
    }
    
    // Also get pending requests to show notification
    const pendingRequests = await prisma.barnMember.findMany({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
      include: {
        barn: {
          select: {
            name: true,
          },
        },
      },
    });
    
    // Format member barns
    const memberBarnIds = new Set(memberships.map(m => m.barn.id));
    const memberBarns = memberships.map((m) => ({
      ...m.barn,
      role: m.role,
      accessType: 'member' as const,
      memberCount: m.barn._count.members,
      horseCount: m.barn._count.horses,
    }));
    
    // Format client barns (exclude those where user is already a member)
    const clientBarns = clientProfiles
      .filter(cp => !memberBarnIds.has(cp.barn.id))
      .map((cp) => ({
        ...cp.barn,
        clientId: cp.id,
        role: 'CLIENT',
        accessType: 'client' as const,
        horseCount: cp.horses.length,
        horses: cp.horses.map(h => h.horse),
      }));
    
    return NextResponse.json({ 
      data: [...memberBarns, ...clientBarns],
      pendingRequests: pendingRequests.map(p => ({
        barnName: p.barn.name,
        requestedAt: p.joinedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching barns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barns' },
      { status: 500 }
    );
  }
}

// POST /api/barns - Create a new barn
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - 30 writes per minute
    const rateLimitResult = checkRateLimit(
      getRateLimitIdentifier(request, user.id),
      RATE_LIMITS.write
    );

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const body = await request.json();
    const { name, address, city, state, zipCode, country, timezone, phone, email, tier, addOns } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Barn name is required' },
        { status: 400 }
      );
    }

    // Default to STARTER tier
    const barnTier = tier || 'STARTER';

    // Trial ends 14 days from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Validate add-ons
    const activeAddOns: string[] = Array.isArray(addOns) ? addOns.filter((a: string) => typeof a === 'string') : [];

    // Generate unique invite code
    const inviteCode = `BARN-${nanoid(6).toUpperCase()}`;

    // Create barn with owner membership and subscription tier
    const barn = await prisma.barn.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        country: country || 'US',
        timezone: timezone || 'America/New_York',
        inviteCode,
        tier: barnTier,
        subscriptionStatus: 'TRIALING',
        trialEndsAt,
        activeAddOns,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
            status: 'ACTIVE',
            approvedAt: new Date(),
          },
        },
      },
      include: {
        _count: {
          select: {
            horses: true,
            members: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      data: {
        ...barn,
        role: 'OWNER',
        memberCount: barn._count.members,
        horseCount: barn._count.horses,
      },
    });
  } catch (error) {
    console.error('Error creating barn:', error);
    return NextResponse.json(
      { error: 'Failed to create barn' },
      { status: 500 }
    );
  }
}
