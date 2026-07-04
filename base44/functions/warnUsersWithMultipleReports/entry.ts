import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Block anonymous direct HTTP calls — allow only the internal automation
    // system (authenticated by the platform, no user session) or admin users.
    const isAuthed = await base44.auth.isAuthenticated().catch(() => false);
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
    // Entity automation payload: { event: { type, entity_name, entity_id }, data: {...} }
    const reportId = payload?.event?.entity_id || payload?.report_id || payload?.data?.id;
    if (!reportId) {
      return Response.json({ error: 'Missing report id' }, { status: 400 });
    }

    // Fetch the newly created report
    const report = await svc.entities.Report.get(reportId);
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // report.reported_id is a Profile entity id — fetch the profile
    const reportedProfile = await svc.entities.Profile.get(report.reported_id);
    if (!reportedProfile) {
      return Response.json({ ok: true, skipped: 'profile_not_found' });
    }

    // Skip if already warned or already suspended/banned
    if (reportedProfile.safety_warning_sent) {
      return Response.json({ ok: true, skipped: 'already_warned' });
    }
    if (reportedProfile.account_status === 'suspended' || reportedProfile.account_status === 'banned') {
      return Response.json({ ok: true, skipped: 'account_suspended' });
    }

    // Count all reports targeting this profile
    const allReports = await svc.entities.Report.filter({ reported_id: report.reported_id });

    // Also count approved safety alerts about this user (matched by created_by_id)
    const allAlerts = await svc.entities.SafetyAlert.filter({ subject_profile_id: reportedProfile.created_by_id });
    const confirmedAlerts = allAlerts.filter((a) => a.status === 'approved');

    const totalCount = allReports.length + confirmedAlerts.length;

    if (totalCount < 3) {
      return Response.json({ ok: true, skipped: 'below_threshold', count: totalCount });
    }

    // Fetch the user's email
    const users = await svc.entities.User.filter({ id: reportedProfile.created_by_id });
    const reportUser = users[0];
    if (!reportUser || !reportUser.email) {
      return Response.json({ ok: true, skipped: 'no_email' });
    }

    const firstName = (reportedProfile.full_name || reportUser.full_name || 'there').split(' ')[0];

    const emailBody =
      `Hi ${firstName},\n\n` +
      `We're reaching out to let you know that your account is now under review. ` +
      `Our Trust & Safety team has received multiple safety reports regarding your activity on Trust Matches.\n\n` +
      `While your account is under review:\n` +
      `  • Your profile visibility may be reduced\n` +
      `  • Certain features may be restricted\n` +
      `  • Further reports may result in account suspension\n\n` +
      `If you believe these reports are inaccurate, you can submit a dispute through the Safety Hub in your app.\n\n` +
      `Please take a moment to review our Community Guidelines and ensure all your interactions remain respectful and safe.\n\n` +
      `— Trust & Safety Team`;

    await svc.integrations.Core.SendEmail({
      to: reportUser.email,
      subject: 'Your account is under review — Trust Matches',
      body: emailBody,
      from_name: 'Trust Matches Safety',
    });

    // Create an in-app notification
    await svc.entities.Notification.create({
      user_id: reportedProfile.created_by_id,
      type: 'system',
      title: 'Account Under Review',
      body: 'Your account has received multiple safety reports and is now under review. Tap to learn more.',
    });

    // Lower trust score and mark warning as sent
    await svc.entities.Profile.update(reportedProfile.id, {
      safety_warning_sent: true,
      trust_score: 25,
    });

    return Response.json({
      ok: true,
      sent: true,
      email: reportUser.email,
      report_count: totalCount,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});