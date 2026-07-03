import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, MapPin, BadgeCheck, SlidersHorizontal, Heart, Flag } from 'lucide-react';
import ReportModal from '@/components/ReportModal';

export default function Browse() {
  const { profile } = useOutletContext();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(99);
  const [showFilters, setShowFilters] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Profile.list('-created_date', 50);
      const filtered = all.filter(
        (p) => p.id !== profile.id && p.is_active && p.is_onboarded
      );
      setProfiles(filtered);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) loadProfiles();
  }, [profile]);

  const filtered = profiles.filter((p) => {
    if (search && !p.full_name?.toLowerCase().includes(search.toLowerCase()) &&
        !p.location?.toLowerCase().includes(search.toLowerCase())) return false;
    if (p.age < ageMin || p.age > ageMax) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <div className="px-6 pt-6 pb-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-4">Browse</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-input bg-card hover:border-primary/50 transition"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 bg-card border border-border rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Age range: {ageMin} – {ageMax}
                </label>
                <div className="flex items-center gap-3">
                  <input type="range" min="18" max="60" value={ageMin}
                    onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax))}
                    className="flex-1 accent-primary" />
                  <input type="range" min="18" max="99" value={ageMax}
                    onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin))}
                    className="flex-1 accent-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="text-muted-foreground mx-auto mb-3" size={36} />
              <p className="text-muted-foreground">No profiles match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow group">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={p.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400`}
                      alt={p.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {p.is_verified && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-gold/90 text-background px-2 py-1 rounded-full text-[10px] font-semibold shadow-lg">
                        <BadgeCheck size={12} /> Verified
                      </div>
                    )}
                    <button
                      onClick={() => setReportTarget(p)}
                      className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-destructive transition z-10"
                      title="Report suspicious activity"
                    >
                      <Flag size={14} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <h3 className="text-white font-semibold text-sm">
                        {p.full_name}, {p.age}
                      </h3>
                      {p.location && (
                        <p className="flex items-center gap-0.5 text-white/80 text-xs">
                          <MapPin size={10} /> {p.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ReportModal
        reportedProfile={reportTarget}
        reporterId={profile?.created_by_id}
        onClose={() => setReportTarget(null)}
      />
    </div>
  );
}