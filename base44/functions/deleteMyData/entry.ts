import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;
    const b = base44.asServiceRole.entities;

    // 1. Find the user's profile
    const profiles = await b.Profile.filter({ created_by_id: userId });
    const profile = profiles[0];
    if (!profile) return Response.json({ error: 'No profile found' }, { status: 404 });

    // 2. Delete personally-linked records owned by this user
    try { await b.Like.deleteMany({ liker_id: profile.id }); } catch (e) { console.error('Like delete:', e.message); }
    try { await b.Like.deleteMany({ liked_id: profile.id }); } catch (e) { console.error('Like liked delete:', e.message); }
    try { await b.Block.deleteMany({ blocker_id: profile.id }); } catch (e) { console.error('Block delete:', e.message); }
    try { await b.Block.deleteMany({ blocked_id: profile.id }); } catch (e) { console.error('Block blocked delete:', e.message); }
    try { await b.Message.deleteMany({ sender_id: profile.id }); } catch (e) { console.error('Message delete:', e.message); }
    try { await b.Notification.deleteMany({ user_id: profile.id }); } catch (e) { console.error('Notification delete:', e.message); }
    try { await b.Report.deleteMany({ reporter_id: profile.id }); } catch (e) { console.error('Report delete:', e.message); }
    try { await b.VerificationRequest.deleteMany({ user_id: profile.id }); } catch (e) { console.error('Verification delete:', e.message); }
    try { await b.SafetySetting.deleteMany({ created_by_id: profile.id }); } catch (e) { console.error('SafetySetting delete:', e.message); }
    try { await b.DateCheckIn.deleteMany({ user_id: profile.id }); } catch (e) { console.error('DateCheckIn delete:', e.message); }
    try { await b.DateFeedback.deleteMany({ reviewer_id: profile.id }); } catch (e) { console.error('DateFeedback delete:', e.message); }
    try { await b.Subscription.deleteMany({ user_id: profile.id }); } catch (e) { console.error('Subscription delete:', e.message); }
    try { await b.EventAttendee.deleteMany({ user_id: profile.id }); } catch (e) { console.error('EventAttendee delete:', e.message); }

    // 3. Anonymize SafetyAlerts where the user is the reporter (keep alert but remove reporter link)
    try {
      const reporterAlerts = await b.SafetyAlert.filter({ reporter_id: profile.id });
      for (const a of reporterAlerts) {
        await b.SafetyAlert.update(a.id, { reporter_id: '[deleted]' });
      }
    } catch (e) { console.error('SafetyAlert anonymize:', e.message); }

    // 4. Anonymize Matches (set status to unmatched rather than delete — preserves other user's history)
    try {
      const matchesA = await b.Match.filter({ user_a: profile.id });
      for (const m of matchesA) {
        await b.Match.update(m.id, { user_a: '[deleted]', status: 'unmatched' });
      }
      const matchesB = await b.Match.filter({ user_b: profile.id });
      for (const m of matchesB) {
        await b.Match.update(m.id, { user_b: '[deleted]', status: 'unmatched' });
      }
    } catch (e) { console.error('Match anonymize:', e.message); }

    // 5. Anonymize Messages received (don't delete — preserve conversation for the other user)
    try {
      const received = await b.Message.filter({ receiver_id: profile.id });
      for (const m of received) {
        await b.Message.update(m.id, { receiver_id: '[deleted]', content: '[Message from deleted user]' });
      }
    } catch (e) { console.error('Message anonymize:', e.message); }

    // 6. Delete the profile itself
    try { await b.Profile.delete(profile.id); } catch (e) { console.error('Profile delete:', e.message); }

    return Response.json({ success: true, message: 'Account and personal data deleted successfully.' });
  } catch (error) {
    console.error('deleteMyData error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});