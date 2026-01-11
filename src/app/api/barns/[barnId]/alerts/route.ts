import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays, isBefore, isAfter } from 'date-fns';

// GET /api/barns/[barnId]/alerts - Get alerts for a barn
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
    
    const alerts: Array<{
      id: string;
      type: 'urgent' | 'warning' | 'info';
      title: string;
      message: string;
      horseId?: string;
      horseName?: string;
      actionUrl?: string;
    }> = [];
    
    const now = new Date();
    const in7Days = addDays(now, 7);
    const in30Days = addDays(now, 30);
    
    // Check for expiring Coggins
    const expiringCoggins = await prisma.healthRecord.findMany({
      where: {
        horse: { barnId: barnId },
        type: 'COGGINS',
        cogginsExpiry: {
          gte: now,
          lte: in30Days,
        },
      },
      include: {
        horse: {
          select: {
            id: true,
            barnName: true,
          },
        },
      },
      orderBy: { cogginsExpiry: 'asc' },
    });
    
    for (const record of expiringCoggins) {
      const daysUntilExpiry = Math.ceil(
        (record.cogginsExpiry!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      alerts.push({
        id: `coggins-${record.id}`,
        type: daysUntilExpiry <= 7 ? 'urgent' : 'warning',
        title: 'Coggins Expiring',
        message: `${record.horse.barnName}'s Coggins expires in ${daysUntilExpiry} days`,
        horseId: record.horse.id,
        horseName: record.horse.barnName,
        actionUrl: `/horses/${record.horse.id}?tab=health`,
      });
    }
    
    // Check for due vaccinations
    const dueVaccinations = await prisma.vaccination.findMany({
      where: {
        horse: { barnId: barnId },
        nextDueDate: {
          gte: now,
          lte: in30Days,
        },
      },
      include: {
        horse: {
          select: {
            id: true,
            barnName: true,
          },
        },
      },
      orderBy: { nextDueDate: 'asc' },
    });
    
    for (const vaccination of dueVaccinations) {
      const daysUntilDue = Math.ceil(
        (vaccination.nextDueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const vaccineName = vaccination.customType || vaccination.type.replace(/_/g, '/');
      
      alerts.push({
        id: `vaccination-${vaccination.id}`,
        type: daysUntilDue <= 7 ? 'warning' : 'info',
        title: 'Vaccination Due',
        message: `${vaccination.horse.barnName} needs ${vaccineName} in ${daysUntilDue} days`,
        horseId: vaccination.horse.id,
        horseName: vaccination.horse.barnName,
        actionUrl: `/horses/${vaccination.horse.id}?tab=health`,
      });
    }
    
    // Check for active medications needing refills
    const medicationsNeedingRefill = await prisma.medication.findMany({
      where: {
        horse: { barnId: barnId },
        status: 'ACTIVE',
        refillsRemaining: { lte: 1 },
      },
      include: {
        horse: {
          select: {
            id: true,
            barnName: true,
          },
        },
      },
    });
    
    for (const medication of medicationsNeedingRefill) {
      alerts.push({
        id: `refill-${medication.id}`,
        type: 'warning',
        title: 'Medication Refill Needed',
        message: `${medication.horse.barnName}'s ${medication.name} needs refill`,
        horseId: medication.horse.id,
        horseName: medication.horse.barnName,
        actionUrl: `/horses/${medication.horse.id}?tab=health`,
      });
    }
    
    // Check for overdue events
    const overdueEvents = await prisma.event.findMany({
      where: {
        barnId: barnId,
        status: 'SCHEDULED',
        scheduledDate: { lt: now },
      },
      include: {
        horse: {
          select: {
            id: true,
            barnName: true,
          },
        },
      },
    });
    
    for (const event of overdueEvents) {
      alerts.push({
        id: `overdue-${event.id}`,
        type: 'urgent',
        title: 'Overdue Event',
        message: `"${event.title}" was scheduled for ${event.scheduledDate.toLocaleDateString()}`,
        horseId: event.horse?.id,
        horseName: event.horse?.barnName,
        actionUrl: `/calendar`,
      });
    }
    
    // Check for horses on layup
    const layupHorses = await prisma.horse.findMany({
      where: {
        barnId: barnId,
        status: 'LAYUP',
      },
      select: {
        id: true,
        barnName: true,
        bio: true,
      },
    });
    
    for (const horse of layupHorses) {
      alerts.push({
        id: `layup-${horse.id}`,
        type: 'info',
        title: 'Horse on Layup',
        message: `${horse.barnName} is currently on layup`,
        horseId: horse.id,
        horseName: horse.barnName,
        actionUrl: `/horses/${horse.id}`,
      });
    }
    
    // Check for expiring documents
    const expiringDocuments = await prisma.document.findMany({
      where: {
        horse: { barnId: barnId },
        expiryDate: {
          gte: now,
          lte: in30Days,
        },
      },
      include: {
        horse: {
          select: {
            id: true,
            barnName: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
    
    for (const doc of expiringDocuments) {
      const daysUntilExpiry = Math.ceil(
        (doc.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      alerts.push({
        id: `doc-${doc.id}`,
        type: daysUntilExpiry <= 7 ? 'warning' : 'info',
        title: 'Document Expiring',
        message: `${doc.horse.barnName}'s ${doc.title} expires in ${daysUntilExpiry} days`,
        horseId: doc.horse.id,
        horseName: doc.horse.barnName,
        actionUrl: `/horses/${doc.horse.id}?tab=documents`,
      });
    }
    
    // Sort alerts: urgent first, then warning, then info
    const priorityOrder = { urgent: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
    
    return NextResponse.json({ data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
