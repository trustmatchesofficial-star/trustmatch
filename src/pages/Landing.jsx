import { Link, Navigate } from 'react-router-dom';
import { Heart, Shield, ArrowRight, BadgeCheck, Lock, MapPin, Mic, ShieldCheck, Star } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function Landing() {
  const { user, isLoadingAuth } = useAuth();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (user) {
      base44.entities.Profile.filter({ created_by_id: user.id })
        .then((profiles) => {
          if (profiles[0]?.is_onboarded) setRedirect(true);
        })
        .catch(() => {});
    }
  }, [user]);

  if (redirect) return <Navigate to="/discover" replace />;
  if (user && !isLoadingAuth) return <Navigate to="/onboarding" replace />;

  const features = [
    { icon: BadgeCheck, title: 'Verified Identities', desc: 'Secure verification for genuine profiles. No catfishing, no exceptions.', color: 'text-primary', border: 'border-primary/30' },
    { icon: ShieldCheck, title: 'Safety Hub & Live Tracking', desc: 'Pre-meet safety tools, emergency SOS, and live location sharing with your match.', color: 'text-teal', border: 'border-teal/30' },
    { icon: Star, title: 'Automatic Safety Recording', desc: 'Optional automatic audio recording during dates for your protection (encrypted, you control it).', color: 'text-gold', border: 'border-gold/30' },
    { icon: Lock, title: 'Privacy First', desc: 'Your data. Your control. Always. GDPR-compliant by design.', color: 'text-purplecustom', border: 'border-purplecustom/30' },
  ];

  const steps = [
    { icon: MapPin, title: '1. Choose to Share', desc: 'Turn on live location sharing when you feel comfortable.' },
    { icon: Heart, title: '2. Only Visible to You Both', desc: 'Your live location is only visible to the people on the date.' },
    { icon: Lock, title: "3. You're in Control", desc: 'Turn sharing on or off at any time. No notifications are sent.' },
    { icon: ShieldCheck, title: '4. Private & Secure', desc: 'Your location is encrypted and never shared with anyone else.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=1600&q=80"
            alt="Couple"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Heart className="text-primary-foreground fill-primary-foreground" size={20} />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">Trust Matches</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Real people. Real connections. Built on trust.
            </p>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground text-balance leading-tight mb-6">
              Find a connection built on <span className="text-primary">trust</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl text-balance mb-8">
              Trust Matches is a relationship platform focused on authenticity, safety, and meaningful connections. Meet real people, verified and genuine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-secondary/50 backdrop-blur-md border border-border text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-secondary transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Feature icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {[
                { icon: BadgeCheck, label: 'Verified Profiles' },
                { icon: ShieldCheck, label: 'Trust Badges' },
                { icon: Lock, label: 'Privacy First' },
                { icon: Heart, label: 'Meaningful Matches' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon size={16} className="text-teal shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Trust Matches */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Why Trust Matches?</p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Safety & trust at every step
            </h2>
          </div>
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc, color, border }) => (
              <div key={title} className={`bg-card rounded-2xl p-6 border ${border} flex items-start gap-4 hover:shadow-lg transition-shadow`}>
                <div className={`w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Date Safety Tracker */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Date Safety <span className="text-primary">Tracker</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-2">
              Because your safety should always be <span className="text-primary font-semibold">your choice.</span>
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              The Date Safety Tracker lets you share your live location during a date — if you choose to. You're in control at all times.
            </p>

            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">How it works</p>
            <div className="space-y-4">
              {steps.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative max-w-sm mx-auto">
            <div className="bg-card rounded-[2.5rem] border-4 border-secondary p-3 shadow-2xl">
              <div className="bg-background rounded-[2rem] overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-border">
                  <div>
                    <span className="font-bold text-foreground">Sophie</span>
                    <span className="text-muted-foreground ml-1">27</span>
                    <p className="text-xs text-teal">Active User</p>
                  </div>
                  <span className="text-muted-foreground">✕</span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3 bg-teal/10 rounded-2xl p-3">
                    <ShieldCheck className="text-teal shrink-0 mt-0.5" size={20} />
                    <p className="text-xs text-foreground">Date Safety Mode is active. Basic on-site sharing is only to you both and can be turned off at any time.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-teal shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">You</p>
                      <p className="text-xs text-foreground">Town Centre, Swindon</p>
                      <p className="text-[10px] text-muted-foreground">Updated less than a minute ago</p>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-teal relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-background" />
                    </div>
                  </div>
                  <div className="h-32 rounded-2xl bg-secondary flex items-center justify-center">
                    <MapPin className="text-teal" size={32} />
                  </div>
                  <button className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    Pause or stop sharing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Banner */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto bg-card rounded-3xl border border-teal/30 p-8 text-center">
          <Shield className="text-teal mx-auto mb-4" size={40} />
          <h3 className="text-xl font-heading font-bold text-teal mb-2">Safety features are always free</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reporting, blocking, profile verification, Date Safety Mode, emergency contacts, safety check-ins, safety phrases, and emergency support are free for every user — no subscription needed.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6 text-balance">
            Ready to find your match?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join Trust Matches today. It's free to sign up and start discovering meaningful connections.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-xl"
          >
            Create Your Free Profile
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="text-primary fill-primary" size={20} />
            <span className="font-heading font-bold">Trust Matches</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Trust Matches. Built for real connections. Designed for your safety.</p>
        </div>
      </footer>
    </div>
  );
}