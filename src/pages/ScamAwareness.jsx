import { ShieldAlert, DollarSign, Plane, Heart, CameraOff, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RED_FLAGS = [
  {
    icon: DollarSign,
    title: 'Requests for money',
    desc: 'Asking for gift cards, crypto, wire transfers, or "loans" — especially before meeting in person. This is the #1 romance scam red flag.',
  },
  {
    icon: Plane,
    title: 'Pressure to leave the app',
    desc: 'Quickly pushing you to move to WhatsApp, Telegram, email, or texting. Scammers prefer platforms with fewer safety protections.',
  },
  {
    icon: Heart,
    title: 'Love bombing',
    desc: 'Professing deep love, calling you a soulmate, or talking about marriage very early — before you\u2019ve even met. Designed to create fast emotional attachment.',
  },
  {
    icon: CameraOff,
    title: 'Refusal to video call',
    desc: 'Always having an excuse for why they can\u2019t video chat or meet up — broken camera, deployed overseas, working on an oil rig. A classic catfish tactic.',
  },
  {
    icon: Zap,
    title: 'Urgency & emergencies',
    desc: 'Sudden crises: a sick relative, stranded at an airport, customs fees, medical bills. Creating panic so you act before thinking.',
  },
];

const TIPS = [
  'Never send money, gift cards, or cryptocurrency to someone you haven\u2019t met in person.',
  'Keep conversations on the platform until you\u2019ve met and built trust.',
  'Insist on a video call early on — if they refuse repeatedly, that\u2019s a red flag.',
  'Search their photos online to check if they appear elsewhere under different names.',
  'Take things slowly. Genuine connections don\u2019t require urgency or pressure.',
  'If something feels off, trust your instincts. You can block and report at any time.',
];

export default function ScamAwareness() {
  return (
    <div className="min-h-screen px-6 py-8 pb-24 max-w-3xl mx-auto">
      <Link to="/safety-hub" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6">
        <ArrowLeft size={16} /> Back to Safety Hub
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center">
          <ShieldAlert className="text-gold" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold">Scam Awareness</h1>
          <p className="text-sm text-muted-foreground">How to spot and avoid romance scams</p>
        </div>
      </div>

      <div className="bg-gold/5 border border-gold/30 rounded-2xl p-4 mb-8">
        <p className="text-sm text-foreground leading-relaxed">
          If you received a heads-up notification, it means a message you received contained language patterns
          commonly associated with scam attempts. This doesn\u2019t necessarily mean the person is a scammer —
          but it\u2019s worth being extra cautious. The notice was private: only you can see it, and no action
          was taken against the sender.
        </p>
      </div>

      <h2 className="text-lg font-heading font-semibold mb-4">Common red flags</h2>
      <div className="space-y-3 mb-8">
        {RED_FLAGS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <Icon className="text-destructive" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-heading font-semibold mb-4">Protect yourself</h2>
      <div className="bg-card rounded-2xl border border-border p-5 mb-8">
        <ul className="space-y-3">
          {TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="w-5 h-5 rounded-full bg-teal/15 text-teal flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-secondary/50 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Remember:</strong> Trust Matches will never ask you for money,
          gift cards, or payment outside the app\u2019s official premium plans. If anyone claiming to be from
          Trust Matches asks for payment, report them immediately — it\u2019s a scam.
        </p>
      </div>
    </div>
  );
}