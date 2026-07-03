import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div>
          <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-3 py-1 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Now welcoming beta members</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold leading-[1.05] mb-4 text-balance">
            <span className="text-foreground">Trust</span>
            <br />
            <span className="text-primary">Matches</span>
          </h1>

          <p className="text-sm md:text-base font-semibold tracking-wider uppercase mb-4 text-muted-foreground">
            Real people. Real connections. Built on <span className="text-primary">trust.</span>
          </p>

          <p className="text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
            A dating platform designed for people who value{' '}
            <span className="font-semibold text-primary">authenticity</span>,{' '}
            <span className="font-semibold text-primary">safety</span>, and{' '}
            <span className="font-semibold text-primary">meaningful</span> relationships.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Join Free <ArrowRight size={18} />
            </Link>
            <a
              href="#safety"
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-7 py-3.5 rounded-full font-semibold hover:bg-secondary transition"
            >
              Learn About Safety
            </a>
          </div>
        </div>

        {/* Right: Image with glassmorphism card */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=900&fit=crop"
              alt="A couple touching foreheads under warm light"
              className="w-full h-[420px] md:h-[520px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </div>

          {/* Glassmorphism card */}
          <div className="absolute bottom-5 right-5 bg-card/70 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-xl max-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <ShieldCheck size={18} className="text-primary" />
              </div>
              <span className="font-bold text-sm text-foreground tracking-wide">VERIFIED PROFILES</span>
            </div>
            <p className="text-xs text-muted-foreground">Real people. Genuine connections.</p>
          </div>
        </div>
      </div>
    </section>
  );
}