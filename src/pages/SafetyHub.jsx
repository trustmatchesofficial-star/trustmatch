import { Link } from 'react-router-dom';
import { Shield, MapPin, Lock, Star, BadgeCheck, ShieldCheck } from 'lucide-react';

export default function SafetyHub() {
  const features = [
    { icon: BadgeCheck, title: 'Verified Identities', desc: 'Secure verification for genuine profiles. No catfishing, no exceptions.', color: 'text-primary', border: 'border-primary/30' },
    { icon: ShieldCheck, title: 'Safety Hub & Live Tracking', desc: 'Pre-meet safety tools, emergency SOS, and live location sharing with your match.', color: 'text-teal', border: 'border-teal/30' },
    { icon: Star, title: 'Automatic Safety Recording', desc: 'Optional automatic audio recording during dates for your protection (encrypted, you control it).', color: 'text-gold', border: 'border-gold/30' },
    { icon: Lock, title: 'Privacy First', desc: 'Your data. Your control. Always. GDPR-compliant by design.', color: 'text-purplecustom', border: 'border-purplecustom/30' },
  ];

  const steps = [
    { icon: MapPin, title: '1. Choose to Share', desc: 'Turn on live location sharing when you feel comfortable.' },
    { icon: Shield, title: '2. Only Visible to You Both', desc: 'Your live location is only visible to the people on the date.' },
    { icon: Lock, title: "3. You're in Control", desc: 'Turn sharing on or off at any time. No notifications are sent.' },
    { icon: ShieldCheck, title: '4. Private & Secure', desc: 'Your location is encrypted and never shared with anyone else.' },
  ];

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center">
            <Shield className="text-teal" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">Safety Hub</h1>
            <p className="text-sm text-muted-foreground">Your safety toolkit</p>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Why Trust Matches?</p>
          <h2 className="text-3xl font-heading font-bold mb-3">Safety & trust at every step</h2>
        </div>

        {/* Feature cards */}
        <div className="space-y-3 mb-10">
          {features.map(({ icon: Icon, title, desc, color, border }) => (
            <div key={title} className={`bg-card rounded-2xl p-5 border ${border} flex items-start gap-4`}>
              <div className={`w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Date Safety Tracker */}
        <div className="bg-card rounded-3xl border border-border p-6 mb-6">
          <h2 className="text-2xl font-heading font-bold mb-2">
            Date Safety <span className="text-primary">Tracker</span>
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Because your safety should always be <span className="text-primary font-semibold">your choice.</span> Share your live location during a date — if you choose to.
          </p>

          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">How it works</p>
          <div className="space-y-3">
            {steps.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link to="/settings" className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-2 hover:border-primary/50 transition">
            <Lock className="text-primary" size={24} />
            <span className="text-sm font-medium">Privacy Settings</span>
          </Link>
          <Link to="/settings" className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-2 hover:border-teal/50 transition">
            <ShieldCheck className="text-teal" size={24} />
            <span className="text-sm font-medium">Verification</span>
          </Link>
        </div>

        {/* Safety banner */}
        <div className="bg-card rounded-3xl border border-teal/30 p-6 text-center">
          <Shield className="text-teal mx-auto mb-3" size={32} />
          <h3 className="font-bold text-teal mb-1">Safety features are always free</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Reporting, blocking, profile verification, Date Safety Mode, emergency contacts, safety check-ins, safety phrases, and emergency support are free for every user — no subscription needed.
          </p>
        </div>
      </div>
    </div>
  );
}