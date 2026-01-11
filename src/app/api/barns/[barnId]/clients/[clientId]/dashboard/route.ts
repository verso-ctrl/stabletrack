// API route for client portal dashboard
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'

type RouteContext = { params: Promise<{ barnId: string; clientId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, clientId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'clients:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    // Get client with their horses
    const client = await prisma.client.findFirst({
      where: { id: clientId, barnId },
      include: {
        horses: {
          include: {
            horse: {
              include: {
                vaccinations: {
                  orderBy: { dateGiven: 'desc' },
                  take: 5,
                },
                healthRecords: {
                  orderBy: { date: 'desc' },
                  take: 5,
                },
                stall: true,
              },
            },
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Build dashboard data - cast to any for included relations
    const clientWithHorses = client as typeof client & { 
      horses: Array<{ 
        isPrimary: boolean; 
        horse: { 
          id: string; 
          barnName: string; 
          status: string; 
          stall: { name: string } | null;
          vaccinations: any[];
          healthRecords: any[];
        } 
      }> 
    }
    
    const dashboard = {
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        balance: client.balance,
      },
      horses: clientWithHorses.horses.map((ch) => ({
        id: ch.horse.id,
        barnName: ch.horse.barnName,
        status: ch.horse.status,
        stall: ch.horse.stall?.name,
        recentVaccinations: ch.horse.vaccinations,
        recentHealth: ch.horse.healthRecords,
        isPrimary: ch.isPrimary,
      })),
      upcomingEvents: [], // Would fetch from events table
      recentInvoices: [], // Would fetch from invoices table (not implemented)
      notifications: [],
    }

    return NextResponse.json({ data: dashboard })
  } catch (error) {
    console.error('Error fetching client dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
