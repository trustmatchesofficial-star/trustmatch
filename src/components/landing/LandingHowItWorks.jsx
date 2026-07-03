import { UserPlus, BadgeCheck, Search, MessageCircle } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create your profile', desc: 'Set up your profile with photos, interests, and what you are looking for.' },
  { icon: BadgeCheck, title: 'Verify your identity', desc: 'Confirm you are real with a quick, secure verification step.' },
  { icon: Search, title: 'Discover genuine people', desc: 'Browse verified profiles and find people who match you.' },
  { icon: MessageCircle, title: 'Chat and meet safely', desc: 'Connect in chat and use safety tools when you meet up.' },
];

export default function LandingHowItWorks() {
  return (
    <section id="how" className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground text-balance">
            Four steps to a safer connection
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6 relative">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="relative text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <Icon size={28} />
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[55%] w-[90%] border-t-2 border-dashed border-border" />
              )}
              <span className="text-xs font-bold text-primary mb-1 block">STEP {i + 1}</span>
              <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}