import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Heart, Crown, Lock, RotateCcw } from 'lucide-react';
import TrustScoreBadge from '@/components/TrustScoreBadge';

export default function LikedYou() {
  const { profile } = useOutletContext();
  const navigate = useNavigate();
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      try {
        const likes = await base44.entities.Like.filter({
          liked_id: profile.id,
          action: 'like',
        });
        const superLikes = await base44.entities.Like.filter({
          liked_id: profile.id,
          action: 'superlike',
        });

        const allLikes = [...likes, ...superLikes].sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date)
        );

        const profileIds = [...new Set(allLikes.map((l) => l.liker_id))];
        const profiles = await Promise.all(
          profileIds.map((id) => base44.entities.Profile.get(id).catch(() => null))
        );

        const valid = profiles.filter((p) => p && p.is_active && p.is_onboarded);
        setLikers(valid);
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

  const isPremium = profile?.is_premium;

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
            <Heart className="text-primary fill-primary" size={16} />
          </div>
          <h1 className="text-2xl font-heading font-bold">Likes You</h1>
        </div>

        {!isPremium && likers.length > 0 && (
          <div className="bg-gradient-to-br from-primary/15 to-gold/10 border border-primary/20 rounded-3xl p-6 mb-6 text-center">
            <Crown className="text-gold mx-auto mb-3" size={32} />
            <h2 className="text-lg font-heading font-bold mb-1">
              {likers.length} {likers.length === 1 ? 'person likes' : 'people like'} you!
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Go Premium to see who's interested and match instantly.
            </p>
            <button
              onClick={() => navigate('/premium')}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition"
            >
              <Crown size={16} /> Unlock with Premium
            </button>
          </div>
        )}

        {likers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="text-muted-foreground" size={36} />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">No likes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Keep swiping and completing your profile — your likes will show up here.
            </p>
            <button
              onClick={() => navigate('/discover')}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition"
            >
              <RotateCcw size={18} /> Start Discovering
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {likers.map((p) => {
              const locked = !isPremium;
              return (
                <div
                  key={p.id}
                  className={`relative rounded-2xl overflow-hidden border border-border bg-card ${locked ? 'blur-[8px] pointer-events-none' : ''}`}
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={p.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400`}
                      alt={p.full_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {locked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <Lock size={28} className="mb-2" />
                        <span className="text-xs font-medium">Premium</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                      <p className="font-bold text-sm truncate">{p.full_name}, {p.age}</p>
                      {p.location && <p className="text-xs text-white/70 truncate">{p.location}</p>}
                      <div className="mt-1">
                        <TrustScoreBadge profile={p} size="xs" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}