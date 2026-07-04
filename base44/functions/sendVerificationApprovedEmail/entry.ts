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
    const requestId = payload?.event?.entity_id || payload?.request_id || payload?.data?.id;
    if (!requestId) {
      return Response.json({ error: 'Missing request id' }, { status: 400 });
    }

    const verification = await svc.entities.VerificationRequest.get(requestId);
    if (!verification) {
      return Response.json({ error: 'Verification request not found' }, { status: 404 });
    }

    if (verification.status !== 'approved') {
      return Response.json({ ok: true, skipped: 'not_approved' });
    }

    // Get the user's email
    const users = await svc.entities.User.filter({ id: verification.user_id });
    const user = users[0];
    if (!user || !user.email) {
      return Response.json({ ok: true, skipped: 'no_email' });
    }

    // Get the profile for first name
    const profiles = await svc.entities.Profile.filter({ created_by_id: verification.user_id });
    const profile = profiles[0];
    const firstName = (profile?.full_name || user.full_name || 'there').split(' ')[0];

    const emailBody =
      `Hi ${firstName},\n\n` +
      `Great news! Your identity verification has been approved. \u2705\n\n` +
      `You now have a verified badge on your profile, which helps you build trust and get more matches. ` +
      `You\u2019ll also appear in verified-only discovery filters.\n\n` +
      `Thank you for helping keep Trust Matches a safe and authentic community.\n\n` +
      `Happy matching,\n` +
      `The Trust Matches Team`;

    await svc.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Your Trust Matches verification is approved! \u2705',
      body: emailBody,
      from_name: 'Trust Matches',
    });

    return Response.json({ ok: true, sent: true, email: user.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});