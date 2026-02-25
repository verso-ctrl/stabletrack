// API route for individual invoice operations
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string; invoiceId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, invoiceId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, barnId },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true, address: true, city: true, state: true, zipCode: true },
        },
        items: {
          include: {
            service: { select: { id: true, name: true, category: true } },
          },
        },
        payments: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ data: invoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, invoiceId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()

    // Verify invoice belongs to this barn
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, barnId },
    })
    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Calculate totals if items are provided
    let updateData: any = {
      status: body.status,
      notes: body.notes,
      terms: body.terms,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    }

    if (body.items) {
      const subtotal = body.items.reduce((sum: number, i: any) => {
        const qty = Math.max(0, parseInt(i.quantity) || 1)
        const price = Math.max(0, parseFloat(i.unitPrice) || 0)
        return sum + (qty * price)
      }, 0)
      const taxRate = Math.max(0, parseFloat(body.taxRate) || 0)
      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount

      updateData = {
        ...updateData,
        subtotal,
        taxRate,
        taxAmount,
        total,
        amountDue: total - (body.amountPaid || 0),
      }

      // Delete existing items and create new ones
      await prisma.invoiceItem.deleteMany({ where: { invoiceId } })
    }

    // Handle status change to PAID
    if (body.status === 'PAID') {
      updateData.paidDate = new Date()
      updateData.amountDue = 0
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    })

    // Create new items if provided
    if (body.items) {
      await prisma.invoiceItem.createMany({
        data: body.items.map((item: any) => ({
          invoiceId,
          serviceId: item.serviceId || null,
          description: item.description,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice,
          total: (item.quantity || 1) * item.unitPrice,
          horseId: item.horseId || null,
          date: item.date ? new Date(item.date) : null,
        })),
      })
    }

    // Re-fetch with all relations to return fresh data
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: true,
        payments: true,
      },
    })

    return NextResponse.json({ data: invoice })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, invoiceId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    // Only allow deleting DRAFT or VOID invoices
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, barnId },
    })
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    
    if (!['DRAFT', 'VOID'].includes(invoice.status)) {
      return NextResponse.json({ error: 'Can only delete draft or voided invoices' }, { status: 400 })
    }

    await prisma.invoice.delete({ where: { id: invoiceId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
