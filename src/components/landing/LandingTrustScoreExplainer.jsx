import { ShieldCheck, BadgeCheck, Crown, UserCheck, Activity, AlertTriangle, X } from 'lucide-react';

const tiers = [
  { range: '90–100', label: 'High Confidence', color: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/30', desc: 'Identity verified, profile complete, and actively using the app.' },
  { range: '70–89', label: 'Likely Real', color: 'text-teal', bg: 'bg-teal/5', border: 'border-teal/20', desc: 'Mostly verified and active — a good sign, but still use your judgement.' },
  { range: '40–69', label: 'Use Caution', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30', desc: 'Limited verification or activity. Take things slowly and meet in public.' },
  { range: 'Below 40', label: 'High Risk', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', desc: 'Unverified, inactive, or flagged. Exercise significant caution.' },
];

const factors = [
  { icon: BadgeCheck, label: 'ID Verification', points: '+35', desc: 'The biggest factor — has the user completed identity verification?' },
  { icon: Crown, label: 'Premium Member', points: '+10', desc: 'Invested members tend to be more committed to real connections.' },
  { icon: UserCheck, label: 'Profile Completed', points: '+10', desc: 'A fully filled-out profile with photos and bio.' },
  { icon: Activity, label: 'Recently Active', points: '+5', desc: 'Is the user currently active on the platform?' },
];

const notMeasured = [
  'Criminal history or records',
  'Credit or financial status',
  'Employment or income',
  'Personal character or morals',
  'Whether someone is "safe" to meet',
];

export default function LandingTrustScoreExplainer() {
  return (
    <section id="trust-score" className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <ShieldCheck size={12} /> Trust Scores
          </div>
          <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-foreground tracking-tight mb-4">
            How Trust Scores Work
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Every profile has a Trust Score from 0 to 100. It's a quick way to gauge how complete and verified a profile is — not a guarantee of someone's character.
          </p>
        </div>

        {/* Score scale */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">The four tiers</h3>
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div key={tier.label} className={`flex items-start gap-4 rounded-2xl border p-4 ${tier.bg} ${tier.border}`}>
                <div className={`shrink-0 w-16 text-center ${tier.color}`}>
                  <p className="text-xs font-bold">{tier.range}</p>
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm mb-0.5 ${tier.color}`}>{tier.label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tier.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's considered */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">What the score considers</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {factors.map(({ icon: Icon, label, points, desc }) => (
              <div key={label} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span className="font-bold text-sm text-foreground">{label}</span>
                  <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{points}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-secondary/50 rounded-2xl p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Base score:</strong> Every profile starts at 40. Verification adds the most points (+35).
              Banned accounts drop to 5; suspended accounts drop to 20. Community-reported behaviour is also factored in.
            </p>
          </div>
        </div>

        {/* What it doesn't measure */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-gold" /> What the score does <em>not</em> measure
          </h3>
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="grid sm:grid-cols-2 gap-3">
              {notMeasured.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <X size={14} className="text-destructive shrink-0" />
                  <span className="text-sm text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important disclaimer */}
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-gold" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">A Trust Score is an indicator, not a guarantee.</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The score reflects profile completeness and verification status — it cannot tell you whether someone is safe to meet.
              Always follow safety guidelines, meet in public places, share your plans with someone you trust, and listen to your instincts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}