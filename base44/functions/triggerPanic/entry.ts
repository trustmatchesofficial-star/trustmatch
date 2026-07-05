import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = user.id;

    let body = {};
    try { body = await req.json(); } catch { /* no body */ }
    const location = body.location || null;
    const mapsLink = location
      ? 'https://www.google.com/maps?q=' + location.lat + ',' + location.lng
      : null;
    const locationLine = mapsLink
      ? 'Approximate location: ' + mapsLink + '\n'
      : '';

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
    let inAppContactNotified = false;
    let smsSent = false;
    let smsError = null;

    // Helper: normalize phone to E.164 (ensure leading +)
    function normalizePhone(phone) {
      if (!phone) return null;
      let p = phone.trim().replace(/\s/g, '');
      if (!p) return null;
      if (!p.startsWith('+')) {
        // If starts with 00, replace with +
        if (p.startsWith('00')) p = '+' + p.slice(2);
        // If starts with 0 (UK domestic), convert to +44
        else if (p.startsWith('0')) p = '+44' + p.slice(1);
        else p = '+' + p;
      }
      return p;
    }

    // Helper: send SMS via Twilio
    async function sendSms(to, message) {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const from = Deno.env.get('TWILIO_PHONE_NUMBER');
      if (!accountSid || !authToken || !from) {
        throw new Error('Twilio credentials not configured');
      }
      console.log('Twilio SMS: from=' + from + ' to=' + to + ' sid=' + accountSid.substring(0, 4) + '...');
      const res = await fetch(
        'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json',
        {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + btoa(accountSid + ':' + authToken),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ To: to, From: from, Body: message }),
        }
      );
      const resText = await res.text();
      if (!res.ok) {
        console.error('Twilio error response:', res.status, resText);
        let errMsg = 'Twilio API error (status ' + res.status + '): ' + resText.substring(0, 200);
        try { const d = JSON.parse(resText); if (d.message) errMsg = d.message + ' (code ' + d.code + ')'; } catch {}
        throw new Error(errMsg);
      }
      try { return JSON.parse(resText); } catch { return { raw: resText }; }
    }

    // 1) Alert the saved emergency contact by email with location link.
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
            locationLine +
            'This alert was sent automatically by Trust Matches Safety.',
        });
        emailSent = true;
      } catch (e) {
        emailError = String(e);
        console.error('SOS email error:', emailError);
      }
    }

    // 1b) Try to match emergency contact to a platform user by email — send in-app notification if matched.
    if (notifyContact && contactEmail) {
      try {
        const matchedUsers = await base44.asServiceRole.entities.User.list();
        const contactUser = matchedUsers.find((u) => u.email && u.email.toLowerCase() === contactEmail.toLowerCase());
        if (contactUser) {
          await base44.asServiceRole.entities.Notification.create({
            user_id: contactUser.id,
            type: 'system',
            title: 'EMERGENCY SOS from ' + name,
            body:
              name + ' triggered a Safety SOS alert and listed you as their emergency contact. ' +
              (mapsLink ? 'Their location: ' + mapsLink : 'Location was unavailable.') +
              ' Please reach out to them immediately.',
            is_read: false,
          });
          inAppContactNotified = true;
        }
      } catch (e) {
        console.error('SOS in-app contact match error:', String(e));
      }
    }

    // 1c) Alert the emergency contact by SMS with location link.
    if (notifyContact && contactPhone) {
      try {
        const normalizedPhone = normalizePhone(contactPhone);
        if (!normalizedPhone) throw new Error('Invalid phone number');
        const smsText =
          'TRUST MATCHES SOS: ' + name + ' triggered a safety alert and listed you as their emergency contact. ' +
          (mapsLink ? 'Their location: ' + mapsLink + ' ' : '') +
          'Please reach out to them immediately. If in immediate danger, call 999.';
        await sendSms(normalizedPhone, smsText);
        smsSent = true;
      } catch (e) {
        smsError = String(e);
        console.error('SOS SMS error:', smsError);
      }
    }

    // 2) Escalate to the platform safety team (admins) with contact details + location.
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
            (mapsLink ? 'Location: ' + mapsLink + '. ' : '') +
            'Email: ' + (emailSent ? 'sent' : 'not sent') + '. SMS: ' + (smsSent ? 'sent' : 'not sent') + '.',
          is_read: false,
        });
      }
    }

    // 3) Confirm to the user what happened.
    let userBody;
    if (notifyContact && contactEmail && emailSent) {
      userBody = 'We alerted your emergency contact' + (contactName ? ' ' + contactName : '') + ' by email' +
        (smsSent ? ' and SMS' : '') +
        (inAppContactNotified ? ' and in-app' : '') + ' and notified our safety team.';
    } else if (notifyContact && !contactEmail && !contactPhone) {
      userBody = 'We notified our safety team, but no emergency contact email or phone is saved in your settings — add one so alerts reach them directly.';
    } else if (notifyContact && !contactEmail && contactPhone) {
      userBody = 'We alerted your emergency contact' + (contactName ? ' ' + contactName : '') + ' by SMS and notified our safety team.';
    } else {
      userBody = 'We notified our safety team.';
    }
    if (mapsLink) userBody += ' Your live location was shared.';
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
      smsSent,
      contactEmail: !!contactEmail,
      contactPhone: !!contactPhone,
      emailError,
      smsError,
      locationShared: !!mapsLink,
      inAppContactNotified,
    });
  } catch (error) {
    console.error('triggerPanic error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});