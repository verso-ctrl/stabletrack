// API for invoice payments
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

    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paidAt: 'desc' },
    })

    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, invoiceId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'billing:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()
    
    // Get the invoice
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, barnId },
    })
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    
    const paymentAmount = parseFloat(body.amount) || 0
    
    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: paymentAmount,
        method: body.method || 'OTHER',
        reference: body.reference,
        notes: body.notes,
        recordedBy: user.id,
        paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
      },
    })
    
    // Update invoice amounts
    const newAmountPaid = invoice.amountPaid + paymentAmount
    const newAmountDue = invoice.total - newAmountPaid
    const newStatus = newAmountDue <= 0 ? 'PAID' : (newAmountPaid > 0 ? 'PARTIAL' : invoice.status)
    
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        amountDue: Math.max(0, newAmountDue),
        status: newStatus,
        paidDate: newStatus === 'PAID' ? new Date() : null,
      },
    })
    
    // Update client balance if invoice is fully paid
    if (newStatus === 'PAID' && invoice.clientId) {
      await prisma.client.update({
        where: { id: invoice.clientId },
        data: {
          balance: { decrement: invoice.total },
        },
      })
    }

    return NextResponse.json({ data: payment })
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
}
