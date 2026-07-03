import { ShieldCheck, EyeOff, ToggleRight, Users, Lock } from 'lucide-react';

const items = [
  { icon: ShieldCheck, title: 'Your Choice', desc: 'Share your location only when you want to.' },
  { icon: EyeOff, title: 'Only You Both', desc: 'Location is private and only visible to the people on the date.' },
  { icon: ToggleRight, title: 'On or Off', desc: 'Turn location sharing on or off anytime with one tap.' },
  { icon: Users, title: 'Extra Peace of Mind', desc: 'Feel more confident meeting someone new.' },
  { icon: Lock, title: 'Privacy First', desc: 'Your data is encrypted and never shared with others.' },
];

export default function LandingSafetyGrid() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card rounded-3xl border border-border p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {items.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1.5 text-sm tracking-wide uppercase">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}