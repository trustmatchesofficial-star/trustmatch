/**
 * Smart matchmaking scoring — weighted compatibility score for deck ordering.
 * Not a filter, just smarter sorting. Higher score = shown earlier.
 *
 * Weights:
 *   - Shared interests overlap: 40 pts max
 *   - Age preference match:     30 pts max
 *   - Distance/location match:  20 pts max
 *   - Looking-for alignment:    10 pts max
 */
export function computeCompatibilityScore(candidate, viewer) {
  if (!candidate || !viewer) return 0;
  let score = 0;

  // 1. Shared interests (0–40)
  const candidateInterests = candidate.interests || [];
  const viewerInterests = viewer.interests || [];
  if (candidateInterests.length > 0 && viewerInterests.length > 0) {
    const shared = candidateInterests.filter((i) => viewerInterests.includes(i));
    const overlapRatio = shared.length / Math.max(candidateInterests.length, viewerInterests.length);
    score += Math.round(overlapRatio * 40);
  }

  // 2. Age preference match (0–30)
  const prefMin = viewer.age_pref_min ?? 18;
  const prefMax = viewer.age_pref_max ?? 99;
  if (candidate.age >= prefMin && candidate.age <= prefMax) {
    score += 30;
  } else {
    // Partial credit if close to range
    const dist = candidate.age < prefMin ? prefMin - candidate.age : candidate.age - prefMax;
    score += Math.max(0, 30 - dist * 5);
  }

  // 3. Distance/location (0–20) — string-based since no geocoding in v1
  const viewerLoc = (viewer.passport_location || viewer.location || '').toLowerCase();
  const candidateLoc = (candidate.location || '').toLowerCase();
  if (viewerLoc && candidateLoc) {
    if (viewerLoc === candidateLoc) {
      score += 20;
    } else if (viewerLoc.split(',')[0] === candidateLoc.split(',')[0]) {
      // Same city, different area
      score += 12;
    } else {
      score += 5;
    }
  }

  // 4. Looking-for alignment (0–10)
  if (viewer.looking_for && candidate.looking_for && viewer.looking_for === candidate.looking_for) {
    score += 10;
  }

  return score;
}

/**
 * Sort profiles by compatibility, with boosted/verified as tiebreakers.
 */
export function sortByCompatibility(profiles, viewer) {
  const now = new Date();
  return [...profiles].sort((a, b) => {
    // Boosted profiles always first
    const aBoosted = a.boosted_until && new Date(a.boosted_until) > now;
    const bBoosted = b.boosted_until && new Date(b.boosted_until) > now;
    if (aBoosted && !bBoosted) return -1;
    if (!aBoosted && bBoosted) return 1;

    // Then compatibility score
    const scoreA = computeCompatibilityScore(a, viewer);
    const scoreB = computeCompatibilityScore(b, viewer);
    if (scoreB !== scoreA) return scoreB - scoreA;

    // Tiebreak: verified first
    if (a.is_verified && !b.is_verified) return -1;
    if (!a.is_verified && b.is_verified) return 1;

    // Final tiebreak: newest
    return new Date(b.created_date) - new Date(a.created_date);
  });
}