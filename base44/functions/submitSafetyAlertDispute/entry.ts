import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { alert_id, dispute_note } = body;
    if (!alert_id) return Response.json({ error: 'Missing alert_id' }, { status: 400 });
    if (!dispute_note || dispute_note.trim().length < 10) {
      return Response.json({ error: 'Dispute note must be at least 10 characters' }, { status: 400 });
    }

    // Fetch the alert with service role (RLS would block the subject from reading)
    const alert = await base44.asServiceRole.entities.SafetyAlert.get(alert_id);
    if (!alert) return Response.json({ error: 'Alert not found' }, { status: 404 });

    // Verify the caller is the actual subject of the alert using the system-assigned
    // subject profile ID stored on the alert — never match on mutable full_name
    if (!alert.subject_profile_id) {
      return Response.json({ error: 'This alert does not have a linked subject profile and cannot be disputed' }, { status: 400 });
    }

    const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: user.id });
    const myProfile = profiles[0];
    if (!myProfile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    if (myProfile.id !== alert.subject_profile_id) {
      return Response.json({ error: 'You can only dispute alerts filed about yourself' }, { status: 403 });
    }

    // Only approved alerts can be disputed
    if (alert.status !== 'approved') {
      return Response.json({ error: 'This alert cannot be disputed at this time' }, { status: 400 });
    }

    // Prevent duplicate disputes
    if (alert.dispute_status === 'disputed') {
      return Response.json({ error: 'This alert has already been disputed' }, { status: 400 });
    }

    // Update with service role — the subject is not the creator, so RLS would block user-scoped writes
    const updated = await base44.asServiceRole.entities.SafetyAlert.update(alert_id, {
      dispute_status: 'disputed',
      dispute_note: dispute_note.trim(),
      disputed_by_id: user.id,
      disputed_at: new Date().toISOString(),
      status: 'pending_review',
    });

    return Response.json({ ok: true, alert: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});