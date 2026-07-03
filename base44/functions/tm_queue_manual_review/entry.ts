import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { verification_id, notes } = body;
    if (!verification_id) {
      return Response.json({ error: 'Missing verification_id' }, { status: 400 });
    }

    // Fetch the current request so we can detect a revert from "approved"
    let existing;
    try {
      existing = await base44.asServiceRole.entities.VerificationRequest.get(verification_id);
    } catch (e) {
      return Response.json({ error: 'Verification request not found' }, { status: 404 });
    }

    const updated = await base44.asServiceRole.entities.VerificationRequest.update(verification_id, {
      status: 'pending_review',
      review_note: notes || '',
    });

    // If this was previously approved, revoke the profile's verified status
    // so it doesn't stay verified while back in the review queue.
    // On a fresh/initial review, is_verified was never true, so leave it alone.
    if (existing.status === 'approved' && existing.user_id) {
      const profiles = await base44.asServiceRole.entities.Profile.filter({ created_by_id: existing.user_id });
      if (profiles[0] && profiles[0].is_verified) {
        await base44.asServiceRole.entities.Profile.update(profiles[0].id, { is_verified: false });
      }
    }

    return Response.json({ ok: true, verification: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});