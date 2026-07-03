import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LandingPhoneMockups from './LandingPhoneMockups';

const avatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d35?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces',
];

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 via-pink-50/40 to-white">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-pink-200 rounded-full px-3 py-1 mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-slate-700">Now welcoming beta members</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-slate-900 leading-[1.1] mb-5 text-balance">
            Verified dating built on <span className="text-primary">trust.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-md mb-8 text-balance">
            A dating platform built around trust, safety and genuine connections — featuring identity verification, advanced safety tools, live date tracking, and privacy-first features to help you date with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Join Free <ArrowRight size={18} />
            </Link>
            <a
              href="#safety"
              className="inline-flex items-center justify-center gap-2 border border-primary text-primary px-7 py-3.5 rounded-full font-semibold hover:bg-pink-50 transition"
            >
              Learn About Safety
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Be part of something different.</span> Join our growing community.
            </p>
          </div>
        </div>
        <LandingPhoneMockups />
      </div>
    </section>
  );
}