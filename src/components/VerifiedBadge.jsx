import { ShieldCheck } from 'lucide-react';

export default function VerifiedBadge({ size = 'md', className = '' }) {
  const dims = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : size === 'lg'
    ? 'px-3.5 py-1.5 text-sm gap-1.5'
    : 'px-3 py-1 text-xs gap-1';
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;

  return (
    <span
      className={`inline-flex items-center bg-teal/15 text-teal rounded-full font-semibold ${dims} ${className}`}
      title="This member has completed identity verification"
    >
      <ShieldCheck size={iconSize} />
      Identity Verified
    </span>
  );
}