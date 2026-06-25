import { Shield, MapPin, Clock, Phone, Mic } from 'lucide-react';

export default function DateSafetyModeModal({ otherName, onActivate, onClose }) {
  const features = [
    { icon: MapPin, text: 'Mutual location sharing during the date' },
    { icon: Clock, text: 'Safety check-ins at set intervals' },
    { icon: Phone, text: 'Emergency contact support' },
    { icon: Mic, text: 'Audio safety features (if enabled in your settings)' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-card rounded-3xl border border-border max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center">
              <Shield className="text-teal" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Going on a date?</h2>
              <p className="text-sm text-muted-foreground">with {otherName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition">
            ✕
          </button>
        </div>

        <p className="text-sm text-foreground/90 mb-4">
          Would you like to activate <span className="font-semibold">Date Safety Mode</span> for this meetup?
        </p>

        <div className="bg-secondary/50 rounded-2xl p-4 mb-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Date Safety Mode includes:
          </p>
          <div className="space-y-2.5">
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-teal/15 flex items-center justify-center shrink-0">
                  <Icon className="text-teal" size={14} />
                </div>
                <span className="text-sm text-foreground/90">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onActivate}
            className="w-full py-3 rounded-full bg-teal text-background font-semibold text-sm hover:bg-teal/90 transition"
          >
            Activate Date Safety Mode
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-transparent text-muted-foreground font-medium text-sm hover:text-foreground transition"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}