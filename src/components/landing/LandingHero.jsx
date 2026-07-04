import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Heart, Lock, Eye, MapPin } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Verified, Not Guessing', desc: 'Real ID checks, so who you match with is who you meet.' },
  { icon: Eye, title: 'Quietly Watching Your Back', desc: 'Our Safety Center and moderated alerts flag risk without turning into a public pile-on.' },
  { icon: MapPin, title: 'Date Safety Tracker', desc: 'Share your plans with someone you trust, one tap.' },
  { icon: Lock, title: 'Private & Secure Messaging', desc: 'Your conversations stay yours.' },
];

export default function LandingHero() {
  return (
    <section
      id="about"
      className="relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(344 84% 20%) 0%, hsl(245 6% 7%) 70%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-8 md:pt-24 md:pb-12">
        {/* Top: Branding + Title */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Heart className="text-primary fill-primary" size={22} />
            </div>
            <span className="font-heading font-extrabold text-2xl md:text-3xl text-foreground tracking-tight">Trust Matches</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-foreground tracking-tight mb-5">
            Meet People You Can Actually Trust
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Every profile verified. Every date, a little safer. TrustMatch is dating that feels good and has your back.
          </p>

          <p className="text-sm md:text-base text-foreground/70 leading-relaxed max-w-xl mx-auto mt-3 italic">
            Know who you're really talking to before you meet, pay, or trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Join Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/safety-center"
              className="inline-flex items-center justify-center gap-2 border border-border bg-card/50 backdrop-blur-sm text-foreground px-8 py-4 rounded-full font-semibold hover:bg-secondary transition"
            >
              See How Safety Works
            </Link>
          </div>
        </div>

        {/* Middle: Image with neon heart glow */}
        <div className="relative max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-border">
            <img
              src="https://images.unsplash.com/photo-1529636798458-92182e662485?w=1000&h=700&fit=crop"
              alt="A couple smiling at each other"
              className="w-full h-[360px] md:h-[560px] object-cover"
            />
            {/* Neon heart glow overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 40%, rgba(214,51,108,0.25) 0%, transparent 50%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
          </div>

          {/* Glassmorphism floating card */}
          <div className="absolute bottom-6 right-4 md:right-8 bg-card/70 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-xl max-w-[240px]">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Heart size={22} className="text-primary fill-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground tracking-wide">REAL CONNECTIONS</p>
                <p className="text-xs text-muted-foreground">Genuine moments, backed by trust.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="bg-card/60 backdrop-blur-sm rounded-3xl border border-border p-6 md:p-8 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
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

        {/* CTA bar */}
        <div className="rounded-3xl bg-gradient-to-r from-primary to-primary/80 px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shadow-primary/20">
          <div className="flex items-center gap-2.5 text-primary-foreground">
            <ShieldCheck size={24} />
            <span className="font-semibold text-sm md:text-base">Your safety. Your trust. Your match.</span>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground">
            <span className="text-sm hidden sm:inline">Join the future of dating.</span>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 bg-primary-foreground text-primary px-7 py-3 rounded-full font-bold text-sm hover:scale-105 transition shadow-lg whitespace-nowrap"
            >
              Join Trust Matches. <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}