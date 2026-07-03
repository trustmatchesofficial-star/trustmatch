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

    const updated = await base44.asServiceRole.entities.VerificationRequest.update(verification_id, {
      status: 'pending_review',
      review_note: notes || '',
    });

    return Response.json({ ok: true, verification: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});