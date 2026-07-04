import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the user's profile
    const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
    const profile = profiles[0];
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    // Check if already has an active or pending subscription
    const existingSubs = await base44.entities.Subscription.filter({ user_id: user.id });
    const activeSub = existingSubs.find((s) => s.status === 'active' || s.status === 'pending');
    if (activeSub) {
      return Response.json({ error: 'You already have an active or pending subscription.' }, { status: 400 });
    }

    const ALLOWED_ORIGINS = [
      'https://trustmatches.com',
      'https://www.trustmatches.com',
    ];
    const rawOrigin = req.headers.get('Origin') || req.headers.get('origin') || '';
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : 'https://trustmatches.com';

    const WIX_API_KEY = Deno.env.get('WIX_PAYMENTS_API_KEY');
    const WIX_SITE_ID = Deno.env.get('WIX_PAYMENTS_SITE_ID');

    if (!WIX_API_KEY || !WIX_SITE_ID) {
      console.error('Missing Wix Payments env vars');
      return Response.json({ error: 'Payment system not configured.' }, { status: 500 });
    }

    const response = await fetch(
      'https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': WIX_API_KEY,
          'wix-site-id': WIX_SITE_ID,
        },
        body: JSON.stringify({
          cart: {
            items: [{
              name: 'Trust Matches Premium — Monthly',
              quantity: 1,
              price: '9.99',
              subscriptionInfo: {
                subscriptionSettings: {
                  frequency: 'MONTH',
                },
                title: 'Trust Matches Premium (Monthly)',
                description: 'Unlimited likes, 5 super likes/day, profile boost, top picks, passport, voice messages, and video calls. Billed monthly. Cancel anytime.',
              },
            }],
            customerInfo: {
              email: user.email,
            },
          },
          callbackUrls: {
            postFlowUrl: origin + '/premium',
            thankYouPageUrl: origin + '/premium',
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Wix checkout error:', JSON.stringify(data));
      return Response.json({ error: 'Failed to create checkout session. Please try again.' }, { status: 500 });
    }

    const checkoutSession = data.checkoutSession;

    // Store pending subscription record linked to this user
    await base44.entities.Subscription.create({
      user_id: user.id,
      plan: 'monthly',
      credits_remaining: 0,
      is_active: false,
      checkout_id: checkoutSession.id,
      status: 'pending',
      buyer_email: user.email,
    });

    return Response.json({ redirectUrl: checkoutSession.redirectUrl });
  } catch (error) {
    console.error('create-checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});