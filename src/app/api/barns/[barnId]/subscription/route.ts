// src/app/api/barns/[barnId]/subscription/route.ts
// Get and update barn subscription/tier

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, checkBarnPermission } from '@/lib/auth'
import { getTierLimits, type SubscriptionTier } from '@/lib/tiers'

interface RouteParams {
  params: Promise<{ barnId: string }>
}

// GET /api/barns/[barnId]/subscription - Get barn subscription info
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { barnId } = await params
    const hasAccess = await checkBarnPermission(user.id, barnId, 'read')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const barn = await prisma.barn.findUnique({
      where: { id: barnId },
      select: {
        tier: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        _count: {
          select: { horses: true },
        },
      },
    })

    if (!barn) {
      return NextResponse.json({ error: 'Barn not found' }, { status: 404 })
    }

    const tier = barn.tier as SubscriptionTier
    const limits = getTierLimits(tier)

    return NextResponse.json({
      tier,
      status: barn.subscriptionStatus,
      hasStripeSubscription: !!barn.stripeSubscriptionId,
      limits,
      usage: {
        horses: barn._count.horses,
      },
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

// PATCH /api/barns/[barnId]/subscription - Update barn tier (for downgrades)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { barnId } = await params

    // Only owners and managers can change subscription
    const member = await prisma.barnMember.findFirst({
      where: {
        userId: user.id,
        barnId,
        role: { in: ['OWNER', 'MANAGER'] },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Only owners and managers can change the subscription' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tier } = body

    const validTiers: SubscriptionTier[] = ['STARTER', 'FARM']
    if (!tier || !validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be STARTER or FARM.' },
        { status: 400 }
      )
    }

    // Get current barn data to check horse count
    const barn = await prisma.barn.findUnique({
      where: { id: barnId },
      select: {
        tier: true,
        _count: { select: { horses: true } },
      },
    })

    if (!barn) {
      return NextResponse.json({ error: 'Barn not found' }, { status: 404 })
    }

    const newLimits = getTierLimits(tier as SubscriptionTier)
    const horseCount = barn._count.horses

    // Check if downgrade is allowed based on horse count
    if (newLimits.maxHorses !== -1 && horseCount > newLimits.maxHorses) {
      return NextResponse.json(
        {
          error: `Cannot downgrade: You have ${horseCount} horses but ${tier} plan only allows ${newLimits.maxHorses}. Please archive some horses first.`,
        },
        { status: 400 }
      )
    }

    // Update the barn tier
    const updatedBarn = await prisma.barn.update({
      where: { id: barnId },
      data: {
        tier,
      },
      select: {
        tier: true,
        subscriptionStatus: true,
      },
    })

    return NextResponse.json({
      success: true,
      tier: updatedBarn.tier,
      status: updatedBarn.subscriptionStatus,
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
