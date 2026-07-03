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
    // blend stored value with computed so report history (set by admin) can lower it
    s = Math.round((s + profile.trust_score) / 2);
  }
  return Math.min(100, Math.max(5, s));
}

export default function TrustScoreBadge({ profile, size = 'md' }) {
  const score = computeTrustScore(profile);
  const color = score >= 80 ? 'text-teal' : score >= 50 ? 'text-gold' : 'text-destructive';
  const bg = score >= 80 ? 'bg-teal/15' : score >= 50 ? 'bg-gold/15' : 'bg-destructive/15';
  const label = score >= 80 ? 'High trust' : score >= 50 ? 'Building trust' : 'Low trust';
  const dims = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${bg} ${color} ${dims}`}>
      <Shield size={size === 'sm' ? 11 : 13} />
      {score} · {label}
    </span>
  );
}