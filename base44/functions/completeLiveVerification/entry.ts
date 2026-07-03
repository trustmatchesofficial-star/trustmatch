import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { live_photo_url } = body;
    if (!live_photo_url) {
      return Response.json({ error: 'Missing live_photo_url' }, { status: 400 });
    }

    // Fetch the user's profile server-side to ensure we update the correct record
    const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
    const profile = profiles[0];
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    // Reject if already verified — no need to re-run
    if (profile.is_live_verified) {
      return Response.json({ match: true, already_verified: true, profile });
    }

    // Use the user's ACTUAL profile photos from the database — never trust client-supplied URLs
    const profile_photo_urls = (profile.photos || []).filter(Boolean);
    if (profile_photo_urls.length === 0) {
      return Response.json({ error: 'No profile photos found to compare against' }, { status: 400 });
    }

    // Run the LLM face-matching check server-side
    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a face-matching assistant for identity verification on a dating app. The first ${profile_photo_urls.length} image(s) are the user's existing profile photos. The FINAL image is a live webcam capture just taken by the user in real time. Determine whether the person in the live capture appears to be the SAME person shown in the profile photos, based on facial features. Respond only with JSON.`,
      file_urls: [...profile_photo_urls, live_photo_url],
      response_json_schema: {
        type: 'object',
        properties: {
          same_person: { type: 'boolean' },
          confidence: { type: 'number' },
          note: { type: 'string' },
        },
        required: ['same_person', 'confidence', 'note'],
      },
    });

    const match = res?.same_person === true && (res?.confidence ?? 0) >= 0.7;

    if (match) {
      const newTrustScore = Math.max((profile.trust_score || 50) + 15, 90);
      const updated = await base44.entities.Profile.update(profile.id, {
        is_live_verified: true,
        trust_score: newTrustScore,
      });
      return Response.json({ match: true, confidence: res.confidence, note: res.note, profile: updated });
    }

    return Response.json({ match: false, confidence: res?.confidence, note: res?.note, profile });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});