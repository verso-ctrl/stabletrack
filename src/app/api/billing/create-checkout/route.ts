import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCurrentUser } from '@/lib/auth';
import { TIER_PRICING, ADD_ONS, type SubscriptionTier } from '@/lib/tiers';
import { prisma } from '@/lib/prisma';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null;

// POST /api/billing/create-checkout - Create Stripe checkout session for plan change
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier, barnId, billingCycle = 'monthly', action, addOnId } = body;

    if (!barnId) {
      return NextResponse.json(
        { error: 'Barn ID is required' },
        { status: 400 }
      );
    }

    if (!tier && action !== 'add_addon') {
      return NextResponse.json(
        { error: 'Tier is required' },
        { status: 400 }
      );
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
    });

    if (!barn) {
      return NextResponse.json(
        { error: 'Barn not found or access denied' },
        { status: 403 }
      );
    }

    // If Stripe is not configured, return demo mode response
    if (!stripe) {
      // In demo mode, handle add-on activation directly
      if (action === 'add_addon' && addOnId) {
        const addOn = ADD_ONS[addOnId];
        if (!addOn || !addOn.available) {
          return NextResponse.json({ error: 'Add-on not available' }, { status: 400 });
        }
        await prisma.barn.update({
          where: { id: barnId },
          data: { activeAddOns: { push: addOnId } },
        });
        return NextResponse.json({
          demoMode: true,
          message: `${addOn.name} add-on activated (demo mode).`,
          addOnId,
        });
      }
      return NextResponse.json(
        {
          demoMode: true,
          message: 'Stripe not configured. In demo mode, plan changes are simulated.',
          tier,
        },
        { status: 200 }
      );
    }

    // Handle add-on purchase
    if (action === 'add_addon' && addOnId) {
      const addOn = ADD_ONS[addOnId];
      if (!addOn || !addOn.available) {
        return NextResponse.json({ error: 'Add-on not available' }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `BarnKeep ${addOn.name}`,
              description: addOn.description,
            },
            unit_amount: addOn.monthlyPriceCents,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing?addon_success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing?canceled=true`,
        client_reference_id: user.id,
        metadata: {
          userId: user.id,
          barnId,
          addOnId,
          action: 'add_addon',
        },
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    }

    const pricing = TIER_PRICING[tier as SubscriptionTier];
    const priceAmount = billingCycle === 'annual'
      ? pricing.annualPriceCents / 12
      : pricing.monthlyPriceCents;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `BarnKeep ${pricing.displayName} Plan`,
              description: pricing.description,
            },
            unit_amount: priceAmount,
            recurring: {
              interval: billingCycle === 'annual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing?success=true&tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing?canceled=true`,
      client_reference_id: user.id,
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
        barnId,
        tier,
        billingCycle,
        action: 'upgrade',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
