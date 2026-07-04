import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plane, X, Loader2, Check, MapPin } from 'lucide-react';

const POPULAR_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow',
  'Liverpool', 'Bristol', 'Edinburgh', 'Cardiff', 'Belfast',
  'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam',
  'New York', 'Los Angeles', 'Toronto', 'Sydney', 'Dubai',
];

export default function PassportModal({ profile, setProfile, onClose }) {
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  const handleSelect = async (city) => {
    setSaving(true);
    try {
      const updated = await base44.entities.Profile.update(profile.id, { passport_location: city });
      setProfile(updated);
      setSaved(city);
      setTimeout(onClose, 1000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.Profile.update(profile.id, { passport_location: '' });
      setProfile(updated);
      setTimeout(onClose, 500);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const filtered = POPULAR_CITIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 animate-slide-up shadow-2xl max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition">
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Plane className="text-primary" size={22} />
          <h2 className="text-xl font-heading font-bold">Passport</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Discover people in any city around the world.
        </p>

        {profile.passport_location && (
          <div className="mb-4 flex items-center justify-between bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span className="text-sm font-medium">{profile.passport_location}</span>
            </div>
            <button onClick={handleClear} disabled={saving} className="text-xs text-destructive hover:underline">
              Reset to home
            </button>
          </div>
        )}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a city..."
          className="w-full px-4 py-3 rounded-2xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm mb-4"
        />

        <div className="grid grid-cols-2 gap-2">
          {filtered.map((city) => (
            <button
              key={city}
              onClick={() => handleSelect(city)}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition ${
                saved === city
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-secondary/50 hover:border-primary/40 hover:text-foreground text-muted-foreground'
              }`}
            >
              {saved === city ? <Check size={16} /> : <MapPin size={16} />}
              {city}
            </button>
          ))}
        </div>

        {saving && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Updating location...
          </div>
        )}
      </div>
    </div>
  );
}