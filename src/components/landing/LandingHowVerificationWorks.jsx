import { ShieldCheck, FileCheck, Camera, Lock, X, Eye, Heart } from 'lucide-react';

const USED = [
  { icon: FileCheck, title: 'ID Document', desc: 'A government-issued photo ID is checked for authenticity.' },
  { icon: Camera, title: 'Selfie & Liveness Check', desc: 'A live selfie confirms you match your ID photo — and that you\'re real, not a photo.' },
  { icon: ShieldCheck, title: 'Name Matching', desc: 'The name on your ID is matched against the name on your profile.' },
];

const NOT_USED = [
  { label: 'No criminal records checks' },
  { label: 'No credit or financial checks' },
  { label: 'No employment or income verification' },
  { label: 'No social media scraping' },
];

export default function LandingHowVerificationWorks() {
  return (
    <section id="how-verification-works" className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <ShieldCheck size={12} /> Transparency
          </div>
          <h2 className="font-heading font-extrabold text-3xl md:text-5xl text-foreground tracking-tight mb-4">
            How Verification Works
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We believe you should know exactly what goes into a verified badge — and what doesn't. Here's our process in plain language.
          </p>
        </div>

        {/* What we check */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
            <Eye size={16} className="text-teal" /> What we check
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {USED.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-2xl border border-border p-5">
                <div className="w-11 h-11 rounded-xl bg-teal/10 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-teal" />
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">{title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What we don't check */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
            <X size={16} className="text-muted-foreground" /> What we don't check
          </h3>
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="grid sm:grid-cols-2 gap-3">
              {NOT_USED.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <X size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground/80">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
            <Lock size={16} className="text-teal" /> How your privacy is protected
          </h3>
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
                <Lock size={18} className="text-teal" />
              </div>
              <div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Your verification documents (ID photo, selfie) are used <strong>only</strong> to confirm your identity — they are never shared publicly, never shown to other members, and never displayed on your profile. Once verification is complete, documents are kept securely for audit purposes only.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important statement */}
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
            <Heart size={18} className="text-gold" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">This is not a criminal background check.</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Identity verification confirms that a member is who they say they are — it does not screen for criminal history. Always follow our safety guidelines, meet in public, and trust your instincts when meeting someone new.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}