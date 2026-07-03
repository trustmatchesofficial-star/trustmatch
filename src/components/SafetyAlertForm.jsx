import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ShieldAlert, X, Loader2, Check, Upload, AlertTriangle, Info,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'catfishing', label: 'Catfishing / Fake Identity', desc: 'Person is using a fake identity or photos.' },
  { value: 'harassment', label: 'Harassment / Stalking', desc: 'Unwanted, repeated, or threatening contact.' },
  { value: 'violence_abuse', label: 'Violence / Abuse', desc: 'Physical, emotional, or sexual abuse.' },
  { value: 'scam_financial', label: 'Scam / Financial Fraud', desc: 'Asked for money or attempted financial fraud.' },
  { value: 'hidden_relationship', label: 'Hidden Relationship / Infidelity', desc: 'Concealed a partner or relationship status.' },
  { value: 'other', label: 'Other Safety Concern', desc: 'Another type of concerning behavior.' },
];

const MAX_PENDING = 3;

export default function SafetyAlertForm({ reporterId, onClose, onSubmitted }) {
  const [subjectName, setSubjectName] = useState('');
  const [subjectPhone, setSubjectPhone] = useState('');
  const [subjectPhoto, setSubjectPhoto] = useState(null);
  const [subjectPhotoUrl, setSubjectPhotoUrl] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    base44.entities.SafetyAlert.filter({ reporter_id: reporterId, status: 'pending_review' })
      .then((rows) => {
        setPendingCount(rows.length);
        if (rows.length >= MAX_PENDING) setRateLimited(true);
      })
      .catch(() => {});
  }, [reporterId]);

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSubjectPhotoUrl(file_url);
      setSubjectPhoto(file);
    } catch (err) { console.error(err); }
    setUploadingPhoto(false);
  };

  const handleEvidenceUpload = async (file) => {
    if (!file) return;
    setUploadingEvidence(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEvidenceUrl(file_url);
      setEvidence(file);
    } catch (err) { console.error(err); }
    setUploadingEvidence(false);
  };

  const handleSubmit = async () => {
    setError('');
    if (!subjectName.trim()) { setError('Please enter the person\'s full name.'); return; }
    if (!category) { setError('Please select a category.'); return; }
    if (details.trim().length < 20) { setError('Please provide at least a brief description (20+ characters) of what happened.'); return; }
    if (!confirmed) { setError('Please confirm you have direct personal experience with this person.'); return; }

    setSubmitting(true);
    try {
      // Look up the subject's profile by name so disputes can be authorized
      // via an immutable profile ID rather than a mutable name
      let subjectProfileId;
      try {
        const allProfiles = await base44.entities.Profile.list('-created_date', 200);
        const match = allProfiles.find(
          (p) => p.full_name && p.full_name.trim().toLowerCase() === subjectName.trim().toLowerCase()
        );
        if (match) subjectProfileId = match.id;
      } catch (e) {}

      await base44.entities.SafetyAlert.create({
        reporter_id: reporterId,
        subject_profile_id: subjectProfileId || undefined,
        subject_full_name: subjectName.trim(),
        subject_phone_or_social_handle: subjectPhone.trim() || undefined,
        subject_photo_url: subjectPhotoUrl || undefined,
        category,
        details: details.trim(),
        evidence_url: evidenceUrl || undefined,
        status: 'pending_review',
        confirmed_personal_experience: true,
        dispute_status: 'none',
      });
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 animate-slide-up shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition z-10"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-teal/15 flex items-center justify-center mb-4 mx-auto">
              <Check className="text-teal" size={32} />
            </div>
            <h2 className="text-xl font-heading font-bold mb-2">Alert Submitted</h2>
            <p className="text-muted-foreground text-sm mb-2 max-w-xs mx-auto leading-relaxed">
              Thank you for helping keep the community safe. Our safety team will review your report before it becomes visible.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              You have {MAX_PENDING - pendingCount - 1} remaining submission{MAX_PENDING - pendingCount - 1 !== 1 ? 's' : ''} in your pending quota.
            </p>
            <button
              onClick={onClose}
              className="w-full px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition"
            >
              Done
            </button>
          </div>
        ) : rateLimited ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="text-gold" size={32} />
            </div>
            <h2 className="text-xl font-heading font-bold mb-2">Submission Limit Reached</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              You can have up to {MAX_PENDING} pending safety alerts at a time. Once your existing reports are reviewed, you can submit new ones.
            </p>
            <button
              onClick={onClose}
              className="w-full px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="text-primary" size={24} />
              <h2 className="text-xl font-heading font-bold">Report a Safety Concern</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Warn the community about someone's concerning behavior. All reports are reviewed by our safety team before becoming visible — nothing goes live without human moderation.
            </p>

            {/* Privacy notice */}
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3 mb-5">
              <Info size={14} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your identity is never shared. Approved alerts only surface as a private warning to others considering meeting this person — no names, no public list.
              </p>
            </div>

            <div className="space-y-4">
              {/* Subject name */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Person's full name <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
                />
              </div>

              {/* Phone / handle */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone or social handle <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={subjectPhone}
                  onChange={(e) => setSubjectPhone(e.target.value)}
                  placeholder="Used only for internal matching — never shown publicly"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
                />
              </div>

              {/* Subject photo */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Photo of this person <span className="text-muted-foreground font-normal">(optional, admin-only)</span></label>
                {subjectPhotoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={subjectPhotoUrl} alt="Subject" className="w-16 h-16 rounded-xl object-cover" />
                    <button onClick={() => { setSubjectPhotoUrl(''); setSubjectPhoto(null); }} className="text-xs text-destructive hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border cursor-pointer hover:border-primary/40 transition text-sm text-muted-foreground">
                    {uploadingPhoto ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    {uploadingPhoto ? 'Uploading...' : 'Upload photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e.target.files?.[0])} />
                  </label>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category <span className="text-destructive">*</span></label>
                <div className="space-y-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                        category === c.value ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-muted-foreground/40'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${category === c.value ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                        {category === c.value && <Check size={12} className="text-primary-foreground" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.label}</p>
                        <p className="text-xs text-muted-foreground">{c.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">What happened? <span className="text-destructive">*</span></label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe the concerning behavior. Stick to facts and your direct experience. Avoid inflammatory or defamatory language."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">{details.length} characters</p>
              </div>

              {/* Evidence */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Evidence (screenshots, etc.) <span className="text-muted-foreground font-normal">(optional)</span></label>
                {evidenceUrl ? (
                  <div className="flex items-center gap-3">
                    <a href={evidenceUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate max-w-[200px]">{evidence?.name || 'Evidence file'}</a>
                    <button onClick={() => { setEvidenceUrl(''); setEvidence(null); }} className="text-xs text-destructive hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border cursor-pointer hover:border-primary/40 transition text-sm text-muted-foreground">
                    {uploadingEvidence ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    {uploadingEvidence ? 'Uploading...' : 'Upload evidence'}
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleEvidenceUpload(e.target.files?.[0])} />
                  </label>
                )}
              </div>

              {/* Confirmation checkbox */}
              <button
                onClick={() => setConfirmed(!confirmed)}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-background text-left hover:border-muted-foreground/40 transition"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${confirmed ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                  {confirmed && <Check size={12} className="text-primary-foreground" />}
                </div>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I confirm that I have direct, personal experience with this person and that the information I'm providing is truthful to the best of my knowledge. I understand that false or malicious reports may result in account suspension.
                </span>
              </button>

              {error && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                  <AlertTriangle size={14} className="text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 px-5 py-3 rounded-full border border-input font-medium text-sm hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldAlert size={16} />}
                  {submitting ? 'Submitting...' : 'Submit Alert'}
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {MAX_PENDING - pendingCount} of {MAX_PENDING} remaining submissions in your pending quota.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}