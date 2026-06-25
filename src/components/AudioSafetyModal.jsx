import { Mic, ShieldCheck } from 'lucide-react';

const POINTS = [
  'Recordings are encrypted and stored for 7 days only.',
  'Only you can access them — never Trust Matches staff.',
  'Deletable at any time from Settings.',
  'Shareable with police only at your request.',
  'Both parties are informed this feature exists.',
];

export default function AudioSafetyModal({ onActivate, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-card rounded-3xl border border-border max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Mic className="text-gold" size={20} />
          </div>
          <h2 className="text-lg font-bold text-foreground">Audio Safety Feature</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Audio recording <span className="font-semibold text-foreground">may occur during active Date Safety Mode</span> according to your selected preferences. Please review how recordings are stored, used, and deleted.
        </p>

        <div className="border border-gold/30 rounded-2xl p-4 mb-5 bg-gold/5 space-y-2.5">
          {POINTS.map((point, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-gold shrink-0 mt-0.5" />
              <span className="text-xs text-foreground/80">{point}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button
            onClick={onActivate}
            className="w-full py-3 rounded-full bg-teal text-background font-semibold text-sm hover:bg-teal/90 transition"
          >
            I understand — Activate
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-transparent border border-border text-muted-foreground font-medium text-sm hover:text-foreground transition"
          >
            Review settings first
          </button>
        </div>
      </div>
    </div>
  );
}