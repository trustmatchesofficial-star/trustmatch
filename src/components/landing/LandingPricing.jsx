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

const premiumPlans = [
  { id: 'monthly', name: 'Monthly', price: '£9.99', period: '/month', badge: null },
  { id: 'quarterly', name: 'Quarterly', price: '£44.99', period: '/3 months', badge: null, save: 'Save 25%' },
  { id: 'annual', name: 'Annual', price: '£119.99', period: '/year', badge: 'Best Value', save: 'Save 50%' },
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

        <div className="grid md:grid-cols-2 gap-6 mb-6">
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

          {/* Premium plans */}
          <div className="relative bg-gradient-to-b from-primary/10 to-card rounded-3xl border border-primary/30 p-8 flex flex-col shadow-xl shadow-primary/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold">
              <Sparkles size={12} /> Popular
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground mb-1">Premium</h3>
            <p className="text-sm text-muted-foreground mb-6">Supercharge your matching experience.</p>

            {/* Plan options */}
            <div className="space-y-2.5 mb-6">
              {premiumPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex items-center justify-between rounded-xl border p-3.5 ${
                    plan.id === 'annual'
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-secondary/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{plan.name}</span>
                      {plan.badge && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{plan.badge}</span>
                      )}
                      {plan.save && (
                        <span className="text-[10px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded-full">{plan.save}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-heading font-extrabold text-lg text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
              ))}
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

        <p className="text-center text-xs text-muted-foreground">
          All safety features — verification, date tracking, SOS, check-ins — are free, always.
        </p>
      </div>
    </section>
  );
}