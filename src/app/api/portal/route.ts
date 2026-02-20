import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIdentifier } from '@/lib/api-helpers';

// GET /api/portal?token={token} - Get client portal data using token authentication
export async function GET(request: NextRequest) {
  try {
    // Rate limit portal access - 20 requests per minute per IP
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimit(`portal:${clientId}`, 20, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find client by portal token
    const client = await prisma.client.findFirst({
      where: { portalToken: token },
      include: {
        barn: {
          select: {
            id: true,
            name: true,
            timezone: true,
          },
        },
        horses: {
          select: {
            horse: {
              select: {
                id: true,
                barnName: true,
                breed: true,
                color: true,
                profilePhotoUrl: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid or expired portal token' },
        { status: 401 }
      );
    }

    // Get upcoming lessons for this client
    const upcomingLessons = await prisma.lesson.findMany({
      where: {
        clientId: client.id,
        date: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      include: {
        horse: {
          select: {
            id: true,
            barnName: true,
          },
        },
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    // Get recent invoices for this client
    const recentInvoices = await prisma.invoice.findMany({
      where: {
        clientId: client.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Calculate total balance
    const totalBalance = recentInvoices.reduce(
      (sum, invoice) => sum + (invoice.amountDue || 0),
      0
    );

    // Get recent activity for client's horses
    const horseIds = client.horses.map((h: any) => h.horse.id);
    const recentActivity = await prisma.activityLog.findMany({
      where: {
        barnId: client.barnId,
        metadata: {
          contains: horseIds.length > 0 ? horseIds[0] : 'none', // Basic filtering, could be improved
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Return portal data
    return NextResponse.json({
      data: {
        client: {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
        },
        barn: client.barn,
        horses: client.horses.map((h: any) => h.horse),
        upcomingLessons: upcomingLessons.map((lesson) => ({
          ...lesson,
          scheduledDate: lesson.date,
        })),
        invoices: recentInvoices,
        totalBalance,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching portal data:', error);
    return NextResponse.json(
      { error: 'Failed to load portal data' },
      { status: 500 }
    );
  }
}
