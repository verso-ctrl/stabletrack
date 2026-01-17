// src/app/api/stripe/create-checkout/route.ts
// Create Stripe checkout session for barn subscription

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { TIER_PRICING, type SubscriptionTier } from '@/lib/tiers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { tier, barnData } = body

    if (!tier || tier === 'FREE') {
      return NextResponse.json(
        { error: 'Stripe checkout not needed for FREE tier' },
        { status: 400 }
      )
    }

    if (!barnData || !barnData.name) {
      return NextResponse.json(
        { error: 'Barn data is required' },
        { status: 400 }
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
              name: `StableTrack ${pricing.displayName} Plan`,
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
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
