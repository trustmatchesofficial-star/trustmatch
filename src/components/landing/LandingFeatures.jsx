import { ShieldCheck, Lock, Eye, MapPin } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Verified, Not Guessing', desc: 'Real ID checks, so who you match with is who you meet.' },
  { icon: Eye, title: 'Quietly Watching Your Back', desc: 'Our Safety Center and moderated alerts flag risk without turning into a public pile-on.' },
  { icon: MapPin, title: 'Date Safety Tracker', desc: 'Share your plans with someone you trust, one tap.' },
  { icon: Lock, title: 'Private & Secure Messaging', desc: 'Your conversations stay yours.' },
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