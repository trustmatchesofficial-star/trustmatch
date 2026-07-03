import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [profiles, settings, likes, matches, messages, blocks, reports,
      checkIns, feedback, notifications, subscriptions, verifications, alerts] = await Promise.all([
      base44.entities.Profile.filter({ created_by_id: user.id }),
      base44.entities.SafetySetting.filter({ created_by_id: user.id }),
      base44.entities.Like.filter({ liker_id: user.id }),
      base44.entities.Match.filter({ user_a: user.id }),
      base44.entities.Message.filter({ sender_id: user.id }),
      base44.entities.Block.filter({ blocker_id: user.id }),
      base44.entities.Report.filter({ reporter_id: user.id }),
      base44.entities.DateCheckIn.filter({ user_id: user.id }),
      base44.entities.DateFeedback.filter({ reviewer_id: user.id }),
      base44.entities.Notification.filter({ user_id: user.id }),
      base44.entities.Subscription.filter({ created_by_id: user.id }),
      base44.entities.VerificationRequest.filter({ user_id: user.id }),
      base44.entities.SafetyAlert.filter({ reporter_id: user.id }),
    ]);

    const data = {
      exported_at: new Date().toISOString(),
      user: { id: user.id, email: user.email, full_name: user.full_name },
      profile: profiles[0] || null,
      safety_settings: settings[0] || null,
      likes,
      matches,
      messages_sent: messages,
      blocks,
      reports_submitted: reports,
      date_check_ins: checkIns,
      date_feedback: feedback,
      notifications,
      subscriptions,
      verification_requests: verifications,
      safety_alerts_submitted: alerts,
    };

    // Email the data to the user
    const body =
      'Hi ' + (user.full_name || 'there') + ',\n\n' +
      'Here is a copy of all your data from Trust Matches, as requested.\n\n' +
      '---\n\n' +
      'PROFILE\n' +
      (data.profile ? JSON.stringify(data.profile, null, 2) : 'No profile found') + '\n\n' +
      'SAFETY SETTINGS\n' +
      (data.safety_settings ? JSON.stringify(data.safety_settings, null, 2) : 'None') + '\n\n' +
      'LIKES (' + data.likes.length + ')\n' +
      (data.likes.length ? JSON.stringify(data.likes, null, 2) : 'None') + '\n\n' +
      'MATCHES (' + data.matches.length + ')\n' +
      (data.matches.length ? JSON.stringify(data.matches, null, 2) : 'None') + '\n\n' +
      'MESSAGES SENT (' + data.messages_sent.length + ')\n' +
      (data.messages_sent.length ? JSON.stringify(data.messages_sent, null, 2) : 'None') + '\n\n' +
      'BLOCKS (' + data.blocks.length + ')\n' +
      (data.blocks.length ? JSON.stringify(data.blocks, null, 2) : 'None') + '\n\n' +
      'REPORTS SUBMITTED (' + data.reports_submitted.length + ')\n' +
      (data.reports_submitted.length ? JSON.stringify(data.reports_submitted, null, 2) : 'None') + '\n\n' +
      'DATE CHECK-INS (' + data.date_check_ins.length + ')\n' +
      (data.date_check_ins.length ? JSON.stringify(data.date_check_ins, null, 2) : 'None') + '\n\n' +
      'DATE FEEDBACK (' + data.date_feedback.length + ')\n' +
      (data.date_feedback.length ? JSON.stringify(data.date_feedback, null, 2) : 'None') + '\n\n' +
      'NOTIFICATIONS (' + data.notifications.length + ')\n' +
      (data.notifications.length ? JSON.stringify(data.notifications, null, 2) : 'None') + '\n\n' +
      'SUBSCRIPTIONS (' + data.subscriptions.length + ')\n' +
      (data.subscriptions.length ? JSON.stringify(data.subscriptions, null, 2) : 'None') + '\n\n' +
      'VERIFICATION REQUESTS (' + data.verification_requests.length + ')\n' +
      (data.verification_requests.length ? JSON.stringify(data.verification_requests, null, 2) : 'None') + '\n\n' +
      'SAFETY ALERTS SUBMITTED (' + data.safety_alerts_submitted.length + ')\n' +
      (data.safety_alerts_submitted.length ? JSON.stringify(data.safety_alerts_submitted, null, 2) : 'None') + '\n\n' +
      '---\n\n' +
      'Exported at: ' + data.exported_at + '\n' +
      'If you did not request this, you can safely ignore this email.';

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Your Trust Matches data export',
      body,
    });

    return Response.json({ ok: true, sent_to: user.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});