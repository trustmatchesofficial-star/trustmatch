import { Link } from 'react-router-dom';
import { Heart, Smartphone, ArrowRight } from 'lucide-react';

export default function LandingDownloadCTA() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/20 via-card to-card border border-border p-8 md:p-14">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Heart className="text-primary fill-primary" size={20} />
                </div>
                <span className="font-heading font-extrabold text-xl text-foreground">Trust Matches</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight mb-4">
                Find your person — safely.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md text-sm md:text-base">
                Download Trust Matches and start connecting with verified, real people today. Safety is built in, always.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 py-3.5 rounded-2xl font-semibold text-sm hover:opacity-90 transition"
                >
                  <Smartphone size={22} />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] opacity-70">Download on the</p>
                    <p className="text-sm font-bold">App Store</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 py-3.5 rounded-2xl font-semibold text-sm hover:opacity-90 transition"
                >
                  <Smartphone size={22} />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] opacity-70">Get it on</p>
                    <p className="text-sm font-bold">Google Play</p>
                  </div>
                </a>
              </div>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-bold text-sm hover:scale-[1.02] transition shadow-lg shadow-primary/30"
              >
                Or join free online <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative hidden md:block">
              <div className="relative mx-auto max-w-[260px]">
                <div className="rounded-[2.5rem] border-[6px] border-foreground/10 bg-card overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1529636798458-92182e662485?w=500&h=900&fit=crop"
                    alt="Trust Matches app preview"
                    className="w-full h-[440px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-6 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal/15 flex items-center justify-center">
                      <Heart size={16} className="text-teal fill-teal" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">It's a Match!</p>
                      <p className="text-[10px] text-muted-foreground">You both liked each other</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}