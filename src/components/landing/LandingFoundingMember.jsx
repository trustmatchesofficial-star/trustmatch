import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Crown, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingFoundingMember() {
  const [claimed, setClaimed] = useState(null);

  useEffect(() => {
    base44.entities.Profile.filter({ is_founding_member: true })
      .then((founders) => setClaimed(founders.length))
      .catch(() => setClaimed(null));
  }, []);

  const total = 100;
  const remaining = claimed !== null ? Math.max(0, total - claimed) : null;
  const pct = claimed !== null ? Math.min(100, (claimed / total) * 100) : 0;

  return (
    <section className="px-6 py-10 md:py-14 bg-background">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl border border-primary/30 p-8 md:p-12"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 20% 50%, hsl(344 84% 16%) 0%, hsl(245 6% 9%) 70%)' }}
        >
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Crown icon */}
            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Crown size={32} className="text-primary fill-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Sparkles size={12} />
                Limited Time · Founding Member Program
              </div>

              <h2 className="font-heading font-extrabold text-2xl md:text-4xl text-foreground tracking-tight mb-3">
                Be One of Our First 100 Founding Members
              </h2>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mb-5">
                Join now and get a full year of TrustMatch Premium free — unlimited likes, see who liked you, read receipts, and more. Plus a permanent Founding Member badge on your profile. Limited to the first 100 members.
              </p>

              {/* Live counter */}
              <div className="mb-6">
                {claimed !== null ? (
                  <>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <span className="text-sm font-semibold text-foreground">
                        {claimed} of {total} spots claimed
                      </span>
                      {remaining <= 63 && remaining > 0 && (
                        <span className="text-xs text-primary font-medium">· Only {remaining} left</span>
                      )}
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden max-w-md mx-auto md:mx-0">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground">Limited to the first 100 members</p>
                )}
              </div>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Claim Your Spot <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}