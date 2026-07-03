import { ShieldCheck, MapPin, Check } from 'lucide-react';

const checklist = [
  'Share date details with a trusted contact',
  'Set an emergency contact',
  'Live location sharing during dates',
  'Safety check-ins and scheduled alerts',
  'One-tap SOS support',
];

export default function LandingSafety() {
  return (
    <section id="safety" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Safety You Can Rely On</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4 text-balance">
            Your safety is never an upgrade
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Every safety feature is free for every member. Share your location with a match, set an emergency contact,
            and check in — all on your terms, all the time.
          </p>
          <ul className="space-y-3 mb-8">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={13} className="text-primary" />
                </span>
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800&h=600&fit=crop"
              alt="A couple on a date"
              className="w-full h-[420px] object-cover"
            />
          </div>
          {/* Floating Share My Date card */}
          <div className="absolute -bottom-5 left-5 bg-white rounded-2xl shadow-2xl p-4 w-56 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-teal-500" />
              <span className="font-semibold text-sm text-slate-900">Share My Date</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-teal-500" />
              <span className="text-xs text-slate-600 flex-1">Live location on</span>
              <div className="w-9 h-5 rounded-full bg-teal-500 relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}