import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ReportModal from '@/components/ReportModal';
import { Heart, MessageCircle, MapPin, BadgeCheck, Flag } from 'lucide-react';

export default function Matches() {
  const { profile } = useOutletContext();
  const [matches, setMatches] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      setLoading(true);
      try {
        const all = await base44.entities.Match.list('-created_date', 50);
        const mine = all.filter(
          (m) => m.status === 'active' && (m.user_a === profile.created_by_id || m.user_b === profile.created_by_id)
        );
        setMatches(mine);

        const otherIds = mine.map((m) => (m.user_a === profile.created_by_id ? m.user_b : m.user_a));
        const profileMap = {};
        for (const id of [...new Set(otherIds)]) {
          try {
            const p = await base44.entities.Profile.get(id);
            profileMap[id] = p;
          } catch (e) {}
        }
        setProfiles(profileMap);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [profile]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-6 flex items-center gap-2">
          <Heart className="text-primary fill-primary" /> Matches
        </h1>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Heart className="text-muted-foreground" size={36} />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-6">Start discovering people to find your match!</p>
            <Link to="/discover" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition">
              Discover People
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {matches.map((m) => {
              const otherId = m.user_a === profile.created_by_id ? m.user_b : m.user_a;
              const p = profiles[otherId];
              if (!p) return null;
              return (
                <Link
                  key={m.id}
                  to={`/chat/${m.id}`}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow group"
                >
                  <div className="relative aspect-[3/4]">
                    <img
                      src={p.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400`}
                      alt={p.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground p-1.5 rounded-full">
                      <MessageCircle size={16} />
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setReportTarget(p); }}
                      className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-destructive transition z-10"
                    >
                      <Flag size={14} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="flex items-center gap-1">
                        <h3 className="text-white font-semibold text-sm">{p.full_name}, {p.age}</h3>
                        {p.is_verified && <BadgeCheck size={14} className="text-accent" />}
                      </div>
                      {p.location && (
                        <p className="flex items-center gap-0.5 text-white/80 text-xs">
                          <MapPin size={10} /> {p.location}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <ReportModal
        reportedProfile={reportTarget}
        reporterId={profile?.created_by_id}
        onClose={() => setReportTarget(null)}
      />
    </div>
  );
}