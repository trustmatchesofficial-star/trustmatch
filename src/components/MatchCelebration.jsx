import { useEffect } from 'react';
import { Heart, X } from 'lucide-react';

export default function MatchCelebration({ match, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!match) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-primary/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Heart
            key={i}
            size={20 + Math.random() * 30}
            className="absolute text-accent animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6">
        <Heart className="w-20 h-20 text-accent mx-auto mb-6 fill-accent animate-pulse" />
        <h1 className="text-4xl font-heading font-bold text-primary-foreground mb-2">
          It's a Match!
        </h1>
        <p className="text-primary-foreground/80 text-lg mb-8">
          You and {match.full_name} liked each other
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-white/10 text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-colors"
          >
            <X size={18} /> Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}