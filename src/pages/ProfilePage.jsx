import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MapPin, BadgeCheck, Heart, Edit3, Camera, X, Check, Crown, ShieldCheck } from 'lucide-react';
import VerificationModal from '@/components/VerificationModal';

const INTERESTS = ['Travel', 'Foodie', 'Fitness', 'Music', 'Movies', 'Art', 'Reading', 'Gaming', 'Hiking', 'Cooking', 'Dogs', 'Cats', 'Photography', 'Dancing', 'Yoga', 'Coffee', 'Wine', 'Tech'];

export default function ProfilePage() {
  const { profile, setProfile } = useOutletContext();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      bio: profile.bio || '',
      location: profile.location || '',
      interests: profile.interests || [],
      photos: profile.photos || [],
    });
  }, [profile]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, photos: [...f.photos, file_url] }));
    } catch (err) { console.error(err); }
  };

  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.Profile.update(profile.id, form);
      setProfile(updated);
      setEditing(false);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  if (!profile || !form) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  const photo = profile.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800`;

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-heading font-bold">Profile</h1>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-input hover:border-primary/50 transition text-sm font-medium">
              <Edit3 size={16} /> Edit
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm font-medium disabled:opacity-40">
              <Check size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        {/* Photo */}
        <div className="relative rounded-3xl overflow-hidden mb-6 aspect-[4/5]">
          <img src={editing ? form.photos?.[0] || photo : photo} alt={profile.full_name} className="w-full h-full object-cover" />
          {profile.is_verified && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-teal text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
              <BadgeCheck size={16} /> Verified
            </div>
          )}
          {profile.is_premium && (
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-accent/20 backdrop-blur-md border border-accent/40 text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
              <Crown size={16} className="text-accent" /> Premium
            </div>
          )}
          {editing && form.photos.length > 0 && (
            <button
              onClick={() => setForm((f) => ({ ...f, photos: f.photos.slice(1) }))}
              className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Name & age */}
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold">
            {profile.full_name}, {profile.age}
            {profile.is_verified && <BadgeCheck size={22} className="text-teal inline ml-2 align-middle" />}
          </h2>
          <div className="flex items-center gap-3 text-muted-foreground mt-1">
            {profile.location && <span className="flex items-center gap-1 text-sm"><MapPin size={14} /> {profile.location}</span>}
            <span className="text-sm capitalize">{profile.looking_for?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Verification CTA */}
        {!profile.is_verified && !editing && (
          <button
            onClick={() => setShowVerify(true)}
            className="w-full flex items-center gap-3 bg-teal/10 border border-teal/30 rounded-2xl p-4 mb-6 hover:bg-teal/15 transition text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} className="text-teal" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-teal">Get Verified</h3>
              <p className="text-xs text-muted-foreground">Confirm your identity to earn a verification badge and build trust.</p>
            </div>
            <Check size={18} className="text-teal" />
          </button>
        )}

        {/* Bio */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">About Me</h3>
          {editing ? (
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-none"
            />
          ) : (
            <p className="text-foreground leading-relaxed">{profile.bio || 'No bio yet.'}</p>
          )}
        </div>

        {/* Location (editing) */}
        {editing && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Location</h3>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-input bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            />
          </div>
        )}

        {/* Add photo (editing) */}
        {editing && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Photos ({form.photos.length})</h3>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl py-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition">
              <Camera size={20} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add a photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        )}

        {/* Interests */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Interests</h3>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const selected = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card hover:border-primary/50'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profile.interests || []).map((interest) => (
                <span key={interest} className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                  {interest}
                </span>
              ))}
              {(!profile.interests || profile.interests.length === 0) && (
                <p className="text-muted-foreground text-sm">No interests added yet.</p>
              )}
            </div>
          )}
        </div>
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