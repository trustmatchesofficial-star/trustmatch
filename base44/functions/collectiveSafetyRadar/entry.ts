import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Minimum distinct reviewers required before any action is taken.
// A single person's feedback — however negative — must NEVER alone trigger anything.
const MIN_DISTINCT_REVIEWERS = 3;

// A reviewer is "concerning" if they gave safety_rating <= 2 or comfort_rating <= 2
// or said they would not meet the person again.
const LOW_RATING_THRESHOLD = 2;

// Modest trust score deduction — applied once, never accumulates.
const TRUST_SCORE_PENALTY = 10;
const TRUST_SCORE_FLOOR = 5;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow system (automation) or admin calls only.
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let caller = null;
    try { caller = await base44.auth.me(); } catch {}
    if (caller && caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    // Fetch all DateFeedback records.
    const allFeedback = await svc.entities.DateFeedback.filter({}, null, 10000);

    // Group by reviewed_id (the person being rated).
    const byReviewed = {};
    for (const fb of allFeedback) {
      const key = fb.reviewed_id;
      if (!key) continue;
      if (!byReviewed[key]) byReviewed[key] = [];
      byReviewed[key].push(fb);
    }

    const results = { checked: 0, flagged: 0, updated: 0, skipped: 0 };

    for (const [reviewedId, feedbacks] of Object.entries(byReviewed)) {
      results.checked++;

      // Count distinct reviewers.
      const reviewerIds = [...new Set(feedbacks.map((f) => f.reviewer_id).filter(Boolean))];
      if (reviewerIds.length < MIN_DISTINCT_REVIEWERS) {
        continue;
      }

      // Calculate aggregates.
      const safetyRatings = feedbacks.map((f) => f.safety_rating).filter((r) => typeof r === 'number');
      const comfortRatings = feedbacks.map((f) => f.comfort_rating).filter((r) => typeof r === 'number');
      const avgSafety = safetyRatings.length > 0
        ? safetyRatings.reduce((a, b) => a + b, 0) / safetyRatings.length
        : 0;
      const avgComfort = comfortRatings.length > 0
        ? comfortRatings.reduce((a, b) => a + b, 0) / comfortRatings.length
        : 0;

      // Count distinct reviewers with low safety / comfort / would_not_meet_again.
      const lowSafetyReviewers = new Set();
      const lowComfortReviewers = new Set();
      const wouldNotMeetAgainReviewers = new Set();

      for (const fb of feedbacks) {
        if (typeof fb.safety_rating === 'number' && fb.safety_rating <= LOW_RATING_THRESHOLD) {
          lowSafetyReviewers.add(fb.reviewer_id);
        }
        if (typeof fb.comfort_rating === 'number' && fb.comfort_rating <= LOW_RATING_THRESHOLD) {
          lowComfortReviewers.add(fb.reviewer_id);
        }
        if (fb.would_meet_again === false) {
          wouldNotMeetAgainReviewers.add(fb.reviewer_id);
        }
      }

      // Pattern requires at least 2 distinct reviewers with concerning signals
      // across any combination of the three dimensions.
      const concerningReviewers = new Set([
        ...lowSafetyReviewers,
        ...lowComfortReviewers,
        ...wouldNotMeetAgainReviewers,
      ]);

      if (concerningReviewers.size < 2) {
        continue;
      }

      // Fetch the subject's profile.
      const profiles = await svc.entities.Profile.filter({ created_by_id: reviewedId });
      const profile = profiles[0];
      if (!profile) {
        continue;
      }

      // Check for an existing flag.
      const existingFlags = await svc.entities.SafetyPatternFlag.filter({
        subject_profile_id: profile.id,
      });

      const flagData = {
        subject_profile_id: profile.id,
        subject_user_id: reviewedId,
        subject_full_name: profile.full_name,
        distinct_reviewer_count: reviewerIds.length,
        total_feedback_count: feedbacks.length,
        avg_safety_rating: Math.round(avgSafety * 100) / 100,
        avg_comfort_rating: Math.round(avgComfort * 100) / 100,
        would_meet_again_false_count: wouldNotMeetAgainReviewers.size,
        low_safety_count: lowSafetyReviewers.size,
        low_comfort_count: lowComfortReviewers.size,
      };

      if (existingFlags.length === 0) {
        // Create a new flag + apply modest trust score penalty (once).
        const currentTrust = typeof profile.trust_score === 'number' ? profile.trust_score : 50;
        const newTrust = Math.max(TRUST_SCORE_FLOOR, currentTrust - TRUST_SCORE_PENALTY);

        await svc.entities.SafetyPatternFlag.create({
          ...flagData,
          flagged_at: new Date().toISOString(),
          status: 'pending_review',
          trust_score_adjusted: true,
        });

        await svc.entities.Profile.update(profile.id, { trust_score: newTrust });
        results.flagged++;
      } else {
        const existing = existingFlags[0];

        // Only update stats if still pending. If dismissed or reviewed, leave it.
        if (existing.status === 'pending_review') {
          await svc.entities.SafetyPatternFlag.update(existing.id, flagData);
          results.updated++;
        } else {
          results.skipped++;
        }
      }
    }

    return Response.json({
      ok: true,
      ...results,
      message: `Checked ${results.checked} profiles with feedback. ${results.flagged} new flags, ${results.updated} updated, ${results.skipped} already resolved.`,
    });
  } catch (error) {
    console.error('collectiveSafetyRadar error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});