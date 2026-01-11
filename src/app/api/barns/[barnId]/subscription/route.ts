// src/app/api/barns/[barnId]/subscription/route.ts
// API route to get subscription info for a barn (Demo mode)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { 
  getTierLimits, 
  getTierFeatures,
  getTierPricing,
  formatBytes,
  normalizeTier,
  type SubscriptionTier
} from '@/lib/tiers'

export async function GET(
  req: NextRequest,
  { params }: { params: { barnId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { barnId } = params

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

    // Demo mode: Always FARM tier
    const tier: SubscriptionTier = 'FARM'
    const limits = getTierLimits(tier)
    const features = getTierFeatures(tier)
    const pricing = getTierPricing(tier)

    // Get current usage
    const [horseCount, memberCount] = await Promise.all([
      prisma.horse.count({ where: { barnId } }),
      prisma.barnMember.count({ where: { barnId } }),
    ])

    // Calculate storage usage
    const [photoStats, documentStats] = await Promise.all([
      prisma.horsePhoto.aggregate({
        where: { horse: { barnId } },
        _sum: { fileSize: true },
      }),
      prisma.document.aggregate({
        where: { horse: { barnId } },
        _sum: { fileSize: true },
      }),
    ])
    
    const storageUsed = (photoStats._sum.fileSize || 0) + (documentStats._sum.fileSize || 0)

    const usage = {
      horses: horseCount,
      teamMembers: memberCount,
      storageBytes: storageUsed,
    }

    return NextResponse.json({
      tier,
      displayName: pricing.displayName,
      status: 'ACTIVE',
      features,
      limits: {
        maxHorses: limits.maxHorses,
        maxTeamMembers: limits.maxTeamMembers,
        maxStorageBytes: limits.maxStorageBytes,
        maxPhotosPerHorse: limits.maxPhotosPerHorse,
      },
      usage,
      remaining: {
        horses: limits.maxHorses === -1 ? Infinity : Math.max(0, limits.maxHorses - horseCount),
        teamMembers: limits.maxTeamMembers === -1 ? Infinity : Math.max(0, limits.maxTeamMembers - memberCount),
        storageBytes: limits.maxStorageBytes - storageUsed,
      },
      percentage: {
        horses: limits.maxHorses === -1 ? 0 : Math.round((horseCount / limits.maxHorses) * 100),
        teamMembers: limits.maxTeamMembers === -1 ? 0 : Math.round((memberCount / limits.maxTeamMembers) * 100),
        storage: Math.round((storageUsed / limits.maxStorageBytes) * 100),
      },
      formatted: {
        storageUsed: formatBytes(storageUsed),
        storageLimit: formatBytes(limits.maxStorageBytes),
      },
    })
  } catch (error) {
    console.error('Subscription info error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription info' },
      { status: 500 }
    )
  }
}
