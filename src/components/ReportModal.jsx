import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flag, X, Send, CheckCircle, Loader2 } from 'lucide-react';

const REASONS = [
  { value: 'harassment', label: 'Harassment', desc: 'Threatening, abusive, or harassing behaviour' },
  { value: 'scam', label: 'Scam or Fraud', desc: 'Asking for money, crypto, or financial details' },
  { value: 'fake_profile', label: 'Fake Profile', desc: 'Seems like a fake or impersonated account' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', desc: 'Explicit or inappropriate content' },
  { value: 'safety_concern', label: 'Safety Concern', desc: 'You feel unsafe or something feels off' },
  { value: 'spam', label: 'Spam', desc: 'Spamming or promotional content' },
  { value: 'other', label: 'Other', desc: 'Something else concerning' },
];

export default function ReportModal({ reportedProfile, reporterId, messageId, onClose, onSubmitted }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!reportedProfile) return null;

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await base44.entities.Report.create({
        reporter_id: reporterId,
        reported_id: reportedProfile.id,
        reason,
        details: details.trim() || undefined,
        message_id: messageId || undefined,
        status: 'pending',
        action_taken: 'none',
      });
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition">
          <X size={18} />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-teal/15 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="text-teal" size={32} />
            </div>
            <h2 className="text-xl font-heading font-bold mb-2">Report Submitted</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Thank you for helping keep our community safe. Our safety team will review this report and take appropriate action.
            </p>
            <button onClick={onClose} className="w-full px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Flag className="text-destructive" size={22} />
              <h2 className="text-xl font-heading font-bold">Report User</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              {messageId ? 'Report this message. ' : ''}Flag {reportedProfile.full_name} for review. Our safety team will investigate.
            </p>

            <div className="space-y-2 mb-5">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-2xl border text-left transition ${
                    reason === r.value ? 'border-destructive bg-destructive/10' : 'border-border bg-secondary/50 hover:border-muted-foreground/40'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${reason === r.value ? 'border-destructive' : 'border-muted-foreground/40'}`}>
                    {reason === r.value && <div className="w-2.5 h-2.5 rounded-full bg-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block">Additional details (optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any additional context..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-input bg-background focus:ring-2 focus:ring-destructive/20 focus:border-destructive outline-none transition text-sm resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition disabled:opacity-40"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}