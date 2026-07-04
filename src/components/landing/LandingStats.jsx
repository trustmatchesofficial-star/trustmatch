import { BadgeCheck, ShieldCheck, Camera, Eye } from 'lucide-react';

const stats = [
  { icon: BadgeCheck, value: 'ID-Checked', label: 'Every profile goes through identity verification' },
  { icon: Camera, value: 'Selfie + Liveness', label: 'Live checks confirm real people, not stolen photos' },
  { icon: ShieldCheck, value: 'Safety First', label: 'Date tracking, SOS, and community alerts built in' },
  { icon: Eye, value: 'Scam Aware', label: 'Tools to help you spot catfish and red flags' },
];

export default function LandingStats() {
  return (
    <section className="py-16 px-6 bg-card/40 border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon size={22} className="text-primary" />
              </div>
              <p className="text-lg md:text-xl font-heading font-bold text-foreground mb-1">{value}</p>
              <p className="text-xs md:text-sm text-muted-foreground leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}