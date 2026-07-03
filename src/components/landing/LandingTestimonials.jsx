import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      'Finally a dating app where I actually trust the profiles. The verification made me feel safe from the first message.',
    name: 'Sophie M.',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
  },
  {
    quote:
      'The date safety tracker gave me real peace of mind on a first meet. Everything is genuinely free, no paywall on safety.',
    name: 'James T.',
    location: 'Manchester, UK',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
  },
  {
    quote:
      'I love that privacy comes first. I control who finds me and my data is mine. Met someone real within a week.',
    name: 'Aisha K.',
    location: 'Birmingham, UK',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d35?w=120&h=120&fit=crop&crop=faces',
  },
];

export default function LandingTestimonials() {
  return (
    <section id="testimonials" className="py-20 px-6 bg-gradient-to-b from-pink-50/40 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 text-balance">
            Loved by our early members
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}