// API for services catalog
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

    const services = await prisma.service.findMany({
      where: { barnId },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })
    
    return NextResponse.json({ data: services })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
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
    
    const service = await prisma.service.create({
      data: {
        barnId,
        name: body.name,
        category: body.category || 'OTHER',
        price: parseFloat(body.price) || 0,
        unit: body.unit || 'month',
        description: body.description,
        taxable: body.taxable ?? true,
        isActive: body.isActive ?? true,
      },
    })
    
    return NextResponse.json({ data: service })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
