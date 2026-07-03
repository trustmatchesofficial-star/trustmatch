import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const userId = body.user_id || user.id;

    const settings = await base44.asServiceRole.entities.SafetySetting.filter({ created_by_id: userId });
    const setting = settings[0];
    const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: userId });
    const profile = profiles[0];

    const mode = setting?.escalation_mode || 'notify_contact';
    const notifyContact = mode === 'notify_contact' || mode === 'both';
    const showSos = mode === 'show_999' || mode === 'both';

    if (notifyContact && setting?.emergency_contact_email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: setting.emergency_contact_email,
          subject: 'Trust Matches Safety SOS',
          body:
            'Hi ' + (setting.emergency_contact_name || '') + ',\n\n' +
            (profile?.full_name || 'A Trust Matches member') +
            ' triggered a safety SOS from Trust Matches. They may need help — please try to reach them.\n\n' +
            'This alert was sent automatically by Trust Matches Safety.',
        });
      } catch (e) {}
    }

    const admins = await base44.asServiceRole.entities.User.list();
    for (const a of admins) {
      if (a.role === 'admin') {
        await base44.asServiceRole.entities.Notification.create({
          user_id: a.id,
          type: 'system',
          title: 'SAFETY SOS — Panic button triggered',
          body:
            (profile?.full_name || 'A member') + ' triggered a panic alert. Escalation mode: ' + mode + '.',
          is_read: false,
        });
      }
    }

    await base44.asServiceRole.entities.Notification.create({
      user_id: userId,
      type: 'system',
      title: 'Safety alert sent',
      body: showSos
        ? "We alerted your emergency contact and our safety team. If in immediate danger, call 999."
        : "We alerted your emergency contact and our safety team.",
      is_read: false,
    });

    return Response.json({ ok: true, mode, showSos });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});