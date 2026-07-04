import { Crown } from 'lucide-react';

export default function FoundingMemberBadge({ number, size = 'md', className = '' }) {
  const dims = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : size === 'lg'
    ? 'px-3.5 py-1.5 text-sm gap-1.5'
    : 'px-3 py-1 text-xs gap-1';
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;

  return (
    <span
      className={`inline-flex items-center bg-gold/15 text-gold rounded-full font-semibold border border-gold/30 ${dims} ${className}`}
      title="One of the first 100 Trust Matches members"
    >
      <Crown size={iconSize} className="fill-gold" />
      Founding Member{number ? ` #${number}` : ''}
    </span>
  );
}