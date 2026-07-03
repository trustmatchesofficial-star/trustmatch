import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, MapPin, BadgeCheck, SlidersHorizontal, Heart, Flag, ArrowDownWideNarrow, X } from 'lucide-react';
import ReportModal from '@/components/ReportModal';
import TrustScoreBadge, { computeTrustScore } from '@/components/TrustScoreBadge';

export default function Browse() {
  const { profile } = useOutletContext();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(99);
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [sortBy, setSortBy] = useState('trust');
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

  const allInterests = [...new Set(profiles.flatMap((p) => p.interests || []))].sort();

  const filtered = profiles.filter((p) => {
    if (search && !p.full_name?.toLowerCase().includes(search.toLowerCase()) &&
        !p.location?.toLowerCase().includes(search.toLowerCase())) return false;
    if (p.age < ageMin || p.age > ageMax) return false;
    if (verifiedOnly && !p.is_verified) return false;
    if (selectedInterests.length > 0 && !selectedInterests.some((i) => p.interests?.includes(i))) return false;
    if (locationSearch && !p.location?.toLowerCase().includes(locationSearch.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'trust') return computeTrustScore(b) - computeTrustScore(a);
    if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'verified') return (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0);
    if (sortBy === 'interests') {
      const aShared = (a.interests || []).filter((i) => profile?.interests?.includes(i)).length;
      const bShared = (b.interests || []).filter((i) => profile?.interests?.includes(i)).length;
      return bShared - aShared;
    }
    return 0;
  });

  const toggleInterest = (interest) =>
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );

  const activeFilterCount =
    (verifiedOnly ? 1 : 0) + selectedInterests.length + (locationSearch ? 1 : 0) + (ageMin !== 18 || ageMax !== 99 ? 1 : 0);

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
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border bg-card transition ${showFilters ? 'border-primary' : 'border-input hover:border-primary/50'}`}
              >
                <SlidersHorizontal size={18} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 bg-card border border-border rounded-2xl p-5 space-y-5 animate-fade-in">
              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <ArrowDownWideNarrow size={15} /> Sort by
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'trust', label: 'Trust Score' },
                    { value: 'interests', label: 'Shared Interests' },
                    { value: 'verified', label: 'Verified First' },
                    { value: 'newest', label: 'Newest' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${sortBy === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Age range */}
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

              <div className="h-px bg-border" />

              {/* Verified only */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <BadgeCheck size={15} className="text-gold" /> Verified members only
                </label>
                <button
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`relative w-11 h-6 rounded-full transition ${verifiedOnly ? 'bg-teal' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${verifiedOnly ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <div className="h-px bg-border" />

              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <MapPin size={15} /> Location
                </label>
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Enter a city or area..."
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
                />
              </div>

              {/* Interests */}
              {allInterests.length > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Shared interests</label>
                    <div className="flex flex-wrap gap-2">
                      {allInterests.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 ${selectedInterests.includes(interest) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
                        >
                          {selectedInterests.includes(interest) && <X size={10} />}
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setVerifiedOnly(false); setSelectedInterests([]); setLocationSearch(''); setAgeMin(18); setAgeMax(99); }}
                  className="text-xs text-destructive hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
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
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="text-muted-foreground mx-auto mb-3" size={36} />
              <p className="text-muted-foreground">No profiles match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sorted.map((p) => (
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
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <TrustScoreBadge profile={p} size="sm" />
                      </div>
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