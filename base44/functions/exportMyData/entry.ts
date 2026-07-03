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

    const json = JSON.stringify(data, null, 2);

    return new Response(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="my-trustmatches-data.json"',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});