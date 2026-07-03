import { ShieldCheck, MapPin, Lock, ToggleRight, Eye, BadgeCheck, Heart } from 'lucide-react';

const howItWorks = [
  { icon: ShieldCheck, color: 'text-teal', title: 'Choose to Share', desc: 'Turn on live location sharing when you feel comfortable.' },
  { icon: Eye, color: 'text-primary', title: 'Only Visible to You Both', desc: 'Your live location is only visible to the people on the date.' },
  { icon: ToggleRight, color: 'text-purplecustom', title: "You're in Control", desc: 'Turn sharing on or off at any time. No notifications are sent.' },
  { icon: Lock, color: 'text-gold', title: 'Private & Secure', desc: 'Your location is encrypted and never shared with anyone else.' },
];

export default function LandingDateSafetyTracker() {
  return (
    <section id="safety" className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto mb-12">
        <img
          src="https://media.base44.com/images/public/6a3ebc375433828e3faa9c58/8d88c8f12_IMG_7752.jpg"
          alt="Date Safety Tracker — share your live location during a date, visible only to you both, with full control to turn it off anytime."
          className="w-full h-auto rounded-3xl border border-border shadow-xl"
        />
      </div>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-8 h-8">
              <Heart className="text-primary fill-primary absolute inset-0" size={28} />
            </div>
            <div>
              <p className="font-heading font-bold text-foreground text-sm leading-tight">Trust Matches</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Real people. Real connections.</p>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-primary mb-3">Date Safety Tracker</h2>
          <p className="text-lg text-foreground/80 mb-4">
            Because your safety should always be <span className="text-primary font-semibold">your choice.</span>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
            The Date Safety Tracker lets you share your live location during a date — if you choose to. You're in control at all times.
          </p>

          {/* How it works list */}
          <div className="space-y-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">How it works</p>
            {howItWorks.map(({ icon: Icon, color, title, desc }, i) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-muted-foreground">{i + 1}.</span>
                  <Icon size={20} className={color} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Phone mockup */}
        <div className="flex justify-center">
          <div className="w-[300px] bg-card border border-border rounded-[2.5rem] p-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces"
                alt="Sophie"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm text-foreground">Sophie</span>
                  <BadgeCheck size={14} className="text-teal" />
                </div>
                <p className="text-[10px] text-teal">Active now</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck size={16} className="text-primary" />
              </div>
            </div>

            {/* Alert box */}
            <div className="border border-teal/40 bg-teal/5 rounded-2xl p-3 mb-4 flex items-start gap-2">
              <ShieldCheck size={16} className="text-teal shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                Date Safety Mode is active. Location sharing is visible only to you both and can be turned off at any time.
              </p>
            </div>

            {/* Toggle rows */}
            <div className="space-y-2 mb-4">
              <div className="bg-secondary/50 rounded-2xl p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center">
                  <MapPin size={14} className="text-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground flex items-center gap-1">
                    You <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                  </p>
                  <p className="text-[10px] text-muted-foreground">Town Centre, Swindon</p>
                </div>
                <div className="w-9 h-5 rounded-full bg-teal relative shrink-0">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-background" />
                </div>
              </div>
              <div className="bg-secondary/50 rounded-2xl p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground flex items-center gap-1">
                    Sophie <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </p>
                  <p className="text-[10px] text-muted-foreground">Town Centre, Swindon</p>
                </div>
                <div className="w-9 h-5 rounded-full bg-primary relative shrink-0">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-background" />
                </div>
              </div>
            </div>

            {/* Map widget */}
            <div className="h-32 rounded-2xl bg-secondary overflow-hidden relative mb-4 border border-border">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--secondary))_0%,hsl(var(--card))_100%)]" />
              {/* Fake streets */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
              <div className="absolute top-0 bottom-0 left-1/3 w-px bg-border" />
              <div className="absolute top-0 bottom-0 left-2/3 w-px bg-border" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-border/50" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-border/50" />
              {/* Avatars on map */}
              <div className="absolute top-[40%] left-[30%]">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces"
                  alt="You"
                  className="w-7 h-7 rounded-full border-2 border-teal object-cover shadow-lg"
                />
              </div>
              <div className="absolute top-[55%] left-[55%]">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=faces"
                  alt="Sophie"
                  className="w-7 h-7 rounded-full border-2 border-primary object-cover shadow-lg"
                />
              </div>
            </div>

            {/* Action bar */}
            <div className="bg-secondary/70 rounded-2xl p-3 border border-border">
              <div className="flex items-start gap-2 mb-3">
                <Lock size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  You control your location sharing. Turn it off anytime.
                </p>
              </div>
              <button className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition">
                Stop Sharing
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}