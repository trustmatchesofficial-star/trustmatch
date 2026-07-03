import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, Heart, Star, X, Loader2, Check, MessageSquare } from 'lucide-react';

export default function PostDateFeedbackModal({ profile, matchId, otherProfile, onClose }) {
  const [safetyRating, setSafetyRating] = useState(0);
  const [comfortRating, setComfortRating] = useState(0);
  const [wouldMeetAgain, setWouldMeetAgain] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [existing, setExisting] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!profile || !matchId) return;
    base44.entities.DateFeedback.filter({
      reviewer_id: profile.created_by_id,
      match_id: matchId,
    })
      .then((rows) => { if (rows[0]) setExisting(rows[0]); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [profile, matchId]);

  const canSubmit = safetyRating > 0 && comfortRating > 0 && !submitting && !existing;

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
        would_meet_again: wouldMeetAgain,
        comment: comment.trim() || undefined,
      });

      // Update the other person's trust score based on feedback
      const positive = safetyRating >= 4 && comfortRating >= 4;
      const negative = safetyRating <= 2 || comfortRating <= 2;
      let bonus = 0;
      if (positive) bonus = wouldMeetAgain === true ? 6 : 4;
      if (negative) bonus = -12;

      if (bonus !== 0) {
        const current = otherProfile.trust_score ?? 50;
        const nextScore = Math.min(100, Math.max(5, current + bonus));
        await base44.entities.Profile.update(otherProfile.id, { trust_score: nextScore });
      }

      setDone(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (checking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition"
        >
          <X size={18} />
        </button>

        {done || existing ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-teal/15 flex items-center justify-center mb-4 mx-auto">
              <Check className="text-teal" size={32} />
            </div>
            <h2 className="text-xl font-heading font-bold mb-2">Thanks for your feedback</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {existing
                ? "You've already shared feedback for this date. Your input helps keep the community safe."
                : "Your feedback has been recorded and the trust score has been updated."}
            </p>
            <button
              onClick={onClose}
              className="w-full px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="text-teal" size={22} />
              <h2 className="text-xl font-heading font-bold">How was your date?</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Your feedback about {otherProfile?.full_name || 'your match'} is private and helps us keep the community safe.
            </p>

            {/* Safety rating */}
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
                <ShieldCheck size={15} className="text-teal" /> Did you feel safe?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSafetyRating(n)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                      safetyRating >= n
                        ? 'border-teal bg-teal/15 text-teal'
                        : 'border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Star size={16} className="mx-auto mb-0.5" fill={safetyRating >= n ? 'currentColor' : 'none'} />
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Comfort rating */}
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
                <Heart size={15} className="text-primary" /> How comfortable were you?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setComfortRating(n)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                      comfortRating >= n
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Star size={16} className="mx-auto mb-0.5" fill={comfortRating >= n ? 'currentColor' : 'none'} />
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Would meet again */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block">Would you meet them again?</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setWouldMeetAgain(true)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                    wouldMeetAgain === true ? 'border-teal bg-teal/15 text-teal' : 'border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setWouldMeetAgain(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${
                    wouldMeetAgain === false ? 'border-destructive bg-destructive/15 text-destructive' : 'border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
                <MessageSquare size={15} className="text-muted-foreground" /> Anything else? (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share any concerns or positive notes..."
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}