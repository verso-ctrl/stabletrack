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

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const appUrl = rawAppUrl.startsWith('http') ? rawAppUrl : `https://${rawAppUrl}`

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { tier, barnData, addOns } = body

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

    // Build line items — base plan + any add-ons
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `BarnKeep ${pricing.displayName} Plan`,
            description: pricing.description,
          },
          unit_amount: pricing.monthlyPriceCents,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ]

    // Add breeding add-on if selected
    const selectedAddOns: string[] = Array.isArray(addOns) ? addOns : []
    if (selectedAddOns.includes('breeding')) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Breeding Tracker Add-On',
            description: 'Heat cycles, breeding records, foaling management',
          },
          unit_amount: 1000, // $10/mo
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      })
    }

    // Create Stripe checkout session with 14-day trial
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: `${appUrl}/onboarding/create-barn/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/onboarding/create-barn`,
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
        tier,
        addOns: selectedAddOns.join(','),
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
