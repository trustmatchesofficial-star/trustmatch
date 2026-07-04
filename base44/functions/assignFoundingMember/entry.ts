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

    const payload = await req.json();
    const profileId = payload?.event?.entity_id || payload?.data?.id || payload?.profile_id;
    if (!profileId) {
      return Response.json({ error: 'Missing profile id' }, { status: 400 });
    }

    const profile = await svc.entities.Profile.get(profileId);
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Already a founding member — nothing to do
    if (profile.is_founding_member) {
      return Response.json({ ok: true, skipped: 'already_founding_member' });
    }

    // Count existing founding members
    const existing = await svc.entities.Profile.filter({ is_founding_member: true });
    const count = existing.length;

    if (count >= 100) {
      return Response.json({ ok: true, skipped: 'cap_reached', count });
    }

    // Assign founding member status
    const nextNumber = count + 1;
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    await svc.entities.Profile.update(profileId, {
      is_founding_member: true,
      founding_member_number: nextNumber,
      is_premium: true,
      premium_free_until: expiry.toISOString(),
    });

    return Response.json({
      ok: true,
      assigned: true,
      founding_member_number: nextNumber,
      premium_free_until: expiry.toISOString(),
    });
  } catch (error) {
    console.error('assignFoundingMember error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});