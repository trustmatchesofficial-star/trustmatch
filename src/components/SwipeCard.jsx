import { BadgeCheck, MapPin, ShieldCheck, Camera, Flag } from 'lucide-react';

export default function SwipeCard({ profile, isTop, swipeDirection, onReport }) {
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

        <div className="absolute top-4 right-4 flex flex-col gap-1.5">
          {profile.is_verified && (
            <div className="flex items-center gap-1 bg-gold/90 text-background px-2 py-1 rounded-full text-[10px] font-semibold shadow-lg">
              <BadgeCheck size={12} /> Verified
            </div>
          )}
          {profile.is_verified && (
            <div className="flex items-center gap-1 bg-teal/90 text-background px-2 py-1 rounded-full text-[10px] font-semibold shadow-lg">
              <ShieldCheck size={12} /> Trusted
            </div>
          )}
          {profile.is_verified && (
            <div className="flex items-center gap-1 bg-purplecustom/90 text-white px-2 py-1 rounded-full text-[10px] font-semibold shadow-lg">
              <Camera size={12} /> Photo Verified
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{profile.full_name}, {profile.age}</h2>
            <button
              onClick={(e) => { e.stopPropagation(); onReport?.(profile); }}
              className="text-white/60 hover:text-destructive transition"
              title="Report user"
            >
              <Flag size={16} />
            </button>
          </div>

          {profile.location && (
            <p className="flex items-center gap-1 text-sm text-white/70 mb-2">
              <MapPin size={12} className="text-teal" /> {profile.location} · 2 km away
            </p>
          )}

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