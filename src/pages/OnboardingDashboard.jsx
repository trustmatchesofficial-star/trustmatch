import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Clock, Users, Loader2, Search, MapPin } from 'lucide-react';

export default function OnboardingDashboard() {
  const { profile } = useOutletContext();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!profile) return;
    (async () => {
      setLoading(true);
      try {
        const all = await base44.entities.Profile.list('-created_date', 500);
        setProfiles(all);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [profile]);

  const filtered = profiles.filter((p) => {
    if (filter === 'completed' && !p.is_onboarded) return false;
    if (filter === 'in_progress' && p.is_onboarded) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.full_name?.toLowerCase().includes(q) && !p.location?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const completed = profiles.filter((p) => p.is_onboarded);
  const inProgress = profiles.filter((p) => !p.is_onboarded);
  const completionRate = profiles.length ? Math.round((completed.length / profiles.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-primary" />
          <h1 className="text-3xl font-heading font-bold">Onboarding Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-heading font-bold">{profiles.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Members</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-heading font-bold text-teal">{completed.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Onboarding Complete</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-heading font-bold text-gold">{inProgress.length}</p>
            <p className="text-xs text-muted-foreground mt-1">In Progress</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-3xl font-heading font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'completed', 'in_progress'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {f === 'all' ? 'All' : f === 'completed' ? 'Completed' : 'In Progress'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="mx-auto mb-3" size={40} />
            <p>No members match your filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 bg-card border border-border rounded-2xl p-3 hover:border-muted-foreground/30 transition"
              >
                <img
                  src={p.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80`}
                  alt={p.full_name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.full_name}, {p.age}</p>
                  {p.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-0.5 truncate">
                      <MapPin size={10} /> {p.location}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(p.created_date).toLocaleDateString()}
                  </p>
                </div>
                {p.is_onboarded ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal/15 text-teal text-xs font-semibold shrink-0">
                    <CheckCircle2 size={12} /> Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-semibold shrink-0">
                    <Clock size={12} /> In Progress
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}