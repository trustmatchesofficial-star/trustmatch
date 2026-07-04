import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles, Crown, X } from 'lucide-react';
import TrustScoreBadge from './TrustScoreBadge';

export default function TopPicks({ profile }) {
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      try {
        const likes = await base44.entities.Like.filter({ liker_id: profile.created_by_id });
        const likedIds = likes.map((l) => l.liked_id);

        const myBlocks = await base44.entities.Block.filter({ blocker_id: profile.created_by_id });
        const blockedByMe = myBlocks.map((b) => b.blocked_id);

        const all = await base44.entities.Profile.list('-created_date', 100);
        let candidates = all.filter(
          (p) =>
            p.id !== profile.id &&
            !likedIds.includes(p.id) &&
            !blockedByMe.includes(p.id) &&
            p.is_active &&
            p.is_onboarded &&
            p.age >= (profile.age_pref_min || 18) &&
            p.age <= (profile.age_pref_max || 99)
        );

        // Score by shared interests + verification + trust score
        candidates = candidates
          .map((p) => {
            const sharedInterests = (p.interests || []).filter((i) =>
              (profile.interests || []).includes(i)
            ).length;
            const score =
              sharedInterests * 10 +
              (p.is_verified ? 15 : 0) +
              (p.trust_score || 50) * 0.3 +
              (p.is_live_verified ? 10 : 0);
            return { ...p, _score: score };
          })
          .sort((a, b) => b._score - a._score)
          .slice(0, 10);

        setPicks(candidates);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [profile]);

  if (loading || picks.length === 0) return null;

  const display = expanded ? picks : picks.slice(0, 3);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={16} className="text-gold" />
          <h3 className="text-sm font-heading font-bold">Top Picks</h3>
          <span className="text-[10px] text-muted-foreground">· Refreshes daily</span>
        </div>
        {!profile?.is_premium && (
          <button
            onClick={() => navigate('/premium')}
            className="flex items-center gap-1 text-[10px] font-medium text-gold bg-gold/10 px-2 py-1 rounded-full"
          >
            <Crown size={10} /> Unlock all
          </button>
        )}
      </div>

      {profile?.is_premium ? (
        <>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {display.map((p) => (
              <div
                key={p.id}
                className="relative shrink-0 w-28 h-40 rounded-2xl overflow-hidden border border-border"
              >
                <img
                  src={p.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300`}
                  alt={p.full_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-2 text-white">
                  <p className="text-xs font-bold truncate">{p.full_name}, {p.age}</p>
                  <TrustScoreBadge profile={p} size="xs" />
                </div>
                {p.is_verified && (
                  <div className="absolute top-1.5 right-1.5 bg-gold/90 text-background px-1.5 py-0.5 rounded-full text-[8px] font-bold">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>

          {!expanded && picks.length > 3 && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition py-1"
            >
              See {picks.length} more picks ↓
            </button>
          )}
        </>
      ) : (
        <button
          onClick={() => navigate('/premium')}
          className="relative w-full h-40 rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-br from-gold/10 to-primary/10 flex flex-col items-center justify-center gap-2 hover:border-gold/50 transition"
        >
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
            <Crown className="text-gold" size={24} />
          </div>
          <p className="text-sm font-bold text-gold">Unlock Top Picks</p>
          <p className="text-[10px] text-muted-foreground text-center px-4">
            Daily curated matches based on your preferences
          </p>
        </button>
      )}
    </div>
  );
}