// API route for invoices
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission, getClientAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    // Pagination with cursor-based approach
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50))
    const cursor = searchParams.get('cursor')

    // Check if user is a client (to filter invoices to their own)
    const clientAccess = await getClientAccess(user.id, barnId)
    const isClient = !!clientAccess && !await prisma.barnMember.findUnique({
      where: { userId_barnId: { userId: user.id, barnId } },
    })

    const invoices = await prisma.invoice.findMany({
      where: {
        barnId,
        ...(status && { status }),
        ...(clientId && { clientId }),
        // If client, only show their invoices
        ...(isClient && clientAccess && { clientId: clientAccess.id }),
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    })

    const hasMore = invoices.length > limit
    if (hasMore) invoices.pop()

    return NextResponse.json({
      data: invoices,
      pagination: {
        hasMore,
        nextCursor: hasMore ? invoices[invoices.length - 1].id : null,
      },
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
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

    // Calculate totals (enforce non-negative values)
    const items = body.items || []
    const subtotal = items.reduce((sum: number, i: any) => {
      const qty = Math.max(0, parseInt(i.quantity) || 1)
      const price = Math.max(0, parseFloat(i.unitPrice) || 0)
      return sum + (qty * price)
    }, 0)
    const taxRate = Math.max(0, parseFloat(body.taxRate) || 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // Use a transaction to prevent invoice number race conditions
    const invoice = await prisma.$transaction(async (tx) => {
      // Generate invoice number inside transaction for atomicity
      const lastInvoice = await tx.invoice.findFirst({
        where: { barnId },
        orderBy: { createdAt: 'desc' },
        select: { invoiceNumber: true },
      })

      let nextNumber = 1001
      if (lastInvoice?.invoiceNumber) {
        const match = lastInvoice.invoiceNumber.match(/\d+/)
        if (match) nextNumber = parseInt(match[0]) + 1
      }
      const invoiceNumber = `INV-${nextNumber}`

      return tx.invoice.create({
        data: {
          barnId,
          clientId: body.clientId,
          invoiceNumber,
          status: body.status || 'DRAFT',
          subtotal,
          taxRate,
          taxAmount,
          total,
          amountPaid: 0,
          amountDue: total,
          dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          notes: body.notes,
          terms: body.terms,
          items: {
            create: items.map((item: any) => ({
              serviceId: item.serviceId || null,
              description: item.description,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice,
              total: (item.quantity || 1) * item.unitPrice,
              horseId: item.horseId || null,
              date: item.date ? new Date(item.date) : null,
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
    })

    return NextResponse.json({ data: invoice })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
