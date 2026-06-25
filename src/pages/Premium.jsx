import { useOutletContext, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useState } from 'react';
import { Crown, Check, Sparkles, Heart, Eye, SlidersHorizontal, TrendingUp, Coins } from 'lucide-react';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$19.99',
    period: '/month',
    color: 'border-border',
    badge: null,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: '$44.99',
    period: '/3 months',
    color: 'border-accent',
    badge: 'Most Popular',
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$119.99',
    period: '/year',
    color: 'border-border',
    badge: 'Best Value',
  },
];

const FEATURES = [
  { icon: Heart, title: 'Unlimited Likes', desc: 'Like as many profiles as you want — no daily limits.' },
  { icon: Eye, title: 'See Who Liked You', desc: 'Skip the guesswork and see who\'s interested in you.' },
  { icon: SlidersHorizontal, title: 'Advanced Filters', desc: 'Filter by interests, education, lifestyle, and more.' },
  { icon: TrendingUp, title: 'Profile Boost', desc: 'Get boosted to the top of discovery for 30 minutes.' },
];

export default function Premium() {
  const { profile, setProfile } = useOutletContext();
  const navigate = useNavigate();
  const [subscribing, setSubscribing] = useState(null);

  const handleSubscribe = async (planId) => {
    setSubscribing(planId);
    try {
      const expires = new Date();
      if (planId === 'monthly') expires.setMonth(expires.getMonth() + 1);
      else if (planId === 'quarterly') expires.setMonth(expires.getMonth() + 3);
      else expires.setFullYear(expires.getFullYear() + 1);

      await base44.entities.Subscription.create({
        user_id: profile.created_by_id,
        plan: planId,
        credits_remaining: 5,
        expires_at: expires.toISOString(),
        is_active: true,
      });

      const updated = await base44.entities.Profile.update(profile.id, {
        is_premium: true,
        credits: 5,
      });
      setProfile(updated);
    } catch (err) {
      console.error(err);
    }
    setSubscribing(null);
  };

  if (profile?.is_premium) {
    return (
      <div className="min-h-screen px-6 pt-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="text-accent" size={40} />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">You're Premium!</h1>
          <p className="text-muted-foreground mb-8">Enjoy unlimited likes, advanced filters, and more.</p>

          <div className="bg-card rounded-3xl border border-accent/30 p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coins className="text-accent" size={24} />
              <span className="text-3xl font-heading font-bold">{profile.credits || 0}</span>
              <span className="text-muted-foreground">credits</span>
            </div>
            <p className="text-sm text-muted-foreground">Use credits for profile boosts and super likes.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title }) => (
              <div key={title} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="text-accent" size={18} />
                </div>
                <span className="text-sm font-medium">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="text-accent" size={32} />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">Trust Matches Premium</h1>
          <p className="text-muted-foreground">Unlock the full experience and find your match faster.</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Icon className="text-accent" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-card rounded-3xl border-2 ${plan.color} p-6 relative ${plan.badge ? 'md:scale-105' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-lg font-heading font-semibold mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-heading font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscribing === plan.id}
                className={`w-full py-3 rounded-full font-semibold text-sm transition disabled:opacity-50 ${
                  plan.badge
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {subscribing === plan.id ? 'Processing...' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Cancel anytime. By subscribing you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}