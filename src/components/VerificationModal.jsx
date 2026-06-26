import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BadgeCheck, Camera, Check, ShieldCheck, X, ArrowRight, ArrowLeft, Loader2, Clock, XCircle } from 'lucide-react';

const STEPS = [
  {
    title: 'Get Verified',
    icon: ShieldCheck,
    color: 'text-teal',
    bg: 'bg-teal/15',
    bullets: [
      'A teal verification badge on your profile',
      'Appear in verified-only discovery filters',
      'Build trust and get more matches',
      'Help keep the community safe',
    ],
  },
  {
    title: 'Upload a Selfie',
    icon: Camera,
    color: 'text-primary',
    bg: 'bg-primary/15',
    description: 'Upload a clear selfie so we can confirm you are a real person. This photo is used only for verification and is never shown on your profile.',
  },
  {
    title: 'Community Guidelines',
    icon: Check,
    color: 'text-gold',
    bg: 'bg-gold/15',
    guidelines: [
      'I am at least 18 years old',
      'The photos on my profile are of me',
      'I will treat other users with respect',
      'I will not share false or misleading information',
    ],
  },
];

export default function VerificationModal({ profile, setProfile, onClose }) {
  const [step, setStep] = useState(0);
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [agreed, setAgreed] = useState([false, false, false, false]);
  const [verifying, setVerifying] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!profile) return;
    base44.entities.VerificationRequest.filter({ user_id: profile.created_by_id })
      .then((reqs) => {
        const latest = reqs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
        setExistingRequest(latest || null);
      })
      .catch(() => setExistingRequest(null))
      .finally(() => setChecking(false));
  }, [profile]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSelfieUrl(file_url);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await base44.entities.VerificationRequest.create({
        user_id: profile.created_by_id,
        selfie_url: selfieUrl,
        status: 'pending',
      });
      setExistingRequest({ status: 'pending' });
      onClose();
    } catch (err) {
      console.error(err);
    }
    setVerifying(false);
  };

  const toggleAgree = (i) =>
    setAgreed((a) => a.map((v, idx) => (idx === i ? !v : v)));

  const allAgreed = agreed.every(Boolean);
  const isLastStep = step === STEPS.length - 1;
  const canProceed =
    step === 0 ||
    (step === 1 && selfieUrl) ||
    (step === 2 && allAgreed);

  const current = STEPS[step];
  const Icon = current.icon;

  const pendingOrRejected = existingRequest && (existingRequest.status === 'pending' || existingRequest.status === 'rejected');

  if (checking) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <Loader2 className="text-muted-foreground animate-spin" size={32} />
      </div>
    );
  }

  if (pendingOrRejected) {
    const isPending = existingRequest.status === 'pending';
    const StatusIcon = isPending ? Clock : XCircle;
    const statusColor = isPending ? 'text-gold' : 'text-destructive';
    const statusBg = isPending ? 'bg-gold/15' : 'bg-destructive/15';
    const statusTitle = isPending ? 'Verification Pending' : 'Verification Rejected';
    const statusDesc = isPending
      ? 'Your selfie is being reviewed by our team. You\u2019ll be notified once it\u2019s approved \u2014 this usually takes 24\u201348 hours.'
      : 'Your verification was not approved. Please try again with a clearer, well-lit selfie that clearly shows your face.';

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6">
        <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 animate-slide-up shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          >
            <X size={18} />
          </button>
          <div className={`w-20 h-20 rounded-2xl ${statusBg} flex items-center justify-center mb-6 mx-auto`}>
            <StatusIcon className={statusColor} size={40} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-center mb-3">{statusTitle}</h2>
          <p className="text-muted-foreground text-center text-sm leading-relaxed mb-6">{statusDesc}</p>
          {!isPending && (
            <button
              onClick={() => { setExistingRequest(null); setStep(0); }}
              className="w-full flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition"
            >
              <Camera size={16} /> Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition"
        >
          <X size={18} />
        </button>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8 mt-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-teal' : 'bg-border'}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-20 h-20 rounded-2xl ${current.bg} flex items-center justify-center mb-6 mx-auto`}>
          <Icon className={current.color} size={40} strokeWidth={2} />
        </div>

        <h2 className="text-2xl font-heading font-bold text-center mb-2">{current.title}</h2>

        {/* Step 0: Benefits */}
        {step === 0 && (
          <div className="space-y-2.5 mb-8">
            {current.bullets.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-teal" />
                </div>
                <span className="text-sm text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Selfie upload */}
        {step === 1 && (
          <div className="mb-8">
            <p className="text-muted-foreground text-center text-sm leading-relaxed mb-6">{current.description}</p>
            {selfieUrl ? (
              <div className="relative mx-auto w-40 h-40 rounded-2xl overflow-hidden">
                <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelfieUrl(null)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl py-10 cursor-pointer hover:border-teal/50 hover:bg-teal/5 transition">
                {uploading ? (
                  <Loader2 size={28} className="text-muted-foreground animate-spin" />
                ) : (
                  <Camera size={28} className="text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Tap to upload'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            )}
          </div>
        )}

        {/* Step 2: Guidelines */}
        {step === 2 && (
          <div className="space-y-3 mb-8">
            {current.guidelines.map((g, i) => (
              <button
                key={g}
                onClick={() => toggleAgree(i)}
                className="w-full flex items-center gap-3 text-left p-3 rounded-xl border border-border hover:border-teal/40 transition"
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition ${agreed[i] ? 'bg-teal border-teal' : 'border-border'}`}>
                  {agreed[i] && <Check size={14} className="text-accent-foreground" />}
                </div>
                <span className="text-sm">{g}</span>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full border border-input font-medium hover:bg-secondary transition text-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {isLastStep ? (
            <button
              onClick={handleVerify}
              disabled={!canProceed || verifying}
              className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-teal text-accent-foreground font-semibold text-sm disabled:opacity-40 hover:bg-teal/90 transition"
            >
              {verifying ? (
                <><Loader2 size={16} className="animate-spin" /> Verifying...</>
              ) : (
                <><BadgeCheck size={18} /> Complete Verification</>
              )}
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 transition"
            >
              Continue <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}