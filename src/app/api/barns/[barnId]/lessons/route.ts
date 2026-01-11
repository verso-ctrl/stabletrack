// API for lessons
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission, getClientAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'lessons:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const unbilled = searchParams.get('unbilled')
    const clientId = searchParams.get('clientId')
    const instructorId = searchParams.get('instructorId')
    const status = searchParams.get('status')

    // Pagination parameters
    const limit = parseInt(searchParams.get('limit') || '100')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Check if user is a client (to filter lessons to their own)
    const clientAccess = await getClientAccess(user.id, barnId)
    const isClient = !!clientAccess && !await prisma.barnMember.findUnique({
      where: { userId_barnId: { userId: user.id, barnId } },
    })

    const lessons = await prisma.lesson.findMany({
      where: {
        barnId,
        ...(unbilled === 'true' && { billed: false }),
        ...(clientId && { clientId }),
        ...(instructorId && { instructorId }),
        ...(status && { status }),
        // If client, only show their lessons
        ...(isClient && clientAccess && { clientId: clientAccess.id }),
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        horse: {
          select: { id: true, barnName: true },
        },
        instructor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: skip,
    })

    // Transform date to scheduledDate for client compatibility
    const transformedLessons = lessons.map(lesson => ({
      ...lesson,
      scheduledDate: lesson.date,
    }))

    return NextResponse.json({
      data: transformedLessons,
      pagination: {
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'lessons:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()
    
    const lesson = await prisma.lesson.create({
      data: {
        barnId,
        clientId: body.clientId,
        horseId: body.horseId || null,
        instructorId: body.instructorId || user.id,
        type: body.type || 'PRIVATE',
        discipline: body.discipline,
        date: new Date(body.scheduledDate || body.date),
        startTime: body.startTime || '09:00',
        duration: body.duration || 60,
        price: parseFloat(body.price) || 0,
        status: 'SCHEDULED',
        billed: false,
        notes: body.notes,
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        horse: {
          select: { id: true, barnName: true },
        },
        instructor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    // Transform date to scheduledDate for client compatibility
    const transformedLesson = {
      ...lesson,
      scheduledDate: lesson.date,
    }

    return NextResponse.json({ data: transformedLesson })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { barnId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'lessons:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()

    // Get the lesson first to check if it's being marked as completed
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: body.lessonId },
      select: { status: true, billed: true, clientId: true, price: true, horseId: true, date: true, type: true, discipline: true },
    })

    if (!existingLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const lesson = await prisma.lesson.update({
      where: { id: body.lessonId },
      data: {
        status: body.status,
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        horse: {
          select: { id: true, barnName: true },
        },
        instructor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    // If lesson is being marked as COMPLETED and hasn't been billed yet, add it to an invoice
    if (body.status === 'COMPLETED' && !existingLesson.billed && existingLesson.price > 0) {
      // Find or create a DRAFT invoice for this client
      let invoice = await prisma.invoice.findFirst({
        where: {
          barnId,
          clientId: existingLesson.clientId,
          status: 'DRAFT',
        },
        include: {
          items: true,
        },
      })

      if (!invoice) {
        // Generate invoice number
        const lastInvoice = await prisma.invoice.findFirst({
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

        // Create new DRAFT invoice
        invoice = await prisma.invoice.create({
          data: {
            barnId,
            clientId: existingLesson.clientId,
            invoiceNumber,
            status: 'DRAFT',
            subtotal: 0,
            taxRate: 0,
            taxAmount: 0,
            total: 0,
            amountPaid: 0,
            amountDue: 0,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
          include: {
            items: true,
          },
        })
      }

      // Add lesson as an invoice item
      const lessonDescription = `${existingLesson.type.replace(/_/g, ' ')} Lesson${existingLesson.discipline ? ` - ${existingLesson.discipline}` : ''}`

      await prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          description: lessonDescription,
          quantity: 1,
          unitPrice: existingLesson.price,
          total: existingLesson.price,
          horseId: existingLesson.horseId,
          date: existingLesson.date,
        },
      })

      // Recalculate invoice totals
      const allItems = await prisma.invoiceItem.findMany({
        where: { invoiceId: invoice.id },
      })

      const subtotal = allItems.reduce((sum, item) => sum + item.total, 0)
      const taxAmount = subtotal * (invoice.taxRate / 100)
      const total = subtotal + taxAmount

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          subtotal,
          taxAmount,
          total,
          amountDue: total - invoice.amountPaid,
        },
      })

      // Mark lesson as billed
      await prisma.lesson.update({
        where: { id: body.lessonId },
        data: { billed: true, invoiceId: invoice.id },
      })
    }

    // Transform date to scheduledDate for client compatibility
    const transformedLesson = {
      ...lesson,
      scheduledDate: lesson.date,
    }

    return NextResponse.json({ data: transformedLesson })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
  }
}
