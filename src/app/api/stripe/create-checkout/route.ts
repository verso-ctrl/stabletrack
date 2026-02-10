// src/app/api/stripe/create-checkout/route.ts
// Create Stripe checkout session for barn subscription

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { TIER_PRICING, type SubscriptionTier } from '@/lib/tiers'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { tier, barnData } = body

    if (!tier) {
      return NextResponse.json(
        { error: 'Tier is required' },
        { status: 400 }
      )
    }

    if (!barnData || !barnData.name) {
      return NextResponse.json(
        { error: 'Barn data is required' },
        { status: 400 }
      )
    }

    // If Stripe is not configured, return error with helpful message
    if (!stripe) {
      return NextResponse.json(
        {
          error: 'Stripe is not configured',
          message: 'Please configure STRIPE_SECRET_KEY environment variable to enable payments. For development, you can create a barn with the FREE tier.',
          demoMode: true,
        },
        { status: 503 }
      )
    }

    const pricing = TIER_PRICING[tier as SubscriptionTier]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'StableTrack Core Plan',
              description: pricing.description,
            },
            unit_amount: pricing.monthlyPriceCents,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/create-barn/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/create-barn`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        tier,
        barnName: barnData.name,
        barnAddress: barnData.address || '',
        barnCity: barnData.city || '',
        barnState: barnData.state || '',
        barnZipCode: barnData.zipCode || '',
        barnPhone: barnData.phone || '',
        barnEmail: barnData.email || '',
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: errorMessage,
        message: 'Please check server logs for more details'
      },
      { status: 500 }
    )
  }
}
