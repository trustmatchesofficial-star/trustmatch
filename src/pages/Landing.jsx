import { Link, Navigate } from 'react-router-dom';
import { Heart, Shield, Sparkles, ArrowRight, BadgeCheck, Lock } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=1600&q=80"
            alt="Couple in love"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md border border-accent/30 px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} className="text-accent" />
              <span className="text-accent-foreground text-sm font-medium">Where trust meets love</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white text-balance leading-tight">
              Find a connection built on <span className="text-accent">trust</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mt-6 max-w-xl text-balance">
              Trust Matches is a relationship platform focused on authenticity, safety, and meaningful connections. Meet real people, verified and genuine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent/90 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Why Trust Matches?
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              We believe meaningful connections start with authenticity and safety.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BadgeCheck, title: 'Verified Profiles', desc: 'Every member can verify their identity with our trust badge system. Know who you\'re connecting with.' },
              { icon: Shield, title: 'Safe & Secure', desc: 'Report and block tools, proactive moderation, and a community built on respect and safety.' },
              { icon: Heart, title: 'Meaningful Matches', desc: 'Our matching system connects you with people who share your values, interests, and relationship goals.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-3xl p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="text-primary" size={28} />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Banner */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto bg-primary rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <Lock className="absolute top-8 right-8 text-primary-foreground" size={120} />
          </div>
          <div className="relative z-10 p-10 md:p-16 text-center">
            <Shield className="text-accent mx-auto mb-6" size={48} />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
              Your safety is our priority
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              From identity verification to 24/7 moderation, we've built Trust Matches to be a space where you can focus on finding the right person — safely.
            </p>
          </div>
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
            <Heart className="text-primary fill-primary" size={24} />
            <span className="font-heading font-bold text-lg">Trust Matches</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Trust Matches. Built on trust, powered by connection.</p>
        </div>
      </footer>
    </div>
  );
}