import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, Heart, Star, X, Loader2, Check } from 'lucide-react';

const DISMISS_KEY = (matchId) => `tm_feedback_dismissed_${matchId}`;

export default function PostMatchFeedbackPopup({ profile, matchId, otherProfile }) {
  const [visible, setVisible] = useState(false);
  const [safetyRating, setSafetyRating] = useState(0);
  const [comfortRating, setComfortRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!profile || !matchId) return;
    const dismissed = sessionStorage.getItem(DISMISS_KEY(matchId));
    if (dismissed) { setChecking(false); return; }

    base44.entities.DateFeedback.filter({
      reviewer_id: profile.created_by_id,
      match_id: matchId,
    })
      .then((rows) => {
        if (rows.length > 0) { setChecking(false); return; }
        // No feedback yet and not dismissed — show popup
        setChecking(false);
        setTimeout(() => setVisible(true), 800);
      })
      .catch(() => setChecking(false));
  }, [profile, matchId]);

  const canSubmit = safetyRating > 0 && comfortRating > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await base44.entities.DateFeedback.create({
        reviewer_id: profile.created_by_id,
        reviewed_id: otherProfile.id,
        match_id: matchId,
        safety_rating: safetyRating,
        comfort_rating: comfortRating,
      });

      // Adjust trust score
      const positive = safetyRating >= 4 && comfortRating >= 4;
      const negative = safetyRating <= 2 || comfortRating <= 2;
      let bonus = 0;
      if (positive) bonus = 3;
      if (negative) bonus = -8;
      if (bonus !== 0 && otherProfile) {
        const current = otherProfile.trust_score ?? 50;
        const nextScore = Math.min(100, Math.max(5, current + bonus));
        await base44.entities.Profile.update(otherProfile.id, { trust_score: nextScore });
      }

      setDone(true);
      setTimeout(() => setVisible(false), 2000);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY(matchId), '1');
    setVisible(false);
  };

  if (checking || !visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-[90] flex justify-center px-4 animate-slide-up pointer-events-none">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 pointer-events-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition"
        >
          <X size={15} />
        </button>

        {done ? (
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-teal/15 flex items-center justify-center shrink-0">
              <Check className="text-teal" size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm">Thanks for your feedback</p>
              <p className="text-xs text-muted-foreground">Your input helps keep the community safe.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1 pr-6">
              <ShieldCheck className="text-teal shrink-0" size={18} />
              <h3 className="font-heading font-semibold text-sm">Quick safety check</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              How do you feel about {otherProfile?.full_name || 'your match'} so far? Your ratings are private.
            </p>

            {/* Safety rating */}
            <div className="mb-3">
              <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5">
                <ShieldCheck size={13} className="text-teal" /> Did you feel safe?
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSafetyRating(n)}
                    className={`flex-1 py-2 rounded-lg border text-xs transition ${
                      safetyRating >= n
                        ? 'border-teal bg-teal/15 text-teal'
                        : 'border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Star size={13} className="mx-auto mb-0.5" fill={safetyRating >= n ? 'currentColor' : 'none'} />
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Comfort rating */}
            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5">
                <Heart size={13} className="text-primary" /> How comfortable are you?
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setComfortRating(n)}
                    className={`flex-1 py-2 rounded-lg border text-xs transition ${
                      comfortRating >= n
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Star size={13} className="mx-auto mb-0.5" fill={comfortRating >= n ? 'currentColor' : 'none'} />
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:bg-secondary transition"
              >
                Later
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-full font-semibold text-xs hover:bg-primary/90 transition disabled:opacity-40"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}