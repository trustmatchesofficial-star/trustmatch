import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, Heart, Phone, Lock, Check, X, ArrowRight, ArrowLeft, Loader2, BadgeCheck,
} from 'lucide-react';

const STORAGE_KEY = 'tm_safety_walkthrough_done';

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Verify your identity',
    description: 'Upload a selfie and ID so we can confirm you\u2019re real. Verified members get a trust badge and more matches.',
    accent: 'text-teal',
    bg: 'bg-teal/15',
  },
  {
    icon: Phone,
    title: 'Add an emergency contact',
    description: 'Choose someone you trust. If you trigger SOS or miss a date check-in, we can alert them automatically.',
    accent: 'text-primary',
    bg: 'bg-primary/15',
  },
  {
    icon: Lock,
    title: 'Set a safety word',
    description: 'Pick a secret word. If a chat mentions it, we\u2019ll discreetly check in and offer help.',
    accent: 'text-gold',
    bg: 'bg-gold/15',
  },
  {
    icon: Heart,
    title: 'You\u2019re ready to date safely',
    description: 'You can update these anytime in Settings. Your safety always comes first at Trust Matches.',
    accent: 'text-accent',
    bg: 'bg-accent/15',
  },
];

export default function SafetySetupWalkthrough({ profile }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [settingsId, setSettingsId] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [safetyWord, setSafetyWord] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlag, setSavedFlag] = useState({});

  useEffect(() => {
    if (!profile) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {}
    // Show walkthrough for newly onboarded, unverified users
    if (profile.is_onboarded && !profile.is_verified) setVisible(true);
  }, [profile]);

  useEffect(() => {
    if (!visible || !profile) return;
    base44.entities.SafetySetting.filter({ created_by_id: profile.created_by_id })
      .then((rows) => {
        if (rows[0]) {
          setSettingsId(rows[0].id);
          setContactName(rows[0].emergency_contact_name || '');
          setContactPhone(rows[0].emergency_contact_phone || '');
          setSafetyWord(rows[0].safety_word || '');
        }
      })
      .catch(() => {});
  }, [visible, profile]);

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    setVisible(false);
  };

  const persist = async (fields) => {
    if (!profile) return;
    setSaving(true);
    try {
      if (settingsId) {
        await base44.entities.SafetySetting.update(settingsId, fields);
      } else {
        const created = await base44.entities.SafetySetting.create(fields);
        setSettingsId(created.id);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleSaveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    await persist({
      emergency_contact_name: contactName.trim(),
      emergency_contact_phone: contactPhone.trim(),
    });
    setSavedFlag((f) => ({ ...f, contact: true }));
  };

  const handleSaveWord = async () => {
    if (!safetyWord.trim()) return;
    await persist({ safety_word: safetyWord.trim() });
    setSavedFlag((f) => ({ ...f, word: true }));
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const goNext = () => (isLast ? finish() : setStep(step + 1));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={finish}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition"
        >
          <X size={18} />
        </button>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8 mt-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-20 h-20 rounded-2xl ${current.bg} flex items-center justify-center mb-6 mx-auto`}>
          <Icon className={current.accent} size={40} strokeWidth={2} />
        </div>

        <h2 className="text-2xl font-heading font-bold text-center mb-2">{current.title}</h2>
        <p className="text-muted-foreground text-center text-sm leading-relaxed mb-6">{current.description}</p>

        {/* Step-specific interactive content */}
        {step === 0 && (
          <div className="space-y-3">
            {profile?.is_verified ? (
              <div className="flex items-center justify-center gap-2 bg-teal/10 text-teal rounded-2xl py-3 text-sm font-semibold">
                <BadgeCheck size={18} /> Identity verified — nice work!
              </div>
            ) : (
              <button
                onClick={() => { finish(); navigate('/profile'); }}
                className="w-full flex items-center justify-center gap-2 bg-teal text-accent-foreground px-5 py-3 rounded-full font-semibold text-sm hover:bg-teal/90 transition"
              >
                <ShieldCheck size={16} /> Start Verification <ArrowRight size={16} />
              </button>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Takes about 2 minutes. Your ID is never shown on your profile.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <input
              type="text"
              value={contactName}
              onChange={(e) => { setContactName(e.target.value); setSavedFlag((f) => ({ ...f, contact: false })); }}
              placeholder="Contact name"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
            />
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => { setContactPhone(e.target.value); setSavedFlag((f) => ({ ...f, contact: false })); }}
              placeholder="Phone number"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
            />
            <button
              onClick={handleSaveContact}
              disabled={!contactName.trim() || !contactPhone.trim() || saving || savedFlag.contact}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40"
            >
              {savedFlag.contact ? <><Check size={16} /> Saved</> : saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Contact'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <input
              type="text"
              value={safetyWord}
              onChange={(e) => { setSafetyWord(e.target.value); setSavedFlag((f) => ({ ...f, word: false })); }}
              placeholder="e.g. sunflower"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
            />
            <button
              onClick={handleSaveWord}
              disabled={!safetyWord.trim() || saving || savedFlag.word}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40"
            >
              {savedFlag.word ? <><Check size={16} /> Saved</> : saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Safety Word'}
            </button>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full border border-input font-medium hover:bg-secondary transition text-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-1.5 bg-accent text-accent-foreground px-5 py-3 rounded-full font-semibold text-sm hover:bg-accent/90 transition"
          >
            {isLast ? <>Get Started <Check size={16} /></> : <>Continue <ArrowRight size={16} /></>}
          </button>
        </div>

        {step < STEPS.length - 1 && (
          <button
            onClick={finish}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition mt-4"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}