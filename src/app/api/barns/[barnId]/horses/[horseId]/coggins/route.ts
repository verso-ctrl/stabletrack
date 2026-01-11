// API for Coggins test records (uses HealthRecord with type='COGGINS')
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ barnId: string; horseId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, horseId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:read')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    // Get coggins records from HealthRecord
    const cogginsRecords = await prisma.healthRecord.findMany({
      where: { 
        horseId,
        type: 'COGGINS',
      },
      include: {
        attachments: true,
      },
      orderBy: { date: 'desc' },
    })
    
    // Transform to expected format
    const data = cogginsRecords.map(record => ({
      id: record.id,
      horseId: record.horseId,
      testDate: record.date,
      expiryDate: record.cogginsExpiry,
      result: 'NEGATIVE', // Coggins must be negative to be valid
      veterinarian: record.provider,
      laboratory: record.findings, // Using findings to store lab name
      accessionNumber: record.diagnosis, // Using diagnosis to store accession #
      documentUrl: record.attachments[0]?.fileUrl || null,
      notes: record.treatment,
      createdAt: record.date,
    }))
    
    // Get current (most recent valid) coggins
    const now = new Date()
    const current = data.find(c => c.expiryDate && new Date(c.expiryDate) > now)
    const isExpired = current ? false : (data.length > 0)
    const expiresIn = current?.expiryDate 
      ? Math.ceil((new Date(current.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null

    return NextResponse.json({ 
      data,
      current: current || data[0] || null,
      isExpired,
      expiresIn,
    })
  } catch (error) {
    console.error('Error fetching coggins:', error)
    return NextResponse.json({ error: 'Failed to fetch coggins records' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { barnId, horseId } = await context.params
    const hasPermission = await checkBarnPermission(user.id, barnId, 'health:write')
    if (!hasPermission) return NextResponse.json({ error: 'Permission denied' }, { status: 403 })

    const body = await req.json()
    
    // Create as HealthRecord with type COGGINS
    const record = await prisma.healthRecord.create({
      data: {
        horseId,
        type: 'COGGINS',
        date: new Date(body.testDate),
        cogginsExpiry: body.expiryDate ? new Date(body.expiryDate) : null,
        provider: body.veterinarian,
        findings: body.laboratory, // Store lab name in findings
        diagnosis: body.accessionNumber, // Store accession # in diagnosis
        treatment: body.notes,
      },
    })
    
    // Transform to expected format
    const coggins = {
      id: record.id,
      horseId: record.horseId,
      testDate: record.date,
      expiryDate: record.cogginsExpiry,
      result: 'NEGATIVE',
      veterinarian: record.provider,
      laboratory: record.findings,
      accessionNumber: record.diagnosis,
      documentUrl: null,
      notes: record.treatment,
      createdAt: record.date,
    }
    
    return NextResponse.json({ data: coggins })
  } catch (error) {
    console.error('Error creating coggins record:', error)
    return NextResponse.json({ error: 'Failed to create coggins record' }, { status: 500 })
  }
}
