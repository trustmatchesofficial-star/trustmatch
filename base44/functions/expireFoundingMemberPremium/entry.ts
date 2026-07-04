import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only the internal automation system (platform-authenticated) or an
    // authenticated admin may invoke this endpoint.
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let caller = null;
    try { caller = await base44.auth.me(); } catch {}
    if (caller && caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;
    const now = new Date();

    // Find all founding members whose free premium has expired
    const founders = await svc.entities.Profile.filter({ is_founding_member: true });
    const expired = founders.filter(
      (p) => p.premium_free_until && new Date(p.premium_free_until) < now
    );

    let downgraded = 0;
    let protectedCount = 0;

    for (const profile of expired) {
      // Check if they have an active paid subscription
      const subs = await svc.entities.Subscription.filter({ user_id: profile.created_by_id });
      const hasActiveSub = subs.some(
        (s) => s.status === 'active' && (!s.expires_at || new Date(s.expires_at) > now)
      );

      if (hasActiveSub) {
        // They're a paying subscriber — keep premium on
        protectedCount++;
        continue;
      }

      // Downgrade — founding member status stays, only premium access expires
      await svc.entities.Profile.update(profile.id, { is_premium: false });
      downgraded++;
    }

    return Response.json({
      ok: true,
      checked: expired.length,
      downgraded,
      protected: protectedCount,
    });
  } catch (error) {
    console.error('expireFoundingMemberPremium error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});