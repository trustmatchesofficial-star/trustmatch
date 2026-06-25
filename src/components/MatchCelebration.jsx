import { useEffect } from 'react';
import { Heart, X } from 'lucide-react';

export default function MatchCelebration({ match, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!match) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Heart
            key={i}
            size={20 + Math.random() * 30}
            className="absolute text-primary fill-primary"
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
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
          <Heart className="relative w-20 h-20 text-primary mx-auto fill-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
          It's a Match!
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          You and {match.full_name} liked each other
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary/80 transition-colors"
          >
            <X size={18} /> Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}