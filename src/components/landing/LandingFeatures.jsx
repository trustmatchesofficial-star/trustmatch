import { BadgeCheck, ShieldCheck, Lock, Heart } from 'lucide-react';

const features = [
  { icon: BadgeCheck, title: 'Identity Verified', desc: 'Every member confirms their identity, so you connect with real people — no catfishing.' },
  { icon: ShieldCheck, title: 'Safety First', desc: 'Live location sharing, emergency SOS, and safety tools available free, always.' },
  { icon: Heart, title: 'Meaningful Matches', desc: 'Discover genuine connections based on shared interests and values.' },
  { icon: Lock, title: 'Privacy by Design', desc: 'Your data, your control. GDPR-compliant and private by default.' },
];

export default function LandingFeatures() {
  return (
    <section id="about" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Why Trust Matches?</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 text-balance">
            Trust is built into everything
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-4">
                <Icon size={26} className="text-primary" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}