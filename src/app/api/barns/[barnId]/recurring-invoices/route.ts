// API for recurring invoices
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const recurring = await prisma.recurringInvoice.findMany({
      where: { barnId },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: {
          include: {
            service: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({ data: recurring })
  } catch (error) {
    console.error('Error fetching recurring invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch recurring invoices' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()
    
    // Calculate next date based on frequency
    const now = new Date()
    const nextDate = new Date()
    switch (body.frequency) {
      case 'WEEKLY':
        nextDate.setDate(now.getDate() + 7)
        break
      case 'BIWEEKLY':
        nextDate.setDate(now.getDate() + 14)
        break
      case 'MONTHLY':
        nextDate.setMonth(now.getMonth() + 1)
        if (body.dayOfMonth) nextDate.setDate(body.dayOfMonth)
        break
      case 'QUARTERLY':
        nextDate.setMonth(now.getMonth() + 3)
        break
      case 'ANNUALLY':
        nextDate.setFullYear(now.getFullYear() + 1)
        break
    }
    
    // Calculate amount from items (enforce non-negative)
    const items = body.items || []
    const amount = items.reduce((sum: number, i: any) => {
      const qty = Math.max(0, parseInt(i.quantity) || 1)
      const price = Math.max(0, parseFloat(i.unitPrice) || 0)
      return sum + (qty * price)
    }, 0)
    
    const recurring = await prisma.recurringInvoice.create({
      data: {
        barnId,
        clientId: body.clientId,
        name: body.name || body.description || 'Recurring Charge',
        frequency: body.frequency || 'MONTHLY',
        amount,
        dayOfMonth: body.dayOfMonth,
        dayOfWeek: body.dayOfWeek,
        nextDate: body.nextDate ? new Date(body.nextDate) : nextDate,
        status: 'ACTIVE',
        notes: body.notes,
        autoSend: body.autoSend ?? false,
        items: {
          create: items.map((item: any) => ({
            serviceId: item.serviceId || null,
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice,
            horseId: item.horseId || null,
          })),
        },
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: true,
      },
    })
    
    return NextResponse.json({ data: recurring })
  } catch (error) {
    console.error('Error creating recurring invoice:', error)
    return NextResponse.json({ error: 'Failed to create recurring invoice' }, { status: 500 })
  }
}
