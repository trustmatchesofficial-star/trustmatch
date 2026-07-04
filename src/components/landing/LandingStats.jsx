import { Users, Heart, ShieldCheck, Star } from 'lucide-react';

const stats = [
  { icon: Users, value: '12,000+', label: 'Verified members' },
  { icon: Heart, value: '8,500+', label: 'Matches made' },
  { icon: ShieldCheck, value: '100%', label: 'ID-verified profiles' },
  { icon: Star, value: '4.8', label: 'Average app rating' },
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
              <p className="text-2xl md:text-3xl font-heading font-extrabold text-foreground mb-1">{value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}