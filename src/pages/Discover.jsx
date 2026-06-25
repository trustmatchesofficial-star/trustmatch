import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SwipeCard from '@/components/SwipeCard';
import MatchCelebration from '@/components/MatchCelebration';
import { Heart, X, RotateCcw, Sparkles } from 'lucide-react';

export default function Discover() {
  const { profile } = useOutletContext();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [match, setMatch] = useState(null);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const likes = await base44.entities.Like.filter({ liker_id: profile.created_by_id });
      const likedIds = likes.map((l) => l.liked_id);

      const all = await base44.entities.Profile.list('-created_date', 50);
      const filtered = all.filter(
        (p) => p.id !== profile.id && !likedIds.includes(p.id) && p.is_active && p.is_onboarded
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

  const handleSwipe = async (direction) => {
    if (profiles.length === 0) return;
    const current = profiles[0];
    setSwipeDirection(direction);

    try {
      await base44.entities.Like.create({
        liker_id: profile.created_by_id,
        liked_id: current.id,
        action: direction === 'right' ? 'like' : 'pass',
      });

      if (direction === 'right') {
        const mutual = await base44.entities.Like.filter({
          liker_id: current.id,
          liked_id: profile.created_by_id,
          action: 'like',
        });
        if (mutual.length > 0) {
          await base44.entities.Match.create({
            user_a: profile.created_by_id,
            user_b: current.id,
            status: 'active',
          });
          setMatch(current);
        }
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setProfiles((p) => p.slice(1));
      setSwipeDirection(null);
    }, 300);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <div className="min-h-screen flex flex-col max-w-lg mx-auto">
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="text-primary fill-primary" size={24} />
            <h1 className="font-heading font-bold text-xl">Discover</h1>
          </div>
          {profile.is_premium && (
            <span className="flex items-center gap-1 bg-accent/20 text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              <Sparkles size={12} /> Premium
            </span>
          )}
        </div>

        <div className="flex-1 px-6 py-4">
          {profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Heart className="text-muted-foreground" size={36} />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">No more profiles</h3>
              <p className="text-muted-foreground mb-6 max-w-xs">
                You've seen everyone for now. Check back later or browse profiles.
              </p>
              <button
                onClick={loadProfiles}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition"
              >
                <RotateCcw size={18} /> Refresh
              </button>
            </div>
          ) : (
            <div className="relative h-[65vh]">
              {profiles.slice(0, 2).reverse().map((p, i, arr) => (
                <SwipeCard
                  key={p.id}
                  profile={p}
                  isTop={i === arr.length - 1}
                  swipeDirection={i === arr.length - 1 ? swipeDirection : null}
                />
              ))}
            </div>
          )}
        </div>

        {profiles.length > 0 && (
          <div className="flex items-center justify-center gap-6 pb-24 md:pb-8">
            <button
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-lg hover:border-destructive hover:text-destructive transition-all hover:scale-105"
            >
              <X size={28} />
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:scale-110 transition-all"
            >
              <Heart size={32} className="fill-current" />
            </button>
          </div>
        )}
      </div>

      <MatchCelebration match={match} onClose={() => setMatch(null)} />
    </>
  );
}