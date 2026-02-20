// src/app/api/stripe/verify-session/route.ts
// Verify Stripe checkout session and create barn

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { nanoid } from 'nanoid'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the session completed — with trials, payment_status may be 'no_payment_required'
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    if (session.client_reference_id !== user.id) {
      return NextResponse.json(
        { error: 'Session does not belong to this user' },
        { status: 403 }
      )
    }

    // Check if barn was already created for this session
    const existingBarn = await prisma.barn.findFirst({
      where: {
        // We'll store the Stripe session ID in a metadata field or check by name/user
        name: session.metadata?.barnName,
        members: {
          some: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    })

    if (existingBarn) {
      // Barn already created, just return success
      return NextResponse.json({ success: true, barn: existingBarn })
    }

    // Extract barn data from session metadata
    const tier = session.metadata?.tier || 'STARTER'
    const barnName = session.metadata?.barnName
    const barnAddress = session.metadata?.barnAddress || ''
    const barnCity = session.metadata?.barnCity || ''
    const barnState = session.metadata?.barnState || ''
    const barnZipCode = session.metadata?.barnZipCode || ''
    const barnPhone = session.metadata?.barnPhone || ''
    const barnEmail = session.metadata?.barnEmail || ''
    const addOnsStr = session.metadata?.addOns || ''
    const activeAddOns = addOnsStr ? addOnsStr.split(',').filter(Boolean) : []

    if (!barnName) {
      return NextResponse.json(
        { error: 'Invalid session metadata' },
        { status: 400 }
      )
    }

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    // Generate unique invite code
    const inviteCode = `BARN-${nanoid(6).toUpperCase()}`

    // Create the barn with Stripe subscription data
    const barn = await prisma.barn.create({
      data: {
        name: barnName,
        address: barnAddress || null,
        city: barnCity || null,
        state: barnState || null,
        zipCode: barnZipCode || null,
        phone: barnPhone || null,
        email: barnEmail || null,
        country: 'US',
        timezone: 'America/New_York',
        inviteCode,
        tier,
        subscriptionStatus: 'TRIALING',
        trialEndsAt,
        activeAddOns,
        stripeCustomerId: (session.customer as string) || null,
        stripeSubscriptionId: (session.subscription as string) || null,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
            status: 'ACTIVE',
            approvedAt: new Date(),
          },
        },
      },
      include: {
        _count: {
          select: {
            horses: true,
            members: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      barn: {
        ...barn,
        role: 'OWNER',
        memberCount: barn._count.members,
        horseCount: barn._count.horses,
      },
    })
  } catch (error) {
    console.error('Verify session error:', error)
    return NextResponse.json(
      { error: 'Failed to verify session and create barn' },
      { status: 500 }
    )
  }
}
