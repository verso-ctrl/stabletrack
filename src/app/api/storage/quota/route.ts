// src/app/api/storage/quota/route.ts
// API route to get storage quota for a barn (Demo mode)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getTierLimits, formatBytes, normalizeTier } from '@/lib/tiers'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const barnId = searchParams.get('barnId')

    if (!barnId) {
      return NextResponse.json({ error: 'barnId is required' }, { status: 400 })
    }

    // Verify user has access to this barn
    const membership = await prisma.barnMember.findFirst({
      where: {
        barnId,
        userId: user.id,
      },
      include: {
        barn: true,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Calculate storage usage from photos and documents
    const [photoStats, documentStats] = await Promise.all([
      prisma.horsePhoto.aggregate({
        where: {
          horse: { barnId },
        },
        _sum: { fileSize: true },
      }),
      prisma.document.aggregate({
        where: {
          horse: { barnId },
        },
        _sum: { fileSize: true },
      }),
    ])
    
    const used = (photoStats._sum.fileSize || 0) + (documentStats._sum.fileSize || 0)
    
    // Use the barn's actual tier
    const tier = normalizeTier(membership.barn.tier || 'STARTER')
    const limits = getTierLimits(tier)
    const limit = limits.maxStorageBytes

    const quota = {
      used,
      limit,
      percentage: Math.round((used / limit) * 100),
      formatted: {
        used: formatBytes(used),
        limit: formatBytes(limit),
      },
    }

    return NextResponse.json({ quota })
  } catch (error) {
    console.error('Storage quota error:', error)
    return NextResponse.json(
      { error: 'Failed to get storage quota' },
      { status: 500 }
    )
  }
}
