import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// POST /api/billing/create-checkout - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, barnId, tier } = body;

    if (!priceId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId and tier' },
        { status: 400 }
      );
    }

    // TODO: Implement Stripe checkout session creation
    // This is a placeholder implementation until Stripe is configured

    // Example Stripe implementation:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price: priceId,
    //     quantity: 1,
    //   }],
    //   mode: 'subscription',
    //   success_url: `${request.headers.get('origin')}/settings/billing?success=true`,
    //   cancel_url: `${request.headers.get('origin')}/settings/billing?canceled=true`,
    //   client_reference_id: barnId,
    //   customer_email: user.email,
    //   metadata: {
    //     userId: user.id,
    //     barnId: barnId,
    //     tier: tier,
    //   },
    // });
    //
    // return NextResponse.json({ sessionId: session.id, url: session.url });

    return NextResponse.json(
      {
        error: 'Stripe integration not configured',
        message: 'Please configure STRIPE_SECRET_KEY environment variable to enable billing',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
