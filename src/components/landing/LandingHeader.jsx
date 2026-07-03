import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Safety', href: '#safety' },
  { label: 'How It Works', href: '#how' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Heart className="text-white fill-white" size={16} />
          </div>
          <span className="font-heading font-bold text-slate-900">Trust Matches</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline text-sm font-medium text-slate-700 hover:text-slate-900 transition">
            Log In
          </Link>
          <Link to="/register" className="text-sm font-semibold bg-primary text-white px-5 py-2 rounded-full hover:bg-primary/90 transition shadow-sm">
            Join Free
          </Link>
        </div>
      </div>
    </header>
  );
}