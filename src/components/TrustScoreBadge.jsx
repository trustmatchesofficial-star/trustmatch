import { Shield } from 'lucide-react';

export function computeTrustScore(profile) {
  if (!profile) return 50;
  if (profile.account_status === 'banned') return 5;
  if (profile.account_status === 'suspended') return 20;
  let s = 40;
  if (profile.is_verified) s += 35;
  if (profile.is_premium) s += 10;
  if (profile.is_onboarded) s += 10;
  if (profile.is_active) s += 5;
  if (typeof profile.trust_score === 'number' && profile.trust_score > 0) {
    s = Math.round((s + profile.trust_score) / 2);
  }
  return Math.min(100, Math.max(5, s));
}

export function getTrustTier(score) {
  if (score >= 90) return { label: 'Verified', color: 'text-teal', bg: 'bg-teal/15', dot: 'bg-teal' };
  if (score >= 70) return { label: 'Likely Real', color: 'text-teal', bg: 'bg-teal/10', dot: 'bg-teal/80' };
  if (score >= 40) return { label: 'Use Caution', color: 'text-gold', bg: 'bg-gold/15', dot: 'bg-gold' };
  return { label: 'High Risk', color: 'text-destructive', bg: 'bg-destructive/15', dot: 'bg-destructive' };
}

export default function TrustScoreBadge({ profile, size = 'md' }) {
  const score = computeTrustScore(profile);
  const tier = getTrustTier(score);
  const dims = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${tier.bg} ${tier.color} ${dims}`}>
      <Shield size={size === 'sm' ? 11 : 13} />
      {score} · {tier.label}
    </span>
  );
}