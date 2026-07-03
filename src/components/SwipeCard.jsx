import { BadgeCheck, MapPin, Flag, Ban, ShieldCheck } from 'lucide-react';
import TrustScoreBadge from './TrustScoreBadge';
import VerifiedBadge from './VerifiedBadge';
import SafetyCheckBanner from './SafetyCheckBanner';

export default function SwipeCard({ profile, isTop, swipeDirection, onReport, onBlock }) {
  if (!profile) return null;

  const photo = profile.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800`;

  return (
    <div
      className={`absolute inset-0 transition-all duration-300 ease-out ${
        swipeDirection === 'right'
          ? 'translate-x-[120%] rotate-12 opacity-0'
          : swipeDirection === 'left'
          ? '-translate-x-[120%] -rotate-12 opacity-0'
          : ''
      }`}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-card border border-border">
        <img src={photo} alt={profile.full_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

        {/* Top badges */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1 bg-teal/90 text-background px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-background animate-pulse" />
            Online
          </span>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
          {profile.is_verified && (
            <div className="flex items-center gap-1 bg-gold/90 text-background px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-lg backdrop-blur-md">
              <BadgeCheck size={12} /> Verified
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 p-5 text-white">
          {/* Safety check banner (private, non-identifying) */}
          <SafetyCheckBanner subjectName={profile.full_name} />

          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold">{profile.full_name}, {profile.age}</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onReport?.(profile); }}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-destructive/80 transition"
                title="Report user"
              >
                <Flag size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onBlock?.(profile); }}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-destructive/80 transition"
                title="Block user"
              >
                <Ban size={14} />
              </button>
            </div>
          </div>

          {profile.location && (
            <p className="flex items-center gap-1 text-sm text-white/70 mb-2">
              <MapPin size={12} className="text-teal" /> {profile.location} · 2 km away
            </p>
          )}

          <div className="flex items-center gap-2 mb-2">
            <TrustScoreBadge profile={profile} size="sm" />
            {profile.is_verified && (
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
                <ShieldCheck size={11} /> Identity Verified
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-white/80 mb-3 line-clamp-2">{profile.bio}</p>
          )}

          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.interests?.slice(0, 4).map((interest) => (
                <span key={interest} className="bg-white/15 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium border border-white/10">
                  {interest}
                </span>
              ))}
              {profile.interests?.length > 4 && (
                <span className="bg-white/10 text-white/80 px-2.5 py-1 rounded-full text-xs font-medium">
                  +{profile.interests.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}