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
    const profileId = payload?.event?.entity_id || payload?.profile_id || payload?.data?.id;
    if (!profileId) {
      return Response.json({ error: 'Missing profile id' }, { status: 400 });
    }

    // Fetch the profile with service role (automation runs without a user session)
    const profile = await svc.entities.Profile.get(profileId);
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Avoid duplicate welcome emails
    if (profile.welcome_email_sent) {
      return Response.json({ ok: true, skipped: 'already_sent' });
    }

    // Onboarding must be complete
    if (!profile.is_onboarded) {
      return Response.json({ ok: true, skipped: 'not_onboarded' });
    }

    // Fetch the user to get their email
    const users = await svc.entities.User.filter({ id: profile.created_by_id });
    const user = users[0];
    if (!user || !user.email) {
      return Response.json({ ok: true, skipped: 'no_email' });
    }

    const firstName = (profile.full_name || user.full_name || 'there').split(' ')[0];

    const emailBody =
      `Hi ${firstName},\n\n` +
      `Welcome to Trust Matches! \ud83d\udc9c Your profile is all set up and you\u2019re ready to start connecting.\n\n` +
      `Here\u2019s what you can do next:\n` +
      `  \u2022 Discover people \u2014 head to the Discover page to start swiping.\n` +
      `  \u2022 Get verified \u2014 verify your identity to build trust and unlock verified-only matches.\n` +
      `  \u2022 Stay safe \u2014 set up your emergency contact and safety word in the Safety Center.\n\n` +
      `Safety is at the heart of Trust Matches. Every member deserves a respectful, secure experience \u2014 and we\u2019re here to help you feel confident every step of the way.\n\n` +
      `If you have any questions, just reply to this email.\n\n` +
      `Happy matching,\n` +
      `The Trust Matches Team`;

    await svc.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Welcome to Trust Matches! \ud83d\udc9c',
      body: emailBody,
      from_name: 'Trust Matches',
    });

    // Mark as sent so we never duplicate
    await svc.entities.Profile.update(profileId, { welcome_email_sent: true });

    return Response.json({ ok: true, sent: true, email: user.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});