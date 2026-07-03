import { ShieldCheck, Lock, Users, Star } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Verified Identities', desc: 'Secure verification for genuine profiles.' },
  { icon: Lock, title: 'Privacy First', desc: 'Your data. Your control. Always.' },
  { icon: Users, title: 'Date Safety Mode', desc: 'Pre-meet safety tools & trusted contacts.' },
  { icon: Star, title: 'Shared Experiences', desc: 'Events, hobbies & interests to help you connect.' },
];

export default function LandingFeatures() {
  return (
    <section id="about" className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card rounded-3xl border border-border p-8 md:p-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1.5 text-sm tracking-wide uppercase">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}