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
    const alertId = payload?.event?.entity_id || payload?.alert_id || payload?.data?.id;
    if (!alertId) {
      return Response.json({ error: 'Missing alert id' }, { status: 400 });
    }

    const alert = await svc.entities.SafetyAlert.get(alertId);
    if (!alert) {
      return Response.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Only notify for approved (confirmed) alerts
    if (alert.status !== 'approved') {
      return Response.json({ ok: true, skipped: 'not_approved' });
    }

    const subjectProfileId = alert.subject_profile_id;
    if (!subjectProfileId) {
      return Response.json({ ok: true, skipped: 'no_subject' });
    }

    const profile = await svc.entities.Profile.get(subjectProfileId);
    if (!profile) {
      return Response.json({ ok: true, skipped: 'no_profile' });
    }

    // Get the subject's safety settings (where emergency contact is stored)
    const settings = await svc.entities.SafetySetting.filter({ created_by_id: profile.created_by_id });
    const setting = settings[0];
    if (!setting) {
      return Response.json({ ok: true, skipped: 'no_safety_settings' });
    }

    // Respect the user's escalation preference
    if (setting.escalation_mode === 'show_999') {
      return Response.json({ ok: true, skipped: 'escalation_mode_show_999' });
    }

    const contactEmail = setting.emergency_contact_email;
    if (!contactEmail) {
      return Response.json({ ok: true, skipped: 'no_contact_email' });
    }

    const contactName = setting.emergency_contact_name || 'there';
    const subjectName = profile.full_name || 'your loved one';
    const categoryLabel = (alert.category || 'other').replace(/_/g, ' ');

    const emailBody =
      `Hi ${contactName},\n\n` +
      `This is an automated safety notification from Trust Matches.\n\n` +
      `A confirmed safety alert has been raised concerning ${subjectName}. ` +
      `You are receiving this because you are listed as their emergency contact.\n\n` +
      `Alert category: ${categoryLabel}\n\n` +
      `We recommend reaching out to ${subjectName} to check on their wellbeing. ` +
      `If you believe they are in immediate danger, please contact emergency services (999 in the UK).\n\n` +
      `This alert has been reviewed and confirmed by the Trust Matches safety team.\n\n` +
      `Stay safe,\n` +
      `The Trust Matches Team`;

    await svc.integrations.Core.SendEmail({
      to: contactEmail,
      subject: 'Trust Matches \u2014 Safety Alert Notification',
      body: emailBody,
      from_name: 'Trust Matches',
    });

    return Response.json({ ok: true, sent: true, to: contactEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});