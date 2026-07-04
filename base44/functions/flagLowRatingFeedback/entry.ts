import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// A rating at or below this threshold is considered "low" and triggers an admin flag.
const LOW_RATING_THRESHOLD = 2;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    // This function is triggered by an entity automation on DateFeedback create.
    // The payload contains { event, data } where data is the new feedback record.
    const body = await req.json().catch(() => ({}));
    const feedback = body.data;

    if (!feedback || !feedback.reviewed_id) {
      return Response.json({ ok: true, skipped: true, reason: 'no feedback data' });
    }

    const lowSafety = typeof feedback.safety_rating === 'number' && feedback.safety_rating <= LOW_RATING_THRESHOLD;
    const lowComfort = typeof feedback.comfort_rating === 'number' && feedback.comfort_rating <= LOW_RATING_THRESHOLD;

    if (!lowSafety && !lowComfort) {
      return Response.json({ ok: true, skipped: true, reason: 'ratings not low enough' });
    }

    // Fetch the subject's profile for display info.
    const profiles = await svc.entities.Profile.filter({ created_by_id: feedback.reviewed_id });
    const profile = profiles[0];
    if (!profile) {
      return Response.json({ ok: true, skipped: true, reason: 'subject profile not found' });
    }

    // Avoid duplicate flags from the same reviewer for the same subject.
    const existing = await svc.entities.SafetyPatternFlag.filter({
      subject_profile_id: profile.id,
      status: 'pending_review',
    });

    // If there's already a pending flag for this subject, update its stats instead of creating a duplicate.
    if (existing.length > 0) {
      const flag = existing[0];
      const allFeedback = await svc.entities.DateFeedback.filter({ reviewed_id: feedback.reviewed_id });
      const reviewerIds = [...new Set(allFeedback.map((f) => f.reviewer_id).filter(Boolean))];
      const safetyRatings = allFeedback.map((f) => f.safety_rating).filter((r) => typeof r === 'number');
      const comfortRatings = allFeedback.map((f) => f.comfort_rating).filter((r) => typeof r === 'number');
      const lowSafetyCount = new Set(allFeedback.filter((f) => typeof f.safety_rating === 'number' && f.safety_rating <= LOW_RATING_THRESHOLD).map((f) => f.reviewer_id)).size;
      const lowComfortCount = new Set(allFeedback.filter((f) => typeof f.comfort_rating === 'number' && f.comfort_rating <= LOW_RATING_THRESHOLD).map((f) => f.reviewer_id)).size;
      const wouldNotMeetAgain = new Set(allFeedback.filter((f) => f.would_meet_again === false).map((f) => f.reviewer_id)).size;

      await svc.entities.SafetyPatternFlag.update(flag.id, {
        distinct_reviewer_count: reviewerIds.length,
        total_feedback_count: allFeedback.length,
        avg_safety_rating: safetyRatings.length > 0 ? Math.round((safetyRatings.reduce((a, b) => a + b, 0) / safetyRatings.length) * 100) / 100 : 0,
        avg_comfort_rating: comfortRatings.length > 0 ? Math.round((comfortRatings.reduce((a, b) => a + b, 0) / comfortRatings.length) * 100) / 100 : 0,
        low_safety_count: lowSafetyCount,
        low_comfort_count: lowComfortCount,
        would_meet_again_false_count: wouldNotMeetAgain,
        flagged_at: new Date().toISOString(),
      });

      return Response.json({ ok: true, updated: true, flag_id: flag.id });
    }

    // Create a new flag.
    await svc.entities.SafetyPatternFlag.create({
      subject_profile_id: profile.id,
      subject_user_id: feedback.reviewed_id,
      subject_full_name: profile.full_name,
      distinct_reviewer_count: 1,
      total_feedback_count: 1,
      avg_safety_rating: typeof feedback.safety_rating === 'number' ? feedback.safety_rating : 0,
      avg_comfort_rating: typeof feedback.comfort_rating === 'number' ? feedback.comfort_rating : 0,
      low_safety_count: lowSafety ? 1 : 0,
      low_comfort_count: lowComfort ? 1 : 0,
      would_meet_again_false_count: feedback.would_meet_again === false ? 1 : 0,
      flagged_at: new Date().toISOString(),
      status: 'pending_review',
      trust_score_adjusted: false,
    });

    return Response.json({ ok: true, flagged: true, subject: profile.full_name });
  } catch (error) {
    console.error('flagLowRatingFeedback error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});