import { useState, useEffect } from 'react';
import { BadgeCheck, ShieldCheck, Users, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LandingStats() {
  const [verifiedCount, setVerifiedCount] = useState(null);
  const [memberCount, setMemberCount] = useState(null);

  useEffect(() => {
    base44.entities.Profile.filter({ is_verified: true }, null, 10000)
      .then((rows) => setVerifiedCount(rows.length))
      .catch(() => setVerifiedCount(null));
    base44.entities.Profile.filter({ is_active: true }, null, 10000)
      .then((rows) => setMemberCount(rows.length))
      .catch(() => setMemberCount(null));
  }, []);

  const stats = [
    {
      icon: BadgeCheck,
      value: verifiedCount !== null ? verifiedCount.toString() : '—',
      label: 'Verified identities',
    },
    {
      icon: Users,
      value: memberCount !== null ? memberCount.toString() : '—',
      label: 'Active members',
    },
    {
      icon: ShieldCheck,
      value: '100%',
      label: 'Safety features free, always',
    },
    {
      icon: Heart,
      value: 'GDPR',
      label: 'Privacy-compliant & encrypted',
    },
  ];

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
              <p className="text-xs md:text-sm text-muted-foreground leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}