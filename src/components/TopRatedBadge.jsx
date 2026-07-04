import { Award } from 'lucide-react';

export default function TopRatedBadge({ size = 'md', className = '' }) {
  const dims = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : size === 'lg'
    ? 'px-3.5 py-1.5 text-sm gap-1.5'
    : 'px-3 py-1 text-xs gap-1';
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;

  return (
    <span
      className={`inline-flex items-center bg-purplecustom/15 text-purplecustom rounded-full font-semibold border border-purplecustom/30 ${dims} ${className}`}
      title="Consistently high safety and comfort ratings from recent dates"
    >
      <Award size={iconSize} className="fill-purplecustom" />
      Top Rated
    </span>
  );
}