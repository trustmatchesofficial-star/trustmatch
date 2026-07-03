import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import VerificationModal from '@/components/VerificationModal';
import {
  ShieldCheck, Phone, Check, ArrowRight, Loader2, BadgeCheck, Lock, Heart, X,
} from 'lucide-react';

export default function OnboardingChecklist({ profile, setProfile, onComplete }) {
  const [safetySetting, setSafetySetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerify, setShowVerify] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    base44.entities.SafetySetting.filter({ created_by_id: profile.created_by_id })
      .then((rows) => {
        const s = rows[0];
        setSafetySetting(s || null);
        if (s?.emergency_contact_name) {
          setContactName(s.emergency_contact_name);
          setContactPhone(s.emergency_contact_phone || '');
          setContactSaved(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile]);

  const isVerified = !!profile?.is_verified;
  const hasContact = !!(safetySetting?.emergency_contact_name && safetySetting?.emergency_contact_phone);
  const allDone = isVerified && hasContact;

  useEffect(() => {
    if (!loading && allDone) onComplete?.();
  }, [loading, allDone, onComplete]);

  const handleSaveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    setSavingContact(true);
    try {
      if (safetySetting) {
        const updated = await base44.entities.SafetySetting.update(safetySetting.id, {
          emergency_contact_name: contactName.trim(),
          emergency_contact_phone: contactPhone.trim(),
        });
        setSafetySetting(updated);
      } else {
        const created = await base44.entities.SafetySetting.create({
          emergency_contact_name: contactName.trim(),
          emergency_contact_phone: contactPhone.trim(),
        });
        setSafetySetting(created);
      }
      setContactSaved(true);
    } catch (err) {
      console.error(err);
    }
    setSavingContact(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    {
      icon: ShieldCheck,
      title: 'Verify your identity',
      desc: 'Confirm you are real with a quick selfie and ID check.',
      done: isVerified,
      accent: 'text-teal',
      bg: 'bg-teal/15',
    },
    {
      icon: Phone,
      title: 'Set your emergency contact',
      desc: 'Choose someone you trust to be alerted if you need help.',
      done: hasContact,
      accent: 'text-primary',
      bg: 'bg-primary/15',
    },
  ];
  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto px-6 pt-10 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="text-primary" size={30} />
        </div>
        <h1 className="text-2xl font-heading font-bold mb-2">Almost there!</h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Complete these two steps to unlock the Discover feed. Your safety comes first.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{completedCount}/{steps.length}</span>
      </div>

      {/* Step cards */}
      <div className="space-y-4 mb-8">
        {/* Step 1: Verification */}
        <div className={`rounded-2xl border p-5 transition ${isVerified ? 'border-teal/40 bg-teal/5' : 'border-border bg-card'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl ${isVerified ? 'bg-teal/15' : 'bg-teal/15'} flex items-center justify-center shrink-0`}>
              {isVerified ? <BadgeCheck className="text-teal" size={22} /> : <ShieldCheck className="text-teal" size={22} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">Identity Verification</h3>
                {isVerified && (
                  <span className="text-[10px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded-full">DONE</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {isVerified
                  ? 'You are verified. A trust badge appears on your profile.'
                  : 'Upload a selfie and ID so we can confirm you are a real person.'}
              </p>
              {!isVerified && (
                <button
                  onClick={() => setShowVerify(true)}
                  className="inline-flex items-center gap-1.5 bg-teal text-accent-foreground px-4 py-2 rounded-full font-semibold text-xs hover:bg-teal/90 transition"
                >
                  <ShieldCheck size={14} /> Start Verification <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Emergency contact */}
        <div className={`rounded-2xl border p-5 transition ${hasContact ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              {hasContact ? <Check className="text-primary" size={22} /> : <Phone className="text-primary" size={22} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">Emergency Contact</h3>
                {hasContact && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">DONE</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {hasContact
                  ? `Set to ${safetySetting.emergency_contact_name}.`
                  : 'Choose someone you trust. They will be alerted if you trigger SOS or miss a check-in.'}
              </p>
              {!hasContact && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => { setContactName(e.target.value); setContactSaved(false); }}
                    placeholder="Contact name"
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => { setContactPhone(e.target.value); setContactSaved(false); }}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
                  />
                  <button
                    onClick={handleSaveContact}
                    disabled={!contactName.trim() || !contactPhone.trim() || savingContact}
                    className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold text-xs hover:bg-primary/90 transition disabled:opacity-40"
                  >
                    {savingContact ? <Loader2 className="animate-spin" size={14} /> : <Phone size={14} />} Save Contact
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        {allDone ? (
          <button
            onClick={onComplete}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
          >
            <Heart size={18} className="fill-current" /> Enter Discover
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 bg-secondary text-muted-foreground py-3.5 rounded-full font-semibold text-sm">
            <Lock size={16} /> Complete both steps to continue
          </div>
        )}
        <p className="text-center text-xs text-muted-foreground mt-3">
          You can update these anytime in Settings.
        </p>
      </div>

      {showVerify && (
        <VerificationModal
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowVerify(false)}
        />
      )}
    </div>
  );
}