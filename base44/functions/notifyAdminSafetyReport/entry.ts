import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@trustmatches.app';

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
    const reportId = payload?.event?.entity_id || payload?.report_id || payload?.data?.id;
    if (!reportId) {
      return Response.json({ error: 'Missing report id' }, { status: 400 });
    }

    const report = await svc.entities.Report.get(reportId);
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Fetch reporter and reported profiles for context
    const [reporterProfiles, reportedProfiles] = await Promise.all([
      svc.entities.Profile.filter({ created_by_id: report.reporter_id }),
      svc.entities.Profile.filter({ created_by_id: report.reported_id }),
    ]);
    const reporter = reporterProfiles[0];
    const reported = reportedProfiles[0];

    const reasonLabel = (report.reason || 'other').replace(/_/g, ' ');
    const submittedAt = new Date(report.created_date).toLocaleString('en-GB', { timeZone: 'Europe/London' });

    const emailBody =
      `A new safety report has been submitted and requires immediate review.\n\n` +
      `--- REPORT DETAILS ---\n` +
      `Report ID: ${report.id}\n` +
      `Reason: ${reasonLabel}\n` +
      `Status: ${report.status}\n` +
      `Submitted: ${submittedAt}\n` +
      `Message ID: ${report.message_id || 'N/A'}\n\n` +
      `Details:\n${report.details || 'No additional details provided.'}\n\n` +
      `--- REPORTER ---\n` +
      `Name: ${reporter?.full_name || 'Unknown'}\n` +
      `Profile ID: ${report.reporter_id}\n` +
      `Verified: ${reporter?.is_verified ? 'Yes' : 'No'}\n\n` +
      `--- REPORTED USER ---\n` +
      `Name: ${reported?.full_name || 'Unknown'}\n` +
      `Profile ID: ${report.reported_id}\n` +
      `Verified: ${reported?.is_verified ? 'Yes' : 'No'}\n` +
      `Account Status: ${reported?.account_status || 'unknown'}\n\n` +
      `---\n\n` +
      `Review this report in the Trust Matches admin dashboard.\n\n` +
      `The Trust Matches Safety Team`;

    await svc.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: `\u26a0\ufe0f New Safety Report: ${reasonLabel}`,
      body: emailBody,
      from_name: 'Trust Matches Safety',
    });

    return Response.json({ ok: true, sent: true, to: ADMIN_EMAIL });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});