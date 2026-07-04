import { useOutletContext, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, Heart, Eye, Star, Plane, Mic, Video, TrendingUp, Coins, Loader2, Lock } from 'lucide-react';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '£9.99',
    period: '/month',
    color: 'border-primary',
    badge: 'Premium',
    real: true,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: '$44.99',
    period: '/3 months',
    color: 'border-border',
    badge: null,
    real: false,
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$119.99',
    period: '/year',
    color: 'border-border',
    badge: 'Best Value',
    real: false,
  },
];

const FEATURES = [
  { icon: Heart, title: 'Unlimited Likes', desc: 'Like as many profiles as you want — no daily limits.' },
  { icon: Eye, title: 'See Who Liked You', desc: 'See everyone who liked you and match instantly.' },
  { icon: Star, title: '5 Super Likes / Day', desc: 'Stand out and show someone you\'re really interested.' },
  { icon: TrendingUp, title: 'Profile Boost', desc: 'Be seen by more people — top of discovery for 30 min.' },
  { icon: Sparkles, title: 'Top Picks', desc: 'Daily curated matches based on your preferences.' },
  { icon: Plane, title: 'Passport', desc: 'Change your location and discover people worldwide.' },
  { icon: Mic, title: 'Voice Messages', desc: 'Record and send voice notes in your chats.' },
  { icon: Video, title: 'Video Calls', desc: 'Call your matches face-to-face, right in the app.' },
];

export default function Premium() {
  const { profile, setProfile } = useOutletContext();
  const navigate = useNavigate();
  const [subscribing, setSubscribing] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);

  const loadSubscription = async () => {
    if (!profile) return;
    try {
      const subs = await base44.entities.Subscription.filter({ user_id: profile.created_by_id });
      const sorted = subs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setSubscription(sorted[0] || null);

      // If pending, poll for activation
      if (sorted[0]?.status === 'pending') {
        setTimeout(loadSubscription, 3000);
      } else if (sorted[0]?.status === 'active' && !profile.is_premium) {
        // Webhook activated the subscription but profile not yet refreshed
        const updated = await base44.entities.Profile.get(profile.id);
        setProfile(updated);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingSub(false);
  };

  useEffect(() => {
    loadSubscription();
  }, [profile]);

  const handleCheckout = async () => {
    setSubscribing('monthly');
    try {
      const res = await base44.functions.invoke('create-checkout', {});
      if (res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      }
    } catch (err) {
      console.error(err);
    }
    setSubscribing(null);
  };

  const handleFakeSubscribe = async (planId) => {
    setSubscribing(planId);
    try {
      const expires = new Date();
      if (planId === 'quarterly') expires.setMonth(expires.getMonth() + 3);
      else expires.setFullYear(expires.getFullYear() + 1);

      await base44.entities.Subscription.create({
        user_id: profile.created_by_id,
        plan: planId,
        credits_remaining: 5,
        expires_at: expires.toISOString(),
        is_active: true,
        status: 'active',
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

  // Pending state — buyer returned from checkout, waiting for webhook
  if (subscription?.status === 'pending' && !profile?.is_premium) {
    return (
      <div className="min-h-screen px-6 pt-6 pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="text-primary animate-spin" size={40} />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2">Confirming your payment…</h1>
          <p className="text-muted-foreground mb-6">
            We're activating your Premium subscription. This usually takes a few seconds. You can close this page — we'll activate your account automatically once payment is confirmed.
          </p>
          <button
            onClick={loadSubscription}
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-full font-medium text-sm hover:bg-secondary/80 transition"
          >
            <Loader2 size={16} className="animate-spin" /> Check again
          </button>
        </div>
      </div>
    );
  }

  if (profile?.is_premium) {
    return (
      <div className="min-h-screen px-6 pt-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="text-accent" size={40} />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">You're Premium!</h1>
          <p className="text-muted-foreground mb-8">Enjoy unlimited likes, super likes, and all premium features.</p>

          {subscription?.status === 'active' && (
            <div className="bg-card rounded-2xl border border-accent/30 p-4 mb-6 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Subscription</p>
                <p className="text-sm font-semibold capitalize">{subscription.plan}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-semibold text-accent flex items-center gap-1">
                  <Check size={14} /> Active
                </p>
              </div>
            </div>
          )}

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
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-lg font-heading font-semibold mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-heading font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <button
                onClick={() => (plan.real ? handleCheckout() : handleFakeSubscribe(plan.id))}
                disabled={subscribing === plan.id || (plan.real && subscribing === 'monthly')}
                className={`w-full py-3 rounded-full font-semibold text-sm transition disabled:opacity-50 ${
                  plan.real
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : plan.badge
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {subscribing === plan.id || (plan.real && subscribing === 'monthly')
                  ? 'Processing...'
                  : plan.real
                  ? 'Subscribe Now'
                  : 'Choose Plan'}
              </button>
              {!plan.real && (
                <p className="text-[10px] text-muted-foreground mt-2 text-center">Coming soon</p>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Cancel anytime. Payments are processed securely by Base44 Payments. By subscribing you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}