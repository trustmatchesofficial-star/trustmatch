import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = user.id;

    const settings = await base44.asServiceRole.entities.SafetySetting.filter({ created_by_id: userId });
    const setting = settings[0];
    const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: userId });
    const profile = profiles[0];
    const name = profile?.full_name || user.full_name || 'A Trust Matches member';

    const mode = setting?.escalation_mode || 'notify_contact';
    const notifyContact = mode === 'notify_contact' || mode === 'both';
    const showSos = mode === 'show_999' || mode === 'both';

    const contactName = setting?.emergency_contact_name || '';
    const contactEmail = setting?.emergency_contact_email || '';
    const contactPhone = setting?.emergency_contact_phone || '';

    let emailSent = false;
    let emailError = null;

    // 1) Alert the saved emergency contact by email (their phone is included for the safety team to text/call).
    if (notifyContact && contactEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: contactEmail,
          subject: 'URGENT: Trust Matches Safety SOS from ' + name,
          body:
            'Hi ' + (contactName || 'there') + ',\n\n' +
            name + ' just triggered a Safety SOS alert on Trust Matches. They may need help — please try to reach them right away.\n\n' +
            (contactPhone ? 'You were listed as their emergency contact.\n\n' : '') +
            'Time: ' + new Date().toISOString() + '\n' +
            'This alert was sent automatically by Trust Matches Safety.',
        });
        emailSent = true;
      } catch (e) {
        emailError = String(e);
      }
    }

    // 2) Escalate to the platform safety team (admins) with the contact details so they can text/call.
    const contactSummary =
      (contactName ? 'Contact: ' + contactName : '') +
      (contactPhone ? (contactName ? ' · ' : 'Phone: ') + contactPhone : '') +
      (contactEmail ? ' · ' + contactEmail : '') ||
      'No emergency contact saved';

    const admins = await base44.asServiceRole.entities.User.list();
    for (const a of admins) {
      if (a.role === 'admin') {
        await base44.asServiceRole.entities.Notification.create({
          user_id: a.id,
          type: 'system',
          title: 'SAFETY SOS — Panic button triggered',
          body:
            name + ' triggered a panic alert. Escalation mode: ' + mode + '. ' +
            'Emergency contact: ' + contactSummary + '. ' +
            (notifyContact && contactEmail ? 'Email alert sent.' : 'No email alert sent (no contact email on file).'),
          is_read: false,
        });
      }
    }

    // 3) Confirm to the user what happened.
    let userBody;
    if (notifyContact && contactEmail && emailSent) {
      userBody = 'We alerted your emergency contact' + (contactName ? ' ' + contactName : '') + ' by email and notified our safety team.';
    } else if (notifyContact && !contactEmail) {
      userBody = 'We notified our safety team, but no emergency contact email is saved in your settings — add one so alerts reach them directly.';
    } else {
      userBody = 'We notified our safety team.';
    }
    if (showSos) userBody += ' If you are in immediate danger, call 999.';

    await base44.asServiceRole.entities.Notification.create({
      user_id: userId,
      type: 'system',
      title: 'Safety alert sent',
      body: userBody,
      is_read: false,
    });

    return Response.json({
      ok: true,
      mode,
      showSos,
      emailSent,
      contactEmail: !!contactEmail,
      contactPhone: !!contactPhone,
      emailError,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});