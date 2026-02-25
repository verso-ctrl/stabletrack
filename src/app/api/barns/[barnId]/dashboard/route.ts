import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission, getClientAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

// GET /api/barns/[barnId]/dashboard - Consolidated dashboard data in a single request
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

    // Check if user is a client (not a barn member) — scope data to their horses only
    const isMember = await prisma.barnMember.findUnique({
      where: { userId_barnId: { userId: user.id, barnId } },
    });
    const clientAccess = !isMember ? await getClientAccess(user.id, barnId) : null;
    const clientHorseIds = clientAccess
      ? clientAccess.horses.map((h: { horseId: string }) => h.horseId)
      : null;

    const now = new Date();
    const in30Days = addDays(now, 30);

    // Run ALL dashboard queries in parallel
    const [
      horses,
      events,
      tasks,
      stalls,
      paddocks,
      // Alert sub-queries
      expiringCoggins,
      dueVaccinations,
      medicationsNeedingRefill,
      overdueEvents,
      layupHorses,
      expiringDocuments,
    ] = await Promise.all([
      // Horses (just count + basic list) — scoped to client's horses if applicable
      prisma.horse.findMany({
        where: { barnId, status: { in: ['ACTIVE', 'LAYUP'] }, ...(clientHorseIds && { id: { in: clientHorseIds } }) },
        select: {
          id: true,
          barnName: true,
          status: true,
          profilePhotoUrl: true,
          breed: true,
          stallRelation: { select: { name: true } },
          medications: { where: { status: 'ACTIVE' }, select: { id: true } },
        },
        orderBy: { barnName: 'asc' },
        take: 50,
      }),
      // Upcoming events (limited) — scoped for clients
      prisma.event.findMany({
        where: { barnId, status: 'SCHEDULED', scheduledDate: { gte: now }, ...(clientHorseIds && { horseId: { in: clientHorseIds } }) },
        include: {
          horse: { select: { id: true, barnName: true } },
          horses: { include: { horse: { select: { id: true, barnName: true } } }, take: 5 },
        },
        orderBy: { scheduledDate: 'asc' },
        take: 10,
      }),
      // Pending tasks (limited) — scoped for clients
      prisma.task.findMany({
        where: { barnId, status: 'PENDING', ...(clientHorseIds && { horseId: { in: clientHorseIds } }) },
        include: {
          assignee: { select: { firstName: true, lastName: true, avatarUrl: true } },
          horse: { select: { id: true, barnName: true } },
        },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        take: 10,
      }),
      // Stalls — hide from clients
      clientHorseIds ? Promise.resolve([]) : prisma.stall.findMany({
        where: { barnId },
        include: { horse: { select: { id: true, barnName: true } } },
        orderBy: { name: 'asc' },
      }),
      // Paddocks — hide from clients
      clientHorseIds ? Promise.resolve([]) : prisma.paddock.findMany({
        where: { barnId },
        include: { turnouts: { where: { endTime: null }, include: { horse: { select: { id: true, barnName: true } } } } },
        orderBy: { name: 'asc' },
      }),
      // Alerts: expiring coggins — scoped for clients
      prisma.healthRecord.findMany({
        where: { horse: { barnId, ...(clientHorseIds && { id: { in: clientHorseIds } }) }, type: 'COGGINS', cogginsExpiry: { gte: now, lte: in30Days } },
        include: { horse: { select: { id: true, barnName: true } } },
        orderBy: { cogginsExpiry: 'asc' },
        take: 20,
      }),
      // Alerts: due vaccinations — scoped for clients
      prisma.vaccination.findMany({
        where: { horse: { barnId, ...(clientHorseIds && { id: { in: clientHorseIds } }) }, nextDueDate: { gte: now, lte: in30Days } },
        include: { horse: { select: { id: true, barnName: true } } },
        orderBy: { nextDueDate: 'asc' },
        take: 20,
      }),
      // Alerts: medications needing refill — scoped for clients
      prisma.medication.findMany({
        where: { horse: { barnId, ...(clientHorseIds && { id: { in: clientHorseIds } }) }, status: 'ACTIVE', refillsRemaining: { lte: 1 } },
        include: { horse: { select: { id: true, barnName: true } } },
        take: 20,
      }),
      // Alerts: overdue events — scoped for clients
      prisma.event.findMany({
        where: { barnId, status: 'SCHEDULED', scheduledDate: { lt: now }, ...(clientHorseIds && { horseId: { in: clientHorseIds } }) },
        include: { horse: { select: { id: true, barnName: true } } },
        take: 20,
      }),
      // Alerts: layup horses — scoped for clients
      prisma.horse.findMany({
        where: { barnId, status: 'LAYUP', ...(clientHorseIds && { id: { in: clientHorseIds } }) },
        select: { id: true, barnName: true },
        take: 20,
      }),
      // Alerts: expiring documents — scoped for clients
      prisma.document.findMany({
        where: { horse: { barnId, ...(clientHorseIds && { id: { in: clientHorseIds } }) }, expiryDate: { gte: now, lte: in30Days } },
        include: { horse: { select: { id: true, barnName: true } } },
        orderBy: { expiryDate: 'asc' },
        take: 20,
      }),
    ]);

    // Build alerts array
    const alerts: Array<{
      id: string;
      type: 'urgent' | 'warning' | 'info';
      title: string;
      message: string;
      horseId?: string;
      horseName?: string;
      actionUrl?: string;
    }> = [];

    for (const record of expiringCoggins) {
      const days = Math.ceil((record.cogginsExpiry!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `coggins-${record.id}`, type: days <= 7 ? 'urgent' : 'warning',
        title: 'Coggins Expiring', message: `${record.horse.barnName}'s Coggins expires in ${days} days`,
        horseId: record.horse.id, horseName: record.horse.barnName, actionUrl: `/horses/${record.horse.id}?tab=health`,
      });
    }
    for (const v of dueVaccinations) {
      const days = Math.ceil((v.nextDueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const name = v.customType || v.type.replace(/_/g, '/');
      alerts.push({
        id: `vaccination-${v.id}`, type: days <= 7 ? 'warning' : 'info',
        title: 'Vaccination Due', message: `${v.horse.barnName} needs ${name} in ${days} days`,
        horseId: v.horse.id, horseName: v.horse.barnName, actionUrl: `/horses/${v.horse.id}?tab=health`,
      });
    }
    for (const m of medicationsNeedingRefill) {
      alerts.push({
        id: `refill-${m.id}`, type: 'warning',
        title: 'Medication Refill Needed', message: `${m.horse.barnName}'s ${m.name} needs refill`,
        horseId: m.horse.id, horseName: m.horse.barnName, actionUrl: `/horses/${m.horse.id}?tab=health`,
      });
    }
    for (const e of overdueEvents) {
      alerts.push({
        id: `overdue-${e.id}`, type: 'urgent',
        title: 'Overdue Event', message: `"${e.title}" was scheduled for ${e.scheduledDate.toLocaleDateString()}`,
        horseId: e.horse?.id, horseName: e.horse?.barnName, actionUrl: `/calendar`,
      });
    }
    for (const h of layupHorses) {
      alerts.push({
        id: `layup-${h.id}`, type: 'info',
        title: 'Horse on Layup', message: `${h.barnName} is currently on layup`,
        horseId: h.id, horseName: h.barnName, actionUrl: `/horses/${h.id}`,
      });
    }
    for (const doc of expiringDocuments) {
      const days = Math.ceil((doc.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `doc-${doc.id}`, type: days <= 7 ? 'warning' : 'info',
        title: 'Document Expiring', message: `${doc.horse.barnName}'s ${doc.title} expires in ${days} days`,
        horseId: doc.horse.id, horseName: doc.horse.barnName, actionUrl: `/horses/${doc.horse.id}?tab=documents`,
      });
    }

    const priorityOrder = { urgent: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    return NextResponse.json({
      data: {
        horses,
        events,
        tasks,
        alerts,
        stalls,
        paddocks,
        stats: {
          totalHorses: horses.length,
          activeHorses: horses.filter(h => h.status === 'ACTIVE').length,
          scheduledEvents: events.length,
          pendingTasks: tasks.length,
          alertCount: alerts.length,
          occupiedStalls: stalls.filter(s => s.horse).length,
          totalStalls: stalls.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
