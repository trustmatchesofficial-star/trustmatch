import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SwipeCard from '@/components/SwipeCard';
import MatchCelebration from '@/components/MatchCelebration';
import NotificationBell from '@/components/NotificationBell';
import ReportModal from '@/components/ReportModal';
import BlockModal from '@/components/BlockModal';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import { Heart, X, Star, RotateCcw, Sparkles, Search, SlidersHorizontal, Bell, Plane, Zap, Lock, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TopPicks from '@/components/TopPicks';
import PassportModal from '@/components/PassportModal';
import { sortByCompatibility } from '@/utils/matchmaking';

export default function Discover() {
  const { profile, setProfile } = useOutletContext();
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [match, setMatch] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('nearby');
  const [showFilters, setShowFilters] = useState(false);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(99);
  const [reportTarget, setReportTarget] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);
  const [lastSwiped, setLastSwiped] = useState(null);
  const [showPassport, setShowPassport] = useState(false);
  const [boostActive, setBoostActive] = useState(false);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const likes = await base44.entities.Like.filter({ liker_id: profile.created_by_id });
      const likedIds = likes.map((l) => l.liked_id);

      const myBlocks = await base44.entities.Block.filter({ blocker_id: profile.created_by_id });
      const blockedByMeIds = myBlocks.map((b) => b.blocked_id);
      const blockedMe = await base44.entities.Block.filter({ blocked_id: profile.id });
      const blockedMeUserIds = blockedMe.map((b) => b.blocker_id);

      const all = await base44.entities.Profile.list('-created_date', 50);
      const filtered = all.filter(
        (p) =>
          p.id !== profile.id &&
          !likedIds.includes(p.id) &&
          !blockedByMeIds.includes(p.id) &&
          !blockedMeUserIds.includes(p.created_by_id) &&
          p.is_active &&
          p.is_onboarded
      );
      // Smart matchmaking: sort by compatibility score (shared interests, distance, preferences)
      setProfiles(sortByCompatibility(filtered, profile));
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
    setLastSwiped(current);
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
          const newMatch = await base44.entities.Match.create({
            user_a: profile.created_by_id,
            user_b: current.id,
            status: 'active',
          });
          await base44.entities.Notification.create({
            user_id: current.created_by_id,
            type: 'match',
            title: `It's a match with ${profile.full_name}!`,
            body: `You and ${profile.full_name} liked each other. Say hello!`,
            match_id: newMatch.id,
            related_profile_id: profile.id,
            is_read: false,
          });
          await base44.entities.Notification.create({
            user_id: profile.created_by_id,
            type: 'match',
            title: `It's a match with ${current.full_name}!`,
            body: `You and ${current.full_name} liked each other. Say hello!`,
            match_id: newMatch.id,
            related_profile_id: current.id,
            is_read: true,
          });
          setMatch(current);
          try {
            const meScore = Math.min(90, (profile.trust_score || 50) + 2);
            const themScore = Math.min(90, (current.trust_score || 50) + 2);
            await base44.entities.Profile.update(profile.id, { trust_score: meScore });
            await base44.entities.Profile.update(current.id, { trust_score: themScore });
          } catch (e) {}
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

  const handleSuperLike = async () => {
    if (profiles.length === 0) return;
    if (!profile?.is_premium && (profile?.super_likes_remaining || 0) <= 0) return;
    const current = profiles[0];
    setLastSwiped(null);
    setSwipeDirection('up');

    try {
      await base44.entities.Like.create({
        liker_id: profile.created_by_id,
        liked_id: current.id,
        action: 'superlike',
      });

      if (!profile?.is_premium) {
        const updated = await base44.entities.Profile.update(profile.id, {
          super_likes_remaining: Math.max(0, (profile.super_likes_remaining || 5) - 1),
        });
        setProfile(updated);
      }

      const mutual = await base44.entities.Like.filter({
        liker_id: current.id,
        liked_id: profile.created_by_id,
        action: 'like',
      });
      const superMutual = await base44.entities.Like.filter({
        liker_id: current.id,
        liked_id: profile.created_by_id,
        action: 'superlike',
      });
      if (mutual.length > 0 || superMutual.length > 0) {
        const newMatch = await base44.entities.Match.create({
          user_a: profile.created_by_id,
          user_b: current.id,
          status: 'active',
        });
        await base44.entities.Notification.create({
          user_id: current.created_by_id,
          type: 'match',
          title: `It's a match with ${profile.full_name}!`,
          body: `${profile.full_name} super-liked you! Say hello!`,
          match_id: newMatch.id,
          related_profile_id: profile.id,
          is_read: false,
        });
        await base44.entities.Notification.create({
          user_id: profile.created_by_id,
          type: 'match',
          title: `It's a match with ${current.full_name}!`,
          body: `You and ${current.full_name} liked each other. Say hello!`,
          match_id: newMatch.id,
          related_profile_id: current.id,
          is_read: true,
        });
        setMatch(current);
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setProfiles((p) => p.slice(1));
      setSwipeDirection(null);
    }, 300);
  };

  const handleRewind = async () => {
    if (!lastSwiped) return;
    try {
      const likes = await base44.entities.Like.filter({
        liker_id: profile.created_by_id,
        liked_id: lastSwiped.id,
      });
      if (likes[0]) {
        await base44.entities.Like.delete(likes[0].id);
      }
    } catch (err) {
      console.error(err);
    }
    setProfiles((p) => [lastSwiped, ...p]);
    setLastSwiped(null);
  };

  const handleBoost = async () => {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 30);
    try {
      const updated = await base44.entities.Profile.update(profile.id, {
        boosted_until: expires.toISOString(),
      });
      setProfile(updated);
      setBoostActive(true);
      setTimeout(() => setBoostActive(false), 30 * 60 * 1000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  // Gate: require verification + emergency contact before accessing the feed
  const needsChecklist = !profile?.is_verified || !checklistComplete;
  if (needsChecklist) {
    return (
      <OnboardingChecklist
        profile={profile}
        setProfile={setProfile}
        onComplete={() => setChecklistComplete(true)}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col max-w-lg mx-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Heart className="text-primary-foreground fill-primary-foreground" size={16} />
              </div>
              <h1 className="font-heading font-bold text-xl">Discover</h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell profile={profile} />
              <Link to="/liked-you" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition relative" title="Likes You">
                <Heart size={18} />
                {!profile?.is_premium && (
                  <Lock size={10} className="absolute -bottom-0.5 -right-0.5 text-gold bg-card rounded-full p-0.5 w-3.5 h-3.5" />
                )}
              </Link>
              <button onClick={() => setShowPassport(true)} className={`w-9 h-9 rounded-full bg-card border flex items-center justify-center transition ${profile?.passport_location ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`} title="Passport">
                <Plane size={18} />
              </button>
              <button onClick={() => setShowFilters(!showFilters)} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username (@handle)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-input bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['nearby', 'age', 'interests'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition ${
                  tab === t ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Top Picks */}
        <div className="px-6">
          <TopPicks profile={profile} />
        </div>

        {/* Boost banner */}
        {profile?.is_premium && !boostActive && (
          <div className="px-6 mb-2">
            <button
              onClick={handleBoost}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold hover:bg-gold/20 transition"
            >
              <Zap size={14} /> Boost my profile — be seen by more people (30 min)
            </button>
          </div>
        )}
        {boostActive && (
          <div className="px-6 mb-2">
            <div className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-semibold">
              <Zap size={14} className="animate-pulse" /> Profile boosted — you're being seen first!
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="flex-1 px-6 py-4">
          {profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Heart className="text-muted-foreground" size={36} />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">No more profiles</h3>
              <p className="text-muted-foreground mb-6 max-w-xs">
                You've seen everyone for now. Check back later or adjust your filters.
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
                  onReport={setReportTarget}
                  onBlock={setBlockTarget}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {profiles.length > 0 && (
          <div className="flex items-center justify-center gap-4 pb-24 md:pb-8">
            {profile?.is_premium ? (
              <button
                onClick={handleRewind}
                disabled={!lastSwiped}
                className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-lg hover:border-primary hover:text-primary transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Rewind last swipe"
              >
                <Undo2 size={22} />
              </button>
            ) : (
              <Link
                to="/premium"
                className="relative w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-lg hover:border-gold hover:text-gold transition-all hover:scale-105"
                title="Premium feature: Rewind"
              >
                <Undo2 size={22} />
                <Lock size={10} className="absolute -bottom-0.5 -right-0.5 text-gold bg-card rounded-full p-0.5 w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-lg hover:border-destructive hover:text-destructive transition-all hover:scale-105"
            >
              <X size={28} />
            </button>
            <button
              onClick={handleSuperLike}
              disabled={!profile?.is_premium && (profile?.super_likes_remaining || 0) <= 0}
              className="relative w-12 h-12 rounded-full bg-card border-2 border-gold flex items-center justify-center shadow-lg hover:scale-110 transition-all text-gold disabled:opacity-40"
              title={profile?.is_premium ? 'Super Like' : `${profile?.super_likes_remaining || 0} Super Likes left`}
            >
              <Star size={24} className="fill-current" />
              {!profile?.is_premium && (profile?.super_likes_remaining || 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-background text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {profile?.super_likes_remaining || 0}
                </span>
              )}
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

      {/* Filters overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center animate-fade-in" onClick={() => setShowFilters(false)}>
          <div className="bg-card rounded-t-3xl md:rounded-3xl border border-border max-w-md w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">✕</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Distance: 10 km</label>
                <input type="range" min="1" max="50" defaultValue="10" className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Age range: {ageMin} – {ageMax}</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="18" max="60" value={ageMin}
                    onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax))}
                    className="flex-1 accent-primary" />
                  <input type="range" min="18" max="99" value={ageMax}
                    onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin))}
                    className="flex-1 accent-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {['Travel', 'Music', 'Coffee', 'Fitness', 'Hiking', 'Movies', 'Food', 'Books'].map((i) => (
                    <button key={i} className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-secondary/50 text-muted-foreground hover:border-primary hover:text-foreground transition">
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Looking for</p>
                <div className="space-y-2">
                  {['Serious Relationship', 'Something Casual', 'New Friends'].map((o, i) => (
                    <button key={o} className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition ${i === 0 ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-secondary/50 text-muted-foreground'}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verified only</span>
                <div className="w-10 h-5 rounded-full bg-primary relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-background" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowFilters(false)} className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                Apply Filters
              </button>
              <button className="px-5 py-3 rounded-full text-muted-foreground text-sm font-medium">Reset</button>
            </div>
          </div>
        </div>
      )}

      <MatchCelebration match={match} onClose={() => setMatch(null)} />
      <ReportModal
        reportedProfile={reportTarget}
        reporterId={profile?.created_by_id}
        onClose={() => setReportTarget(null)}
      />
      <BlockModal
        blockedProfile={blockTarget}
        blockerId={profile?.created_by_id}
        onClose={() => setBlockTarget(null)}
        onBlocked={loadProfiles}
      />
      {showPassport && (
        <PassportModal
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowPassport(false)}
        />
      )}
    </>
  );
}