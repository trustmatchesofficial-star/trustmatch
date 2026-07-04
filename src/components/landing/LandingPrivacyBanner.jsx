import { ShieldCheck, Lock, FileX, ToggleRight } from 'lucide-react';

const points = [
  { icon: FileX, label: 'Not a background check' },
  { icon: ShieldCheck, label: 'No criminal or credit checks' },
  { icon: Lock, label: 'GDPR-compliant & encrypted' },
  { icon: ToggleRight, label: 'You control your privacy' },
];

export default function LandingPrivacyBanner() {
  return (
    <section className="px-6 py-4 bg-card/60 border-b border-border">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {points.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
            <Icon size={14} className="text-teal shrink-0" />
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}