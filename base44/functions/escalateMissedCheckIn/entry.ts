import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const cronSecret = Deno.env.get('CRON_SECRET');
    if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const checkIns = await base44.asServiceRole.entities.DateCheckIn.filter({ status: 'pending' });
    const overdue = checkIns.filter((c) => new Date(c.check_in_time) < now);

    let escalated = 0;
    for (const c of overdue) {
      const settings = await base44.asServiceRole.entities.SafetySetting.filter({ created_by_id: c.user_id });
      const setting = settings[0];
      const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: c.user_id });
      const profile = profiles[0];

      if (setting?.emergency_contact_email) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: setting.emergency_contact_email,
            subject: 'A gentle check-in regarding ' + (profile?.full_name || 'your contact'),
            body:
              'Hi ' + (setting.emergency_contact_name || 'there') + ',\n\n' +
              (profile?.full_name || 'A Trust Matches member') +
              " set a safety check-in for a date and hasn't marked themselves safe by the planned time. " +
              "This is just a gentle nudge — they may have simply forgotten, but we wanted to let you know so you can reach out and check they're okay.\n\n" +
              'Date scheduled: ' + (c.date_at ? new Date(c.date_at).toLocaleString() : 'n/a') + '\n' +
              'Location note: ' + (c.location_note || 'n/a') + '\n\n' +
              "If they're safe, no further action is needed. This message was sent automatically by Trust Matches Safety.",
          });
        } catch (e) {}
      }

      const admins = await base44.asServiceRole.entities.User.list();
      for (const a of admins) {
        if (a.role === 'admin') {
          await base44.asServiceRole.entities.Notification.create({
            user_id: a.id,
            type: 'system',
            title: 'Missed date check-in',
            body:
              (profile?.full_name || 'A member') + ' missed their scheduled check-in. Escalation triggered.',
            is_read: false,
          });
        }
      }

      await base44.asServiceRole.entities.Notification.create({
        user_id: c.user_id,
        type: 'system',
        title: 'You missed your check-in',
        body: "We alerted your emergency contact because you missed your scheduled check-in. Tap if you're safe.",
        is_read: false,
      });

      await base44.asServiceRole.entities.DateCheckIn.update(c.id, { status: 'escalated' });
      escalated++;
    }

    return Response.json({ ok: true, escalated, checked: overdue.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});