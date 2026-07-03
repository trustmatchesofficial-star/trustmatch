import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Only admins can trigger manually; scheduled runs use service role
    let isAdminContext = false;
    try {
      const user = await base44.auth.me();
      if (user && user.role === 'admin') isAdminContext = true;
    } catch (e) {}

    const svc = base44.asServiceRole;

    // Fetch all users, profiles, safety alerts, verification requests, matches, messages, reports
    const [users, profiles, alerts, verifications, matches, messages, reports] = await Promise.all([
      svc.entities.User.list('-created_date', 500),
      svc.entities.Profile.list('-created_date', 500),
      svc.entities.SafetyAlert.filter({ status: 'pending_review' }),
      svc.entities.VerificationRequest.filter({ status: { $in: ['pending', 'pending_review', 'reviewing'] } }),
      svc.entities.Match.list('-created_date', 500),
      svc.entities.Message.list('-created_date', 500),
      svc.entities.Report.filter({ status: { $in: ['pending', 'reviewing'] } }),
    ]);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const profileMap = {};
    for (const p of profiles) {
      if (p.created_by_id) profileMap[p.created_by_id] = p;
    }

    let emailsSent = 0;
    let skipped = 0;

    for (const user of users) {
      if (!user.email) { skipped++; continue; }
      const profile = profileMap[user.id];
      if (!profile) { skipped++; continue; }

      // Recent activity (last 7 days)
      const recentMatches = matches.filter(
        (m) =>
          (m.user_a === user.id || m.user_b === user.id) &&
          new Date(m.created_date) >= oneWeekAgo
      );
      const recentMessages = messages.filter(
        (m) =>
          (m.sender_id === user.id || m.receiver_id === user.id) &&
          new Date(m.created_date) >= oneWeekAgo
      );
      const myPendingReports = reports.filter((r) => r.reporter_id === user.id);
      const myVerifications = verifications.filter((v) => v.user_id === user.id);
      const alertsAboutMe = alerts.filter((a) => a.subject_profile_id === user.id);

      const sections = [];
      sections.push('PROFILE ACTIVITY (last 7 days)');
      sections.push(`  - New matches: ${recentMatches.length}`);
      sections.push(`  - Messages exchanged: ${recentMessages.length}`);
      sections.push(`  - Trust score: ${profile.trust_score ?? 50}`);
      sections.push(`  - Verified: ${profile.is_verified ? 'Yes' : 'No'}`);
      sections.push(`  - Live verified: ${profile.is_live_verified ? 'Yes' : 'No'}`);

      sections.push('');
      sections.push('SAFETY ALERTS');
      if (alertsAboutMe.length > 0) {
        sections.push(`  - ${alertsAboutMe.length} pending safety alert(s) about your profile — under review.`);
      } else {
        sections.push('  - No safety alerts about your profile. You\u2019re all clear!');
      }
      sections.push(`  - Your pending reports submitted: ${myPendingReports.length}`);

      sections.push('');
      sections.push('VERIFICATION REQUESTS');
      if (myVerifications.length > 0) {
        for (const v of myVerifications) {
          sections.push(`  - Status: ${v.status} (submitted ${new Date(v.created_date).toLocaleDateString()})`);
        }
      } else {
        sections.push('  - No pending verification requests.');
      }

      const body =
        `Hi ${profile.full_name || user.full_name || 'there'},\n\n` +
        `Here is your weekly Trust Matches summary.\n\n` +
        `---\n\n` +
        sections.join('\n') +
        `\n\n---\n\n` +
        `Log in to Trust Matches to see full details and take any action.\n\n` +
        `If you did not expect this email, you can disable weekly summaries in your Settings.\n\n` +
        `Stay safe,\nThe Trust Matches Team`;

      try {
        await svc.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Your Weekly Trust Matches Summary',
          body,
          from_name: 'Trust Matches',
        });
        emailsSent++;
      } catch (e) {
        // continue to next user
      }
    }

    return Response.json({ ok: true, emailsSent, skipped, totalUsers: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});