import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const freeFeatures = [
  'Create your verified profile',
  'Unlimited swiping & matches',
  'Direct messaging with matches',
  'Date Safety Tracker & SOS',
  'Block, report & privacy controls',
];

const premiumFeatures = [
  'Everything in Free',
  'See who liked you',
  '5 Super Likes per day',
  'Unlimited Rewinds',
  'Monthly profile Boost (30 min)',
  'Passport — match anywhere in the world',
  'Advanced filters & Top Picks',
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground text-balance">
            Safety is always free. Premium is optional.
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm md:text-base">
            Every safety feature is free for everyone. Upgrade to Premium for extra perks that help you connect faster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free plan */}
          <div className="bg-card rounded-3xl border border-border p-8 flex flex-col">
            <h3 className="font-heading font-bold text-xl text-foreground mb-1">Free</h3>
            <p className="text-sm text-muted-foreground mb-6">Everything you need to date safely.</p>
            <p className="text-4xl font-heading font-extrabold text-foreground mb-6">£0</p>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <Check size={18} className="text-teal shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 border border-border bg-secondary/50 text-foreground px-6 py-3.5 rounded-full font-semibold text-sm hover:bg-secondary transition"
            >
              Join Free <ArrowRight size={16} />
            </Link>
          </div>

          {/* Premium plan */}
          <div className="relative bg-gradient-to-b from-primary/10 to-card rounded-3xl border border-primary/30 p-8 flex flex-col shadow-xl shadow-primary/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold">
              <Sparkles size={12} /> Popular
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground mb-1">Premium</h3>
            <p className="text-sm text-muted-foreground mb-6">Supercharge your matching experience.</p>
            <div className="flex items-baseline gap-1 mb-6">
              <p className="text-4xl font-heading font-extrabold text-foreground">£9.99</p>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <Check size={18} className="text-primary shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-full font-bold text-sm hover:scale-[1.02] transition shadow-lg shadow-primary/30"
            >
              Start Free, Upgrade Anytime <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}