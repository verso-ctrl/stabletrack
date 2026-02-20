import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null;

// POST /api/barns/[barnId]/sync-subscription
// Syncs subscription state from Stripe to the database.
// Called after returning from Stripe checkout to ensure add-ons/plans are activated
// even if the webhook hasn't fired yet.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = await checkBarnPermission(user.id, barnId, 'read');
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const barn = await prisma.barn.findUnique({
      where: { id: barnId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        activeAddOns: true,
        tier: true,
      },
    });

    if (!barn) {
      return NextResponse.json({ error: 'Barn not found' }, { status: 404 });
    }

    // If no Stripe configured or no customer, check for recent checkout sessions
    if (!stripe) {
      return NextResponse.json({ synced: false, reason: 'Stripe not configured' });
    }

    // Find recent completed checkout sessions for this user/barn
    const sessions = await stripe.checkout.sessions.list({
      limit: 5,
      status: 'complete',
    });

    let updated = false;

    for (const session of sessions.data) {
      if (session.metadata?.barnId !== barnId) continue;

      // Handle add-on activation
      if (session.metadata?.action === 'add_addon' && session.metadata?.addOnId) {
        const addOnId = session.metadata.addOnId;
        const currentAddOns = barn.activeAddOns as string[];

        if (!currentAddOns.includes(addOnId)) {
          await prisma.barn.update({
            where: { id: barnId },
            data: {
              activeAddOns: { push: addOnId },
              stripeCustomerId: session.customer as string || undefined,
            },
          });
          updated = true;
        }
      }

      // Handle plan upgrade
      if (session.metadata?.action === 'upgrade' && session.metadata?.tier) {
        const newTier = session.metadata.tier;
        if (barn.tier !== newTier) {
          await prisma.barn.update({
            where: { id: barnId },
            data: {
              tier: newTier,
              subscriptionStatus: 'ACTIVE',
              stripeCustomerId: session.customer as string || undefined,
              stripeSubscriptionId: session.subscription as string || undefined,
            },
          });
          updated = true;
        }
      }
    }

    return NextResponse.json({ synced: true, updated });
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
