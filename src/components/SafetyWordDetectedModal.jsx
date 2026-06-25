import { useState, useEffect } from 'react';
import { AlertTriangle, Phone, ShieldCheck } from 'lucide-react';

export default function SafetyWordDetectedModal({ emergencyContact, onHelp, onSafe, onClose }) {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (seconds / 60) * circumference;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-card rounded-3xl border border-border max-w-sm w-full p-8 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="text-gold" size={32} />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">Safety word detected</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          We heard your safety phrase. Are you okay? Your emergency contact will be alerted if you don't respond.
        </p>

        {/* Timer */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke="hsl(var(--primary))" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{seconds}s</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onHelp}
            className="w-full py-3 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition flex items-center justify-center gap-2"
          >
            <Phone size={16} /> I need help — alert my contact
          </button>
          <button
            onClick={onSafe}
            className="w-full py-3 rounded-full bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition"
          >
            I'm safe — false alarm
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-5">
          Your emergency contact: <span className="font-semibold text-foreground">{emergencyContact || 'Not set'}</span>
        </p>
      </div>
    </div>
  );
}