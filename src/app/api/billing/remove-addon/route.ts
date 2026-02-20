import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCurrentUser } from '@/lib/auth';
import { ADD_ONS } from '@/lib/tiers';
import { prisma } from '@/lib/prisma';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null;

// POST /api/billing/remove-addon - Remove an add-on from a barn
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { barnId, addOnId } = body;

    if (!barnId || !addOnId) {
      return NextResponse.json(
        { error: 'Barn ID and add-on ID are required' },
        { status: 400 }
      );
    }

    const addOn = ADD_ONS[addOnId];
    if (!addOn) {
      return NextResponse.json({ error: 'Invalid add-on' }, { status: 400 });
    }

    // Verify user has access to this barn (OWNER or MANAGER)
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

    // Check if add-on is actually active
    if (!barn.activeAddOns.includes(addOnId)) {
      return NextResponse.json(
        { error: 'Add-on is not active' },
        { status: 400 }
      );
    }

    // Remove add-on from activeAddOns array
    const updatedAddOns = barn.activeAddOns.filter((id: string) => id !== addOnId);
    await prisma.barn.update({
      where: { id: barnId },
      data: { activeAddOns: { set: updatedAddOns } },
    });

    // If Stripe is configured and barn has a subscription, cancel the add-on subscription item
    if (stripe && barn.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(barn.stripeSubscriptionId);
        // Find the subscription item matching this add-on by product name
        const addOnItem = subscription.items.data.find(
          (item) => item.price.product &&
            typeof item.price.product === 'object' &&
            'name' in item.price.product &&
            (item.price.product as Stripe.Product).name === `BarnKeep ${addOn.name}`
        );
        if (addOnItem) {
          await stripe.subscriptionItems.del(addOnItem.id);
        }
      } catch (stripeErr) {
        console.error('Stripe add-on removal error (non-fatal):', stripeErr);
        // Non-fatal — the add-on is already removed from the DB
      }
    }

    return NextResponse.json({
      success: true,
      message: `${addOn.name} has been removed.`,
    });
  } catch (error) {
    console.error('Error removing add-on:', error);
    return NextResponse.json(
      { error: 'Failed to remove add-on' },
      { status: 500 }
    );
  }
}
