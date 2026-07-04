import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ArrowRight, Upload, X, Heart, Check, Camera, IdCard, ShieldCheck, Loader2 } from 'lucide-react';

const INTERESTS = ['Travel', 'Foodie', 'Fitness', 'Music', 'Movies', 'Art', 'Reading', 'Gaming', 'Hiking', 'Cooking', 'Dogs', 'Cats', 'Photography', 'Dancing', 'Yoga', 'Coffee', 'Wine', 'Tech'];
const LOOKING_FOR = [
  { value: 'serious_relationship', label: 'Serious Relationship' },
  { value: 'casual_dating', label: 'Casual Dating' },
  { value: 'friendship', label: 'Friendship' },
  { value: 'not_sure', label: 'Not Sure Yet' },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [idDocumentUrl, setIdDocumentUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    age: '',
    gender: '',
    bio: '',
    location: '',
    interests: [],
    looking_for: '',
    age_pref_min: 18,
    age_pref_max: 99,
  });

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    base44.entities.Profile.filter({ created_by_id: user.id })
      .then((profiles) => {
        if (profiles[0]?.is_onboarded) navigate('/discover', { replace: true });
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [user, navigate]);

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/register" replace />;

  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotos((p) => [...p, file_url]);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleVerifyUpload = async (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setter(file_url);
    } catch (err) {
      console.error('Upload failed', err);
    }
    setUploading(false);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const profile = await base44.entities.Profile.create({
        ...form,
        age: Number(form.age),
        photos,
        is_onboarded: true,
        is_verified: false,
        is_premium: false,
        credits: 0,
        is_active: true,
      });
      // Create the mandatory identity verification request.
      // Nobody can complete onboarding without uploading a passport/ID.
      await base44.entities.VerificationRequest.create({
        user_id: user.id,
        selfie_url: selfieUrl,
        id_document_url: idDocumentUrl,
        status: 'pending',
      });
      navigate('/discover');
    } catch (err) {
      console.error('Profile creation failed', err);
      setSaving(false);
    }
  };

  const steps = [
    // Step 0: Photos
    {
      title: 'Add your photos',
      subtitle: 'Your best photos get more matches. Add at least one.',
      valid: photos.length > 0,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {photos.map((url, i) => (
              <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80"
                >
                  <X size={16} />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    Main
                  </span>
                )}
              </div>
            ))}
            {photos.length < 6 && (
              <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <Upload className="text-muted-foreground mb-2" size={28} />
                <span className="text-sm text-muted-foreground">Upload photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
        </div>
      ),
    },
    // Step 1: Basic info
    {
      title: 'Tell us about you',
      subtitle: 'Let others know who you are.',
      valid: form.full_name && form.age >= 18 && form.gender,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Age (must be 18+)</label>
            <input
              type="number"
              min="18"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              placeholder="25"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {['male', 'female', 'non-binary', 'other'].map((g) => (
                <button
                  key={g}
                  onClick={() => setForm({ ...form, gender: g })}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                    form.gender === g
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-card hover:border-primary/50'
                  }`}
                >
                  {g.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Step 2: Bio + Location
    {
      title: 'Your story & location',
      subtitle: 'Share a bit about yourself and where you are.',
      valid: form.bio.length > 10 && form.location,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={5}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-none"
              placeholder="Tell people about yourself, what you love, and what you're looking for..."
            />
            <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/300</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              placeholder="City, State"
            />
          </div>
        </div>
      ),
    },
    // Step 3: Interests
    {
      title: 'Your interests',
      subtitle: 'Select a few things you enjoy.',
      valid: form.interests.length >= 3,
      content: (
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const selected = form.interests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-card hover:border-primary/50'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      ),
    },
    // Step 4: Preferences
    {
      title: 'What are you looking for?',
      subtitle: 'This helps us find the right matches for you.',
      valid: form.looking_for,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            {LOOKING_FOR.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setForm({ ...form, looking_for: value })}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border text-sm font-medium transition-all ${
                  form.looking_for === value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-card hover:border-primary/50'
                }`}
              >
                {label}
                {form.looking_for === value && <Check size={20} />}
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Age range: {form.age_pref_min} – {form.age_pref_max}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="18" max="60"
                value={form.age_pref_min}
                onChange={(e) => setForm({ ...form, age_pref_min: Math.min(Number(e.target.value), form.age_pref_max) })}
                className="flex-1 accent-primary"
              />
              <input
                type="range" min="18" max="99"
                value={form.age_pref_max}
                onChange={(e) => setForm({ ...form, age_pref_max: Math.max(Number(e.target.value), form.age_pref_min) })}
                className="flex-1 accent-primary"
              />
            </div>
          </div>
        </div>
      ),
    },
    // Step 5: Mandatory identity verification (passport/ID + selfie)
    {
      title: 'Verify your identity',
      subtitle: 'A passport or government ID and a selfie are required to join Trust Matches. This keeps the community real and safe.',
      valid: selfieUrl && idDocumentUrl,
      content: (
        <div className="space-y-5">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-teal/10 border border-teal/30">
            <ShieldCheck className="text-teal shrink-0" size={20} />
            <p className="text-xs text-foreground leading-relaxed">
              Your documents are used only for identity verification and are never shown on your profile.
              You may cover sensitive details except your photo, name, and date of birth.
            </p>
          </div>

          {/* Selfie upload */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Camera size={16} className="text-primary" /> Selfie photo
            </label>
            {selfieUrl ? (
              <div className="relative w-full max-w-[200px] aspect-[3/4] rounded-2xl overflow-hidden mx-auto">
                <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelfieUrl(null)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition">
                {uploading ? <Loader2 size={28} className="text-muted-foreground animate-spin" /> : <Camera size={28} className="text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Tap to upload selfie'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleVerifyUpload(e, setSelfieUrl)} />
              </label>
            )}
          </div>

          {/* ID document upload */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <IdCard size={16} className="text-gold" /> Passport or government ID
            </label>
            {idDocumentUrl ? (
              <div className="relative w-full max-w-[200px] aspect-[3/4] rounded-2xl overflow-hidden mx-auto">
                <img src={idDocumentUrl} alt="ID Document" className="w-full h-full object-cover" />
                <button
                  onClick={() => setIdDocumentUrl(null)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl py-8 cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition">
                {uploading ? <Loader2 size={28} className="text-muted-foreground animate-spin" /> : <IdCard size={28} className="text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Tap to upload passport/ID'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleVerifyUpload(e, setIdDocumentUrl)} />
              </label>
            )}
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="text-primary fill-primary" size={24} />
            <span className="font-heading font-bold text-lg">Trust Matches</span>
          </div>
          <div className="flex gap-1.5 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-32">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-heading font-bold mb-1">{current.title}</h2>
          <p className="text-muted-foreground text-sm mb-6">{current.subtitle}</p>
          {current.content}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-4 safe-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full border border-input font-medium hover:bg-secondary transition"
            >
              <ArrowLeft size={18} /> Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!current.valid}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-5 py-3 rounded-full font-semibold disabled:opacity-40 transition hover:bg-primary/90"
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!current.valid || saving}
              className="flex-1 flex items-center justify-center gap-1.5 bg-accent text-accent-foreground px-5 py-3 rounded-full font-semibold disabled:opacity-40 transition hover:bg-accent/90"
            >
              {saving ? 'Creating profile...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}