import { Heart, X, MapPin, BadgeCheck } from 'lucide-react';

export default function SwipeCard({ profile, onSwipe, isTop, swipeDirection }) {
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
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-card">
        <img src={photo} alt={profile.full_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {profile.is_verified && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-accent/90 text-accent-foreground px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg">
            <BadgeCheck size={14} />
            Verified
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
          {profile.interests?.slice(0, 3).map((interest) => (
            <span key={interest} className="bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium">
              {interest}
            </span>
          ))}
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 text-white">
          <h2 className="text-2xl font-heading font-bold">
            {profile.full_name}, {profile.age}
          </h2>
          {profile.location && (
            <p className="flex items-center gap-1 text-sm text-white/80 mt-1">
              <MapPin size={14} /> {profile.location}
            </p>
          )}
          <p className="text-sm text-white/90 mt-2 line-clamp-3">{profile.bio}</p>
        </div>
      </div>
    </div>
  );
}