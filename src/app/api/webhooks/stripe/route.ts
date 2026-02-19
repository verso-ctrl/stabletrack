// src/app/api/webhooks/stripe/route.ts
// Handle Stripe webhook events for subscription updates

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('Stripe not configured')
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    )
  }

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Handle barn creation (from onboarding)
        if (session.metadata?.barnName) {
          // Barn creation is handled by verify-session endpoint
          // This webhook is a backup confirmation
          console.log('Barn creation payment completed:', session.metadata.barnName)
        }

        // Handle plan upgrade (from billing page)
        if (session.metadata?.barnId && session.metadata?.action === 'upgrade') {
          const { barnId, tier } = session.metadata

          await prisma.barn.update({
            where: { id: barnId },
            data: {
              tier,
              subscriptionStatus: 'ACTIVE',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          })

          console.log(`Barn ${barnId} upgraded to ${tier}`)
        }

        // Handle add-on purchase
        if (session.metadata?.barnId && session.metadata?.action === 'add_addon') {
          const { barnId, addOnId } = session.metadata

          if (addOnId) {
            const barn = await prisma.barn.findUnique({
              where: { id: barnId },
              select: { activeAddOns: true },
            })

            if (barn && !barn.activeAddOns.includes(addOnId)) {
              await prisma.barn.update({
                where: { id: barnId },
                data: {
                  activeAddOns: { push: addOnId },
                  stripeCustomerId: session.customer as string || undefined,
                  stripeSubscriptionId: session.subscription as string || undefined,
                },
              })
              console.log(`Barn ${barnId} activated add-on: ${addOnId}`)
            }
          }
        }

        // Handle barn creation with add-ons (from onboarding)
        if (session.metadata?.addOns && session.metadata?.barnName) {
          const addOns = session.metadata.addOns.split(',').filter(Boolean)
          if (addOns.length > 0) {
            // The barn may not exist yet (created by verify-session),
            // but if it does, update its add-ons
            const barn = await prisma.barn.findFirst({
              where: {
                name: session.metadata.barnName,
                stripeCustomerId: session.customer as string,
              },
            })
            if (barn && barn.activeAddOns.length === 0) {
              await prisma.barn.update({
                where: { id: barn.id },
                data: { activeAddOns: addOns },
              })
              console.log(`Barn ${barn.id} initialized with add-ons: ${addOns.join(', ')}`)
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Find barn by Stripe subscription ID
        const barn = await prisma.barn.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (barn) {
          const status = subscription.status === 'active' ? 'ACTIVE' :
                        subscription.status === 'past_due' ? 'PAST_DUE' :
                        subscription.status === 'canceled' ? 'CANCELED' : 'ACTIVE'

          await prisma.barn.update({
            where: { id: barn.id },
            data: { subscriptionStatus: status },
          })

          console.log(`Barn ${barn.id} subscription status updated to ${status}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Find barn and downgrade to FREE
        const barn = await prisma.barn.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (barn) {
          await prisma.barn.update({
            where: { id: barn.id },
            data: {
              tier: 'STARTER',
              subscriptionStatus: 'CANCELED',
              stripeSubscriptionId: null,
              activeAddOns: [],
            },
          })

          console.log(`Barn ${barn.id} subscription canceled`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }

        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id

        if (subscriptionId) {
          const barn = await prisma.barn.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
          })

          if (barn) {
            await prisma.barn.update({
              where: { id: barn.id },
              data: { subscriptionStatus: 'PAST_DUE' },
            })

            console.log(`Barn ${barn.id} payment failed, marked as PAST_DUE`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
