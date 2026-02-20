// src/app/api/barns/[barnId]/clients/route.ts
// API route for managing barn clients (horse owners)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import crypto from 'crypto'

type RouteContext = {
  params: Promise<{ barnId: string }>
}

// GET /api/barns/[barnId]/clients - List all clients
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { barnId } = await context.params

    const hasPermission = await checkBarnPermission(user.id, barnId, 'clients:read')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Pagination parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: { barnId },
        include: {
          horses: {
            include: {
              horse: {
                select: {
                  id: true,
                  barnName: true,
                  profilePhotoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { lastName: 'asc' },
        take: limit,
        skip: skip,
      }),
      prisma.client.count({ where: { barnId } }),
    ])

    // Transform for frontend
    const data = clients.map(client => ({
      ...client,
      _count: {
        invoices: 0, // Placeholder until Invoice model is added
      },
    }))

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// POST /api/barns/[barnId]/clients - Create a new client
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { barnId } = await context.params

    const hasPermission = await checkBarnPermission(user.id, barnId, 'clients:write')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      portalEnabled,
      horseIds,
      notes,
    } = body

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Check if client with same email already exists (only if email provided)
    if (email) {
      const existing = await prisma.client.findFirst({
        where: { barnId, email },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'A contact with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Generate portal token if portal is enabled
    const portalToken = portalEnabled ? crypto.randomBytes(32).toString('hex') : null

    // Create client
    const client = await prisma.client.create({
      data: {
        barnId,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        portalEnabled: portalEnabled || false,
        portalToken,
        notes,
        balance: 0,
      },
    })

    // Assign horses if provided
    if (horseIds && horseIds.length > 0) {
      await prisma.clientHorse.createMany({
        data: horseIds.map((horseId: string, index: number) => ({
          clientId: client.id,
          horseId,
          isPrimary: index === 0, // First horse is primary
        })),
      })
    }

    // Fetch complete client with horses
    const completeClient = await prisma.client.findUnique({
      where: { id: client.id },
      include: {
        horses: {
          include: {
            horse: {
              select: {
                id: true,
                barnName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      data: {
        ...completeClient,
        _count: { invoices: 0 },
      },
    })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}

// PUT /api/barns/[barnId]/clients - Update a client
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { barnId } = await context.params

    const hasPermission = await checkBarnPermission(user.id, barnId, 'clients:write')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await req.json()
    const {
      id,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      portalEnabled,
      horseIds,
      notes,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    // Check client exists and belongs to barn
    const existing = await prisma.client.findFirst({
      where: { id, barnId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Generate portal token if enabling portal
    let portalToken = existing.portalToken
    if (portalEnabled && !existing.portalToken) {
      portalToken = crypto.randomBytes(32).toString('hex')
    }

    // Update client
    const client = await prisma.client.update({
      where: { id },
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        portalEnabled: portalEnabled || false,
        portalToken,
        notes,
      },
    })

    // Update horse assignments if provided
    if (horseIds !== undefined) {
      // Remove existing assignments
      await prisma.clientHorse.deleteMany({
        where: { clientId: id },
      })

      // Add new assignments
      if (horseIds.length > 0) {
        await prisma.clientHorse.createMany({
          data: horseIds.map((horseId: string, index: number) => ({
            clientId: id,
            horseId,
            isPrimary: index === 0,
          })),
        })
      }
    }

    // Fetch complete client
    const completeClient = await prisma.client.findUnique({
      where: { id },
      include: {
        horses: {
          include: {
            horse: {
              select: {
                id: true,
                barnName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      data: {
        ...completeClient,
        _count: { invoices: 0 },
      },
    })
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

// DELETE /api/barns/[barnId]/clients - Delete a client
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { barnId } = await context.params
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('id')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    const hasPermission = await checkBarnPermission(user.id, barnId, 'clients:write')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check client exists and belongs to barn
    const existing = await prisma.client.findFirst({
      where: { id: clientId, barnId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Delete client (cascade will handle ClientHorse records)
    await prisma.client.delete({
      where: { id: clientId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
