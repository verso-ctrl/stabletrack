// src/app/api/billing/portal/route.ts
// Create Stripe billing portal session

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { barnId } = body

    if (!barnId) {
      return NextResponse.json(
        { error: 'Barn ID is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this barn
    const barn = await prisma.barn.findFirst({
      where: {
        id: barnId,
        members: {
          some: {
            userId: user.id,
            role: { in: ['OWNER', 'MANAGER'] },
          },
        },
      },
    })

    if (!barn) {
      return NextResponse.json(
        { error: 'Barn not found or access denied' },
        { status: 403 }
      )
    }

    // If Stripe is not configured, return demo mode response
    if (!stripe) {
      return NextResponse.json({
        demoMode: true,
        message: 'Stripe not configured. Billing portal unavailable in demo mode.',
      })
    }

    // Check if barn has a Stripe customer ID
    if (!barn.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing information found. Please upgrade your plan first.' },
        { status: 400 }
      )
    }

    // Create billing portal session
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing`
    const session = await stripe.billingPortal.sessions.create({
      customer: barn.stripeCustomerId,
      return_url: returnUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
