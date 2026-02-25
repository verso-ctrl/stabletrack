// API for horse activity feed
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string; horseId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, horseId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'horses:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    // Verify horse belongs to this barn
    const horse = await prisma.horse.findUnique({
      where: { id: horseId, barnId },
      select: { id: true },
    })
    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 })
    }

    // Build activity feed from multiple sources
    const activities: any[] = []

    // Get health records
    const healthRecords = await prisma.healthRecord.findMany({
      where: { horseId },
      orderBy: { date: 'desc' },
      take: 20,
    })
    healthRecords.forEach(hr => {
      activities.push({
        id: `health-${hr.id}`,
        category: 'health',
        title: `${hr.type.replace(/_/g, ' ')} recorded`,
        description: hr.findings || hr.treatment || hr.diagnosis,
        date: hr.date.toISOString(),
        metadata: { veterinarian: hr.provider },
      })
    })

    // Get daily health checks
    const healthChecks = await prisma.dailyHealthCheck.findMany({
      where: { horseId },
      orderBy: { date: 'desc' },
      take: 20,
    })
    healthChecks.forEach(hc => {
      const details = []
      if (hc.temperature) details.push(`Temp: ${hc.temperature}°F`)
      if (hc.heartRate) details.push(`HR: ${hc.heartRate}`)
      if (hc.overallCondition) details.push(`Condition: ${hc.overallCondition}`)
      
      activities.push({
        id: `healthcheck-${hc.id}`,
        category: 'health',
        title: 'Daily health check',
        description: details.length > 0 ? details.join(', ') : hc.notes,
        date: hc.date.toISOString(),
        metadata: { 
          temperature: hc.temperature,
          heartRate: hc.heartRate,
          respiratoryRate: hc.respiratoryRate,
          overallCondition: hc.overallCondition,
          appetite: hc.appetite,
          attitude: hc.attitude,
          notes: hc.notes,
          checkedBy: hc.checkedBy 
        },
      })
    })

    // Get feed logs
    const feedLogs = await prisma.feedLog.findMany({
      where: { horseId },
      orderBy: { loggedAt: 'desc' },
      take: 20,
      include: { feedType: true },
    })
    feedLogs.forEach(fl => {
      activities.push({
        id: `feed-${fl.id}`,
        category: 'feed',
        title: fl.feedType?.name ? `Fed ${fl.feedType.name}` : `${fl.feedingTime} feeding`,
        description: fl.notes,
        date: fl.loggedAt.toISOString(),
        metadata: { fedBy: fl.loggedBy, amount: fl.amount, amountEaten: fl.amountEaten },
      })
    })

    // Get medications
    const medications = await prisma.medication.findMany({
      where: { horseId },
      orderBy: { startDate: 'desc' },
      take: 20,
    })
    medications.forEach(med => {
      activities.push({
        id: `med-${med.id}`,
        category: 'medication',
        title: `${med.name} - ${med.dosage}`,
        description: `${med.frequency}${med.instructions ? ': ' + med.instructions : ''}`,
        date: med.startDate.toISOString(),
        metadata: { status: med.status },
      })
    })

    // Get vaccinations
    const vaccinations = await prisma.vaccination.findMany({
      where: { horseId },
      orderBy: { dateGiven: 'desc' },
      take: 20,
    })
    vaccinations.forEach(vax => {
      activities.push({
        id: `vax-${vax.id}`,
        category: 'health',
        title: `${vax.type} vaccination`,
        description: vax.notes,
        date: vax.dateGiven.toISOString(),
        metadata: { veterinarian: vax.veterinarian, nextDue: vax.nextDueDate },
      })
    })

    // Get weight records
    const weights = await prisma.weightRecord.findMany({
      where: { horseId },
      orderBy: { date: 'desc' },
      take: 10,
    })
    weights.forEach(w => {
      activities.push({
        id: `weight-${w.id}`,
        category: 'weight',
        title: `Weight recorded: ${w.weightLbs} lbs`,
        description: w.notes,
        date: w.date.toISOString(),
        metadata: {},
      })
    })

    // Get events for this horse
    const events = await prisma.event.findMany({
      where: { horseId },
      orderBy: { scheduledDate: 'desc' },
      take: 20,
    })
    events.forEach(evt => {
      activities.push({
        id: `event-${evt.id}`,
        category: 'event',
        title: evt.title,
        description: evt.description,
        date: evt.scheduledDate.toISOString(),
        metadata: { type: evt.type, status: evt.status },
      })
    })

    // Get activity log entries (general activities like "Added horse to barn")
    const activityLogs = await prisma.activityLog.findMany({
      where: { 
        barnId,
        metadata: { contains: horseId },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    activityLogs.forEach(al => {
      activities.push({
        id: `log-${al.id}`,
        category: al.type.toLowerCase().includes('health') ? 'health' : 
                  al.type.toLowerCase().includes('feed') ? 'feed' : 'event',
        title: al.description,
        description: null,
        date: al.createdAt.toISOString(),
        metadata: al.metadata ? JSON.parse(al.metadata) : {},
      })
    })

    // Sort all activities by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ data: activities.slice(0, 50) })
  } catch (error) {
    console.error('Error fetching horse activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
