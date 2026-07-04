import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

Deno.serve(async (req) => {
  try {
    const requestBody = await req.text();
    const WEBHOOK_PUBLIC_KEY = Deno.env.get('WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');

    if (!WEBHOOK_PUBLIC_KEY) {
      console.error('Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
      return Response.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Step 1: Verify JWT signature — fail closed if verification fails
    let rawPayload;
    try {
      rawPayload = jwt.verify(requestBody, WEBHOOK_PUBLIC_KEY, { algorithms: ['RS256'] });
    } catch (verifyError) {
      console.error('JWT verification failed:', verifyError.message);
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Step 2: Parse double-nested JSON (WebhookEnvelope -> event data)
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    const base44 = createClientFromRequest(req);

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      // Access order through actionEvent.body
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;

      // Find pending subscription by checkout_id
      const subs = await base44.asServiceRole.entities.Subscription.filter({ checkout_id: checkoutId });
      const sub = subs[0];

      if (sub) {
        // Extract subscription ID from line items
        let subscriptionId = null;
        for (const lineItem of order.lineItems) {
          if (lineItem.subscriptionInfo) {
            subscriptionId = lineItem.subscriptionInfo.id;
            break;
          }
        }

        // Activate subscription
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          status: 'active',
          subscription_id: subscriptionId,
          is_active: true,
        });

        // Activate premium on the user's profile
        const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: sub.user_id });
        if (profiles[0]) {
          await base44.asServiceRole.entities.Profile.update(profiles[0].id, {
            is_premium: true,
            credits: 5,
          });
        }
      }
    } else if (
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_canceled' ||
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_expired'
    ) {
      // Match by subscriptionContract.id (= stored subscriptionInfo.id)
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      const subscriptionId = subscriptionContract.id;

      const subs = await base44.asServiceRole.entities.Subscription.filter({ subscription_id: subscriptionId });
      const sub = subs[0];

      if (sub) {
        const newStatus = event.eventType.includes('canceled') ? 'canceled' : 'expired';

        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          status: newStatus,
          is_active: false,
        });

        // Remove premium from the user's profile
        const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: sub.user_id });
        if (profiles[0]) {
          await base44.asServiceRole.entities.Profile.update(profiles[0].id, {
            is_premium: false,
          });
        }
      }
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});