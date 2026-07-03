import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { profile_id } = body;
    if (!profile_id) {
      return Response.json({ error: 'Missing profile_id' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.Profile.update(profile_id, {
      welcome_email_sent: true,
    });

    return Response.json({ ok: true, profile: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});