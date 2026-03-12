import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/server/db';
import { users, subscriptions } from '@/shared/schema';
import { eq } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || '0');

        if (userId) {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;

          await db
            .update(users)
            .set({
              subscriptionTier: 'premium',
              subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })
            .where(eq(users.id, userId));

          if (subscriptionId) {
            await db.insert(subscriptions).values({
              userId,
              tier: 'premium',
              status: 'active',
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              autoRenew: true,
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const [userSubscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
          .limit(1);

        if (userSubscription) {
          const status = subscription.status === 'active' ? 'active' : 'cancelled';
          await db
            .update(subscriptions)
            .set({ status })
            .where(eq(subscriptions.id, userSubscription.id));

          await db
            .update(users)
            .set({
              subscriptionTier: status === 'active' ? 'premium' : 'free',
            })
            .where(eq(users.id, userSubscription.userId));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
